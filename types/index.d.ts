/** A tip item returned by the AI for a specific category */
interface Tip {
    type: "good" | "improve";
    tip: string;
    explanation: string;
}

/** A tip item for the ATS section (no explanation field) */
interface ATSTip {
    type: "good" | "improve";
    tip: string;
}

/** Category feedback block */
interface CategoryFeedback {
    score: number;
    tips: Tip[];
}

/** Full structured feedback returned by the AI */
interface Feedback {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    ATS: {
        score: number;
        tips: ATSTip[];
    };
    toneAndStyle: CategoryFeedback;
    content: CategoryFeedback;
    structure: CategoryFeedback;
    skills: CategoryFeedback;
}

/** A resume row as stored in the Supabase `resumes` table */
interface ResumeRow {
    id: string;
    user_id: string;
    company_name: string;
    job_title: string;
    job_description?: string;
    resume_path: string;
    image_path: string;
    feedback: Feedback | null;
    created_at: string;
}

/** Legacy mock Resume type used by constants/index.ts */
interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
}
