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
  // Determine color theme based on score
  const getTheme = (s: number) => {
    if (s >= 80) return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "Check" };
    if (s >= 50) return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "Alert" };
    return { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "X" };
  };

  const theme = getTheme(score);
  const subtitle = score >= 80 ? 'Excellent' : score >= 50 ? 'Good Start' : 'Needs Improvement';

  return (
    <div className={`glass-card p-0 overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 border-b border-white/5 flex items-center justify-between ${theme.bg}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.border} border`}>
            <span className={`text-2xl font-bold ${theme.color}`}>
              {score >= 80 ? '✓' : score >= 50 ? '!' : '⚠'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ATS Analysis</h2>
            <p className={`${theme.color} font-medium`}>{subtitle} • {score}/100</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-slate-400 leading-relaxed">
          This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
        </p>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className={`mt-0.5 flex-shrink-0 ${suggestion.type === "good" ? "text-emerald-400" : "text-amber-400"}`}>
                {suggestion.type === "good"
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                }
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>

        <p className="text-slate-500 text-sm italic border-t border-slate-800 pt-4">
          Keep refining your resume to improve your chances of getting past ATS filters.
        </p>
      </div>
    </div>
  )
}

export default ATS
