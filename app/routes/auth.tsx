import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";

import { Sparkles, Mail, Lock, User } from "lucide-react";
import Button from "~/components/Button";

export const meta = () => ([
    { title: 'CVision | Auth' },
    { name: 'description', content: 'Log into your account' },
])

export const loader = async () => null;

const Auth = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                setUser(session?.user ?? null);
                setIsLoading(false);
                if (session?.user) {
                    const destination = next === '/auth' ? '/' : next;
                    navigate(destination, { replace: true });
                }
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                if (session?.user) {
                    const destination = next === '/auth' ? '/' : next;
                    navigate(destination, { replace: true });
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [navigate, next]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Welcome to CVision
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isSignUp ? 'Create your account' : 'Sign in to continue'}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-violet-500/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isSignUp && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            placeholder="John"
                                            required={isSignUp}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                            placeholder="Doe"
                                            required={isSignUp}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-fade-in-up">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={submitting}
                        >
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </div>
        </main >
    );
};

export default Auth;
