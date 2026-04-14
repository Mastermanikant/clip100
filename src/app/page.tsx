'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Send, Image as ImageIcon, File, Copy, X, Shield, Lock, Wifi, Smartphone, Link as LinkIcon } from 'lucide-react';
import { useFrankRTC } from '@/hooks/useFrankRTC';

export default function FrankEcoSystem() {
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  
  // Custom hook wrapping Ably + WebRTC
  const { isConnected, messages, sendMessage } = useFrankRTC(joinedRoom);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && roomId.length >= 4) {
      setJoinedRoom(roomId.toUpperCase());
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg);
    setInputMsg('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex justify-center items-center p-4 md:p-8 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.03] transition-colors duration-1000 ${isConnected ? 'bg-green-500' : 'bg-blue-600'}`} />
      </div>

      <motion.div 
        layout
        className="max-w-4xl w-full h-[90vh] md:h-[85vh] bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <motion.div
              animate={isConnected ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Shield className={`w-6 h-6 ${isConnected ? 'text-green-500' : 'text-blue-500'}`} />
            </motion.div>
            <h1 className="text-xl font-black italic tracking-widest uppercase">
              Frank<span className={isConnected ? "text-green-500" : "text-blue-500"}>Link</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {joinedRoom && (
              <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                <Lock className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-mono tracking-widest">{joinedRoom}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isConnected ? 'P2P Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!joinedRoom ? (
              <motion.div 
                key="join"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center"
              >
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                  <Smartphone className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Zero-Friction Transfer</h2>
                <p className="text-gray-400 max-w-sm mb-12 text-sm leading-relaxed">
                  Join a room to securely share clipboard text, images, and files instantly via WebRTC P2P.
                </p>
                
                <form onSubmit={handleJoin} className="w-full max-w-sm relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex gap-2">
                    <input 
                      type="text"
                      autoFocus
                      placeholder="Enter 4-Digit Room Code"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      className="w-full bg-black/80 border border-white/10 rounded-xl px-6 py-4 text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors uppercase placeholder:tracking-normal placeholder:text-sm placeholder:text-gray-600"
                      maxLength={8}
                    />
                    <button 
                      type="submit"
                      disabled={roomId.length < 4}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-8 rounded-xl font-black uppercase text-sm transition-all active:scale-95"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex"
              >
                {/* Chat Section */}
                <div className="flex-1 flex flex-col h-full">
                  {!isConnected ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <QRCodeSVG 
                          value={typeof window !== 'undefined' ? `${window.location.origin}?room=${joinedRoom}` : joinedRoom} 
                          size={180} 
                          bgColor="#050505" 
                          fgColor="#3b82f6" 
                          level="H"
                          className="mb-8 p-4 bg-white/5 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                        />
                        <h3 className="text-xl font-black mb-2 uppercase tracking-widest">Waiting for peer...</h3>
                        <p className="text-sm text-gray-500 mb-6">Scan QR with your phone to instantly connect.</p>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                        </div>
                     </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {messages.length === 0 && (
                          <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono uppercase tracking-widest">
                            Connection established. Ready to transfer.
                          </div>
                        )}
                        {messages.map((msg) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            key={msg.id} 
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] rounded-2xl p-4 flex flex-col gap-2 relative group ${
                              msg.sender === 'me' 
                                ? 'bg-blue-600/90 text-white rounded-tr-sm' 
                                : 'bg-white/10 text-white rounded-tl-sm'
                            }`}>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                              
                              <div className={`flex items-center justify-end gap-3 mt-1 ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-500'}`}>
                                <span className="text-[9px] font-mono">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                <button onClick={() => copyToClipboard(msg.content)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/20 hover:bg-black/40 rounded-md">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Input Area */}
                      <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md">
                        <form onSubmit={handleSend} className="flex gap-2">
                          <button type="button" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                            <ImageIcon className="w-5 h-5" />
                          </button>
                          <input 
                            type="text" 
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            placeholder="Type to send securely via P2P..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 focus:outline-none focus:border-blue-500 text-sm"
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
                    </>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
