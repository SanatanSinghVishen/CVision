import { Link, redirect, useParams, useNavigate } from "react-router";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";

import { ArrowLeft, Download, RefreshCw, ExternalLink } from "lucide-react";
import Navbar from "~/components/Navbar";
import Button from "~/components/Button";

export const meta = () => ([
    { title: 'CVision | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

export const loader = async () => null;

const Resume = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [imagePublicUrl, setImagePublicUrl] = useState<string | null>(null);
    const [resumePublicUrl, setResumePublicUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchResume = async () => {
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
    }, [id, navigate]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400">Loading analysis...</p>
                </div>
            </main>
        );
    }

    if (error || !resume) {
        return (
            <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-center p-4">
                <h1 className="text-2xl text-white font-bold">Oops!</h1>
                <p className="text-slate-400">{error || "Something went wrong."}</p>
                <Link to="/">
                    <Button variant="secondary">Back to Dashboard</Button>
                </Link>
            </main>
        );
    }

    const feedback = resume.feedback;

    return (
        <main className="min-h-screen bg-slate-950">
            <Navbar />

            {/* Sticky Header */}
            <div className="sticky top-20 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    {resume.company_name || 'Resume Analysis'}
                                </h1>
                                <p className="text-sm text-slate-400">{resume.job_title}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {resumePublicUrl && (
                                <a href={resumePublicUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm">
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
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[400px_1fr] gap-8">
                    {/* Left: PDF Preview (Sticky) */}
                    <aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-36 lg:h-[calc(100vh-10rem)]"
                    >
                        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 h-full overflow-hidden shadow-2xl">
                            <div className="h-full overflow-y-auto rounded-xl bg-slate-800/50 custom-scrollbar">
                                {imagePublicUrl ? (
                                    <img
                                        src={imagePublicUrl}
                                        className="w-full object-contain"
                                        alt="resume preview"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500">
                                        Preview Unavailable
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Right: Analysis Panel */}
                    <section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col gap-8"
                    >
                        {feedback ? (
                            <>
                                <Summary feedback={feedback} />
                                <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                                <Details feedback={feedback} />
                            </>
                        ) : (
                            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                                <h2 className="text-xl text-white mb-4">Analysis in progress...</h2>
                                <p className="text-slate-400">If this persists, please try re-uploading.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.7);
                }
            `}</style>
        </main>
    );
};

export default Resume;
