import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Flame, Copy, Check, ShieldAlert, ArrowLeft, Lock, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const BurnNote = () => {
    const { secretId } = useParams();
    const navigate = useNavigate();

    const [isRevealed, setIsRevealed] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [isBurned, setIsBurned] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');

    useEffect(() => {
        if (!secretId) return;

        // Check if note exists
        fetch(`/api/room/burn_${encodeURIComponent(secretId)}`)
            .then(res => res.json())
            .then(data => {
                setIsLoading(false);
                if (data.messages && data.messages.length > 0) {
                    setHasPin(data.hasPin || false);
                    setNoteContent(data.messages[0].content || '');
                } else {
                    setIsBurned(true);
                }
            })
            .catch(() => {
                setIsLoading(false);
                setIsBurned(true);
            });
    }, [secretId]);

    const handleReveal = async () => {
        if (hasPin && !enteredPin) {
            toast.error('Please enter the secret PIN');
            return;
        }

        // Fetch and immediately burn
        try {
            const res = await fetch(`/api/room/burn_${encodeURIComponent(secretId)}?pin=${encodeURIComponent(enteredPin)}`);
            const data = await res.json();

            if (data.isLocked && !data.unlocked) {
                toast.error('Incorrect PIN. Note locked.');
                return;
            }

            if (data.messages && data.messages.length > 0) {
                setNoteContent(data.messages[0].content);
                setIsRevealed(true);

                // Immediately burn from database
                await fetch(`/api/room/burn_${encodeURIComponent(secretId)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'clear_all' })
                });

                toast.success('Note revealed! It has been permanently destroyed from the server.', { icon: '🔥' });
            } else {
                setIsBurned(true);
            }
        } catch (e) {
            toast.error('Failed to reveal note.');
        }
    };

    const copyNote = () => {
        if (noteContent) {
            navigator.clipboard.writeText(noteContent);
            setCopied(true);
            toast.success('Copied secret to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />

            <main className="flex-1 max-w-xl mx-auto px-4 py-16 w-full flex items-center justify-center">
                <div className="theme-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl w-full text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                        <Flame className="w-8 h-8 animate-pulse" />
                    </div>

                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">
                            Self-Destructing Secret
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            One-Time Burn Note
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="py-8 text-sm text-slate-500 animate-pulse">
                            Checking secret integrity...
                        </div>
                    ) : isBurned ? (
                        <div className="py-8 space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
                                🛑 <strong>This secret note has already been burned and destroyed.</strong> It was viewed once and permanently erased from the server.
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-95 shadow transition"
                            >
                                Create a New Note
                            </button>
                        </div>
                    ) : !isRevealed ? (
                        <div className="space-y-6">
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs text-left leading-relaxed flex items-start gap-3">
                                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
                                <div>
                                    <strong>Warning:</strong> Clicking "Reveal Secret" will display the message and <u>permanently erase it from the server</u>. You will not be able to view it again.
                                </div>
                            </div>

                            {hasPin && (
                                <div className="text-left space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Enter Secret PIN:
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={8}
                                        placeholder="Enter PIN"
                                        value={enteredPin}
                                        onChange={(e) => setEnteredPin(e.target.value)}
                                        className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleReveal}
                                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl hover:opacity-95 shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> Reveal & Burn Note Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left font-mono text-sm leading-relaxed whitespace-pre-wrap break-words select-text">
                                {noteContent}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={copyNote}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-95 shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Secret'}</span>
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-300 transition"
                                >
                                    Done
                                </button>
                            </div>

                            <p className="text-[11px] text-rose-500 font-medium">
                                🔥 Note has been destroyed. Refreshing this page will show nothing.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BurnNote;
