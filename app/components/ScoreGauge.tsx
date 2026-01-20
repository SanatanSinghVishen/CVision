import { useEffect, useState } from 'react';

const ScoreGauge = ({ score }: { score: number }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 300);
        return () => clearTimeout(timer);
    }, [score]);

    const getColor = (s: number) => {
        if (s >= 80) return { from: '#10b981', to: '#059669', text: 'text-emerald-400' };
        if (s >= 60) return { from: '#f59e0b', to: '#d97706', text: 'text-amber-400' };
        return { from: '#ef4444', to: '#dc2626', text: 'text-rose-400' };
    };

    const color = getColor(score);
    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Circle */}
                <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.1)"
                    strokeWidth="12"
                />

                {/* Animated Progress Circle */}
                <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={`url(#gradient-${score})`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />

                {/* Gradient Definition */}
                <defs>
                    <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color.from} />
                        <stop offset="100%" stopColor={color.to} />
                    </linearGradient>
                </defs>
            </svg>

            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${color.text} transition-all duration-500`}>
                    {Math.round(animatedScore)}
                </span>
                <span className="text-sm text-slate-500 font-medium">/ 100</span>
            </div>
        </div>
    );
};

export default ScoreGauge;
