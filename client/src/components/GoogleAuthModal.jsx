import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, ArrowRight, User, Mail, Sparkles, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = '1086435746053-viv2odbldg31n72j6o3k4nhi32vdl8l4.apps.googleusercontent.com';

const GoogleAuthModal = () => {
    const { showAuthModal, setShowAuthModal, triggerGoogleSignIn, handleGoogleCredentialResponse, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const googleButtonRef = useRef(null);

    // Initialize Native Google Identity Services Button
    useEffect(() => {
        if (!showAuthModal) return;

        const initializeGoogleButton = () => {
            if (window.google?.accounts?.id && googleButtonRef.current) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: (response) => {
                            if (response.credential) {
                                handleGoogleCredentialResponse(response.credential);
                            }
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    window.google.accounts.id.renderButton(googleButtonRef.current, {
                        theme: 'outline',
                        size: 'large',
                        width: 320,
                        text: 'continue_with',
                        shape: 'pill',
                        logo_alignment: 'left',
                    });
                } catch (e) {
                    console.error("GSI Button Render Error:", e);
                }
            }
        };

        const timer = setTimeout(initializeGoogleButton, 100);
        return () => clearTimeout(timer);
    }, [showAuthModal]);

    if (!showAuthModal) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        const cleanName = name.trim() || cleanEmail.split('@')[0];
        await triggerGoogleSignIn(cleanEmail, cleanName);
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

                {/* Brand Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                    <User className="w-7 h-7" />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        FrankBase Universal ID
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        Sign in with your Google Account to claim your permanent Cloud Diary, sync across all devices, and connect with FrankBase Ecosystem apps.
                    </p>
                </div>

                {/* Native Google Sign-In Button Slot */}
                <div className="flex flex-col items-center justify-center space-y-3 py-1">
                    <div ref={googleButtonRef} className="min-h-[44px] flex items-center justify-center"></div>
                </div>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Or with Email
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                {/* Clean Email Fallback Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Your Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                placeholder="name@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Your Full Name (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Master Manikant"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-primary/25 disabled:opacity-50"
                    >
                        <span>{isLoading ? 'Connecting to Central Database...' : 'Continue with Email'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Zero-Knowledge Privacy • 1 Account for All FrankBase Apps</span>
                </div>
            </div>
        </div>
    );
};

export default GoogleAuthModal;
