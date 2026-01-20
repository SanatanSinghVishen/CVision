import { Link, useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { LogOut, User, Home, Upload, Sparkles } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 animate-fade-in-up">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/20 px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent hidden sm:block">
                        CVision
                    </span>
                </Link>

                {/* Nav Items */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <Link
                        to="/upload"
                        className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-violet-500/30"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Analyze</span>
                    </Link>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-200"
                        >
                            <User className="w-4 h-4 text-white" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
