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
  History, 
  HardDriveDownload, 
  RefreshCcw,
  PlusCircle,
  Hash,
  ArrowRight,
  Notebook,
  Clipboard,
  Share2,
  Shield,
  Lock,
  Crown,
  ChevronRight,
  Info,
  Check,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/store/useRoomStore';
import { hashPassword } from '@/lib/crypto';
import { db } from '@/lib/storage';

export default function Home() {
  const router = useRouter();
  const { roomId, setRoom, isLocalOnly } = useRoomStore();
  const [vanityName, setVanityName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(1);
  const [availability, setAvailability] = useState<'IDLE' | 'CHECKING' | 'AVAILABLE' | 'TAKEN'>('IDLE');
  const [creationMode, setCreationMode] = useState<'transfer' | 'notebook' | 'clipboard'>('transfer');
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    // Record Visit (Indian Jugaad style stats)
    fetch('/api/admin/visit', { method: 'POST' }).catch(() => {});
  }, []);

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
        if (data.success) {
          setAvailability(data.available ? 'AVAILABLE' : 'TAKEN');
        } else {
          setAvailability('IDLE');
          setError('Database Error: Link your Vercel KV');
        }
      } catch (err) {
        setAvailability('IDLE');
        setError('Connection failed. Link your KV Storage.');
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
    executeCreateRoom();
  };

  const executeCreateRoom = async () => {
    setLoading(true);
    setError('');
    const passwordHash = password ? await hashPassword(password) : '';
    
    try {
      // Signaling will be re-implemented via CDN/Build-safe method
      const adminId = 'admin-' + Math.random().toString(36).substring(7);

      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vanityName, 
          passwordHash, 
          isPublic: !password, 
          isPro, 
          initialMode: creationMode,
          adminId
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Server connection error');
      }

      const data = await res.json();
      const ecosystem = creationMode === 'transfer' ? 'room' : creationMode === 'notebook' ? 'nb' : 'cb';
      
      if (data.success) {
        router.push(`/${ecosystem}/${data.roomId}`);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Check KV database.');
    } finally {
      setLoading(false);
    }
  };

  const [nearby, setNearby] = useState<any[]>([]);
  const [ipGroupId, setIpGroupId] = useState('');

  useEffect(() => {
    // 1. Check for 'Deep Clean' request from previous version
    const lastVer = localStorage.getItem('frank_version');
    if (lastVer !== '14.15') {
       db.delete().then(() => db.open()); // Purge IndexedDB
       localStorage.setItem('frank_version', '14.15');
    }

    const checkNearby = async () => {
       try {
         const res = await fetch('/api/room/nearby', { method: 'POST', body: JSON.stringify({ deviceName: 'My Device' }) });
         const data = await res.json();
         if (data.success) {
           setNearby(data.members);
           setIpGroupId(data.groupId);
         }
       } catch (err) {}
    };
    checkNearby();
    const interval = setInterval(checkNearby, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeepClean = async () => {
    if (confirm('Delete all local storage and data? This will fix most "Application Errors" caused by old data.')) {
      await db.delete();
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleJoinNearby = () => {
    const roomId = `local-${ipGroupId}`;
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* LAST UPDATE BADGE */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
         <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Live Update: 14:15</span>
         </div>
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full z-10 space-y-8"
      >
        {/* DISCOVERY WIDGET */}
        {nearby.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-3xl flex items-center justify-between backdrop-blur-3xl"
          >
             <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
                <div>
                   <div className="text-xs font-black uppercase tracking-widest text-blue-400">{nearby.length} Nearby device found</div>
                   <div className="text-[10px] text-gray-500">Connected to same WiFi as you</div>
                </div>
             </div>
             <button 
               onClick={handleJoinNearby}
               className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-xl"
             >
               Connect Now
             </button>
          </motion.div>
        )}

        <div className="flex flex-col items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 bg-black border border-white/10 rounded-3xl mb-6 shadow-2xl flex items-center justify-center overflow-hidden"
          >
            <img src="/logo.png" alt="Frank Drop Logo" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 italic">FRANK DROP</h1>
          <p className="text-gray-500 font-medium text-center">Powering <span className="text-blue-400">frank-drop.vercel.app</span> ecosystem</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          {!showAd ? (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-3 p-1 bg-black/50 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setCreationMode('transfer')}
                  className={`py-3 px-2 rounded-xl text-[10px] md:text-sm font-bold transition-all ${creationMode === 'transfer' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Transfer
                </button>
                <button 
                  onClick={() => setCreationMode('notebook')}
                  className={`py-3 px-2 rounded-xl text-[10px] md:text-sm font-bold transition-all ${creationMode === 'notebook' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Notebook
                </button>
                <button 
                  onClick={() => setCreationMode('clipboard')}
                  className={`py-3 px-2 rounded-xl text-[10px] md:text-sm font-bold transition-all ${creationMode === 'clipboard' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Clipboard
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-[10px] hidden md:block">
                    frank-drop.vercel.app/{creationMode === 'transfer' ? 'room' : creationMode === 'notebook' ? 'nb' : 'cb'}/
                  </span>
                  <input
                    type="text"
                    placeholder="custom-name"
                    value={vanityName}
                    onChange={(e) => setVanityName(e.target.value)}
                    className={`w-full bg-black/60 border rounded-2xl md:pl-48 pr-12 py-5 text-lg font-bold focus:outline-none focus:ring-2 transition-all placeholder:text-gray-800 ${
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
                  onClick={() => { setIsPro(true); alert('👑 PRO MODE ACTIVATED! 1Gbps channels ready.'); }}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${isPro ? 'bg-amber-500 text-black border-amber-500' : 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'}`}
                >
                  <Crown className="w-3 h-3" /> {isPro ? 'Pro Active' : 'Go Pro'}
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

        <div className="mt-12 flex flex-col items-center gap-6">
           <div className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-6">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-500/50" /> E2EE P2P</span>
              <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-blue-500/50" /> GLOBAL SIGNALLING</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500/50" /> 1GBPS READY</span>
           </div>
           <button 
             onClick={handleDeepClean}
             className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-red-500 transition-all flex items-center gap-2 px-6 py-2 border border-white/5 hover:border-red-500/20 rounded-full"
           >
             <Trash2 className="w-3 h-3" /> Repair Storage & Reset
           </button>
        </div>
      </motion.div>
    </main>
  );
}
