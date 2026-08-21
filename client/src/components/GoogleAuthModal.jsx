import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const GoogleAuthModal = () => {
    const { showAuthModal, setShowAuthModal, triggerGoogleSignIn, handleGoogleCredentialResponse, signInWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const googleBtnRef = useRef(null);

    useEffect(() => {
        if (!showAuthModal) return;

        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '321582100536-8upe62akrjoh3vfuc9v526je14h5c4m5.apps.googleusercontent.com';

        // If official Google SDK is loaded and client ID exists, render native Google Button
        if (window.google && googleClientId && googleBtnRef.current) {
            try {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCredentialResponse,
                });

                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'continue_with',
                    shape: 'pill'
                });
            } catch (e) {}
        }
    }, [showAuthModal]);

    if (!showAuthModal) return null;

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email');
            return;
        }
        signInWithEmail(email.trim(), name.trim() || email.split('@')[0]);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAuthModal(false)}
        >
            <div
                className="theme-card p-6 sm:p-8 rounded-3xl max-w-md w-full text-center shadow-2xl space-y-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                    <User className="w-7 h-7" />
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Claim Your Permanent Diary
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Sign in to reserve your vanity username, enable email recovery, and keep your clipboard notes permanent.
                    </p>
                </div>

                {/* Google Sign-In Container */}
                <div className="space-y-3">
                    {/* Native Google Render Slot */}
                    <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]"></div>

                    {/* Standard Trigger Button */}
                    <button
                        onClick={triggerGoogleSignIn}
                        className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition flex items-center justify-center gap-3 text-xs sm:text-sm"
                    >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        <span>Continue with Google Account</span>
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        <span className="flex-shrink mx-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Or with Custom Email</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-3 text-left">
                        <input
                            type="text"
                            placeholder="Your Name (Optional)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                        />
                        <input
                            type="email"
                            required
                            placeholder="Your Email (e.g. name@gmail.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 text-xs transition flex items-center justify-center gap-1.5"
                        >
                            <span>Link Account with Email</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </form>
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
