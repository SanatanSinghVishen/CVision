"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = analyzeResume;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
function analyzeResume(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { companyName, jobTitle, jobDescription, resumeText } = params;
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GROQ_API_KEY environment variable.");
        }
        const groq = new groq_sdk_1.default({
            apiKey,
        });
        const prompt = `
  You are an elite Tech Recruiter and Resume Coach for ${companyName}. 
  I will provide you with a candidate's resume and a job description for a ${jobTitle} role at ${companyName}.
  
  Target Company: ${companyName}
  Job Title: ${jobTitle}
  Job Description: ${jobDescription}

  Resume Content:
  ${resumeText}

  Your objective is to critically analyze the resume against the requirements of ${companyName} for the ${jobTitle} role.
  Provide actionable, specific feedback, focusing on exact sections, context, and new bullet point suggestions.
  Return a JSON response with the following EXACT structure:
  {
    "summary": "Professional summary of the candidate's fit for the role (2-3 sentences)",
    "overallMatch": 85,
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
    "sectionUpdates": [
        {
            "section": "Professional Experience",
            "currentContext": "Briefly describe what is currently written that needs to be improved.",
            "suggestedRevision": "Provide an EXACT, newly rewritten bullet point to be inserted here, using strong action verbs and highlighting metrics relevant to the job.",
            "reasoning": "Explain WHY this change is needed for this specific role at ${companyName}."
        }
    ],
    "reorderingSuggestions": [
        "Suggestion on moving a section (e.g., 'Move Skills to the top to immediately highlight technical proficiency for this role.')"
    ],
    "ATS": {
        "score": 85,
        "tips": [{"type": "good", "tip": "Brief tip title"}, {"type": "improve", "tip": "Brief tip title"}]
    },
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
    "toneAndStyle": {
        "score": 75,
        "tips": [
            {"type": "good", "tip": "Brief tip title", "explanation": "Detailed explanation"},
            {"type": "improve", "tip": "Brief tip title", "explanation": "Detailed explanation"}
        ]
    },
    "content": {
        "score": 80,
        "tips": [
            {"type": "good", "tip": "Brief tip title", "explanation": "Detailed explanation"},
            {"type": "improve", "tip": "Brief tip title", "explanation": "Detailed explanation"}
        ]
    },
    "structure": {
        "score": 70,
        "tips": [
            {"type": "good", "tip": "Brief tip title", "explanation": "Detailed explanation"},
            {"type": "improve", "tip": "Brief tip title", "explanation": "Detailed explanation"}
        ]
    },
    "skills": {
        "score": 85,
        "tips": [
            {"type": "good", "tip": "Brief tip title", "explanation": "Detailed explanation"},
            {"type": "improve", "tip": "Brief tip title", "explanation": "Detailed explanation"}
        ]
    }
  }

  IMPORTANT: 
  - Return ONLY valid JSON properly formatted
  - Do not include markdown code blocks
  - Tailor all advice specifically for ${companyName}. Provide at least 2-3 sectionUpdates.
  - Each category (toneAndStyle, content, structure, skills) must have a score (0-100) and tips array
  - Each tip must have "type" (either "good" or "improve"), "tip" (short title), and "explanation" (detailed description)
  `;
        const response = yield groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
        });
        const content = response.choices[0].message.content;
        if (!content)
            throw new Error("No response content from AI");
        try {
            return JSON.parse(content);
        }
        catch (e) {
            throw new Error("Failed to parse AI response as JSON: " + content);
        }
    });
}
