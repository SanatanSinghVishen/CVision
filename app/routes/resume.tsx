import { Link, useParams, useNavigate, useLocation } from "react-router";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";
import {
    ArrowLeft, ExternalLink, ShieldAlert, TrendingUp, Target, Award,
    FileText, Zap, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
    BarChart3
} from "lucide-react";
import Navbar from "~/components/Navbar";

export const meta = () => ([
    { title: 'CVision | Resume Analysis' },
    { name: 'description', content: 'Detailed AI-powered analysis of your resume' },
])

// ─── Score Ring Component ──────────────────────────────────────────
const ScoreRing = ({ score, size = 120, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) => {
    const [anim, setAnim] = useState(0);
    useEffect(() => { const t = setTimeout(() => setAnim(score), 300); return () => clearTimeout(t); }, [score]);
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (anim / 100) * circ;
    const color = score >= 80 ? ['#10b981', '#059669'] : score >= 60 ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626'];
    const textColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={`url(#g-${score})`} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out" />
                <defs>
                    <linearGradient id={`g-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color[0]} />
                        <stop offset="100%" stopColor={color[1]} />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-extrabold ${textColor} leading-none`} style={{ fontSize: size * 0.22 }}>{score}</span>
                <span className="text-slate-400 font-medium" style={{ fontSize: size * 0.1 }}>/100</span>
            </div>
        </div>
    );
};

// ─── Score Bar ──────────────────────────────────────────────────────
const ScoreBar = ({ score }: { score: number }) => {
    const [anim, setAnim] = useState(0);
    useEffect(() => { const t = setTimeout(() => setAnim(score), 500); return () => clearTimeout(t); }, [score]);
    const bgColor = score >= 80 ? 'from-emerald-400 to-emerald-500' : score >= 60 ? 'from-amber-400 to-amber-500' : 'from-rose-400 to-rose-500';
    return (
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${bgColor} transition-all duration-1000 ease-out`}
                style={{ width: `${anim}%` }} />
        </div>
    );
};

// ─── Category Panel ─────────────────────────────────────────────────
const CategoryPanel = ({ title, icon: Icon, score, tips, accentColor }: {
    title: string; icon: any; score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
    accentColor: string;
}) => {
    const [open, setOpen] = useState(false);
    const goodTips = tips?.filter(t => t.type === 'good') || [];
    const improveTips = tips?.filter(t => t.type === 'improve') || [];
    const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';
    const scoreLabelColor = score >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-rose-600 bg-rose-50 border-rose-200';

    return (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden hover:border-slate-300 transition-all">
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-slate-50/70 transition-colors group"
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${accentColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreLabelColor}`}>{scoreLabel}</span>
                    </div>
                    <ScoreBar score={score} />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-2xl font-extrabold text-slate-900">{score}<span className="text-sm font-medium text-slate-400">/100</span></span>
                    {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-slate-100 px-6 py-6 bg-slate-50/50 animate-fade-in-up">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        {goodTips.length > 0 && (
                            <div>
                                <h4 className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" /> Strengths ({goodTips.length})
                                </h4>
                                <div className="space-y-3">
                                    {goodTips.map((tip, i) => (
                                        <div key={i} className="bg-white border border-emerald-100 rounded-2xl p-4">
                                            <p className="font-bold text-slate-800 text-sm mb-1">{tip.tip}</p>
                                            {tip.explanation && <p className="text-slate-500 text-xs leading-relaxed">{tip.explanation}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Improvements */}
                        {improveTips.length > 0 && (
                            <div>
                                <h4 className="text-sm font-extrabold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" /> Improve ({improveTips.length})
                                </h4>
                                <div className="space-y-3">
                                    {improveTips.map((tip, i) => (
                                        <div key={i} className="bg-white border border-amber-100 rounded-2xl p-4">
                                            <p className="font-bold text-slate-800 text-sm mb-1">{tip.tip}</p>
                                            {tip.explanation && <p className="text-slate-500 text-xs leading-relaxed">{tip.explanation}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── ATS Panel ──────────────────────────────────────────────────────
const ATSPanel = ({ score, tips }: { score: number; tips: { type: "good" | "improve"; tip: string }[] }) => {
    const goodTips = tips?.filter(t => t.type === 'good') || [];
    const improveTips = tips?.filter(t => t.type === 'improve') || [];
    const scoreLabel = score >= 80 ? 'High Compatibility' : score >= 50 ? 'Moderate Compatibility' : 'Low Compatibility';
    const headerColor = score >= 80 ? 'bg-emerald-50 border-emerald-200' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';

    return (
        <div className={`bg-white border rounded-3xl shadow-sm overflow-hidden ${score >= 80 ? 'border-emerald-200' : score >= 50 ? 'border-amber-200' : 'border-rose-200'}`}>
            <div className={`px-6 py-5 border-b flex items-center gap-5 ${headerColor}`}>
                <ScoreRing score={score} size={80} strokeWidth={8} />
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900">ATS Compatibility</h2>
                    <p className={`font-bold text-sm mt-0.5 ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {scoreLabel} · {score}/100
                    </p>
                    <p className="text-slate-500 font-medium text-xs mt-1">How well your resume passes automated screening systems</p>
                </div>
            </div>
            <div className="px-6 py-5 grid md:grid-cols-2 gap-5">
                {goodTips.length > 0 && (
                    <div>
                        <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passing Checks ({goodTips.length})
                        </h4>
                        <div className="space-y-2">
                            {goodTips.map((t, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-700 font-medium text-sm">{t.tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {improveTips.length > 0 && (
                    <div>
                        <h4 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Action Required ({improveTips.length})
                        </h4>
                        <div className="space-y-2">
                            {improveTips.map((t, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-700 font-medium text-sm">{t.tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────
const Resume = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [resume, setResume] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [imagePublicUrl, setImagePublicUrl] = useState<string | null>(null);
    const [resumePublicUrl, setResumePublicUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchResume = async () => {
            if (location.state?.guestMode && location.state?.feedback) {
                setResume({ company_name: "Guest Analysis", job_title: "Temporary Analysis (not saved)", feedback: location.state.feedback });
                setLoading(false);
                return;
            }
            if (!id) { navigate('/'); return; }
            const { data, error } = await supabase.from('resumes').select('*').eq('id', id).single();
            if (mounted) {
                if (error || !data) { setError("Resume not found or access denied."); setLoading(false); return; }
                setResume(data);
                if (data.resume_path) setResumePublicUrl(supabase.storage.from('resumes').getPublicUrl(data.resume_path).data.publicUrl);
                if (data.image_path) setImagePublicUrl(supabase.storage.from('resumes').getPublicUrl(data.image_path).data.publicUrl);
                setLoading(false);
            }
        };
        fetchResume();
        return () => { mounted = false; };
    }, [id, navigate, location.state]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Loading analysis...</p>
                </div>
            </main>
        );
    }

    if (error || !resume) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-4">
                <ShieldAlert className="w-16 h-16 text-rose-400" />
                <h1 className="text-2xl font-extrabold text-slate-900">Not Found</h1>
                <p className="text-slate-500 font-medium">{error || "Something went wrong."}</p>
                <Link to="/" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all">Go Home</Link>
            </main>
        );
    }

    const feedback = resume.feedback || location.state?.feedback;

    if (!feedback) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md w-full shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-violet-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Analysis in progress...</h2>
                    <p className="text-slate-500 font-medium">Please wait or try re-uploading.</p>
                </div>
            </main>
        );
    }

    // Compute overall score
    const catScores = [
        feedback.toneAndStyle?.score, feedback.content?.score,
        feedback.structure?.score, feedback.skills?.score
    ].filter(Boolean);
    const overallScore = catScores.length > 0
        ? Math.round(catScores.reduce((a: number, b: number) => a + b, 0) / catScores.length)
        : feedback.ATS?.score || 0;

    const categories = [
        { key: 'toneAndStyle', title: 'Tone & Style', icon: Award, accentColor: 'bg-violet-100 text-violet-600' },
        { key: 'content', title: 'Content', icon: FileText, accentColor: 'bg-sky-100 text-sky-600' },
        { key: 'structure', title: 'Structure', icon: BarChart3, accentColor: 'bg-fuchsia-100 text-fuchsia-600' },
        { key: 'skills', title: 'Skills Match', icon: Target, accentColor: 'bg-teal-100 text-teal-600' },
    ];

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            {/* Sticky Top Bar */}
            <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={location.state?.guestMode ? "/" : "/dashboard"}
                            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Back
                        </Link>
                        <span className="text-slate-300">|</span>
                        <div>
                            <span className="font-extrabold text-slate-900">{resume.company_name}</span>
                            {resume.job_title && <span className="text-slate-500 font-medium ml-2 text-sm">· {resume.job_title}</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {location.state?.guestMode && (
                            <Link to="/auth" className="hidden sm:inline-flex px-4 py-1.5 rounded-full text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all">
                                Save to Dashboard →
                            </Link>
                        )}
                        {resumePublicUrl && (
                            <a href={resumePublicUrl} target="_blank" rel="noopener noreferrer"
                                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border border-slate-200 text-slate-600 hover:border-slate-400 transition-all">
                                <ExternalLink className="w-3.5 h-3.5" /> View PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">

                    {/* ─── Left: Sticky Sidebar ────────────────── */}
                    <aside className="lg:sticky lg:top-36 space-y-4">
                        {/* Overall Score Card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center">
                            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Overall Score</p>
                            <div className="flex justify-center mb-4">
                                <ScoreRing score={overallScore} size={140} strokeWidth={12} />
                            </div>
                            <p className="text-slate-500 font-medium text-sm">
                                {overallScore >= 80 ? '🎉 Outstanding! Your resume is highly competitive.' :
                                    overallScore >= 60 ? '👍 Good foundation. Small improvements will make a big difference.' :
                                        '💡 Several key areas need attention before applying.'}
                            </p>
                        </div>

                        {/* Category Score Mini Cards */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Category Breakdown</p>
                            {categories.map(cat => {
                                const score = feedback[cat.key]?.score || 0;
                                return (
                                    <div key={cat.key}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-bold text-slate-700">{cat.title}</span>
                                            <span className={`text-sm font-extrabold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {score}
                                            </span>
                                        </div>
                                        <ScoreBar score={score} />
                                    </div>
                                );
                            })}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-bold text-slate-700">ATS</span>
                                    <span className={`text-sm font-extrabold ${(feedback.ATS?.score || 0) >= 80 ? 'text-emerald-600' : (feedback.ATS?.score || 0) >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                        {feedback.ATS?.score || 0}
                                    </span>
                                </div>
                                <ScoreBar score={feedback.ATS?.score || 0} />
                            </div>
                        </div>

                        {/* PDF Preview */}
                        {imagePublicUrl && (
                            <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm overflow-hidden max-h-80 hidden lg:block">
                                <img src={imagePublicUrl} className="w-full object-contain rounded-2xl" alt="resume preview" />
                            </div>
                        )}
                        {location.state?.guestMode && (
                            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center hidden lg:block">
                                <p className="text-sm font-bold text-amber-800 mb-0.5">Guest Mode</p>
                                <p className="text-xs font-medium text-amber-700">PDF not saved for privacy. Sign in to save analyses.</p>
                            </div>
                        )}
                    </aside>

                    {/* ─── Right: Analysis Panels ──────────────── */}
                    <section className="space-y-5 min-w-0">
                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'ATS Score', value: feedback.ATS?.score || 0, icon: TrendingUp, color: 'text-violet-600 bg-violet-50 border-violet-200' },
                                { label: 'Content', value: feedback.content?.score || 0, icon: FileText, color: 'text-sky-600 bg-sky-50 border-sky-200' },
                                { label: 'Structure', value: feedback.structure?.score || 0, icon: BarChart3, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' },
                                { label: 'Skills', value: feedback.skills?.score || 0, icon: Target, color: 'text-teal-600 bg-teal-50 border-teal-200' },
                            ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className={`rounded-2xl p-4 border ${color} flex flex-col gap-1`}>
                                    <Icon className="w-4 h-4 mb-1" />
                                    <p className="text-2xl font-extrabold">{value}</p>
                                    <p className="text-xs font-bold opacity-70">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* ATS Panel */}
                        <ATSPanel score={feedback.ATS?.score || 0} tips={feedback.ATS?.tips || []} />

                        {/* Category Panels */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-slate-400" /> Detailed Breakdown
                            </h2>
                            {categories.map(cat => feedback[cat.key] && (
                                <CategoryPanel
                                    key={cat.key}
                                    title={cat.title}
                                    icon={cat.icon}
                                    score={feedback[cat.key].score}
                                    tips={feedback[cat.key].tips || []}
                                    accentColor={cat.accentColor}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </main>
    );
};

export default Resume;
