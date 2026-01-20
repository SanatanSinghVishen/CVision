import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
    // Score Color Logic
    const getColorClass = (s: number) => {
        if (s >= 80) return "text-emerald-400";
        if (s >= 60) return "text-amber-400";
        return "text-rose-400";
    };

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between border border-slate-700/50">
            <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-slate-200">{title}</span>
                <ScoreBadge score={score} />
            </div>
            <div className="text-xl font-bold">
                <span className={getColorClass(score)}>{score}</span>
                <span className="text-slate-600 text-sm ml-1">/100</span>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: any }) => {
    // Calculate overall score from category scores
    const calculateOverallScore = () => {
        if (!feedback) return 0;

        const scores = [
            feedback.toneAndStyle?.score || 0,
            feedback.content?.score || 0,
            feedback.structure?.score || 0,
            feedback.skills?.score || 0
        ];

        const validScores = scores.filter(s => s > 0);
        if (validScores.length === 0) return feedback.ATS?.score || 0;

        return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    };

    const overallScore = calculateOverallScore();

    return (
        <div className="glass-card flex flex-col gap-6">
            <div className="flex flex-row items-center gap-6 pb-4 border-b border-white/5">
                <div className="transform scale-90 sm:scale-100">
                    <ScoreGauge score={overallScore} />
                </div>

                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-white">Overall Score</h2>
                    <p className="text-sm text-slate-400">
                        Based on industry standards and ATS algorithms.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <Category title="Tone & Style" score={feedback?.toneAndStyle?.score || 0} />
                <Category title="Content" score={feedback?.content?.score || 0} />
                <Category title="Structure" score={feedback?.structure?.score || 0} />
                <Category title="Skills" score={feedback?.skills?.score || 0} />
            </div>
        </div>
    )
}
export default Summary
