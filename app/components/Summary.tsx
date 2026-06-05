import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
    const getColorClass = (s: number) => {
        if (s >= 80) return "text-[#10B981]";
        if (s >= 60) return "text-[#F59E0B]";
        return "text-[#EF4444]";
    };

    return (
        <div className="bg-[#0A0A0F] rounded-2xl p-4 flex items-center justify-between border border-[#27272A] transition-all hover:border-[#3F3F46]">
            <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#F8F9FC]">{title}</span>
                <ScoreBadge score={score} />
            </div>
            <div className="text-xl font-bold flex items-baseline">
                <span className={getColorClass(score)}>{score}</span>
                <span className="text-[#6B7280] font-medium text-sm ml-1">/100</span>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: any }) => {
    const calculateOverallScore = () => {
        if (!feedback) return 0;

        const scores = [
            feedback.toneAndStyle?.score || 0,
            feedback.content?.score || 0,
            feedback.structure?.score || 0,
            feedback.skills?.score || 0
        ];

        const validScores = scores.filter((s: number) => s > 0);
        if (validScores.length === 0) return feedback.ATS?.score || 0;

        return Math.round(validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length);
    };

    const overallScore = calculateOverallScore();

    return (
        <div className="bg-[#13131A] border border-[#27272A] rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex flex-row items-center gap-6 pb-6 border-b border-[#27272A]">
                <div className="transform scale-90 sm:scale-100 drop-shadow-sm">
                    <ScoreGauge score={overallScore} />
                </div>

                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold text-[#F8F9FC]">Overall Score</h2>
                    <p className="text-sm font-medium text-[#A1A1AA]">
                        Based on industry standards and ATS algorithms.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <Category title="Tone & Style" score={feedback?.toneAndStyle?.score || 0} />
                <Category title="Content" score={feedback?.content?.score || 0} />
                <Category title="Structure" score={feedback?.structure?.score || 0} />
                <Category title="Skills" score={feedback?.skills?.score || 0} />
            </div>
        </div>
    )
}
export default Summary
