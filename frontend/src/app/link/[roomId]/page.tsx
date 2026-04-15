'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, File, Copy, Shield, Lock, Smartphone } from 'lucide-react';
import { useFrankRTC } from '@/hooks/useFrankRTC';
import RoomHeader from '@/components/RoomHeader';
import MessageBubble from '@/components/MessageBubble';
import QRPanel from '@/components/QRPanel';

export default function LinkRoomPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const [inputMsg, setInputMsg] = useState('');
  
  const { isConnected, messages, sendMessage } = useFrankRTC(roomId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg);
    setInputMsg('');
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex justify-center items-center p-0 md:p-8 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.03] transition-colors duration-1000 ${isConnected ? 'bg-green-500' : 'bg-blue-600'}`} />
      </div>

      <motion.div 
        layout
        className="w-full h-[100dvh] md:max-w-4xl md:h-[85vh] bg-white/[0.02] md:border border-white/5 md:rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
      >
        <RoomHeader 
            title="FrankLink" 
            roomId={roomId} 
            isConnected={isConnected} 
            peerCount={isConnected ? 1 : 0} 
            accentColor="blue"
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex">
          <AnimatePresence mode="wait">
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col h-full"
            >
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-6">
                    <QRPanel url={typeof window !== 'undefined' ? window.location.href : ''} roomId={roomId} label="Scan QR with your phone" />
                  </div>
                )}
                {messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    content={msg.content} 
                    sender={msg.sender as any} 
                    timestamp={msg.timestamp} 
                  />
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md pb-safe">
                <form onSubmit={handleSend} className="flex gap-2">
                  <button type="button" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors" title={isConnected ? "Send File" : "Connecting P2P..."}>
                    <ImageIcon className={`w-5 h-5 ${isConnected ? 'text-blue-500' : 'text-gray-600'}`} />
                  </button>
                  <input 
                    type="text" 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    autoFocus
                    placeholder="Type a secure message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 focus:outline-none focus:border-blue-500 text-sm placeholder:text-gray-600"
                  />
                  <button 
                    type="submit" 
                    disabled={!inputMsg.trim()}
                    className="p-4 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
