import React from 'react'

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const getTheme = (s: number) => {
    if (s >= 80) return { 
        text: "text-[#10B981]", 
        iconBg: "bg-[#10B981]/10", 
        iconBorder: "border-[#10B981]/20",
    };
    if (s >= 50) return { 
        text: "text-[#F59E0B]", 
        iconBg: "bg-[#F59E0B]/10", 
        iconBorder: "border-[#F59E0B]/20",
    };
    return { 
        text: "text-[#EF4444]", 
        iconBg: "bg-[#EF4444]/10", 
        iconBorder: "border-[#EF4444]/20",
    };
  };

  const theme = getTheme(score);
  const subtitle = score >= 80 ? 'Excellent' : score >= 50 ? 'Good Start' : 'Needs Improvement';

  return (
    <div className="bg-[#13131A] border border-[#27272A] rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.iconBg} border ${theme.iconBorder}`}>
            <span className={`text-2xl font-bold ${theme.text}`}>
              {score >= 80 ? '✓' : score >= 50 ? '!' : '⚠'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#F8F9FC]">ATS Analysis</h2>
            <p className={`${theme.text} font-medium mt-0.5`}>{subtitle} • <span className="opacity-70">{score}/100</span></p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <p className="text-[#A1A1AA] font-medium leading-relaxed">
          This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
        </p>

        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex gap-4 p-5 rounded-2xl bg-[#0A0A0F] border border-[#27272A]">
              <div className={`mt-0.5 flex-shrink-0 ${suggestion.type === "good" ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                {suggestion.type === "good"
                  ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                }
              </div>
              <p className="text-[#A1A1AA] font-medium leading-relaxed">
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[#6B7280] font-medium text-sm italic border-t border-[#27272A] pt-6 mt-6">
          Keep refining your resume to improve your chances of getting past ATS filters.
        </p>
      </div>
    </div>
  )
}

export default ATS
