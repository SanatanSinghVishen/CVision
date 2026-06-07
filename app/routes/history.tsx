import type { Route } from "./+types/history";
import Navbar from "~/components/Navbar";
import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { useEffect, useState } from "react";
import { FileText, TrendingUp, Award, Upload, ChevronRight, History as HistoryIcon } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";
import { AnimatedCounter } from "~/components/ui/AnimatedCounter";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CVision | History" },
    { name: "description", content: "View your past resume analysis history." },
  ];
}

// Mock data for the history page
const MOCK_HISTORY_DATA = [
  {
    id: "mock-1",
    company_name: "InteligenAI",
    job_title: "AI Development Engineer",
    created_at: "2026-06-05T10:30:00Z",
    feedback: {
      ATS: { score: 85 },
      content: { score: 80 },
      toneAndStyle: { score: 75 },
      structure: { score: 70 }
    }
  },
  {
    id: "mock-2",
    company_name: "TechCorp",
    job_title: "Senior Frontend Developer",
    created_at: "2026-05-20T14:15:00Z",
    feedback: {
      ATS: { score: 92 },
      content: { score: 88 },
      toneAndStyle: { score: 85 },
      structure: { score: 90 }
    }
  },
  {
    id: "mock-3",
    company_name: "StartupX",
    job_title: "Full Stack Engineer",
    created_at: "2026-05-10T09:45:00Z",
    feedback: {
      ATS: { score: 65 },
      content: { score: 70 },
      toneAndStyle: { score: 60 },
      structure: { score: 75 }
    }
  }
];

export default function History() {
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

      // Simulate network request for mock data
      setTimeout(() => {
        if (mounted) {
          setLoading(false);
        }
      }, 500);
    };

    checkUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin"></div>
          <p className="text-[#A1A1AA] font-medium">Loading history...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-[#F8F9FC] font-sans">
      <Navbar />

      <div className="container mx-auto px-4 pt-28 pb-12 max-w-4xl">
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 text-[#6366F1]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8F9FC]">
              History
            </h1>
          </div>
          <p className="text-[#A1A1AA] text-lg font-medium">
            Review your past AI resume analyses
          </p>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {MOCK_HISTORY_DATA.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4">
              {MOCK_HISTORY_DATA.map((resume) => (
                <HistoryListItem key={resume.id} resume={resume} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const HistoryListItem = ({ resume }: { resume: any }) => {
  const score = resume.feedback?.ATS?.score || 0;
  
  const getBadgeVariant = (s: number) => {
    if (s >= 71) return "success";
    if (s >= 41) return "warning";
    return "error";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Link to={`/resume/${resume.id}`}>
      <Card className="group p-5 border-[#27272A] bg-[#13131A] hover:bg-[#1E1E24] hover:border-[#3F3F46] transition-all cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <div className="flex items-center gap-3 text-sm text-[#A1A1AA]">
                <span className="font-medium text-[#D4D4D8]">{resume.job_title || "No role specified"}</span>
                <span>•</span>
                <span>{formatDate(resume.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 self-end sm:self-auto">
            <div className="flex items-center gap-3">
               <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">ATS Score</span>
                  <Badge variant={getBadgeVariant(score)}>
                    {score}/100
                  </Badge>
               </div>
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
  <div className="mt-8">
    <Card className="p-16 text-center border-[#27272A] bg-[#13131A] border-dashed border-2">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1E1E24] border border-[#27272A] flex items-center justify-center shadow-inner">
        <Upload className="w-10 h-10 text-[#6366F1]" />
      </div>
      <h3 className="text-2xl font-bold text-[#F8F9FC] mb-3">No history found</h3>
      <p className="text-[#A1A1AA] mb-8 max-w-sm mx-auto text-base leading-relaxed">
        You haven't run any resume analyses yet.
      </p>
      <Link to="/upload" className="inline-block">
        <button className="px-8 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          Start Your First Analysis
        </button>
      </Link>
    </Card>
  </div>
);
