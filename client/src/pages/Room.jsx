import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../services/socket';
import {
    Copy,
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
    Send,
    Edit3,
    CheckSquare,
    Laptop,
    Smartphone,
    Monitor,
    Clock,
    Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

// Helper: Auto-detect device name & icon
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let name = 'Web Browser';
    let type = 'desktop';

    if (/android/i.test(ua)) {
        name = '📱 Android Phone';
        type = 'mobile';
    } else if (/iPad|iPhone|iPod/.test(ua)) {
        name = '🍎 iPhone / iPad';
        type = 'mobile';
    } else if (/Macintosh|Mac OS X/.test(ua)) {
        name = '💻 Mac';
        type = 'desktop';
    } else if (/Windows/.test(ua)) {
        name = '💻 Windows PC';
        type = 'desktop';
    } else if (/Linux/.test(ua)) {
        name = '🐧 Linux PC';
        type = 'desktop';
    }

    let deviceId = localStorage.getItem('clipsync_device_id');
    if (!deviceId) {
        deviceId = `dev_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('clipsync_device_id', deviceId);
    }

    return { name, type, deviceId };
};

const Room = ({ roomType = 'ephemeral' }) => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Determine effective roomId or slug
    const effectiveId = params.customSlug || params.roomId || params.username || location.pathname.replace(/^\/(link\/|l\/|room\/|r\/|u\/)?/, '');

    const [deviceInfo] = useState(getDeviceInfo);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [pendingImage, setPendingImage] = useState(null);
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editText, setEditText] = useState('');
    const [userCount, setUserCount] = useState(1);
    const [showQR, setShowQR] = useState(false);
    const [copiedMsgId, setCopiedMsgId] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [isPinProtected, setIsPinProtected] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [roomPin, setRoomPin] = useState(() => localStorage.getItem(`clipsync_pin_${effectiveId}`) || '');
    const [showPinModal, setShowPinModal] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const broadcastChannelRef = useRef(null);

    // Identify mode label
    const isCustomLink = location.pathname.startsWith('/link/') || location.pathname.startsWith('/l/') || roomType === 'custom_link';
    const isDiary = location.pathname.startsWith('/u/') || roomType === 'diary' || (!location.pathname.startsWith('/room/') && !location.pathname.startsWith('/r/') && !location.pathname.startsWith('/link/') && !location.pathname.startsWith('/l/'));

    // Cloudflare Edge Sync Fetch
    const fetchEdgeState = async (pinToUse = roomPin) => {
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
                    if (Array.isArray(data.messages)) {
                        setMessages(data.messages);
                    }
                }
            }
        } catch (e) {}
    };

    // Push Edge State
    const postEdgeAction = async (payload) => {
        try {
            setIsSyncing(true);
            const res = await fetch(`/api/room/${encodeURIComponent(effectiveId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.messages)) {
                    setMessages(data.messages);
                }
            }
            setTimeout(() => setIsSyncing(false), 250);
        } catch (e) {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (!effectiveId) return;

        // Initialize BroadcastChannel for instant local multi-tab sync
        try {
            broadcastChannelRef.current = new BroadcastChannel(`clipsync_stream_${effectiveId}`);
            broadcastChannelRef.current.onmessage = (event) => {
                const msg = event.data;
                if (msg.type === 'MESSAGES_UPDATE') {
                    if (Array.isArray(msg.messages)) setMessages(msg.messages);
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
                        setUserCount(data.userCount || 1);
                        if (data.hasPin) setIsPinProtected(true);
                    }
                }
            });

            socket.on('messages_stream_update', (newMessages) => {
                if (Array.isArray(newMessages)) setMessages(newMessages);
            });

            socket.on('user_count_update', (count) => {
                setUserCount(count);
            });

            socket.on('pin_verified', (result) => {
                if (result.success) {
                    setIsLocked(false);
                    if (Array.isArray(result.messages)) setMessages(result.messages);
                    toast.success('PIN verified! Access granted.');
                } else {
                    toast.error('Incorrect PIN. Please try again.');
                }
            });
        } catch (err) {}

        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
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
                socket.off('messages_stream_update');
                socket.off('user_count_update');
                socket.off('pin_verified');
            } catch (e) {}
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [effectiveId, roomPin]);

    // Send New Message / Clip
    const handleSendMessage = () => {
        const text = inputText.trim();
        if (!text && !pendingImage) {
            toast.error('Please type a message or attach an image');
            return;
        }

        const newMsg = {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            deviceId: deviceInfo.deviceId,
            deviceName: deviceInfo.name,
            content: text,
            imageData: pendingImage,
            timestamp: Date.now()
        };

        const updatedMessages = [newMsg, ...messages];
        setMessages(updatedMessages);
        setInputText('');
        setPendingImage(null);

        // Broadcast to other tabs
        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
                type: 'MESSAGES_UPDATE',
                messages: updatedMessages
            });
        }

        // Socket emit
        try {
            socket.emit('send_stream_message', {
                roomId: effectiveId,
                message: newMsg
            });
        } catch (e) {}

        // Edge API push
        postEdgeAction({
            action: 'add_message',
            message: newMsg,
            pin: roomPin
        });

        toast.success('Clip sent!', { icon: '🚀' });
    };

    // Save Edited Message
    const handleSaveEdit = (msgId) => {
        const updated = messages.map(m => {
            if (m.id === msgId) {
                return { ...m, content: editText, editedAt: Date.now() };
            }
            return m;
        });

        setMessages(updated);
        setEditingMsgId(null);
        setEditText('');

        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
                type: 'MESSAGES_UPDATE',
                messages: updated
            });
        }

        try {
            socket.emit('edit_stream_message', {
                roomId: effectiveId,
                messageId: msgId,
                content: editText
            });
        } catch (e) {}

        postEdgeAction({
            action: 'edit_message',
            messageId: msgId,
            content: editText,
            pin: roomPin
        });

        toast.success('Clip updated!');
    };

    // Delete Single Message
    const handleDeleteMessage = (msgId) => {
        const updated = messages.filter(m => m.id !== msgId);
        setMessages(updated);

        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
                type: 'MESSAGES_UPDATE',
                messages: updated
            });
        }

        try {
            socket.emit('delete_stream_message', {
                roomId: effectiveId,
                messageId: msgId
            });
        } catch (e) {}

        postEdgeAction({
            action: 'delete_message',
            messageId: msgId,
            pin: roomPin
        });

        toast('Clip deleted', { icon: '🗑️' });
    };

    // Clear All Clips
    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear all clips in this room for all devices?")) {
            setMessages([]);

            if (broadcastChannelRef.current) {
                broadcastChannelRef.current.postMessage({
                    type: 'MESSAGES_UPDATE',
                    messages: []
                });
            }

            try {
                socket.emit('clear_all_stream', { roomId: effectiveId });
            } catch (e) {}

            postEdgeAction({
                action: 'clear_all',
                pin: roomPin
            });

            toast('All clips cleared', { icon: '🧹' });
        }
    };

    // Copy Single Clip Content
    const copyClip = (msg) => {
        if (msg.content) {
            navigator.clipboard.writeText(msg.content);
            setCopiedMsgId(msg.id);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopiedMsgId(null), 2000);
        }
    };

    // Copy Entire Room History
    const copyAllClips = () => {
        if (messages.length === 0) {
            toast.error('No clips to copy');
            return;
        }
        const fullText = messages
            .map(m => `[${m.deviceName} • ${new Date(m.timestamp).toLocaleTimeString()}]:\n${m.content}`)
            .join('\n\n---\n\n');

        navigator.clipboard.writeText(fullText);
        toast.success('All clips copied to clipboard!');
    };

    // Process and attach image file
    const processImageFile = (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image exceeds 10MB limit.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            setPendingImage(event.target.result);
            toast.success('Screenshot attached! Hit Send to stream.', { icon: '📸' });
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

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) processImageFile(file);
    };

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

    const copyRoomUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success('Room link copied!');
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const downloadImage = (imgSrc, id) => {
        if (!imgSrc) return;
        const link = document.createElement('a');
        link.href = imgSrc;
        link.download = `clipsync-${id}.png`;
        link.click();
        toast.success('Downloading image...');
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

        postEdgeAction({
            action: 'set_pin',
            pin: newPin
        });

        setShowPinModal(false);
        setNewPin('');
        toast.success('Room PIN protection enabled!');
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
                            <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-sm truncate max-w-[130px] sm:max-w-[200px]">
                                {effectiveId}
                            </span>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {userCount} {userCount === 1 ? 'device' : 'devices'}
                            </div>
                            {isSyncing && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-primary animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
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

                        {messages.length > 0 && (
                            <button
                                onClick={copyAllClips}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-xl hover:text-primary text-xs font-medium transition"
                                title="Copy All Room Clips"
                            >
                                <Copy className="w-4 h-4" />
                                <span>Copy All</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Live Message Stream Workspace */}
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-6">
                {/* Device Identification Bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Active on this device as: <strong className="text-slate-800 dark:text-slate-200">{deviceInfo.name}</strong>
                    </span>
                    <span>{messages.length} {messages.length === 1 ? 'clip' : 'clips'} saved</span>
                </div>

                {/* Messages / Clips Feed */}
                <div className="flex-1 space-y-4">
                    {messages.length === 0 ? (
                        <div className="theme-card rounded-3xl p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Clipboard Feed is Empty
                            </h3>
                            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                Type a message below, paste a link, or press <code>Ctrl+V</code> to paste a screenshot. Each message is saved as an individual clip tagged with your device name!
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`theme-card rounded-2xl p-4 sm:p-5 shadow-sm border transition-all ${
                                    msg.deviceId === deviceInfo.deviceId
                                        ? 'border-primary/30 bg-primary/[0.02]'
                                        : 'border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                            {msg.deviceName}
                                        </span>
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {formatTime(msg.timestamp)}
                                        </span>
                                        {msg.editedAt && (
                                            <span className="text-[10px] text-amber-500 font-medium">(edited)</span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => copyClip(msg)}
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-primary transition text-slate-600 dark:text-slate-300 flex items-center gap-1 text-[11px] font-medium"
                                            title="Copy Clip Text"
                                        >
                                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span className="hidden sm:inline">{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                                        </button>

                                        {editingMsgId !== msg.id && (
                                            <button
                                                onClick={() => {
                                                    setEditingMsgId(msg.id);
                                                    setEditText(msg.content);
                                                }}
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-primary transition text-slate-600 dark:text-slate-300"
                                                title="Edit Clip"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition"
                                            title="Delete Clip"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Card Content (Text / Edit Mode) */}
                                {editingMsgId === msg.id ? (
                                    <div className="space-y-3 pt-1">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            rows={4}
                                            className="w-full p-3 rounded-xl border border-primary/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingMsgId(null)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveEdit(msg.id)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:opacity-95 shadow"
                                            >
                                                Update Clip
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="font-mono text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words select-text">
                                        {msg.content}
                                    </div>
                                )}

                                {/* Attached Image / Screenshot */}
                                {msg.imageData && (
                                    <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={msg.imageData}
                                                alt="Screenshot Clip"
                                                className="w-16 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm"
                                            />
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Screenshot Attached
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => downloadImage(msg.imageData, msg.id)}
                                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-95 transition flex items-center gap-1.5 shadow-sm"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Bottom Input Composer */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`sticky bottom-4 theme-card rounded-2xl p-3 sm:p-4 shadow-xl border transition-all ${
                        isDragOver ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-slate-200 dark:border-slate-800'
                    }`}
                >
                    {/* Pending Image Preview Thumbnail */}
                    {pendingImage && (
                        <div className="mb-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-flex items-center gap-3">
                            <img
                                src={pendingImage}
                                alt="Pending Attachment"
                                className="w-12 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                            />
                            <div className="text-xs">
                                <span className="font-semibold text-slate-900 dark:text-white block">Screenshot Ready</span>
                                <span className="text-[11px] text-slate-500">Will be sent with clip</span>
                            </div>
                            <button
                                onClick={() => setPendingImage(null)}
                                className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 ml-2"
                                title="Remove screenshot"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
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
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition shrink-0"
                            title="Attach Image / Screenshot"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onPaste={handlePaste}
                            placeholder="Type new text, paste links, or press Ctrl+V for screenshots... (Ctrl+Enter to Send)"
                            rows={2}
                            className="flex-1 p-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm sm:text-base focus:outline-none resize-none font-mono"
                        />

                        <button
                            onClick={handleSendMessage}
                            className="px-5 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-95 shadow-md shadow-primary/25 transition flex items-center gap-1.5 shrink-0"
                        >
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Send Clip</span>
                        </button>
                    </div>

                    {messages.length > 0 && (
                        <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                            <span>{isCustomLink ? '30-Day Active Custom Room' : 'Live Ephemeral Stream'}</span>
                            <button
                                onClick={handleClearAll}
                                className="text-rose-500 hover:underline flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Clear All Clips
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
                            Protect this room so only users who know the PIN can view or send clips.
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
