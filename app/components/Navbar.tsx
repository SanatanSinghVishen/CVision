import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { LogOut, User, Home, Upload, Sparkles, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg shadow-slate-200/50 px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-extrabold bg-gradient-to-r from-violet-900 to-slate-800 bg-clip-text text-transparent hidden sm:block">
                        CVision
                    </span>
                </Link>

                {/* Nav Items */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition-all duration-200 flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            <Link
                                to="/upload"
                                className="px-5 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-200 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="hidden sm:inline">Analyze</span>
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-all duration-200"
                                >
                                    <User className="w-4 h-4 text-slate-600" />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/upload"
                                className="px-5 py-2 rounded-full text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md"
                            >
                                Analyze a Resume
                            </Link>
                            <Link
                                to="/auth"
                                className="px-5 py-2 rounded-full text-sm font-bold border-2 border-slate-200 text-slate-700 hover:border-violet-500 hover:text-violet-600 transition-all duration-200 flex items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign In</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
