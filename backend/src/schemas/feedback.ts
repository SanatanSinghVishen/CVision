import { z } from 'zod';

const SectionFeedbackSchema = z.object({
  section: z.string(),
  status: z.enum(['strong', 'improve', 'missing']),
  issues: z.array(z.string()),
  suggestedBullets: z.array(z.string()),
  reorderPriority: z.number().min(1).max(6),
});

const RewriteSchema = z.object({
  original: z.string(),
  improved: z.string(),
});

export const FeedbackSchema = z.object({
  summary: z.string(),
  overallScore: z.number().min(0).max(100),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  sectionFeedback: z.array(SectionFeedbackSchema),
  recommendedSectionOrder: z.array(z.string()),
  ATS: z.object({
    score: z.number().min(0).max(100),
    tips: z.array(z.string()),
    formattingIssues: z.array(z.string()),
  }),
  toneAndStyle: z.object({
    score: z.number().min(0).max(100),
    tips: z.array(z.string()),
    rewrites: z.array(RewriteSchema),
  }),
  content: z.object({ score: z.number(), tips: z.array(z.string()) }),
  structure: z.object({ score: z.number(), tips: z.array(z.string()) }),
  companySpecificTips: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type Feedback = z.infer<typeof FeedbackSchema>;
