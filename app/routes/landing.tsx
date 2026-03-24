import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import { ArrowRight, Zap, Target, ShieldCheck } from "lucide-react";

export function meta() {
  return [
    { title: "CVision | AI Resume Analyzer" },
    { name: "description", content: "Optimize your resume and land your dream job with instantaneous AI-powered feedback." },
  ];
}

export default function Landing() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-violet-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-100/50 rounded-[100%] blur-3xl -z-10 pointer-events-none" />
        
        <div className="container mx-auto px-6 text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-medium text-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Llama-3 Powered Engine Live
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Score your resume against <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
              any job description.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Secure, client-side algorithms extract your PDF instantly. Discover exactly why the ATS rejected you, and get actionable insights to fix it manually.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link to="/upload">
              <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1">
                Analyze My Resume <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for uncompromised precision</h2>
            <p className="text-slate-600">We decoupled our infrastructure to guarantee blistering speed and robust security without sacrificing the power of large language models.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Zero-Latency Extraction"
              description="Your PDF never hits our servers during extraction. The parsing algorithm runs entirely in your local browser memory to ensure ultimate privacy and speed."
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6 text-fuchsia-500" />}
              title="Zero-Shot Precision"
              description="We enforce strict JSO schemas on Groq's high-speed inference engine, delivering mathematically accurate categorization of your strengths and weaknesses."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
              title="Tamper-Proof Integrity"
              description="Score calculations are piped natively off the backend using Service Role isolation, meaning your dashboard strictly displays algorithmically authentic feedback."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

const FeatureCard = ({ icon, title, description }: any) => (
  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors group">
    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);
