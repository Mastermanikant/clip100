'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Wifi, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  MousePointer2, 
  LayoutDashboard, 
  RefreshCcw,
  Shield,
  Lock,
  Crown,
  ChevronRight,
  Info,
  Check,
  X,
  Trash2,
  Share2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/store/useRoomStore';
import { hashPassword } from '@/lib/crypto';

export default function Home() {
  const router = useRouter();
  const { setRoom } = useRoomStore();
  const [vanityName, setVanityName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<'IDLE' | 'CHECKING' | 'AVAILABLE' | 'TAKEN'>('IDLE');
  const [creationMode, setCreationMode] = useState<'transfer' | 'notebook' | 'clipboard'>('transfer');

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
        if (data.success) {
          setAvailability(data.available ? 'AVAILABLE' : 'TAKEN');
        } else {
          setAvailability('IDLE');
        }
      } catch (err) {
        setAvailability('IDLE');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vanityName]);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    
    try {
      const passwordHash = password ? await hashPassword(password) : '';
      const adminId = 'admin-' + Math.random().toString(36).substring(7);

      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vanityName, 
          passwordHash, 
          isPublic: !password, 
          initialMode: creationMode,
          adminId
        })
      });
      
      const data = await res.json();
      const ecosystem = creationMode === 'transfer' ? 'room' : creationMode === 'notebook' ? 'nb' : 'cb';
      
      if (data.success) {
        setRoom(data.roomId);
        router.push(`/${ecosystem}/${data.roomId}`);
      } else {
        setError(data.message === 'ID_TAKEN' ? 'This URL is already taken.' : 'Creation failed.');
      }
    } catch (err: any) {
      setError('Connection Error. Check Database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full z-10 space-y-8"
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-black border border-white/10 rounded-3xl mb-6 shadow-2xl flex items-center justify-center overflow-hidden">
             <div className="text-4xl">💎</div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 italic">FRANK DROP</h1>
          <p className="text-gray-500 font-medium text-center">Status: <span className="text-blue-400 font-black">ULTIMATE_REBIRTH</span></p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl">
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-3 p-1 bg-black/50 rounded-2xl border border-white/5">
              {['transfer', 'notebook', 'clipboard'].map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setCreationMode(mode as any)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all capitalize ${creationMode === mode ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="space-y-4">
               <div className="relative">
                  <input
                    type="text"
                    placeholder="custom-name (optional)"
                    value={vanityName}
                    onChange={(e) => setVanityName(e.target.value)}
                    className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-800"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    {availability === 'CHECKING' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    {availability === 'AVAILABLE' && <Check className="w-5 h-5 text-green-500" />}
                    {availability === 'TAKEN' && <X className="w-5 h-5 text-red-500" />}
                  </div>
               </div>

               <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="password"
                    placeholder="Optional Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/5 rounded-2xl px-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              
              {error && <p className="text-red-400 text-xs font-bold text-center">⚠️ {error}</p>}
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? 'Initializing...' : 'Launch Ecosystem'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="text-center text-gray-700 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-6">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-500/50" /> P2P SECURITY</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500/50" /> INSTANT DELIVERY</span>
        </div>
      </motion.div>
    </main>
  );
}
