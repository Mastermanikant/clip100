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
                    {/* Official Native Google Button Slot */}
                    <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]"></div>

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
