import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

import { Sparkles, Mail, Lock, User, ArrowLeft, Loader2, Github } from "lucide-react";
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

    const handleOAuth = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            toast.error(err.message || `Failed to sign in with ${provider}`);
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
                    <div className="flex flex-col gap-3 mb-6">
                        <button
                            onClick={() => handleOAuth('google')}
                            className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>
                        <button
                            onClick={() => handleOAuth('github')}
                            className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-[#24292F] text-white font-medium hover:bg-[#2c3137] transition-colors shadow-sm"
                        >
                            <Github className="w-5 h-5" />
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="relative flex items-center py-2 mb-6">
                        <div className="flex-grow border-t border-[#27272A]"></div>
                        <span className="flex-shrink-0 mx-4 text-[#A1A1AA] text-sm font-medium">Or continue with email</span>
                        <div className="flex-grow border-t border-[#27272A]"></div>
                    </div>

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

            </div>
        </main>
    );
};

export default Auth;
