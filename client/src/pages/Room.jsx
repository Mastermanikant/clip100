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
    X,
    RefreshCw,
    Paperclip,
    ExternalLink
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
    const [copiedLink, setCopiedLink] = useState(false);
    const [isPinProtected, setIsPinProtected] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [roomPin, setRoomPin] = useState(() => localStorage.getItem(`clipsync_pin_${effectiveId}`) || '');
    const [showPinModal, setShowPinModal] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const timeoutRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const lastContentRef = useRef('');
    const isTypingLocallyRef = useRef(false);
    const typingTimerRef = useRef(null);
    const broadcastChannelRef = useRef(null);

    // Identify mode label
    const isCustomLink = location.pathname.startsWith('/link/') || location.pathname.startsWith('/l/') || roomType === 'custom_link';
    const isDiary = location.pathname.startsWith('/u/') || roomType === 'diary' || (!location.pathname.startsWith('/room/') && !location.pathname.startsWith('/r/') && !location.pathname.startsWith('/link/') && !location.pathname.startsWith('/l/'));

    // Cloudflare Edge Sync Fetch
    const fetchEdgeState = async (pinToUse = roomPin) => {
        // Skip polling overwrite if the user is actively typing right now
        if (isTypingLocallyRef.current) return;

        try {
            const res = await fetch(`/api/room/${encodeURIComponent(effectiveId)}${pinToUse ? `?pin=${encodeURIComponent(pinToUse)}` : ''}`);
            if (res.ok) {
                const data = await res.json();
                if (data.isLocked && !data.unlocked) {
                    setIsPinProtected(true);
                    setIsLocked(true);
                } else {
                    setIsLocked(false);
                    if (data.hasPin) setIsPinProtected(true);

                    // Only update if not typing locally and content differs
                    if (!isTypingLocallyRef.current && data.content !== undefined && data.content !== lastContentRef.current) {
                        setContent(data.content);
                        lastContentRef.current = data.content;
                    }
                    if (data.imageData !== undefined) {
                        setImageData(data.imageData);
                    }
                }
            }
        } catch (e) {
            // Ignore fetch error
        }
    };

    // Push Edge State
    const pushEdgeState = async (textToSave, imgToSave, pinToSet) => {
        try {
            setIsSyncing(true);
            await fetch(`/api/room/${encodeURIComponent(effectiveId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: textToSave,
                    imageData: imgToSave,
                    pin: pinToSet
                })
            });
            setTimeout(() => setIsSyncing(false), 300);
        } catch (e) {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (!effectiveId) return;

        // Initialize BroadcastChannel for instant local multi-tab sync
        try {
            broadcastChannelRef.current = new BroadcastChannel(`clipsync_${effectiveId}`);
            broadcastChannelRef.current.onmessage = (event) => {
                const msg = event.data;
                if (msg.type === 'UPDATE') {
                    if (!isTypingLocallyRef.current && msg.content !== undefined) {
                        setContent(msg.content);
                        lastContentRef.current = msg.content;
                    }
                    if (msg.imageData !== undefined) setImageData(msg.imageData);
                } else if (msg.type === 'CLEAR') {
                    setContent('');
                    setImageData(null);
                    lastContentRef.current = '';
                }
            };
        } catch (e) {}

        // Initial Edge Fetch
        fetchEdgeState();

        // Polling Edge fallback every 1.5 seconds for cross-device sync
        const edgePollInterval = setInterval(() => {
            fetchEdgeState();
        }, 1500);

        // Connect WebSocket if available
        try {
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
                        if (!isTypingLocallyRef.current) {
                            setContent(data.content || '');
                            lastContentRef.current = data.content || '';
                        }
                        setImageData(data.imageData || null);
                        setUserCount(data.userCount || 1);
                        if (data.hasPin) setIsPinProtected(true);
                    }
                }
            });

            socket.on('content_updated', (data) => {
                if (typeof data === 'string') {
                    if (!isTypingLocallyRef.current) {
                        setContent(data);
                        lastContentRef.current = data;
                    }
                } else if (data && typeof data === 'object') {
                    if (!isTypingLocallyRef.current && data.content !== undefined) {
                        setContent(data.content);
                        lastContentRef.current = data.content;
                    }
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
                    lastContentRef.current = result.content || '';
                    setImageData(result.imageData || null);
                    toast.success('PIN verified! Access granted.');
                } else {
                    toast.error('Incorrect PIN. Please try again.');
                }
            });
        } catch (err) {}

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
            clearInterval(edgePollInterval);
            if (broadcastChannelRef.current) broadcastChannelRef.current.close();
            try {
                socket.off('room_joined');
                socket.off('content_updated');
                socket.off('user_count_update');
                socket.off('pin_verified');
            } catch (e) {}
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [effectiveId, roomPin]);

    // Handle Text Typing with Typing Lock to prevent race condition overwrite
    const handleTextChange = (e) => {
        const newText = e.target.value;
        setContent(newText);
        lastContentRef.current = newText;

        // Set typing flag
        isTypingLocallyRef.current = true;
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            isTypingLocallyRef.current = false;
        }, 1200);

        // Broadcast locally to other tabs instantly
        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
                type: 'UPDATE',
                content: newText,
                imageData: imageData
            });
        }

        // Socket emit
        try {
            socket.emit('update_content', {
                roomId: effectiveId,
                content: newText,
                imageData: imageData
            });
        } catch (err) {}

        // Debounce Edge API Push
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            pushEdgeState(newText, imageData, roomPin);
        }, 150);
    };

    // Helper: Process and send image file
    const processImageFile = (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image exceeds 10MB limit.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            setImageData(base64);

            // Broadcast to local tabs
            if (broadcastChannelRef.current) {
                broadcastChannelRef.current.postMessage({
                    type: 'UPDATE',
                    content: content,
                    imageData: base64
                });
            }

            // Socket emit
            try {
                socket.emit('update_content', {
                    roomId: effectiveId,
                    content: content,
                    imageData: base64
                });
            } catch (err) {}

            // Push Edge
            pushEdgeState(content, base64, roomPin);
            toast.success('Screenshot / Image synced live!', { icon: '📸' });
        };
        reader.readAsDataURL(file);
    };

    // Handle Direct Clipboard Screenshot Paste (Ctrl+V Image)
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) processImageFile(blob);
            }
        }
    };

    // Handle Mobile & Desktop File Attachment
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) processImageFile(file);
    };

    // Handle Drag and Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processImageFile(file);
        } else if (file) {
            toast.error('Please drop an image or screenshot (Max 10MB).');
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

    const copyRoomUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success('Room link copied!');
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const removeImage = () => {
        setImageData(null);
        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
                type: 'UPDATE',
                content: content,
                imageData: null
            });
        }
        try {
            socket.emit('update_content', {
                roomId: effectiveId,
                content: content,
                imageData: null
            });
        } catch (e) {}
        pushEdgeState(content, null, roomPin);
        toast('Image removed', { icon: '🗑️' });
    };

    const downloadImage = () => {
        if (!imageData) return;
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `clipsync-${effectiveId}.png`;
        link.click();
        toast.success('Downloading image...');
    };

    const clearAll = () => {
        if (window.confirm("Are you sure you want to clear text and image for all connected devices?")) {
            setContent('');
            setImageData(null);
            lastContentRef.current = '';

            if (broadcastChannelRef.current) {
                broadcastChannelRef.current.postMessage({ type: 'CLEAR' });
            }

            try {
                socket.emit('update_content', {
                    roomId: effectiveId,
                    content: '',
                    imageData: null
                });
            } catch (e) {}

            pushEdgeState('', null, roomPin);
            toast('Room cleared', { icon: '🧹' });
        }
    };

    const handleUnlockPin = (e) => {
        e.preventDefault();
        const pin = enteredPin.trim();
        if (!pin) return;
        setRoomPin(pin);
        localStorage.setItem(`clipsync_pin_${effectiveId}`, pin);

        fetchEdgeState(pin);

        try {
            socket.emit('verify_pin', {
                roomId: effectiveId,
                pin: pin
            });
        } catch (e) {}
    };

    const handleSetPin = (e) => {
        e.preventDefault();
        if (newPin.length < 4) {
            toast.error('PIN must be at least 4 digits');
            return;
        }
        setRoomPin(newPin);
        setIsPinProtected(true);
        localStorage.setItem(`clipsync_pin_${effectiveId}`, newPin);

        pushEdgeState(content, imageData, newPin);

        try {
            socket.emit('set_room_pin', {
                roomId: effectiveId,
                pin: newPin
            });
        } catch (e) {}

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
                            {isSyncing && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-primary animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Saving
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
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 relative flex flex-col theme-card rounded-2xl p-4 sm:p-6 shadow-sm border transition-all ${
                        isDragOver ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Live Edge Sync Active • Type text or paste/drop screenshots
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
                        placeholder="Start typing or press Ctrl+V to paste screenshots/images... Anything you paste here syncs instantly to your phone and secondary computers in real-time!"
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
                                        <ImageIcon className="w-3.5 h-3.5 text-primary" /> Live Streamed Screenshot / Image
                                    </div>
                                    <p className="text-[11px] text-slate-500">Available to all paired devices</p>
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

                    {/* Bottom Utility Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                                title="Attach Screenshot or Image from phone/PC"
                            >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>Attach Image / Screenshot</span>
                            </button>
                            <span className="text-[11px] text-slate-400">
                                (or drag & drop here)
                            </span>
                        </div>

                        {(content || imageData) && (
                            <button
                                onClick={clearAll}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center gap-1.5"
                                title="Wipe room data"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear All Text & Image
                            </button>
                        )}
                    </div>
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

                        <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 break-all select-all flex items-center justify-between gap-2">
                            <span className="truncate">{window.location.href}</span>
                            <button
                                onClick={copyRoomUrl}
                                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-primary shrink-0"
                                title="Copy Link"
                            >
                                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
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
