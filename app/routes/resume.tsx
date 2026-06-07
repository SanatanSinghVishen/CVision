import { Link, useParams, useNavigate, useLocation } from "react-router";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";
import {
    ArrowLeft, ExternalLink, ShieldAlert, Target, Award,
    FileText, Zap, CheckCircle2, AlertTriangle,
    BarChart3, RefreshCcw, Sparkles, Download, Share2, MoveRight
} from "lucide-react";
import Navbar from "~/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";
import { Tabs } from "~/components/ui/Tabs";
import type { Feedback } from "~/types/feedback";

export const meta = () => ([
    { title: 'CVision | Resume Analysis' },
    { name: 'description', content: 'Detailed AI-powered analysis of your resume' },
])

// ─── Score Ring Component ──────────────────────────────────────────
const ScoreRing = ({ score, size = 160, strokeWidth = 12 }: { score: number; size?: number; strokeWidth?: number }) => {
    const [anim, setAnim] = useState(0);
    useEffect(() => { const t = setTimeout(() => setAnim(score), 300); return () => clearTimeout(t); }, [score]);
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (anim / 100) * circ;
    const color = score >= 71 ? ['#10B981', '#059669'] : score >= 41 ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626'];
    const textColor = score >= 71 ? 'text-[#10B981]' : score >= 41 ? 'text-[#F59E0B]' : 'text-[#EF4444]';
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="-rotate-90 transform" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272A" strokeWidth={strokeWidth} />
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
                <span className={`font-bold ${textColor} leading-none`} style={{ fontSize: size * 0.25 }}>
                    <AnimatedCounter from={0} to={score} duration={1} />
                </span>
                <span className="text-[#6B7280] font-medium mt-1" style={{ fontSize: size * 0.1 }}>Match Score</span>
            </div>
        </div>
    );
};

// ─── Score Bar ──────────────────────────────────────────────────────
const ScoreBar = ({ score, label }: { score: number, label: string }) => {
    const bgColor = score >= 71 ? 'bg-[#10B981]' : score >= 41 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]';
    const statusText = score >= 71 ? 'Strong' : score >= 41 ? 'Good' : 'Needs Work';
    return (
        <div className="space-y-1.5 mb-4">
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-[#A1A1AA]">{label}</span>
                <span className="text-xs font-bold text-[#F8F9FC] flex items-center gap-2">
                    <span className="opacity-70 font-normal">{statusText}</span>
                    {score}/100
                </span>
            </div>
            <div className="w-full bg-[#27272A] rounded-full h-2 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${bgColor}`} 
                />
            </div>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────
const Resume = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [resume, setResume] = useState<ResumeRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchResume = async () => {
            if (location.state?.guestMode && location.state?.feedback) {
                setResume({
                    id: '',
                    user_id: '',
                    company_name: "Guest Analysis",
                    job_title: "Temporary Analysis (not saved)",
                    resume_path: '',
                    image_path: '',
                    created_at: '',
                    feedback: location.state.feedback as Feedback,
                });
                setLoading(false);
                return;
            }
            if (!id) { navigate('/'); return; }
            const { data, error } = await supabase.from('resumes').select('*').eq('id', id).single();
            if (mounted) {
                if (error || !data) { setError("Resume not found or access denied."); setLoading(false); return; }
                setResume(data);
                setLoading(false);
            }
        };
        fetchResume();
        return () => { mounted = false; };
    }, [id, navigate, location.state]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />
                    <p className="text-[#6B7280] font-medium">Loading analysis...</p>
                </div>
            </main>
        );
    }

    if (error || !resume) {
        return (
            <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4 p-4 text-[#F8F9FC]">
                <ShieldAlert className="w-16 h-16 text-[#EF4444]" />
                <h1 className="text-2xl font-bold">Not Found</h1>
                <p className="text-[#A1A1AA] font-medium">{error || "Something went wrong."}</p>
                <Link to="/" className="px-6 py-3 bg-[#13131A] text-white rounded-lg font-bold border border-[#27272A] hover:bg-[#27272A] transition-all">Go Home</Link>
            </main>
        );
    }

    const feedback: Feedback | null = resume?.feedback ?? (location.state?.feedback ?? null);

    if (!feedback) {
        return (
            <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
                <Card className="p-12 text-center max-w-md w-full">
                    <div className="w-16 h-16 rounded-full bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-4 border border-[#6366F1]/20">
                        <Zap className="w-8 h-8 text-[#6366F1] animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#F8F9FC] mb-2">Analysis in progress...</h2>
                    <p className="text-[#A1A1AA] font-medium">Please wait or try re-uploading.</p>
                </Card>
            </main>
        );
    }

    // Compute overall score
    const overallScore = feedback.overallScore || 0;

    // Build Tabs
    const tabs = [
        {
            id: 'summary',
            label: 'Summary',
            content: (
                <div className="space-y-8 animate-fade-in-up">
                    <Card className="p-6 border-[#27272A]">
                        <h3 className="text-lg font-bold text-[#F8F9FC] mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#6366F1]" /> AI Executive Summary
                        </h3>
                        <p className="text-[#A1A1AA] leading-relaxed text-base">
                            {feedback.summary || "Your resume has been analyzed against the provided job description. Check the detailed sections for specific insights."}
                        </p>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="p-6 border-[#27272A]">
                            <h3 className="text-sm font-bold text-[#10B981] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Strong Matches
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {feedback.strengths?.length ? feedback.strengths.map((s, i) => (
                                    <Badge key={i} variant="success">{s}</Badge>
                                )) : <p className="text-[#6B7280] text-sm">No specific strengths highlighted.</p>}
                            </div>
                        </Card>
                        <Card className="p-6 border-[#27272A]">
                            <h3 className="text-sm font-bold text-[#EF4444] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Missing Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {feedback.weaknesses?.length ? feedback.weaknesses.map((w, i) => (
                                    <Badge key={i} variant="error">{w}</Badge>
                                )) : <p className="text-[#6B7280] text-sm">No critical weaknesses identified.</p>}
                            </div>
                        </Card>
                    </div>

                    {(feedback.matchedKeywords?.length > 0 || feedback.missingKeywords?.length > 0) && (
                        <Card className="p-6 border-[#27272A]">
                            <h3 className="text-sm font-bold text-[#F8F9FC] mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-[#6366F1]" /> Keyword Match
                            </h3>
                            <div className="space-y-4">
                                {feedback.matchedKeywords?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">✅ Matched</p>
                                        <div className="flex flex-wrap gap-2">
                                            {feedback.matchedKeywords.map((k, i) => <Badge key={`m-${i}`} variant="success">{k}</Badge>)}
                                        </div>
                                    </div>
                                )}
                                {feedback.missingKeywords?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-[#EF4444] uppercase tracking-wider mb-2">❌ Missing</p>
                                        <div className="flex flex-wrap gap-2">
                                            {feedback.missingKeywords.map((k, i) => <Badge key={`miss-${i}`} variant="error">{k}</Badge>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )
        },
        {
            id: 'sections',
            label: 'Section Suggestions',
            content: (
                <div className="space-y-6 animate-fade-in-up">
                    {feedback.sectionFeedback?.sort((a, b) => a.reorderPriority - b.reorderPriority).map((update, i) => (
                        <CollapsibleSectionCard key={i} update={update} />
                    ))}
                    {!feedback.sectionFeedback?.length && (
                        <p className="text-[#A1A1AA]">No specific section updates suggested.</p>
                    )}
                </div>
            )
        },
        {
            id: 'ats',
            label: 'ATS Deep Dive',
            content: (
                <div className="space-y-6 animate-fade-in-up">
                    <Card className="p-8 text-center flex flex-col items-center justify-center bg-[#13131A] border-[#27272A]">
                        <h3 className="text-lg font-bold text-[#F8F9FC] mb-6">ATS Parsability</h3>
                        <ScoreRing score={feedback.ATS?.score || 0} size={140} strokeWidth={10} />
                        <p className="text-[#A1A1AA] mt-6 max-w-md">
                            This score represents how easily Applicant Tracking Systems can read and extract data from your PDF.
                        </p>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="p-6 border-[#27272A]">
                            <h4 className="text-sm font-bold text-[#10B981] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> ATS Tips
                            </h4>
                            <div className="space-y-3">
                                {feedback.ATS?.tips?.map((t, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                                        <p className="text-[#A1A1AA] text-sm">{t}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="p-6 border-[#27272A]">
                            <h4 className="text-sm font-bold text-[#F59E0B] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Formatting Issues Detected
                            </h4>
                            <div className="space-y-3">
                                {feedback.ATS?.formattingIssues?.length ? feedback.ATS.formattingIssues.map((issue, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0" />
                                        <p className="text-[#A1A1AA] text-sm">{issue}</p>
                                    </div>
                                )) : <p className="text-[#6B7280] text-sm">No critical formatting issues found.</p>}
                            </div>
                        </Card>
                    </div>
                </div>
            )
        },
        {
            id: 'tone',
            label: 'Tone & Style',
            content: (
                <div className="space-y-6 animate-fade-in-up">
                    <Card className="p-6 border-[#27272A]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#F8F9FC]">Tone & Style Analysis</h3>
                            <Badge variant={feedback.toneAndStyle?.score >= 70 ? 'success' : 'warning'}>Score: {feedback.toneAndStyle?.score}/100</Badge>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            {feedback.toneAndStyle?.tips?.map((tip, i) => (
                                <div key={i} className={`p-4 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5`}>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                                        <div>
                                            <p className={`font-bold mb-1 text-[#10B981]`}>{tip}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {feedback.toneAndStyle?.rewrites?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-[#F8F9FC] mb-4">Suggested Rewrites</h3>
                                <div className="space-y-4">
                                    {feedback.toneAndStyle.rewrites.map((rewrite, i) => (
                                        <div key={i} className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-[#1E1E24] rounded-lg p-4 border border-[#27272A]">
                                                <p className="text-xs font-bold text-[#EF4444] mb-2 uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Original</p>
                                                <p className="text-[#A1A1AA] text-sm line-through decoration-[#EF4444]/50">{rewrite.original}</p>
                                            </div>
                                            <div className="bg-[#6366F1]/5 rounded-lg p-4 border border-[#6366F1]/20">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-bold text-[#6366F1] uppercase tracking-wide flex items-center gap-1"><Sparkles className="w-3 h-3"/> Improved</p>
                                                </div>
                                                <p className="text-[#F8F9FC] text-sm font-medium">{rewrite.improved}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )
        },
        {
            id: 'structure',
            label: 'Structure',
            content: (
                <div className="space-y-6 animate-fade-in-up">
                    <Card className="p-6 border-[#27272A]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#F8F9FC]">Resume Structure</h3>
                            <Badge variant={feedback.structure?.score >= 70 ? 'success' : 'warning'}>Score: {feedback.structure?.score}/100</Badge>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            {feedback.structure?.tips?.map((tip, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#A1A1AA] flex-shrink-0" />
                                    <p className="text-[#F8F9FC]">{tip}</p>
                                </div>
                            ))}
                        </div>

                        {feedback.recommendedSectionOrder?.length > 0 && (
                            <div className="mt-8 border-t border-[#27272A] pt-6">
                                <h4 className="text-sm font-bold text-[#A1A1AA] uppercase tracking-wider mb-4">Recommended Section Order</h4>
                                <ol className="list-decimal list-inside space-y-2 text-[#F8F9FC] marker:text-[#6366F1] marker:font-bold">
                                    {feedback.recommendedSectionOrder.map((section, i) => (
                                        <li key={i} className="pl-2">{section}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </Card>
                </div>
            )
        },
        {
            id: 'tailoring',
            label: `For ${resume.company_name}`,
            content: (
                <div className="space-y-6 animate-fade-in-up">
                    <Card className="p-6 border-[#27272A]">
                        <h3 className="text-lg font-bold text-[#F8F9FC] mb-2 flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#6366F1]" /> Action Plan
                        </h3>
                        <p className="text-[#A1A1AA] mb-6 text-sm">Top priority actions to take before applying to {resume.company_name}.</p>

                        <div className="space-y-4 mb-8">
                            {feedback.recommendations?.map((rec, i) => (
                                <div key={i} className="flex gap-4 items-start p-4 bg-[#1E1E24] rounded-xl border border-[#27272A]">
                                    <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 flex items-center justify-center shrink-0 border border-[#6366F1]/20 text-[#6366F1] font-bold">
                                        {i + 1}
                                    </div>
                                    <p className="text-[#F8F9FC] leading-relaxed pt-1">{rec}</p>
                                </div>
                            ))}
                        </div>

                        {feedback.companySpecificTips?.length > 0 && (
                            <div className="border-t border-[#27272A] pt-6">
                                <h3 className="text-lg font-bold text-[#F8F9FC] mb-4 flex items-center gap-2">
                                    <BuildingLogo name={resume.company_name} /> {resume.company_name} Insights
                                </h3>
                                <ul className="space-y-3">
                                    {feedback.companySpecificTips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0" />
                                            <p className="text-[#A1A1AA]">{tip}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-[#0A0A0F] font-sans text-[#F8F9FC]">
            <Navbar />

            {/* Sticky Top Bar */}
            <div className="sticky top-[72px] z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#27272A]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={location.state?.guestMode ? "/" : "/dashboard"}
                            className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#F8F9FC] transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Link>
                        <div className="h-4 w-px bg-[#27272A]" />
                        <div className="flex items-center gap-2">
                            <BuildingLogo name={resume.company_name} />
                            <span className="font-bold text-[#F8F9FC]">{resume.company_name}</span>
                            {resume.job_title && <span className="text-[#6B7280] font-medium text-sm hidden sm:inline">· {resume.job_title}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">

                    {/* ─── Left: Sticky Sidebar ────────────────── */}
                    <aside className="lg:sticky lg:top-[160px] space-y-6">
                        {/* Overall Score Card */}
                        <Card className="p-6 text-center border-[#27272A] bg-[#13131A]">
                            <div className="flex justify-center mb-6">
                                <ScoreRing score={overallScore} />
                            </div>
                            
                            {/* Sub-scores */}
                            <div className="mt-8 space-y-2 text-left">
                                <ScoreBar label="ATS Compatibility" score={feedback.ATS?.score || 0} />
                                <ScoreBar label="Content & Relevance" score={feedback.content?.score || 0} />
                                <ScoreBar label="Tone & Style" score={feedback.toneAndStyle?.score || 0} />
                                <ScoreBar label="Structure" score={feedback.structure?.score || 0} />
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="p-4 border-[#27272A] bg-[#13131A] space-y-2">
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm text-[#F8F9FC] bg-[#27272A] hover:bg-[#3F3F46] transition-colors">
                                <Download className="w-4 h-4" /> Download Report PDF
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm text-[#A1A1AA] hover:text-[#F8F9FC] hover:bg-[#27272A] transition-colors">
                                <RefreshCcw className="w-4 h-4" /> Re-analyze
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm text-[#A1A1AA] hover:text-[#F8F9FC] hover:bg-[#27272A] transition-colors">
                                <Share2 className="w-4 h-4" /> Share Link
                            </button>
                        </Card>
                    </aside>

                    {/* ─── Right: Main Content Tabs ──────────────── */}
                    <section className="min-w-0">
                        <Tabs tabs={tabs} stickyOffset={128} />
                    </section>

                </div>
            </div>
        </main>
    );
};

// Sub-components

function BuildingLogo({ name }: { name: string }) {
    if (name === "Guest Analysis" || !name) return <div className="w-6 h-6 rounded-md bg-[#27272A]" />;
    return (
        <img 
            src={`https://logo.clearbit.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            className="w-6 h-6 rounded-sm object-contain bg-white"
            alt=""
        />
    );
}

function CollapsibleSectionCard({ update }: { update: any }) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Status color mapping
    const getBadgeConfig = (status: string) => {
        switch (status) {
            case 'strong': return { variant: 'success' as const, label: '✅ Strong' };
            case 'missing': return { variant: 'error' as const, label: '❌ Missing' };
            default: return { variant: 'warning' as const, label: '⚠️ Improve' };
        }
    };
    
    const badgeConfig = getBadgeConfig(update.status);

    return (
        <Card className="border-[#27272A] overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1E1E24] transition-colors text-left"
            >
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-[#F8F9FC]">{update.section}</h3>
                    <Badge variant={badgeConfig.variant}>
                        {badgeConfig.label}
                    </Badge>
                </div>
                <div className="text-[#6B7280]">
                    {isOpen ? <ArrowLeft className="w-5 h-5 rotate-90 transition-transform" /> : <ArrowLeft className="w-5 h-5 -rotate-90 transition-transform" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[#27272A] px-6 py-5 bg-[#13131A]/50"
                    >
                        <div className="space-y-6">
                            {update.issues?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-[#EF4444] uppercase tracking-wider mb-3">Issues Identified</h4>
                                    <ul className="space-y-2">
                                        {update.issues.map((issue: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
                                                <p className="text-[#A1A1AA] text-sm leading-relaxed">{issue}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {update.suggestedBullets?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-[#6366F1] uppercase tracking-wider mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Suggested Bullets</h4>
                                    <div className="space-y-4">
                                        {update.suggestedBullets.map((bullet: string, i: number) => (
                                            <div key={i} className="bg-[#6366F1]/5 rounded-lg p-4 border border-[#6366F1]/20 group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="text-[#F8F9FC] text-sm font-mono whitespace-pre-wrap">{bullet}</p>
                                                    <button 
                                                        onClick={() => navigator.clipboard.writeText(bullet.replace(/^•\s*/, ''))}
                                                        className="text-xs font-medium text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

export default Resume;
