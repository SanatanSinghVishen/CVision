import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import { supabase } from "~/lib/supabase";
import { ArrowRight, CheckCircle2, Target, FileText, Briefcase, Zap, LineChart } from "lucide-react";
import { Card } from "~/components/ui/Card";

export function meta() {
  return [
    { title: "CVision | AI Resume Analyzer" },
    { name: "description", content: "Upload your resume. Paste a job description. Get AI feedback tailored to the company and role — in seconds." },
  ];
}

const WORDS = ["Smarter Resume.", "Better Chances.", "Real Feedback."];

export default function Landing() {
  const [wordIndex, setWordIndex] = useState(0);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2500);

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-[#F8F9FC] font-sans selection:bg-[#6366F1]/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6366F1]/10 rounded-full blur-[120px] -z-10" 
          />
        </div>
        
        <div className="container mx-auto px-6 text-center z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 h-[140px] md:h-[90px] flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
              >
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-[#A1A1AA] mb-12"
          >
            Upload your resume. Paste a job description. Get AI feedback tailored to the company and role — in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <Link to={session ? "/upload" : "/auth"}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-8 py-4 bg-[#6366F1] text-white font-medium rounded-[10px] hover:bg-[#4F46E5] transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              >
                Analyze My Resume <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <div className="w-full border-y border-[#27272A] bg-[#13131A]/50 py-6">
        <p className="text-center text-sm font-medium text-[#6B7280]">
          Used by students from IIIT, NIT, VIT, BITS and more.
        </p>
      </div>

      {/* How It Works */}
      <section className="py-24 bg-[#0A0A0F]">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-[#A1A1AA]">Three simple steps to a tailored resume.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-[#27272A] -translate-y-1/2 z-0" />
            
            <StepCard step={1} title="Upload Resume" icon={<FileText className="w-6 h-6 text-[#6366F1]" />} />
            <StepCard step={2} title="Paste Job Description" icon={<Briefcase className="w-6 h-6 text-[#6366F1]" />} />
            <StepCard step={3} title="Get Tailored Feedback" icon={<Zap className="w-6 h-6 text-[#6366F1]" />} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#13131A]/30 border-t border-[#27272A]">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Everything you need to land the interview</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<LineChart className="w-6 h-6 text-[#10B981]" />}
              title="ATS Score & Analysis"
              description="See exactly how Applicant Tracking Systems parse your resume and identify missing critical keywords."
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6 text-[#F59E0B]" />}
              title="Section-by-Section Suggestions"
              description="Detailed feedback for every part of your resume, from Header to Projects, telling you exactly what to fix."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-[#6366F1]" />}
              title="Bullet Point Rewrites"
              description="Weak action verbs are identified and rewritten into strong, metric-driven achievements."
            />
            <FeatureCard 
              icon={<Briefcase className="w-6 h-6 text-[#D946EF]" />}
              title="Company-Specific Tailoring"
              description="Insights on how to position your experience specifically for the culture and requirements of the target company."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function StepCard({ step, title, icon }: { step: number, title: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative z-10 flex flex-col items-center text-center bg-[#0A0A0F] p-4 rounded-xl"
    >
      <div className="w-16 h-16 rounded-full bg-[#13131A] border border-[#27272A] flex items-center justify-center mb-4 relative shadow-lg">
        {icon}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#6366F1] text-white text-xs font-bold flex items-center justify-center">
          {step}
        </div>
      </div>
      <h3 className="text-lg font-medium text-[#F8F9FC]">{title}</h3>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card hoverable className="p-8 h-full flex flex-col">
        <div className="w-12 h-12 rounded-[10px] bg-[#1E1E24] flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-[#F8F9FC] mb-3">{title}</h3>
        <p className="text-[#A1A1AA] leading-relaxed flex-grow">{description}</p>
      </Card>
    </motion.div>
  );
}
