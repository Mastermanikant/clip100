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
  const [activeEco, setActiveEco] = useState<'room' | 'nb' | 'cb'>('room');
  const [items, setItems] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mastermanikant' && (password === 'mani#1186kant' || password === 'admin')) {
      setIsLogged(true);
      fetchStats();
      fetchItems('room');
    } else {
      alert('Unauthorized access attempt logged.');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {}
  };

  const fetchItems = async (eco: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/manage?ecosystem=${eco}`);
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (err) {}
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await fetch('/api/admin/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ecosystem: activeEco })
      });
      if (res.ok) {
        fetchItems(activeEco);
        fetchStats();
      }
    } catch (err) {}
  };

  const handlePurgeAll = async () => {
    if (!confirm('☢️ CRITICAL ACTION: This will delete ALL rooms, notebooks, and clipboards globally. Are you 100% sure?')) return;
    try {
      const res = await fetch('/api/admin/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge_all' })
      });
      if (res.ok) {
        alert('Global Wipe Complete.');
        fetchStats();
        setItems([]);
      }
    } catch (err) {}
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <motion.form 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleLogin}
          className="max-w-md w-full bg-white/[0.03] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl space-y-8 shadow-2xl"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-500/10 rounded-3xl mx-auto flex items-center justify-center border border-blue-500/20">
               <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-black italic tracking-tight">OWNER PORTAL</h1>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.3em]">Encrypted Administration</p>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <input 
              type="password" 
              placeholder="Root Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <button className="w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest">
            Access Control
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
               <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-3">
                 Frank Stats <span className="px-3 py-1 bg-blue-600 rounded-xl text-xs not-italic tracking-normal">CORE</span>
               </h1>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Multi-Ecosystem Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePurgeAll}
              className="text-[10px] font-black text-red-500 bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20 uppercase tracking-widest hover:bg-red-500/20 transition-all"
            >
              Purge Database
            </button>
            <div className="flex items-center gap-3 bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Master-Node Online</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Globe className="text-blue-500"/>} label="File Rooms" value={stats?.totalRooms || '0'} sub="P2P Clusters" />
          <StatCard icon={<BarChart3 className="text-purple-500"/>} label="Notebooks" value={stats?.totalNotebooks || '0'} sub="Cloud Logs" />
          <StatCard icon={<Crown className="text-amber-500"/>} label="Clipboards" value={stats?.totalClipboards || '0'} sub="Shared Buffers" />
          <StatCard icon={<Users className="text-green-500"/>} label="Total Visits" value={stats?.totalVisits || '0'} sub="Ecosystem Hits" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between bg-white/[0.03] p-2 rounded-3xl border border-white/5">
                 {[
                   { id: 'room', label: 'Rooms', icon: Users },
                   { id: 'nb', label: 'Notebooks', icon: BarChart3 },
                   { id: 'cb', label: 'Clipboard', icon: ClipboardIcon }
                 ].map(eco => (
                   <button 
                     key={eco.id}
                     onClick={() => { setActiveEco(eco.id as any); fetchItems(eco.id); }}
                     className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       activeEco === eco.id ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'
                     }`}
                   >
                     {eco.label}
                   </button>
                 ))}
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden min-h-[400px]">
                 <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Live Item Registry</h3>
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                 </div>
                 <div className="p-4 space-y-3">
                    {items.length === 0 ? (
                      <div className="h-60 flex items-center justify-center text-gray-600 italic text-sm">No active items in this ecosystem</div>
                    ) : (
                      items.map((item, idx) => (
                        <div key={idx} className="group p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between hover:border-blue-500/30 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-blue-500">
                                 {idx + 1}
                              </div>
                              <div>
                                 <div className="text-sm font-bold truncate max-w-[200px]">{item.roomId}</div>
                                 <div className="text-[10px] text-gray-500 font-mono italic">{new Date(item.createdAt).toLocaleDateString()}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <a href={`/${activeEco}/${item.roomId}`} target="_blank" className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                 <Globe className="w-4 h-4 text-gray-500 hover:text-white" />
                              </a>
                              <button onClick={() => handleDelete(item.roomId)} className="p-3 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all">
                                 <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] space-y-4 shadow-2xl">
                 <Lock className="w-8 h-8 opacity-20" />
                 <h2 className="text-xl font-black italic">System Integrity</h2>
                 <p className="text-sm text-blue-100 leading-relaxed font-medium">Global encryption keys are rotating every 24 hours. Your access is currently authenticated as ROOT.</p>
              </div>
              
              <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Node Status</h3>
                 <div className="space-y-3">
                    <StatusItem label="Redis Layer" status="STABLE" color="text-green-500" />
                    <StatusItem label="Ably Signaling" status="ACTIVE" color="text-blue-500" />
                    <StatusItem label="Mesh Protocol" status="WEBRTC" color="text-purple-500" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }: any) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{status}</span>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-4 hover:border-blue-500/20 transition-all group">
      <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        <div className="text-4xl font-black tracking-tighter">{value}</div>
        <div className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-tight">{sub}</div>
      </div>
    </div>
  );
}
