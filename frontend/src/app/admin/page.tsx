'use client';
import React, { useState, useEffect } from 'react';
import { Shield, Globe, Lock, Trash2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [activeEco, setActiveEco] = useState<'link' | 'notes' | 'nearby'>('link');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      fetchStats(savedToken);
      fetchItems('link', savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem('adminToken', data.token);
      setToken(data.token);
      fetchStats(data.token);
      fetchItems('link', data.token);
    } else {
      alert('Invalid credentials');
    }
  };

  const fetchStats = async (t = token) => {
    if (!t) return;
    const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${t}` } });
    if (res.ok) {
       const data = await res.json();
       setStats(data.stats);
    }
  };

  const fetchItems = async (eco: string, t = token) => {
    if (!t) return;
    const res = await fetch(`/api/admin/manage?ecosystem=${eco}`, { headers: { 'Authorization': `Bearer ${t}` } });
    if (res.ok) {
       const data = await res.json();
       setItems(data.items || []);
    }
  };

  const handleDelete = async (id: string) => {
    // Basic confirm in dashboard is fine
    if (!confirm('Delete this item?')) return;
    await fetch('/api/admin/manage', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id, ecosystem: activeEco })
    });
    fetchItems(activeEco);
    fetchStats();
  };

  const handlePurgeAll = async () => {
    if (!confirm('☢️ CRITICAL ACTION: PURGE ALL?')) return;
    await fetch('/api/admin/manage', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'purge_all' })
    });
    fetchStats();
    setItems([]);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-md w-full border border-white/10 p-12 rounded-[2rem] space-y-6">
          <Shield className="w-12 h-12 text-blue-500 mx-auto" />
          <h1 className="text-2xl font-black text-center">Root Access</h1>
          <input type="text" placeholder="User" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl" />
          <input type="password" placeholder="Pass" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 p-4 rounded-xl" />
          <button className="w-full bg-blue-600 p-4 rounded-xl font-bold">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
       <header className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
             <Link href="/" className="bg-white/10 p-2 rounded-xl"><ArrowLeft className="w-5 h-5"/></Link>
             <h1 className="text-3xl font-black">Admin</h1>
          </div>
          <button onClick={handlePurgeAll} className="bg-red-500/20 text-red-500 px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-500/30">Purge Data</button>
       </header>

       <div className="max-w-6xl mx-auto grid grid-cols-4 gap-4">
          <div className="bg-white/5 p-6 rounded-2xl"><h3 className="text-xs text-gray-500">Link Rooms</h3><p className="text-3xl font-black">{stats?.totalRooms || 0}</p></div>
          <div className="bg-white/5 p-6 rounded-2xl"><h3 className="text-xs text-gray-500">Notes</h3><p className="text-3xl font-black">{stats?.totalNotebooks || 0}</p></div>
          <div className="bg-white/5 p-6 rounded-2xl"><h3 className="text-xs text-gray-500">Nearby</h3><p className="text-3xl font-black">{stats?.totalNearby || 0}</p></div>
          <div className="bg-white/5 p-6 rounded-2xl"><h3 className="text-xs text-gray-500">Visits</h3><p className="text-3xl font-black">{stats?.totalVisits || 0}</p></div>
       </div>

       <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex gap-2">
            {(['link', 'notes', 'nearby'] as const).map(eco => (
               <button key={eco} onClick={() => { setActiveEco(eco); fetchItems(eco); }} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase ${activeEco === eco ? 'bg-blue-600' : 'bg-white/5'}`}>{eco}</button>
            ))}
          </div>
          <div className="bg-white/5 rounded-2xl p-4 space-y-2">
             {items.map(item => (
                <div key={item.roomId || item.id} className="flex justify-between items-center p-4 bg-black/40 rounded-xl">
                   <div>
                      <span className="font-bold">{item.roomId || item.id}</span>
                      {item.passwordHash && <Lock className="w-3 h-3 text-red-500 inline ml-2" />}
                   </div>
                   <div className="flex gap-2">
                      {item.roomId && <a href={`/${activeEco}/${item.roomId}`} target="_blank" className="p-2 bg-white/10 rounded-lg"><Globe className="w-4 h-4"/></a>}
                      <button onClick={() => handleDelete(item.roomId || item.id)} className="p-2 bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-500"/></button>
                   </div>
                </div>
             ))}
             {items.length === 0 && <p className="text-gray-500 p-8 text-center text-sm">No items found</p>}
          </div>
       </div>
    </div>
  );
}
