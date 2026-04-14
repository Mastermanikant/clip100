'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Copy, Check, Wifi, WifiOff } from 'lucide-react';
import { Realtime } from 'ably';

export default function FrankLink() {
  const [text, setText] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<any>(null);
  const ablyRef = useRef<any>(null);

  const joinRoom = () => {
    if (!roomId.trim()) return;

    // Direct Ably v2 Realtime instance
    const ably = new Realtime({ authUrl: '/api/auth' });
    ablyRef.current = ably;

    const channel = ably.channels.get(`sync:${roomId.toLowerCase()}`);
    channelRef.current = channel;

    channel.subscribe('update', (msg) => {
      setText(msg.data);
    });

    ably.connection.on('connected', () => setIsConnected(true));
    ably.connection.on('disconnected', () => setIsConnected(false));
    ably.connection.on('failed', () => setIsConnected(false));
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (channelRef.current && isConnected) {
      channelRef.current.publish('update', newText);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-clean on unmount
  useEffect(() => {
    return () => {
      if (ablyRef.current) ablyRef.current.close();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 font-sans selection:bg-blue-500/30">
      <div className="max-w-2xl w-full pt-12 space-y-8">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <Zap className={`w-6 h-6 transition-all duration-500 ${isConnected ? 'text-blue-500 fill-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-gray-800'}`} />
          <h1 className="text-2xl font-black italic tracking-tighter">FRANK LINK : CLIPBOARD</h1>
        </div>

        {/* Room Setup */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest relative z-10">Connect to Room ID</label>
          <div className="flex gap-2 relative z-10">
            <input 
              type="text" 
              placeholder="Enter Room Code (e.g. ALPHA-1)" 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isConnected}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono disabled:opacity-50"
            />
            <button 
              onClick={joinRoom}
              disabled={isConnected}
              className="bg-white text-black font-black px-6 py-3 rounded-xl hover:bg-blue-500 hover:text-white active:scale-95 transition-all text-xs disabled:bg-blue-600 disabled:text-white shadow-lg"
            >
              {isConnected ? 'CONNECTED' : 'JOIN'}
            </button>
          </div>
        </div>

        {/* Sync Area */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] space-y-4 relative overflow-hidden shadow-2xl">
           {isConnected && (
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6]"
                />
             </div>
           )}

           <textarea 
             placeholder="Start typing to sync across devices..."
             value={text}
             onChange={(e) => handleTextChange(e.target.value)}
             className="w-full h-96 bg-transparent border-none focus:outline-none text-lg resize-none placeholder:text-gray-800 leading-relaxed scrollbar-hide"
           />
           
           <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500'}`} />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {isConnected ? 'Live Sync Active' : 'Disconnected'}
                </span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider active:scale-95"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-blue-500" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
           </div>
        </div>

        {/* Info */}
        <p className="text-[9px] text-center text-gray-700 font-bold uppercase tracking-[0.2em]">
           End-to-End Real-time Synchronization Powered by Ably
        </p>

      </div>
    </main>
  );
}
