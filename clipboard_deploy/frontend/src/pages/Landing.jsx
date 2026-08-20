import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Copy, Shield, Zap, Globe } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Landing = () => {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');

    const createRoom = () => {
        const newRoomId = uuidv4().slice(0, 6);
        navigate(`/room/${newRoomId}`);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (joinCode.trim()) {
            navigate(`/room/${joinCode.trim()}`);
        }
    };

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center glass-nav">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    LiveClipboard
                </div>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition">
                    About
                </a>
            </nav>

            {/* Hero Section */}
            <main className="container mx-auto px-6 pt-20 pb-12 flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    Share Text <span className="text-primary">Instantly</span> <br />
                    Across Any Device
                </h1>
                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
                    Real-time clipboard synchronization. No login required. Just create a room and start sharing text, links, and code snippets securely.
                </p>

                <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg">
                    <button
                        onClick={createRoom}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
                    >
                        Create New Room
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <form onSubmit={handleJoin} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Room Code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="w-full px-6 py-4 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-white placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            className="p-4 bg-surface/80 border border-white/10 rounded-xl hover:bg-surface transition"
                        >
                            <ArrowRight className="w-5 h-5 text-gray-300" />
                        </button>
                    </form>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-24 w-full">
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-yellow-400" />}
                        title="Real-Time Sync"
                        description="Changes appear instantly across all connected devices using WebSockets."
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8 text-green-400" />}
                        title="Secure & Private"
                        description="Rooms are temporary. Data is cleared when you leave (or after server restart)."
                    />
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-blue-400" />}
                        title="Cross Platform"
                        description="Works on mobile, desktop, and tablets. Scan QR to join instantly."
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl glass-card hover:bg-white/5 transition duration-300 text-left">
        <div className="mb-4 p-3 bg-white/5 w-fit rounded-lg">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
);

export default Landing;
