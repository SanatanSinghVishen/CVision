import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { Trash2, FileText, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "~/components/Navbar";
import { Card } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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
                if (error) toast.error(error.message);
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
            toast.success("All data wiped successfully.");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setDeleting(false);
        }
    };

    const getBadgeVariant = (score: number) => {
        if (score >= 71) return "success" as const;
        if (score >= 41) return "warning" as const;
        return "error" as const;
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0A0A0F] font-sans text-[#F8F9FC]">
            <Navbar />
            <div className="container mx-auto px-4 pt-28 pb-12 max-w-2xl">
                <div className="mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Wipe All Data</h1>
                    </div>
                    <p className="text-[#A1A1AA] font-medium leading-relaxed">
                        This will permanently delete all your resumes, images, and analysis data. This action cannot be undone.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {done ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="p-10 text-center border-[#10B981]/20 bg-[#13131A]">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                                </div>
                                <p className="text-2xl font-bold text-[#F8F9FC] mb-2">All data wiped</p>
                                <p className="text-[#A1A1AA] font-medium mb-8">Your account is now clean.</p>
                                <Link
                                    to="/dashboard"
                                    className="inline-block px-8 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                                >
                                    Go to Dashboard
                                </Link>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="border-[#27272A] bg-[#13131A] overflow-hidden mb-6">
                                <div className="px-6 py-4 border-b border-[#27272A]">
                                    <p className="font-medium text-[#A1A1AA]">
                                        <span className="text-[#F8F9FC] font-bold">{resumes.length}</span> resume{resumes.length !== 1 ? "s" : ""} on file
                                    </p>
                                </div>
                                {resumes.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-[#6B7280] font-medium">No data to delete.</div>
                                ) : (
                                    <div className="divide-y divide-[#27272A]">
                                        {resumes.map(resume => (
                                            <div key={resume.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#1E1E24] transition-colors">
                                                <div className="w-10 h-10 rounded-xl bg-[#0A0A0F] border border-[#27272A] flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-[#A1A1AA]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[#F8F9FC] truncate">{resume.company_name || "Untitled"}</p>
                                                    <p className="text-sm text-[#A1A1AA]">{resume.job_title || "No title"}</p>
                                                </div>
                                                <Badge variant={getBadgeVariant(resume.feedback?.ATS?.score || 0)}>
                                                    {resume.feedback?.ATS?.score || 0}/100
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            <div className="flex gap-4">
                                <Link
                                    to="/dashboard"
                                    className="flex-1 py-3 text-center font-medium border border-[#27272A] text-[#A1A1AA] rounded-xl hover:border-[#3F3F46] hover:text-[#F8F9FC] transition-all"
                                >
                                    Cancel
                                </Link>
                                <button
                                    onClick={handleWipe}
                                    disabled={deleting || resumes.length === 0}
                                    className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                                >
                                    {deleting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            Wipe All Data
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default WipePage;

