import Groq from "groq-sdk";

export async function analyzeResume(
    params: {
        jobTitle: string;
        jobDescription: string;
        resumeText: string;
    }
) {
    const { jobTitle, jobDescription, resumeText } = params;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY environment variable.");
    }

    const groq = new Groq({
        apiKey,
    });

    const prompt = `
  You are an expert Resume Analyzer and Career Coach. 
  I will provide you with the text content of a resume and a job description. 
  
  Job Title: ${jobTitle}
  Job Description: ${jobDescription}

  Resume Content:
  ${resumeText}

  Your task is to analyze the resume against the job description and provide a JSON response with the following EXACT structure:
  {
    "summary": "Professional summary of the candidate (2-3 sentences)",
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
    "ATS": {
        "score": 85,
        "tips": ["ATS tip 1", "ATS tip 2", "ATS tip 3"]
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
  - Each category (toneAndStyle, content, structure, skills) must have a score (0-100) and tips array
  - Each tip must have "type" (either "good" or "improve"), "tip" (short title), and "explanation" (detailed description)
  - Provide at least 2-4 tips per category
  `;

    const response = await groq.chat.completions.create({
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
    if (!content) throw new Error("No response content from AI");

    try {
        return JSON.parse(content);
    } catch (e) {
        throw new Error("Failed to parse AI response as JSON: " + content);
    }
}
