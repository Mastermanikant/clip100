import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, ShieldCheck, ExternalLink, KeyRound, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserProfileModal = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [vanityUsername, setVanityUsername] = useState('mastermanikant');

    if (!isOpen || !user) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="theme-card p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative text-left"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header User Bio */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-2xl border-2 border-primary shadow-md object-cover"
                    />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {user.name}
                            </h3>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> Free Launch Pass Active
                        </div>
                    </div>
                </div>

                {/* Claimed Vanity URL Card */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Your Claimed Permanent Cloud Diary URL:
                    </label>
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-primary font-bold truncate">
                            clipboard.frankbase.com/{vanityUsername}
                        </span>
                        <Link
                            to={`/${vanityUsername}`}
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-95 transition flex items-center gap-1 shadow-sm shrink-0"
                        >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                    <p className="text-[11px] text-slate-400">
                        This URL is permanently linked to your Google Account. Protected with your secret PIN.
                    </p>
                </div>

                {/* Account Settings / Actions */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Account Security
                        </span>
                        <span className="text-emerald-500 font-bold">Zero-Knowledge Encrypted</span>
                    </div>

                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="w-full py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out of Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
