import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";
import { FileText, TrendingUp, Award, Upload, ChevronRight } from "lucide-react";
import Card from "~/components/Card";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CVision | AI Resume Analyzer" },
    { name: "description", content: "Optimize your resume and land your dream job with AI-powered feedback." },
  ];
}

// export const loader = async () => null;

export default function Home() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes directly
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (!session) {
        // Only redirect if we are sure we have no session
        // And maybe add a small delay or check event type?
        // Actually, onAuthStateChange fires 'INITIAL_SESSION' instantly if known.
        navigate('/auth');
      } else {
        // We have a session, fetch data
        setLoading(true);
        supabase
          .from('resumes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (mounted) {
              if (!error && data) {
                setResumes(data);
              }
              setLoading(false);
            }
          });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Calculate stats
  const totalResumes = resumes.length;
  const avgScore = resumes.length > 0
    ? Math.round(resumes.reduce((acc, r) => acc + (r.feedback?.ATS?.score || 0), 0) / resumes.length)
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="container mx-auto px-4 pt-28 pb-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
              Your Command Center
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Track your resume optimization journey</p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Total Scans"
            value={totalResumes}
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Avg ATS Score"
            value={`${avgScore}%`}
            gradient
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Recent Activity"
            value={resumes.slice(0, 3).length}
          />
        </div>

        {/* Resumes List or Empty State */}
        {resumes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Scans</h2>
              <Link
                to="/upload"
                className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                New Scan <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {resumes.map((resume) => (
                <ResumeListItem key={resume.id} resume={resume} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Stat Card Component
const StatCard = ({ icon, label, value, gradient = false }: any) => (
  <Card className={gradient ? "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20" : ""}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-slate-800"}`}>
        <div className="text-white">{icon}</div>
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  </Card>
);

// Resume List Item (IDE-style)
const ResumeListItem = ({ resume }: any) => {
  const score = resume.feedback?.ATS?.score || 0;
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400 bg-emerald-500/10";
    if (s >= 60) return "text-amber-400 bg-amber-500/10";
    return "text-rose-400 bg-rose-500/10";
  };

  return (
    <Link to={`/resume/${resume.id}`}>
      <div className="group bg-slate-900/30 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold group-hover:text-violet-300 transition-colors">
                {resume.company_name || "Untitled"}
              </h3>
              <p className="text-sm text-slate-400">{resume.job_title || "No title"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mini Sparkline */}
            <div className="hidden md:flex items-center gap-1 h-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-violet-500/30 rounded-full"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>

            {/* Score Badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
              {score}%
            </div>

            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Empty State
const EmptyState = () => (
  <div className="mt-12 animate-fade-in-up">
    <div className="bg-slate-900/30 border-2 border-dashed border-white/10 rounded-3xl p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
        <Upload className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No resumes yet</h3>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Upload your first resume to get AI-powered feedback and optimization tips
      </p>
      <Link to="/upload">
        <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 active:scale-95">
          Analyze Your First Resume
        </button>
      </Link>
    </div>
  </div>
);
