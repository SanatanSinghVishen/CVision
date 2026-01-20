import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: any }) => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (!imagePath) return;
        const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(imagePath);
        setImageUrl(publicUrl);
    }, [imagePath]);

    return (
        <Link to={`/resume/${id}`} className="resume-card-modern group animate-fade-in-up flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <h2 className="!text-white !text-xl font-bold truncate max-w-[200px]" title={companyName}>
                        {companyName || "Unknown Company"}
                    </h2>
                    <h3 className="text-slate-400 text-sm truncate max-w-[200px]" title={jobTitle}>
                        {jobTitle || "General Application"}
                    </h3>
                </div>
                <div className="transform transition-transform group-hover:scale-110">
                    <ScoreCircle score={feedback?.ATS?.score || feedback?.overallScore || 0} />
                </div>
            </div>

            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="resume thumbnail"
                        className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        📄
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <span className="text-white font-medium px-4 py-2 bg-indigo-600/90 rounded-full text-sm backdrop-blur-sm">
                        View Analysis
                    </span>
                </div>
            </div>
        </Link>
    )
}
export default ResumeCard
