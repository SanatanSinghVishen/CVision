import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { FileText, TrendingUp, Award, Upload, ChevronRight, BarChart3 } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CVision | Dashboard" },
    { name: "description", content: "Optimize your resume and land your dream job with AI-powered feedback." },
  ];
}

export default function Home() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
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
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin"></div>
          <p className="text-[#A1A1AA] font-medium">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-[#F8F9FC] font-sans">
      <Navbar />

      <div className="container mx-auto px-4 pt-28 pb-12 max-w-6xl">
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#F8F9FC]">
            Dashboard
          </h1>
          <p className="text-[#A1A1AA] text-lg font-medium">Track your resume optimization journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up">
          <StatCard
            icon={<FileText className="w-5 h-5 text-[#6B7280]" />}
            label="Total Scans"
            value={totalResumes}
          />
          <StatCard
            icon={<Award className="w-5 h-5 text-[#6366F1]" />}
            label="Avg ATS Score"
            value={avgScore}
            suffix="%"
            accent
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-[#10B981]" />}
            label="Recent Activity"
            value={resumes.slice(0, 3).length}
          />
        </div>

        {resumes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#F8F9FC]">Recent Scans</h2>
              <Link
                to="/upload"
                className="text-sm font-medium text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 transition-colors bg-[#6366F1]/10 px-4 py-2 rounded-lg border border-[#6366F1]/20"
              >
                New Scan <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4">
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

const StatCard = ({ icon, label, value, suffix = "", accent = false }: any) => (
  <Card className={`p-6 border-[#27272A] ${accent ? 'bg-[#13131A] shadow-[0_0_30px_rgba(99,102,241,0.05)] border-[#6366F1]/20' : 'bg-[#13131A]'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent ? "bg-[#6366F1]/10 border border-[#6366F1]/20" : "bg-[#1E1E24] border border-[#27272A]"}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[#A1A1AA] mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#F8F9FC]">
                <AnimatedCounter from={0} to={value} />
            </span>
            {suffix && <span className="text-xl font-bold text-[#F8F9FC]">{suffix}</span>}
        </div>
      </div>
    </div>
  </Card>
);

const ResumeListItem = ({ resume }: { resume: ResumeRow }) => {
  const score = resume.feedback?.ATS?.score || 0;
  
  const getBadgeVariant = (s: number) => {
    if (s >= 71) return "success";
    if (s >= 41) return "warning";
    return "error";
  };

  return (
    <Link to={`/resume/${resume.id}`}>
      <Card className="group p-5 border-[#27272A] bg-[#13131A] hover:bg-[#1E1E24] hover:border-[#3F3F46] transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5 flex-1">
            <div className="w-12 h-12 rounded-xl bg-[#0A0A0F] border border-[#27272A] flex items-center justify-center group-hover:border-[#6366F1]/50 transition-colors shrink-0">
                {resume.company_name ? (
                    <img 
                        src={`https://logo.clearbit.com/${resume.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        className="w-6 h-6 rounded-sm object-contain bg-white"
                        alt=""
                    />
                ) : (
                    <FileText className="w-6 h-6 text-[#A1A1AA] group-hover:text-[#6366F1] transition-colors" />
                )}
            </div>
            <div>
              <h3 className="text-[#F8F9FC] font-bold text-lg mb-1 group-hover:text-[#6366F1] transition-colors">
                {resume.company_name || "Untitled Analysis"}
              </h3>
              <p className="text-sm text-[#A1A1AA]">{resume.job_title || "No role specified"}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Match Score</span>
                <Badge variant={getBadgeVariant(score)}>
                  {score}/100
                </Badge>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-[#1E1E24] border border-[#27272A] flex items-center justify-center group-hover:bg-[#6366F1] group-hover:border-[#6366F1] transition-all">
                <ChevronRight className="w-5 h-5 text-[#A1A1AA] group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

const EmptyState = () => (
  <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
    <Card className="p-16 text-center border-[#27272A] bg-[#13131A] border-dashed border-2">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1E1E24] border border-[#27272A] flex items-center justify-center shadow-inner">
        <Upload className="w-10 h-10 text-[#6366F1]" />
      </div>
      <h3 className="text-2xl font-bold text-[#F8F9FC] mb-3">No analyses yet</h3>
      <p className="text-[#A1A1AA] mb-8 max-w-sm mx-auto text-base leading-relaxed">
        Upload your resume and a target job description to get AI-powered optimization feedback.
      </p>
      <Link to="/upload" className="inline-block">
        <button className="px-8 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          Start Your First Analysis
        </button>
      </Link>
    </Card>
  </div>
);
