import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";
import { FileText, TrendingUp, Award, Upload, ChevronRight } from "lucide-react";
import Card from "~/components/Card";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CVision | Dashboard" },
    { name: "description", content: "Optimize your resume and land your dream job with AI-powered feedback." },
  ];
}

export default function Home() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/auth');
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (mounted) {
        if (!error && data) {
          setResumes(data);
        }
        setLoading(false);
      }
    };

    checkUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const totalResumes = resumes.length;
  const avgScore = resumes.length > 0
    ? Math.round(resumes.reduce((acc, r) => acc + (r.feedback?.ATS?.score || 0), 0) / resumes.length)
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="container mx-auto px-4 pt-28 pb-12">
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
              Your Command Center
            </span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Track your resume optimization journey</p>
        </div>

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

        {resumes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Scans</h2>
              <Link
                to="/upload"
                className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors"
              >
                New Scan <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
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

const StatCard = ({ icon, label, value, gradient = false }: any) => (
  <Card className={gradient ? "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200 shadow-sm" : "bg-white border-slate-200 shadow-sm"}>
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${gradient ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-slate-100"}`}>
        <div className={gradient ? "text-white" : "text-slate-700"}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  </Card>
);

const ResumeListItem = ({ resume }: any) => {
  const score = resume.feedback?.ATS?.score || 0;
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-700 bg-emerald-100 border-emerald-200";
    if (s >= 60) return "text-amber-700 bg-amber-100 border-amber-200";
    return "text-rose-700 bg-rose-100 border-rose-200";
  };

  return (
    <Link to={`/resume/${resume.id}`}>
      <div className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-300 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5 flex-1">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-violet-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-900 font-bold group-hover:text-violet-600 transition-colors text-lg">
                {resume.company_name || "Untitled"}
              </h3>
              <p className="text-sm font-medium text-slate-500">{resume.job_title || "No title"}</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-1.5 h-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-violet-200 rounded-full"
                  style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                />
              ))}
            </div>

            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(score)}`}>
              {score}%
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const EmptyState = () => (
  <div className="mt-12 animate-fade-in-up">
    <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center shadow-sm">
      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center shadow-inner">
        <Upload className="w-12 h-12 text-violet-500" />
      </div>
      <h3 className="text-3xl font-extrabold text-slate-900 mb-3">No scans yet</h3>
      <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto text-lg">
        Upload your first resume to get AI-powered feedback and optimization tips
      </p>
      <Link to="/upload">
        <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 active:scale-95">
          Analyze Your First Resume
        </button>
      </Link>
    </div>
  </div>
);
