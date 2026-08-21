import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, ArrowRight, User, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const GoogleAuthModal = () => {
    const { showAuthModal, setShowAuthModal, triggerGoogleSignIn, signInWithEmail } = useAuth();
    const [customEmail, setCustomEmail] = useState('');
    const [customName, setCustomName] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);

    if (!showAuthModal) return null;

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (!customEmail || !customEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        signInWithEmail(customEmail.trim(), customName.trim() || customEmail.split('@')[0]);
    };

    return (
        <div
            className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setShowAuthModal(false)}
        >
            <div
                className="theme-card p-6 sm:p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-6 relative border border-slate-200 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Brand Logo / Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                    <User className="w-7 h-7" />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Claim Your Permanent Diary
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        Sign in to reserve your vanity username, enable cloud sync, and access your notes across all devices.
                    </p>
                </div>

                {/* 1-Click Fast Identity Selector */}
                <div className="space-y-3">
                    {/* Primary Founder / Verified Account Card */}
                    <button
                        onClick={() => triggerGoogleSignIn('connect@mastermanikant.com')}
                        className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary hover:shadow-md transition flex items-center justify-between gap-3 text-left group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src="https://ui-avatars.com/api/?name=Master+Manikant&background=4f46e5&color=fff"
                                alt="Master Manikant"
                                className="w-10 h-10 rounded-full border border-primary/40 shadow-sm shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                        Master Manikant
                                    </span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono block truncate">
                                    connect@mastermanikant.com
                                </span>
                            </div>
                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider shrink-0 group-hover:bg-primary group-hover:text-white transition">
                            1-Click Sign In
                        </div>
                    </button>

                    {/* Use Another Google / Personal Account Button */}
                    {!showEmailInput ? (
                        <button
                            onClick={() => setShowEmailInput(true)}
                            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition flex items-center justify-center gap-2 text-xs"
                        >
                            {/* Google G Logo SVG */}
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>Use Another Google or Personal Email</span>
                        </button>
                    ) : (
                        <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2 text-left animate-in fade-in">
                            <input
                                type="text"
                                placeholder="Your Name (Optional)"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                            />
                            <input
                                type="email"
                                required
                                placeholder="Enter Gmail / Email (e.g. rahul@gmail.com)"
                                value={customEmail}
                                onChange={(e) => setCustomEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <span>Sign In with this Email</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEmailInput(false)}
                                    className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Protected by FrankBase Zero-Knowledge Privacy Standard</span>
                </div>
            </div>
        </div>
    );
};

export default GoogleAuthModal;
