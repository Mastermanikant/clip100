'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Wifi, MessageSquare, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import CyberButton from '@/components/ui/CyberButton';
import CyberInput from '@/components/ui/CyberInput';
import CyberCard from '@/components/ui/CyberCard';
import GlowBackground from '@/components/ui/GlowBackground';
import type { Ecosystem } from '@/lib/constants';
import { isValidRoomId } from '@/lib/utils';

const ecosystems = [
  {
    id: 'link' as Ecosystem,
    title: 'Frank Link',
    subtitle: 'Instant P2P Transfer',
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'blue' as const,
    route: '/link',
  },
  {
    id: 'nearby' as Ecosystem,
    title: 'Frank Nearby',
    subtitle: 'Local Network Share',
    icon: Wifi,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'green' as const,
    route: '/nearby',
  },
  {
    id: 'notes' as Ecosystem,
    title: 'Frank Notes',
    subtitle: 'Smart Notebook',
    icon: MessageSquare,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'purple' as const,
    route: '/notes',
  },
];

type Availability = 'idle' | 'checking' | 'available' | 'taken';

export default function LandingPage() {
  const router = useRouter();
  const [vanityName, setVanityName] = useState('');
  const [selectedEco, setSelectedEco] = useState<Ecosystem>('link');
  const [availability, setAvailability] = useState<Availability>('idle');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Debounced availability check
  useEffect(() => {
    if (!vanityName.trim() || !isValidRoomId(vanityName)) {
      setAvailability('idle');
      return;
    }

    setAvailability('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/room/check?roomId=${encodeURIComponent(vanityName)}&ecosystem=${selectedEco}`
        );
        const data = await res.json();
        if (data.success) {
          setAvailability(data.available ? 'available' : 'taken');
        }
      } catch {
        setAvailability('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vanityName, selectedEco]);

  const handleCreate = async () => {
    if (!vanityName.trim()) return;
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vanityName: vanityName.toLowerCase(),
          ecosystem: selectedEco,
          isPublic: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/${selectedEco}/${data.roomId}`);
      } else {
        setError(data.message || 'Failed to create room');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const availabilityIcon = {
    idle: null,
    checking: <Loader2 className="w-4 h-4 animate-spin text-gray-500" />,
    available: <Check className="w-4 h-4 text-green-500" />,
    taken: <X className="w-4 h-4 text-red-500" />,
  };

  return (
    <main className="min-h-screen bg-cyber-bg text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <GlowBackground color="bg-blue-600" />

      <div className="max-w-2xl w-full z-10 space-y-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter italic">
            FRANK <span className="text-neon-blue">DROP</span>
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-[0.3em] font-bold">
            Zero-friction cross-device transfer
          </p>
        </motion.div>

        {/* Ecosystem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ecosystems.map((eco, i) => (
            <motion.div
              key={eco.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <CyberCard
                glow={eco.glow}
                onClick={() => router.push(eco.route)}
                className="p-8 group"
              >
                <div
                  className={`w-12 h-12 ${eco.bg} rounded-2xl flex items-center justify-center mb-4 border ${eco.border} group-hover:scale-110 transition-transform`}
                >
                  <eco.icon className={`w-6 h-6 ${eco.color}`} />
                </div>
                <h3 className="text-lg font-black tracking-tight">{eco.title}</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
                  {eco.subtitle}
                </p>
              </CyberCard>
            </motion.div>
          ))}
        </div>

        {/* Quick Create */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CyberCard className="p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
              Quick Create
            </h2>

            {/* Ecosystem selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-black/50 rounded-2xl border border-white/5">
              {ecosystems.map((eco) => (
                <button
                  key={eco.id}
                  onClick={() => setSelectedEco(eco.id)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all capitalize ${
                    selectedEco === eco.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {eco.title.replace('Frank ', '')}
                </button>
              ))}
            </div>

            {/* Room name input */}
            <div className="relative">
              <CyberInput
                placeholder="custom-room-name"
                value={vanityName}
                onChange={(val) => setVanityName(val.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                maxLength={20}
                monospace
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {availabilityIcon[availability]}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-bold text-center">{error}</p>
            )}

            <CyberButton
              variant="primary"
              size="lg"
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={!vanityName.trim() || availability === 'taken'}
              icon={<ChevronRight className="w-4 h-4" />}
              className="w-full"
            >
              Create Room
            </CyberButton>
          </CyberCard>
        </motion.div>
      </div>
    </main>
  );
}
