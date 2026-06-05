import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

import { Sparkles, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "~/components/ui/Card";
import toast from 'react-hot-toast';

export const meta = () => ([
    { title: 'CVision | Sign In' },
    { name: 'description', content: 'Log into your CVision account to access your dashboard' },
])

const Auth = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/dashboard';

    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                setIsLoading(false);
                if (session?.user) {
                    const destination = next === '/auth' ? '/dashboard' : next;
                    navigate(destination, { replace: true });
                }
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted && session?.user) {
                const destination = next === '/auth' ? '/dashboard' : next;
                navigate(destination, { replace: true });
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [navigate, next]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName
                        }
                    }
                });
                if (error) throw error;
                toast.success('Account created! Check your email to confirm your address.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Welcome back!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Authentication failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4 relative overflow-hidden font-sans text-[#F8F9FC]">
            <div className="w-full max-w-md relative z-10 animate-fade-in-up">

                {/* Back link */}
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#F8F9FC] transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#13131A] border border-[#27272A] flex items-center justify-center shadow-lg shadow-[#6366F1]/10">
                        <Sparkles className="w-8 h-8 text-[#6366F1]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#F8F9FC]">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className="text-[#A1A1AA] font-medium mt-2">
                        {isSignUp
                            ? 'Sign up to save and track your resume analyses.'
                            : 'Sign in to access your CVision dashboard.'}
                    </p>
                </div>

                {/* Auth Card */}
                <Card className="p-8 border-[#27272A] bg-[#13131A]/80 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-2 gap-4 overflow-hidden"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0F] border border-[#27272A] rounded-xl text-[#F8F9FC] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all shadow-sm"
                                                placeholder="John"
                                                required={isSignUp}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                                            Last Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0F] border border-[#27272A] rounded-xl text-[#F8F9FC] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all shadow-sm"
                                                placeholder="Doe"
                                                required={isSignUp}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0F] border border-[#27272A] rounded-xl text-[#F8F9FC] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all shadow-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0F] border border-[#27272A] rounded-xl text-[#F8F9FC] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] transition-all shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`relative w-full h-12 rounded-xl font-medium text-base transition-all overflow-hidden ${
                                submitting ? 'bg-[#1E1E24] cursor-not-allowed' :
                                'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                            }`}
                        >
                            <AnimatePresence mode="wait">
                                {submitting ? (
                                    <motion.div 
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center text-[#6366F1]"
                                    >
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="idle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center gap-2"
                                    >
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#27272A] text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                            }}
                            className="text-sm font-medium text-[#A1A1AA] hover:text-[#F8F9FC] transition-colors"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign in →'
                                : "Don't have an account? Sign up →"}
                        </button>
                    </div>
                </Card>

                {/* Guest nudge */}
                <p className="text-center text-sm text-[#6B7280] font-medium mt-6">
                    Just browsing?{' '}
                    <Link to="/upload" className="font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors">
                        Analyze a resume without signing in →
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default Auth;
