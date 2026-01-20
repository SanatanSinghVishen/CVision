const ScoreCircle = ({ score = 75 }: { score: number }) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2; // Adjusted for padding
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = score / 100;
    const strokeDashoffset = circumference * (1 - progress);

    // Color logic
    const getGradientColors = (s: number) => {
        if (s >= 80) return ["#10b981", "#34d399"]; // Green
        if (s >= 50) return ["#fbbf24", "#fbbf24"]; // Yellow/Amber
        return ["#ef4444", "#f87171"]; // Red
    };

    const colors = getGradientColors(score);
    const gradientId = `grad-${score}`;

    return (
        <div className="relative w-[80px] h-[80px]">
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90 drop-shadow-lg"
            >
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="#334155"
                    strokeWidth={stroke}
                    fill="transparent"
                    className="opacity-50"
                />
                <defs>
                    <linearGradient id={gradientId} x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-lg text-white drop-shadow-md">{score}</span>
            </div>
        </div>
    );
};

export default ScoreCircle;
