import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, ArrowRight, User, Mail, Sparkles, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const GoogleAuthModal = () => {
    const { showAuthModal, setShowAuthModal, triggerGoogleSignIn, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [desiredUsername, setDesiredUsername] = useState('');

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
                        FrankBase Universal Account
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        Create or access your permanent Cloud Diary, sync across all devices, and connect with FrankBase Ecosystem apps.
                    </p>
                </div>

                {/* Clean Dynamic Form */}
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
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (!desiredUsername && e.target.value.includes('@')) {
                                        setDesiredUsername(e.target.value.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                                    }
                                }}
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
                            placeholder="e.g. Rahul Kumar"
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
                        <span>{isLoading ? 'Connecting to Central Database...' : 'Continue & Open Cloud Diary'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Zero-Knowledge Encryption • 1 Account for All FrankBase Apps</span>
                </div>
            </div>
        </div>
    );
};

export default GoogleAuthModal;
