import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import { Copy, Users, Trash2, ArrowLeft, QrCode, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [userCount, setUserCount] = useState(0);
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);

    // Debounce for emitting typing
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Join logic
        socket.emit('join_room', roomId);

        socket.on('room_joined', (data) => {
            // If joining a new room or existing, data.content has latest
            if (data.roomId === roomId) {
                setContent(data.content || '');
                setUserCount(data.userCount);
            }
        });

        socket.on('content_updated', (newContent) => {
            setContent(newContent);
        });

        socket.on('user_count_update', (count) => {
            setUserCount(count);
        });

        return () => {
            socket.off('room_joined');
            socket.off('content_updated');
            socket.off('user_count_update');
            // optional: socket.emit('leave_room', roomId);
        };
    }, [roomId]);

    const handleChange = (e) => {
        const newText = e.target.value;
        setContent(newText);

        // Clear existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Debounce emit to avoid flooding server
        // Actually for live typing we want it fast, but maybe 10-20ms debounce or direct?
        // Let's do direct for "real-time" feel, but typically throttle 50ms is good.
        socket.emit('update_content', { roomId, content: newText });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const clearContent = () => {
        if (window.confirm("Are you sure you want to clear the text for everyone?")) {
            setContent('');
            socket.emit('update_content', { roomId, content: '' });
            toast('Content cleared', { icon: '🧹' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 bg-surface/50 p-4 rounded-2xl glass-card">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-lg transition">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg">Room: <span className="text-primary font-mono bg-white/5 px-2 py-1 rounded">{roomId}</span></h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className={`w-2 h-2 rounded-full ${userCount > 1 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            {userCount} user{userCount !== 1 ? 's' : ''} online
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
                        title="Show QR Code"
                    >
                        <QrCode className="w-5 h-5" />
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl transition font-medium shadow-lg shadow-primary/20"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative">
                <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder="Start typing... text will sync instantly across devices."
                    className="w-full h-full min-h-[60vh] bg-surface/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-lg leading-relaxed focus:outline-none focus:border-primary/50 resize-none font-mono"
                    spellCheck="false"
                />

                {/* Floating Clear Button */}
                {content && (
                    <button
                        onClick={clearContent}
                        className="absolute bottom-6 right-6 p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition"
                        title="Clear All Text"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </main>

            {/* QR Code Modal / Overlay */}
            {showQR && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
                    <div className="bg-surface border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-6">Scan to Join Room</h3>
                        <div className="bg-white p-4 rounded-xl inline-block mb-6">
                            <QRCodeSVG value={window.location.href} size={200} />
                        </div>
                        <p className="text-gray-400 break-all bg-black/20 p-3 rounded-lg text-sm mb-6 font-mono">
                            {window.location.href}
                        </p>
                        <button
                            onClick={() => setShowQR(false)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;
