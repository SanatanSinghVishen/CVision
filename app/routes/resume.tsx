import { Link, useParams, useNavigate, useLocation } from "react-router";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";

import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";
import Navbar from "~/components/Navbar";
import Button from "~/components/Button";

export const meta = () => ([
    { title: 'CVision | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

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
            // Guest Mode Bypass
            if (location.state?.guestMode && location.state?.feedback) {
                setResume({
                    company_name: "Guest Analysis",
                    job_title: "Generated dynamically without saving",
                    feedback: location.state.feedback
                });
                setLoading(false);
                return;
            }

            if (!id) {
                navigate('/');
                return;
            }

            const { data, error } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', id)
                .single();

            if (mounted) {
                if (error || !data) {
                    console.error("Fetch Error:", error);
                    setError("Resume not found or access denied.");
                    setLoading(false);
                    return;
                }

                setResume(data);

                // Get Public URLs
                if (data.resume_path) {
                    const { data: { publicUrl: rUrl } } = supabase.storage
                        .from('resumes')
                        .getPublicUrl(data.resume_path);
                    setResumePublicUrl(rUrl);
                }

                if (data.image_path) {
                    const { data: { publicUrl: iUrl } } = supabase.storage
                        .from('resumes')
                        .getPublicUrl(data.image_path);
                    setImagePublicUrl(iUrl);
                }

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
                    <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading analysis...</p>
                </div>
            </main>
        );
    }

    if (error || !resume) {
        return (
            <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center p-4">
                <ShieldAlert className="w-16 h-16 text-rose-500 mb-2" />
                <h1 className="text-3xl text-slate-900 font-extrabold">Oops!</h1>
                <p className="text-slate-500 font-medium">{error || "Something went wrong."}</p>
                <Link to="/">
                    <Button variant="secondary" className="mt-4">Back to Safety</Button>
                </Link>
            </main>
        );
    }

    const feedback = resume.feedback || location.state?.feedback;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />

            {/* Sticky Header */}
            <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={location.state?.guestMode ? "/" : "/dashboard"}>
                                <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-slate-100 text-slate-600">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-900">
                                    {resume.company_name}
                                </h1>
                                <p className="text-sm font-medium text-slate-500">{resume.job_title}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {resumePublicUrl && (
                                <a href={resumePublicUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="secondary" size="sm" className="hidden sm:flex border-slate-200 hover:bg-slate-50 hover:text-violet-600">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View PDF
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid lg:grid-cols-[400px_1fr] gap-8">
                    {/* Left: PDF Preview (Sticky) */}
                    <aside className="lg:sticky lg:top-40 lg:h-[calc(100vh-12rem)] hidden lg:block">
                        <div className="bg-white border border-slate-200 rounded-3xl p-4 h-full overflow-hidden shadow-sm flex flex-col">
                            {location.state?.guestMode ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                                    <ShieldAlert className="w-12 h-12 mb-4 text-amber-500/50" />
                                    <p className="font-bold text-slate-700">Guest Mode</p>
                                    <p className="text-sm">For your privacy, we did not save your PDF file. Thus, no preview is available.</p>
                                </div>
                            ) : imagePublicUrl ? (
                                <div className="h-full overflow-y-auto rounded-2xl bg-slate-100 flex-1 custom-scrollbar">
                                    <img
                                        src={imagePublicUrl}
                                        className="w-full object-contain"
                                        alt="resume preview"
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                                    Preview Unavailable
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Right: Analysis Panel */}
                    <section className="flex flex-col gap-6 w-full max-w-3xl">
                        {feedback ? (
                            <>
                                <Summary feedback={feedback} />
                                <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                                <Details feedback={feedback} />
                            </>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Analysis in progress...</h2>
                                <p className="text-slate-500 font-medium">If this persists, please try re-uploading.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Custom Scrollbar Styles for Light Theme */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </main>
    );
};

export default Resume;
