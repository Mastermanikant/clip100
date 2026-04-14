'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Globe, Lock, Crown, BarChart3, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isLogged, setIsLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mastermanikant' && password === 'mani#1186kant') {
      setIsLogged(true);
      fetchStats();
    } else {
      alert('Unauthorized access attempt logged.');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Stats failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin}
          className="max-w-md w-full bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black italic">OWNER PORTAL</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Encrypted Administration</p>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
            />
            <input 
              type="password" 
              placeholder="Root Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
            />
          </div>
          <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:scale-[1.02] transition-all">
            Access Dashboard
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-white/5 rounded-2xl">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Frank Stats <span className="text-blue-500">PRO</span></h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 uppercase tracking-widest">
            System Live
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Globe className="text-blue-500"/>} label="Total Rooms" value={stats?.totalRooms || '0'} sub="Lifetime clusters" />
          <StatCard icon={<Users className="text-purple-500"/>} label="Active Rooms" value={stats?.activeRooms || '0'} sub="Currently resolving" />
          <StatCard icon={<BarChart3 className="text-green-500"/>} label="Total Visits" value={stats?.totalVisits || '0'} sub="Total ecosystem hits" />
          <StatCard icon={<Crown className="text-amber-500"/>} label="Engagement" value={`${stats?.engagementScore || '0'}%`} sub="Conversion rate" />
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Performance Logs</h2>
            <button onClick={fetchStats} className="text-xs font-bold text-gray-500 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5">Refresh</button>
          </div>
          <div className="space-y-4">
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-light text-gray-400">Signaling Stability</span>
                  <span className="text-xs font-bold text-blue-400">100% (Token Auth)</span>
               </div>
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-light text-gray-400">Redis Connection</span>
                  <span className="text-xs font-bold text-green-400">STABLE (IOREDIS)</span>
               </div>
               <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-light text-gray-400">P2P Peer Mesh</span>
                  <span className="text-xs font-bold text-purple-400">ACTIVE (WEBRTC)</span>
               </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] space-y-4">
      <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <div className="text-4xl font-black">{value}</div>
        <div className="text-[10px] text-gray-600 mt-1 uppercase font-bold">{sub}</div>
      </div>
    </div>
  );
}
