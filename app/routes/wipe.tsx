import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { Trash2, FileText, AlertTriangle, ShieldAlert } from "lucide-react";
import Navbar from "~/components/Navbar";

export const meta = () => ([
    { title: "CVision | Wipe Data" },
    { name: "description", content: "Delete all your stored resume data" },
]);

const WipePage = () => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<ResumeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth?next=/wipe");
                return;
            }

            const { data, error } = await supabase
                .from("resumes")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false });

            if (mounted) {
                if (error) setError(error.message);
                else setResumes(data || []);
                setLoading(false);
            }
        };

        init();
        return () => { mounted = false; };
    }, [navigate]);

    const handleWipe = async () => {
        if (!window.confirm("This will permanently delete ALL your resume data. Are you sure?")) return;

        setDeleting(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            // Delete all storage files
            const storagePaths = resumes.flatMap(r => [r.resume_path, r.image_path].filter(Boolean));
            if (storagePaths.length > 0) {
                const { error: storageError } = await supabase.storage.from("resumes").remove(storagePaths);
                if (storageError) console.warn("Storage delete partial error:", storageError.message);
            }

            // Delete all DB rows
            const { error: dbError } = await supabase
                .from("resumes")
                .delete()
                .eq("user_id", session.user.id);

            if (dbError) throw new Error(dbError.message);

            setResumes([]);
            setDone(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <div className="container mx-auto px-4 pt-28 pb-12 max-w-2xl">
                <div className="mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="w-8 h-8 text-rose-500" />
                        <h1 className="text-4xl font-extrabold tracking-tight">Wipe All Data</h1>
                    </div>
                    <p className="text-slate-500 font-medium">
                        This will permanently delete all your resumes, images, and analysis data. This action cannot be undone.
                    </p>
                </div>

                {done ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-fade-in-up">
                        <p className="text-2xl font-extrabold text-emerald-700 mb-2">All data wiped ✓</p>
                        <p className="text-emerald-600 font-medium mb-6">Your account is now clean.</p>
                        <Link to="/dashboard" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-medium flex items-center gap-2 text-sm animate-fade-in-up">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-6 animate-fade-in-up">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <p className="font-bold text-slate-700">{resumes.length} resume{resumes.length !== 1 ? "s" : ""} on file</p>
                            </div>
                            {resumes.length === 0 ? (
                                <div className="px-6 py-8 text-center text-slate-500 font-medium">No data to delete.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {resumes.map(resume => (
                                        <div key={resume.id} className="px-6 py-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100 flex-shrink-0">
                                                <FileText className="w-5 h-5 text-violet-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{resume.company_name || "Untitled"}</p>
                                                <p className="text-sm text-slate-500 font-medium">{resume.job_title || "No title"}</p>
                                            </div>
                                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${(resume.feedback?.ATS?.score || 0) >= 80 ? "bg-emerald-100 text-emerald-700" : (resume.feedback?.ATS?.score || 0) >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                                {resume.feedback?.ATS?.score || 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 animate-fade-in-up">
                            <Link to="/dashboard" className="flex-1 py-3 text-center font-bold border-2 border-slate-200 text-slate-600 rounded-full hover:border-slate-400 transition-all">
                                Cancel
                            </Link>
                            <button
                                onClick={handleWipe}
                                disabled={deleting || resumes.length === 0}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-500/20"
                            >
                                <Trash2 className="w-5 h-5" />
                                {deleting ? "Deleting..." : "Wipe All Data"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default WipePage;
