'use client';

import React, { useState, useEffect } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { hashPassword } from '@/lib/crypto';
import TransferRoom from '@/components/TransferRoom';
import { Shield, Zap, Globe, Lock, Crown, ChevronRight, Share2, Info, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { roomId, setRoom, isLocalOnly } = useRoomStore();
  const [vanityName, setVanityName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(1);
  const [availability, setAvailability] = useState<'IDLE' | 'CHECKING' | 'AVAILABLE' | 'TAKEN'>('IDLE');

  // URL Availability Check JUGAD
  useEffect(() => {
    if (!vanityName.trim()) {
      setAvailability('IDLE');
      return;
    }

    const timer = setTimeout(async () => {
      setAvailability('CHECKING');
      try {
        const res = await fetch(`/api/room/check?roomId=${vanityName}`);
        const data = await res.json();
        setAvailability(data.available ? 'AVAILABLE' : 'TAKEN');
      } catch (err) {
        setAvailability('IDLE');
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [vanityName]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAd && adTimer > 0) {
      timer = setInterval(() => setAdTimer(t => t - 1), 1000);
    } else if (adTimer === 0) {
      setShowAd(false);
      executeCreateRoom();
    }
    return () => clearInterval(timer);
  }, [showAd, adTimer]);

  const handleCreateRoom = () => {
    if (availability === 'TAKEN' && vanityName) {
      setError('This URL is already taken. Please choose another.');
      return;
    }
    setShowAd(true);
    setAdTimer(1); 
  };

  const executeCreateRoom = async () => {
    setLoading(true);
    setError('');
    const passwordHash = password ? await hashPassword(password) : '';
    
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vanityName, passwordHash, isPublic: !password, isPro: false })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Server connection error');
      }

      const data = await res.json();
      if (data.success) {
        setRoom(data.roomId, data.roomId, isLocalOnly);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Check KV database.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    setLoading(true);
    setError('');
    const passwordHash = password ? await hashPassword(password) : '';

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: inputCode, passwordHash })
      });
      const data = await res.json();
      if (data.success) {
        setRoom(inputCode, inputCode, false);
      } else {
        setError(data.message || 'Room not found');
      }
    } catch (err) {
      setError('Join failed');
    } finally {
      setLoading(false);
    }
  };

  if (roomId) return <TransferRoom />;

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl flex items-center justify-center"
          >
            <Zap className="text-white w-10 h-10 fill-white" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 italic">FRANK DROP</h1>
          <p className="text-gray-500 font-medium">Powering <span className="text-blue-400">frank-drop.vercel.app</span> ecosystem</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          {!showAd ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 p-1 bg-black/50 rounded-2xl border border-white/5">
                <button className="py-3 px-6 rounded-xl bg-white/10 text-sm font-bold">Transfer</button>
                <button className="py-3 px-6 rounded-xl text-sm font-medium text-gray-500 hover:text-white transition-colors">Notebook</button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-[10px]">frank-drop.vercel.app/d/</span>
                  <input
                    type="text"
                    placeholder="custom-name"
                    value={vanityName}
                    onChange={(e) => setVanityName(e.target.value)}
                    className={`w-full bg-black/60 border rounded-2xl pl-44 pr-12 py-5 text-lg font-bold focus:outline-none focus:ring-2 transition-all placeholder:text-gray-800 ${
                      availability === 'AVAILABLE' ? 'border-green-500/50 focus:ring-green-500/30' : 
                      availability === 'TAKEN' ? 'border-red-500/50 focus:ring-red-500/30' : 
                      'border-white/5 focus:ring-blue-500/50'
                    }`}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    {availability === 'CHECKING' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    {availability === 'AVAILABLE' && <Check className="w-5 h-5 text-green-500" />}
                    {availability === 'TAKEN' && <X className="w-5 h-5 text-red-500" />}
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs font-bold text-center animate-bounce">⚠️ {error}</p>}

                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="password"
                    placeholder="Optional Password (Private Room)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/5 rounded-2xl px-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="flex-1 bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  Create Room <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-6 rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="w-3 h-3" />
                  <span>Rooms stay alive for 30 days</span>
                </div>
                <button 
                  onClick={() => alert('Pro features coming soon! This will unlock 1Gbps+ speeds and remove ads.')}
                  className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                >
                  <Crown className="w-3 h-3" /> Go Pro
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Generating Secure Room...</h3>
                <p className="text-gray-500 text-sm">Please wait while we verify your request.</p>
              </div>
              <div className="bg-white/5 px-6 py-2 rounded-full text-xs font-mono text-gray-400">
                AD_SIMULATION_ACTIVE: {adTimer}s
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-gray-600 text-xs flex items-center justify-center gap-6">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> E2EE P2P</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> GLOBAL SIGNALLING</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 1GBPS READY</span>
        </div>
      </motion.div>
    </main>
  );
}
