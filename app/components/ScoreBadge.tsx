interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = '';
  let badgeText = '';

  if (score > 70) {
    badgeColor = 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20';
    badgeText = 'Strong';
  } else if (score > 49) {
    badgeColor = 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
    badgeText = 'Good Start';
  } else {
    badgeColor = 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20';
    badgeText = 'Needs Work';
  }

  return (
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
      <p className="text-sm font-medium">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;
