'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Router, Smartphone, Monitor } from 'lucide-react';
import { RoomHeader } from '@/components/RoomHeader';

export default function FrankNearby() {
  const [isScanning, setIsScanning] = useState(false);
  const [peers, setPeers] = useState<any[]>([]);

  const startScan = () => {
    setIsScanning(true);
    // Ping API every 5 seconds
    const interval = setInterval(async () => {
       const res = await fetch('/api/room/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop PC' })
       });
       if (res.ok) {
          const data = await res.json();
          setPeers(data.members || []);
       }
    }, 5000);
    // Initial ping
    fetch('/api/room/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop PC' })
    }).then(res => res.json()).then(data => setPeers(data.members || []));

    return () => clearInterval(interval);
  };

  useEffect(() => {
     let cleanup: any;
     if (isScanning) {
        cleanup = startScan();
     }
     return () => { if (cleanup) cleanup() };
  }, [isScanning]);

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.03] transition-colors duration-1000 ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`} />
      </div>

      <motion.div 
        layout
        className="max-w-4xl w-full h-[90vh] bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
      >
        <RoomHeader 
           title="FrankNearby" 
           roomId="LAN-DISCOVERY" 
           isConnected={isScanning} 
           peerCount={peers.length}
           accentColor="text-green-500" 
        />

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-12 relative">
           
           <div className="relative flex justify-center items-center w-full max-w-sm aspect-square">
              {/* Radar Circles */}
              {[1, 2, 3].map(i => (
                <div key={i} className={`absolute border border-green-500/20 rounded-full w-full h-full scale-[${i*0.3}] ${isScanning ? 'animate-ping' : ''}`} style={{ animationDuration: `${i*1.5}s` }} />
              ))}
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                 <button 
                   onClick={() => setIsScanning(!isScanning)}
                   className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all ${isScanning ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-white/5 border-white/10 text-gray-500 hover:border-green-500/50 hover:text-green-500'}`}
                 >
                    <Router className={`w-10 h-10 ${isScanning ? 'animate-pulse' : ''}`} />
                 </button>
              </div>

              {/* Peers orbiting */}
              <AnimatePresence>
                {peers.map((p, i) => {
                  const angle = (i * 360) / (peers.length || 1);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute w-20 h-20 rounded-2xl bg-white/5 border border-green-500/30 backdrop-blur-md flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-green-500/20 transition-all z-20"
                      style={{ transform: `rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)` }}
                      onClick={() => alert('Connect to ' + p.name + ' - WebRTC Direct')}
                    >
                      {p.name.includes('Mobile') ? <Smartphone className="w-6 h-6 text-green-400" /> : <Monitor className="w-6 h-6 text-green-400" />}
                      <span className="text-[9px] font-bold uppercase truncate px-2 text-white">{p.name}</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
           </div>
           
           <div className="text-center">
             <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">{isScanning ? 'Scanning LAN' : 'Radar Offline'}</h2>
             <p className="text-sm text-gray-500 max-w-xs mx-auto">Devices on the same Wi-Fi network will appear above automatically.</p>
           </div>
        </div>
      </motion.div>
    </main>
  );
}
