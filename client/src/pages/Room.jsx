import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../services/socket';
import {
    Copy,
    Users,
    Trash2,
    ArrowLeft,
    QrCode,
    Check,
    Sun,
    Moon,
    Share2,
    Shield,
    Sparkles,
    Image as ImageIcon,
    Download,
    Lock,
    KeyRound,
    Calendar,
    AlertCircle,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

const Room = ({ roomType = 'ephemeral' }) => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Determine effective roomId or slug
    const effectiveId = params.customSlug || params.roomId || params.username || location.pathname.replace(/^\/(link\/|l\/|room\/|r\/|u\/)?/, '');

    const [content, setContent] = useState('');
    const [imageData, setImageData] = useState(null); // base64 screenshot/image
    const [userCount, setUserCount] = useState(1);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPinProtected, setIsPinProtected] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [roomPin, setRoomPin] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [newPin, setNewPin] = useState('');

    const timeoutRef = useRef(null);
    const textareaRef = useRef(null);

    // Identify mode label
    const isCustomLink = location.pathname.startsWith('/link/') || location.pathname.startsWith('/l/') || roomType === 'custom_link';
    const isDiary = location.pathname.startsWith('/u/') || roomType === 'diary';

    useEffect(() => {
        if (!effectiveId) return;

        // Auto connect & join
        socket.emit('join_room', {
            roomId: effectiveId,
            type: isCustomLink ? 'custom_link' : (isDiary ? 'diary' : 'ephemeral'),
            pin: roomPin
        });

        socket.on('room_joined', (data) => {
            if (data.roomId === effectiveId) {
                if (data.isLocked && !data.unlocked) {
                    setIsPinProtected(true);
                    setIsLocked(true);
                } else {
                    setIsLocked(false);
                    setContent(data.content || '');
                    setImageData(data.imageData || null);
                    setUserCount(data.userCount || 1);
                    if (data.hasPin) setIsPinProtected(true);
                }
            }
        });

        socket.on('content_updated', (data) => {
            if (typeof data === 'string') {
                setContent(data);
            } else if (data && typeof data === 'object') {
                if (data.content !== undefined) setContent(data.content);
                if (data.imageData !== undefined) setImageData(data.imageData);
            }
        });

        socket.on('user_count_update', (count) => {
            setUserCount(count);
        });

        socket.on('pin_verified', (result) => {
            if (result.success) {
                setIsLocked(false);
                setContent(result.content || '');
                setImageData(result.imageData || null);
                toast.success('PIN verified! Access granted.');
            } else {
                toast.error('Incorrect PIN. Please try again.');
            }
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
            socket.off('pin_verified');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [effectiveId, roomPin]);

    // Handle Text Typing
    const handleTextChange = (e) => {
        const newText = e.target.value;
        setContent(newText);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            socket.emit('update_content', {
                roomId: effectiveId,
                content: newText,
                imageData: imageData
            });
        }, 30);
    };

    // Handle Direct Clipboard Screenshot / Image Paste (Ctrl+V Image)
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    if (blob.size > 10 * 1024 * 1024) {
                        toast.error('Image size exceeds 10MB limit.');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target.result;
                        setImageData(base64);
                        socket.emit('update_content', {
                            roomId: effectiveId,
                            content: content,
                            imageData: base64
                        });
                        toast.success('Screenshot pasted & streamed live!', { icon: '📸' });
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    };

    const copyToClipboard = () => {
        if (!content && !imageData) {
            toast.error('Nothing to copy yet!');
            return;
        }
        if (content) {
            navigator.clipboard.writeText(content);
            setCopied(true);
            toast.success('Copied text to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const removeImage = () => {
        setImageData(null);
        socket.emit('update_content', {
            roomId: effectiveId,
            content: content,
            imageData: null
        });
        toast('Image removed', { icon: '🗑️' });
    };

    const downloadImage = () => {
        if (!imageData) return;
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `clipsync-image-${effectiveId}.png`;
        link.click();
        toast.success('Downloading image...');
    };

    const clearAll = () => {
        if (window.confirm("Are you sure you want to clear text and image for all connected devices?")) {
            setContent('');
            setImageData(null);
            socket.emit('update_content', {
                roomId: effectiveId,
                content: '',
                imageData: null
            });
            toast('Room cleared', { icon: '🧹' });
        }
    };

    const handleUnlockPin = (e) => {
        e.preventDefault();
        if (!enteredPin.trim()) return;
        setRoomPin(enteredPin.trim());
        socket.emit('verify_pin', {
            roomId: effectiveId,
            pin: enteredPin.trim()
        });
    };

    const handleSetPin = (e) => {
        e.preventDefault();
        if (newPin.length < 4) {
            toast.error('PIN must be at least 4 digits');
            return;
        }
        socket.emit('set_room_pin', {
            roomId: effectiveId,
            pin: newPin
        });
        setIsPinProtected(true);
        setRoomPin(newPin);
        setShowPinModal(false);
        setNewPin('');
        toast.success('Room PIN protection enabled!');
    };

    const charCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    // If Room is PIN Locked
    if (isLocked) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                <header className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:text-primary transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-base">Protected Room</span>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="theme-card rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                PIN Protected Room
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                This link requires a 4-digit PIN to decrypt and display contents.
                            </p>
                        </div>

                        <form onSubmit={handleUnlockPin} className="space-y-4">
                            <input
                                type="password"
                                maxLength={8}
                                autoFocus
                                placeholder="Enter Room PIN"
                                value={enteredPin}
                                onChange={(e) => setEnteredPin(e.target.value)}
                                className="w-full text-center tracking-widest text-2xl font-mono py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary transition"
                            />
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-95 shadow-md transition"
                            >
                                Unlock & View Room
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

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
                                {isCustomLink ? 'Custom Link:' : (isDiary ? 'Cloud Diary:' : 'Room:')}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-sm truncate max-w-[140px] sm:max-w-[220px]">
                                {effectiveId}
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {userCount} {userCount === 1 ? 'device' : 'devices'}
                            </div>
                            {isCustomLink && (
                                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[11px] font-medium border border-indigo-500/20">
                                    <Calendar className="w-3 h-3" /> 30-Day Active Link
                                </span>
                            )}
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
                            onClick={() => setShowPinModal(true)}
                            className={`p-2 rounded-xl border transition ${
                                isPinProtected
                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                    : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-primary'
                            }`}
                            title={isPinProtected ? "Room is PIN Protected" : "Add 4-Digit PIN Lock"}
                        >
                            <KeyRound className="w-4 h-4" />
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

            {/* Live Workspace */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-4">
                <div className="flex-1 relative flex flex-col theme-card rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Live Multi-Device Sync Active (Paste text or Ctrl+V image)
                        </span>
                        <div className="flex items-center gap-3">
                            <span>{charCount} chars</span>
                            <span>•</span>
                            <span>{wordCount} words</span>
                        </div>
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleTextChange}
                        onPaste={handlePaste}
                        placeholder="Start typing or press Ctrl+V to paste screenshots/images... Live changes stream instantly across all connected phones and computers!"
                        className="flex-1 w-full min-h-[45vh] py-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base sm:text-lg leading-relaxed focus:outline-none resize-none font-mono"
                        spellCheck="false"
                    />

                    {/* Screenshot / Image Preview Card */}
                    {imageData && (
                        <div className="my-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={imageData}
                                    alt="Pasted Screenshot"
                                    className="w-20 h-20 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm"
                                />
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-primary" /> Synced Image / Screenshot
                                    </div>
                                    <p className="text-[11px] text-slate-500">Live streamed to all devices</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={downloadImage}
                                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download
                                </button>
                                <button
                                    onClick={removeImage}
                                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition flex items-center justify-center gap-1.5"
                                >
                                    <X className="w-3.5 h-3.5" /> Remove
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bottom Controls */}
                    {(content || imageData) && (
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="text-[11px] text-slate-400">
                                {isCustomLink ? 'Expires after 30 days of inactivity' : 'Ephemeral session auto-clears on tab exit'}
                            </div>
                            <button
                                onClick={clearAll}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center gap-1.5"
                                title="Wipe room data"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear All
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

            {/* PIN Protection Modal */}
            {showPinModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowPinModal(false)}
                >
                    <div
                        className="theme-card p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Set 4-Digit Room PIN
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Protect this room so only users who know the PIN can view or edit text.
                        </p>

                        <form onSubmit={handleSetPin} className="space-y-4">
                            <input
                                type="password"
                                maxLength={8}
                                placeholder="Enter 4-digit PIN"
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                className="w-full text-center tracking-widest text-2xl font-mono py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary transition"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:opacity-95 shadow-md"
                                >
                                    Set PIN Lock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Room;
