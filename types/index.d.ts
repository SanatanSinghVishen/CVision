import type { Feedback } from "../app/types/feedback";

declare global {
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
}

