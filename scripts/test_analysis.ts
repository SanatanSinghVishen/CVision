import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

async function analyzeResume(params: {
    jobTitle: string;
    jobDescription: string;
    resumeText: string;
}) {
    const { jobTitle, jobDescription, resumeText } = params;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY");
    }

    const groq = new Groq({ apiKey });

    const prompt = `
  You are an expert Resume Analyzer and Career Coach. 
  I will provide you with the text content of a resume and a job description. 
  
  Job Title: ${jobTitle}
  Job Description: ${jobDescription}

  Resume Content:
  ${resumeText}

  Your task is to analyze the resume against the job description and provide a JSON response with the following structure:
  {
    "summary": "Professional summary of the candidate...",
    "strengths": ["List of 3-5 key strengths..."],
    "weaknesses": ["List of 3-5 areas for improvement..."],
    "ATS": {
        "score": 85,
        "tips": ["Specific tip 1...", "Specific tip 2..."]
    },
    "recommendations": ["Actionable recommendation 1...", "Actionable recommendation 2..."]
  }

  IMPORTANT: Return ONLY valid JSON properly formatted. Do not include markdown code blocks.
  `;

    console.log("Sending request to Groq (llama-3.3-70b-versatile)...");

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
    console.log("---------------- RAW RESPONSE ----------------");
    console.log(content);
    console.log("----------------------------------------------");

    if (!content) throw new Error("No response content from AI");

    try {
        return JSON.parse(content);
    } catch (e) {
        throw new Error("Failed to parse AI response as JSON: " + content);
    }
}

async function main() {
    try {
        const feedback = await analyzeResume({
            jobTitle: "Software Engineer",
            jobDescription: "Must know React and Node.js",
            resumeText: "John Doe. Experienced Software Engineer with 5 years in React and Node.js. Built many apps."
        });
        console.log("Parsed Feedback:", JSON.stringify(feedback, null, 2));
    } catch (e: any) {
        console.error("Analysis Failed:", e.message);
    }
}

main();
