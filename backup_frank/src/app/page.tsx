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
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [vanityName, setVanityName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<'IDLE' | 'CHECKING' | 'AVAILABLE' | 'TAKEN'>('IDLE');
  const [creationMode, setCreationMode] = useState<'transfer' | 'notebook' | 'clipboard'>('transfer');

  // URL Availability Check
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
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vanityName, 
          passwordHash: password, // Simplified for Baseline
          isPublic: !password, 
          initialMode: creationMode,
          adminId: 'temp-' + Math.random().toString(36).substring(7)
        })
      });
      
      const data = await res.json();
      const ecosystem = creationMode === 'transfer' ? 'room' : creationMode === 'notebook' ? 'nb' : 'cb';
      
      if (data.success) {
        router.push(`/${ecosystem}/${data.roomId}`);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError('Baseline Connection Error. Check KV.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="max-w-xl w-full z-10 space-y-8">
        <div className="flex flex-col items-center">
          <h1 className="text-5xl font-black tracking-tighter mb-2 italic">FRANK DROP</h1>
          <p className="text-gray-500 font-medium text-center">Stability Check: <span className="text-blue-400">BASELINE_ACTIVE</span></p>
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
              <input
                type="text"
                placeholder="custom-name"
                value={vanityName}
                onChange={(e) => setVanityName(e.target.value)}
                className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-800"
              />
              {error && <p className="text-red-400 text-xs font-bold text-center">⚠️ {error}</p>}
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? 'Initializing...' : 'Create Room'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
