export interface SectionFeedback {
  section: string
  status: 'strong' | 'improve' | 'missing'
  issues: string[]
  suggestedBullets: string[]
  reorderPriority: number
}

export interface Rewrite {
  original: string
  improved: string
}

export interface Feedback {
  summary: string
  overallScore: number
  matchedKeywords: string[]
  missingKeywords: string[]
  strengths: string[]
  weaknesses: string[]
  sectionFeedback: SectionFeedback[]
  recommendedSectionOrder: string[]
  ATS: {
    score: number
    tips: string[]
    formattingIssues: string[]
  }
  toneAndStyle: {
    score: number
    tips: string[]
    rewrites: Rewrite[]
  }
  content: {
    score: number
    tips: string[]
  }
  structure: {
    score: number
    tips: string[]
  }
  companySpecificTips: string[]
  recommendations: string[]
}
