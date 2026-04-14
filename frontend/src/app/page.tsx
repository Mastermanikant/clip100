'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Wifi, MessageSquare, ChevronRight, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { CyberButton } from '@/components/ui/CyberButton';
import { CyberInput } from '@/components/ui/CyberInput';
import { CyberCard } from '@/components/ui/CyberCard';
import { GlowBackground } from '@/components/ui/GlowBackground';

export default function Home() {
  const router = useRouter();
  const [vanityName, setVanityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<'IDLE' | 'CHECKING' | 'AVAILABLE' | 'TAKEN'>('IDLE');
  const [creationMode, setCreationMode] = useState<'link' | 'nearby' | 'notes'>('link');

  useEffect(() => {
    if (!vanityName.trim()) {
      setAvailability('IDLE');
      return;
    }

    const timer = setTimeout(async () => {
      setAvailability('CHECKING');
      try {
        const res = await fetch(`/api/room/check?roomId=${vanityName}&ecosystem=${creationMode}`);
        if (res.ok) {
          const data = await res.json();
          setAvailability(data.available ? 'AVAILABLE' : 'TAKEN');
        } else {
           setAvailability('IDLE');
        }
      } catch (err) {
        setAvailability('IDLE');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vanityName, creationMode]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vanityName, 
          isPublic: true, 
          ecosystem: creationMode
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        router.push(`/${creationMode}/${data.roomId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      <GlowBackground color="bg-blue-600" pulse />
      
      <div className="max-w-4xl w-full z-10 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic uppercase">
            Frank<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Drop</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-md">Zero-friction cross-device data transfer. Secure, fast, and serverless P2P.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <CyberCard glow="blue" hover className="flex flex-col items-center text-center cursor-pointer group" onClick={() => router.push('/link')}>
             <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-blue-500" />
             </div>
             <h2 className="text-xl font-black uppercase mb-2">Frank Link</h2>
             <p className="text-sm text-gray-500">Instant P2P Clipboard & File Transfer</p>
          </CyberCard>

          <CyberCard glow="green" hover className="flex flex-col items-center text-center cursor-pointer group" onClick={() => router.push('/nearby')}>
             <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wifi className="w-8 h-8 text-green-500" />
             </div>
             <h2 className="text-xl font-black uppercase mb-2">Frank Nearby</h2>
             <p className="text-sm text-gray-500">Local Area Network Discovery & Share</p>
          </CyberCard>

          <CyberCard glow="purple" hover className="flex flex-col items-center text-center cursor-pointer group" onClick={() => router.push('/notes')}>
             <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-purple-500" />
             </div>
             <h2 className="text-xl font-black uppercase mb-2">Frank Notes</h2>
             <p className="text-sm text-gray-500">Smart Persistent Shared Notebook</p>
          </CyberCard>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleCreateRoom}
          className="max-w-md mx-auto bg-black/40 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl space-y-6"
        >
          <div className="grid grid-cols-3 gap-2 p-1 bg-black/60 rounded-xl border border-white/5">
            {(['link', 'nearby', 'notes'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setCreationMode(mode)}
                className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${creationMode === mode ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="relative">
             <CyberInput 
               placeholder="Custom Room ID (Optional)"
               value={vanityName}
               onChange={(e) => setVanityName(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
               maxLength={20}
               monospace
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
               {availability === 'CHECKING' && <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />}
               {availability === 'AVAILABLE' && <Check className="w-5 h-5 text-green-500" />}
               {availability === 'TAKEN' && <X className="w-5 h-5 text-red-500" />}
             </div>
          </div>

          <CyberButton 
            type="submit" 
            size="lg" 
            isLoading={loading}
            icon={<ChevronRight className="w-5 h-5" />}
            disabled={availability === 'TAKEN'}
          >
            {vanityName ? 'Create Vanity Room' : 'Auto Generate Room'}
          </CyberButton>
        </motion.form>
      </div>
    </main>
  );
}
