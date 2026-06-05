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

    // Close menu when clicking outside
    useEffect(() => {
        if (!showMenu) return;
        const handler = () => setShowMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showMenu]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 animate-fade-in-up">
            <div className="bg-[#13131A]/80 backdrop-blur-xl border border-[#27272A] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center group-hover:bg-[#6366F1]/20 transition-colors">
                        <Sparkles className="w-4 h-4 text-[#6366F1]" />
                    </div>
                    <span className="text-lg font-bold text-[#F8F9FC] hidden sm:block tracking-tight">
                        CVision
                    </span>
                </Link>

                {/* Nav Items */}
                <div className="flex items-center gap-2">
                    {session ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 rounded-full text-sm font-medium text-[#A1A1AA] hover:text-[#F8F9FC] hover:bg-[#1E1E24] transition-all duration-200 flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            <Link
                                to="/upload"
                                className="px-5 py-2 rounded-full text-sm font-medium bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-200 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="hidden sm:inline">Analyze</span>
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                    className="w-9 h-9 rounded-full bg-[#1E1E24] border border-[#27272A] flex items-center justify-center hover:border-[#3F3F46] hover:bg-[#27272A] transition-all duration-200"
                                >
                                    <User className="w-4 h-4 text-[#A1A1AA]" />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-3 w-48 bg-[#13131A]/95 backdrop-blur-xl border border-[#27272A] rounded-2xl shadow-[0_16px_64px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
                                        <Link
                                            to="/wipe"
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-[#A1A1AA] hover:text-[#F8F9FC] hover:bg-[#1E1E24] transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Wipe Data
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors flex items-center gap-2 border-t border-[#27272A]"
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
                                className="px-5 py-2 rounded-full text-sm font-medium bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all"
                            >
                                Analyze a Resume
                            </Link>
                            <Link
                                to="/auth"
                                className="px-5 py-2 rounded-full text-sm font-medium border border-[#27272A] text-[#A1A1AA] hover:border-[#6366F1]/50 hover:text-[#F8F9FC] transition-all duration-200 flex items-center gap-2"
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

