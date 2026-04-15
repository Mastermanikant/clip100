'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Router, Smartphone, Monitor, ChevronRight } from 'lucide-react';
import CyberCard from '@/components/ui/CyberCard';
import GlowBackground from '@/components/ui/GlowBackground';
import Link from 'next/link';

interface NearbyDevice {
  id: string;
  name: string;
  type: string;
}

export default function NearbyPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [devices, setDevices] = useState<NearbyDevice[]>([]);
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    const scan = async () => {
      try {
        const res = await fetch('/api/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceName: 'My Device' }),
        });
        const data = await res.json();
        if (data.success) {
          setDevices(data.members || []);
          setGroupId(data.groupId);
        }
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    
    scan();
    const interval = setInterval(scan, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 relative overflow-hidden">
      <GlowBackground color="bg-green-600" />

      <div className="w-full max-w-4xl z-10 pt-12 space-y-12">
        <div className="text-center">
          <div className="inline-flex relative">
            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20" />
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 relative">
              <Wifi className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl font-black italic tracking-widest uppercase mt-6 mb-2">
            Frank<span className="text-green-500">Nearby</span>
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold flex items-center justify-center gap-2">
            Network ID: <span className="text-green-500 font-mono">{groupId || '---'}</span>
          </p>
        </div>

        <div className="relative border border-white/10 rounded-3xl p-8 bg-black/40 backdrop-blur-xl min-h-[400px]">
          {isScanning && devices.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 border-2 border-green-500 rounded-full opacity-20 animate-ping absolute inset-0 auto-ping-1" />
                <div className="w-32 h-32 border-2 border-green-500 rounded-full opacity-40 animate-ping absolute inset-0 animate-delay-200" />
                <Router className="w-12 h-12 text-green-500 z-10 relative" />
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                Scanning Local Network...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No devices found on this network.</p>
                  <p className="text-xs mt-2">Make sure both devices are on the same Wi-Fi.</p>
                </div>
              ) : (
                devices.map((device, i) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CyberCard glow="green" className="p-6 flex flex-col items-center gap-4 group">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center relative">
                        {device.type === 'mobile' ? (
                          <Smartphone className="w-6 h-6 text-green-500" />
                        ) : (
                          <Monitor className="w-6 h-6 text-green-500" />
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#050505] rounded-full" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">{device.name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{device.type}</p>
                      </div>
                      <Link href={`/link/${groupId}-${device.id.slice(0, 4)}`} className="w-full">
                        <button className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-xs font-bold uppercase tracking-widest transition-all mt-2">
                          Connect
                        </button>
                      </Link>
                    </CyberCard>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
