import type { Feedback } from "../app/types/feedback";

const mockFeedback: Feedback = {
  summary: "",
  overallScore: 90,
  matchedKeywords: [],
  missingKeywords: [],
  strengths: [],
  weaknesses: [],
  sectionFeedback: [],
  recommendedSectionOrder: [],
  ATS: { score: 90, tips: [], formattingIssues: [] },
  toneAndStyle: { score: 90, tips: [], rewrites: [] },
  content: { score: 90, tips: [] },
  structure: { score: 90, tips: [] },
  companySpecificTips: [],
  recommendations: []
};

export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: mockFeedback,
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: mockFeedback,
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: mockFeedback,
    },
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: mockFeedback,
    },
    {
        id: "5",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: mockFeedback,
    },
    {
        id: "6",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: mockFeedback,
    },
];

export const AIResponseFormat = "";
export const prepareInstructions = ({jobTitle, jobDescription}: { jobTitle: string; jobDescription: string; }) => "";
