import Groq from "groq-sdk";
import sanitizeHtml from "sanitize-html";
import { FeedbackSchema, Feedback } from "../schemas/feedback";
import { supabaseAdmin } from "../lib/supabase";
import {
  getAnalysisCacheKey,
  getCachedAnalysis,
  setCachedAnalysis
} from '../lib/cache';

export const parseWithRetry = async (
  rawResponse: string,
  retryFn: () => Promise<string>,
  attempts = 0
): Promise<Feedback> => {
  const stripped = rawResponse.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(stripped);
    const validated = FeedbackSchema.safeParse(parsed);

    if (validated.success) return validated.data;

    // Schema mismatch — retry once
    if (attempts < 1) {
      console.warn('LLM schema mismatch, retrying...', validated.error.issues);
      const retryResponse = await retryFn();
      return parseWithRetry(retryResponse, retryFn, attempts + 1);
    }

    throw new Error('LLM returned invalid schema after retry');
  } catch (e) {
    if (attempts < 1) {
      console.warn('JSON parsing failed, retrying...', e);
      const retryResponse = await retryFn();
      return parseWithRetry(retryResponse, retryFn, attempts + 1);
    }
    throw new Error('Failed to parse LLM response');
  }
};

export async function analyzeResume(
    resumeText: string,
    jobTitle: string,
    jobDescription: string,
    companyName: string,
    resumeId: string,
    userId: string,
    forceRefresh = false
): Promise<Feedback> {
    const startTime = Date.now()

    // ── Cache check ────────────────────────────────────────────────────────────
    const cacheKey = getAnalysisCacheKey(
      companyName, jobTitle, jobDescription, resumeText
    )

    if (!forceRefresh) {
      const cached = await getCachedAnalysis(cacheKey)
      if (cached) {
        if (supabaseAdmin) {
            await supabaseAdmin
              .from('resumes')
              .update({
                feedback: cached,
                overall_score: cached.overallScore,
                status: 'completed',
                analysis_version: 1,
              })
              .eq('id', resumeId)

            await supabaseAdmin.from('usage_logs').insert({
              user_id: userId,
              action: 'analyze',
              company_name: companyName,
              job_title: jobTitle,
              tokens_used: 0,
              latency_ms: Date.now() - startTime,
              success: true,
              cache_hit: true,
            })
        }
        return cached
      }
    }

    // ── Cache miss — call Groq ─────────────────────────────────────────────────
    const callGroqWithRetry = async () => {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("Missing GROQ_API_KEY environment variable.");
        
        const groq = new Groq({ apiKey });
        const prompt = buildPrompt(companyName, jobTitle, jobDescription, resumeText);

        const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
          );
          return Promise.race([promise, timeout]);
        };

        const fetchAI = async () => {
            const response = await withTimeout(
                groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                }),
                30_000
            );
            const content = response.choices[0].message.content;
            const tokensUsed = response.usage?.total_tokens || 0;
            if (!content) throw new Error("No response content from AI");
            return { content, tokensUsed };
        };

        const initialResult = await fetchAI();
        const feedback = await parseWithRetry(initialResult.content, async () => {
            const res = await fetchAI();
            return res.content;
        });

        return { feedback, tokensUsed: initialResult.tokensUsed };
    };

    const { feedback, tokensUsed } = await callGroqWithRetry();

    // Save to cache for future identical requests
    await setCachedAnalysis(cacheKey, feedback)

    if (supabaseAdmin) {
        await supabaseAdmin
          .from('resumes')
          .update({
            feedback,
            overall_score: feedback.overallScore,
            status: 'completed',
          })
          .eq('id', resumeId)

        await supabaseAdmin.from('usage_logs').insert({
          user_id: userId,
          action: 'analyze',
          company_name: companyName,
          job_title: jobTitle,
          tokens_used: tokensUsed,
          latency_ms: Date.now() - startTime,
          success: true,
          cache_hit: false,
        })
    }

    return feedback
}

export function buildPrompt(
    companyName: string,
    jobTitle: string,
    jobDescription: string,
    resumeText: string
) {
    const clean = (text: string) => sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });

    const safeResumeText = clean(resumeText);
    const safeJobDescription = clean(jobDescription);
    const safeJobTitle = clean(jobTitle);
    const safeCompanyName = clean(companyName);

    return `
You are a senior engineering hiring manager and resume coach at ${safeCompanyName}.

You are reviewing a candidate's resume for the position of "${safeJobTitle}" at ${safeCompanyName}.

CRITICAL INSTRUCTION: Every piece of feedback you generate must be specific to:
1. The exact role: ${safeJobTitle}
2. The exact company: ${safeCompanyName}
3. The actual content of the resume provided below
Generic advice is strictly not acceptable. If a tip could apply to any company or any resume, rewrite it until it cannot.

Job Description:
${safeJobDescription}

Resume Content:
${safeResumeText}

Return ONLY a valid JSON object. No markdown. No explanation. No text outside the JSON.
IMPORTANT: The numerical scores (85, 75, 80, etc) in the schema below are ONLY EXAMPLES. You MUST genuinely evaluate the resume and output REAL calculated scores from 0-100 based on the candidate's actual fit. DO NOT simply copy the example numbers.

The JSON must follow this exact schema:

{
  "summary": "3-4 sentence honest assessment of fit for ${safeJobTitle} at ${safeCompanyName}. Be direct.",

  "overallScore": 85,

  "matchedKeywords": ["keyword from JD found in resume"],
  "missingKeywords": ["important JD keyword absent from resume"],

  "strengths": [
    "Specific strength referencing actual resume content and why it matters for ${safeCompanyName}"
  ],
  "weaknesses": [
    "Specific gap referencing actual resume content and why it matters for ${safeCompanyName}"
  ],

  "sectionFeedback": [
    {
      "section": "Skills | Projects | Experience | Education | Summary | Achievements",
      "status": "strong | improve | missing",
      "issues": ["Specific issue with this section for this role"],
      "suggestedBullets": [
        "• Complete ready-to-paste bullet point tailored for ${safeJobTitle} at ${safeCompanyName}"
      ],
      "reorderPriority": 1
    }
  ],

  "recommendedSectionOrder": ["Section1", "Section2", "Section3"],

  "ATS": {
    "score": 85,
    "tips": ["Specific ATS improvement for this role"],
    "formattingIssues": ["Specific formatting problem found"]
  },

  "toneAndStyle": {
    "score": 75,
    "tips": ["Specific tone issue for ${safeCompanyName}'s culture"],
    "rewrites": [
      {
        "original": "exact weak phrase copied from the resume",
        "improved": "stronger version written for ${safeJobTitle} at ${safeCompanyName}"
      }
    ]
  },

  "content": {
    "score": 80,
    "tips": ["Content gap specific to ${safeJobTitle} requirements"]
  },

  "structure": {
    "score": 70,
    "tips": ["Structure improvement for ${safeCompanyName}'s expectations"]
  },

  "companySpecificTips": [
    "Tip that only applies to ${safeCompanyName} — reference their known culture, stack, or values"
  ],

  "recommendations": [
    "Top priority action the candidate should take before applying to ${safeCompanyName}"
  ]
}
`;
}

export async function* streamAnalyzeResume(
    resumeText: string,
    jobTitle: string,
    jobDescription: string,
    companyName: string
) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY environment variable.");
    }

    const groq = new Groq({ apiKey });
    const prompt = buildPrompt(companyName, jobTitle, jobDescription, resumeText);

    const stream = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        stream: true,
    });
    
    for await (const chunk of stream) {
        yield chunk.choices[0]?.delta?.content || "";
    }
}
