import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { socket } from '../services/socket';
import { Copy, Users, Trash2, ArrowLeft, QrCode, Check, Sun, Moon, Share2, Shield, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [content, setContent] = useState('');
    const [userCount, setUserCount] = useState(1);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        // Auto connect & join
        socket.emit('join_room', roomId);

        socket.on('room_joined', (data) => {
            if (data.roomId === roomId) {
                setContent(data.content || '');
                setUserCount(data.userCount || 1);
            }
        });

        socket.on('content_updated', (newContent) => {
            setContent(newContent);
        });

        socket.on('user_count_update', (count) => {
            setUserCount(count);
        });

        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                copyToClipboard();
            }
            if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
                e.preventDefault();
                setShowQR(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            socket.off('room_joined');
            socket.off('content_updated');
            socket.off('user_count_update');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [roomId, content]);

    const handleChange = (e) => {
        const newText = e.target.value;
        setContent(newText);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            socket.emit('update_content', { roomId, content: newText });
        }, 30);
    };

    const copyToClipboard = () => {
        if (!content) {
            toast.error('Nothing to copy yet!');
            return;
        }
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success('Copied text to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const clearContent = () => {
        if (window.confirm("Are you sure you want to clear the clipboard for all connected devices?")) {
            setContent('');
            socket.emit('update_content', { roomId, content: '' });
            toast('Clipboard cleared', { icon: '🧹' });
        }
    };

    const charCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            {/* Top Bar Header */}
            <header className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:text-primary transition"
                            title="Back to Home"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
                                Room:
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-sm">
                                {roomId}
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {userCount} {userCount === 1 ? 'device' : 'devices'}
                            </div>
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-primary transition"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        </button>

                        <button
                            onClick={() => setShowQR(!showQR)}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:text-primary transition flex items-center gap-1.5 text-xs font-medium"
                            title="Pair Phone via QR Code (Alt+Q)"
                        >
                            <QrCode className="w-4 h-4 text-primary" />
                            <span className="hidden sm:inline">Pair Phone</span>
                        </button>

                        <button
                            onClick={copyToClipboard}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-95 shadow-md shadow-primary/20 transition flex items-center gap-1.5 text-xs sm:text-sm"
                            title="Copy to Local Clipboard (Ctrl+Enter)"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Live Editor Workspace */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col">
                <div className="flex-1 relative flex flex-col theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Live Bidirectional Stream Active
                        </span>
                        <div className="flex items-center gap-3">
                            <span>{charCount} chars</span>
                            <span>•</span>
                            <span>{wordCount} words</span>
                        </div>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleChange}
                        placeholder="Start typing or paste anything here... Any device connected to room code or QR code will see text live in real time!"
                        className="flex-1 w-full min-h-[55vh] py-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base sm:text-lg leading-relaxed focus:outline-none resize-none font-mono"
                        spellCheck="false"
                    />

                    {/* Floating Clear Button */}
                    {content && (
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={clearContent}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center gap-1.5"
                                title="Wipe room data"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear All Text
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* QR Code Modal */}
            {showQR && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowQR(false)}
                >
                    <div
                        className="theme-card p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            <QrCode className="w-3.5 h-3.5" /> Scan to Join Room
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Point Your Phone Camera
                        </h3>

                        <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-slate-200">
                            <QRCodeSVG value={window.location.href} size={200} />
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 break-all select-all">
                            {window.location.href}
                        </div>

                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition text-sm"
                        >
                            Done / Close
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Room;
