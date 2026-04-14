'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Copy, Check, Wifi, WifiOff } from 'lucide-react';
import * as Ably from 'ably';

export default function FrankLink() {
  const [text, setText] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  const joinRoom = () => {
    if (!roomId.trim()) return;

    const ably = new Ably.Realtime({ authUrl: '/api/auth' });
    const channel = ably.channels.get(`sync:${roomId.toLowerCase()}`);
    channelRef.current = channel;

    channel.subscribe('update', (msg) => {
      setText(msg.data);
    });

    ably.connection.on('connected', () => setIsConnected(true));
    ably.connection.on('disconnected', () => setIsConnected(false));
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

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 font-sans">
      <div className="max-w-2xl w-full pt-12 space-y-8">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <Zap className={`w-6 h-6 ${isConnected ? 'text-blue-500 fill-blue-500' : 'text-gray-800'}`} />
          <h1 className="text-2xl font-black italic tracking-tighter">FRANK LINK : CLIPBOARD</h1>
        </div>

        {/* Room Setup */}
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl backdrop-blur-3xl">
          <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">Connect to Room ID</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Room Code (e.g. ALPHA-1)" 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isConnected}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono disabled:opacity-50"
            />
            <button 
              onClick={joinRoom}
              disabled={isConnected}
              className="bg-white text-black font-black px-6 py-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-xs disabled:bg-blue-500 disabled:text-white"
            >
              {isConnected ? 'CONNECTED' : 'JOIN'}
            </button>
          </div>
        </div>

        {/* Sync Area */}
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] space-y-4 relative overflow-hidden">
           {isConnected && (
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_blue]"
                />
             </div>
           )}

           <textarea 
             placeholder="Start typing to sync across devices..."
             value={text}
             onChange={(e) => handleTextChange(e.target.value)}
             className="w-full h-80 bg-transparent border-none focus:outline-none text-lg resize-none placeholder:text-gray-800"
           />
           
           <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                {isConnected ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                  {isConnected ? 'Live Sync Active' : 'Disconnected'}
                </span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-[10px] font-black uppercase"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-500" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
           </div>
        </div>

      </div>
    </main>
  );
}
