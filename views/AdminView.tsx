import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shield, Zap, Search, Gift, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';

const AdminView = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() })) as UserProfile[];
      setUsers(loaded);
    } catch (error) {
      console.error("Admin Access Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. The "God Mode" Action
  const giftCredits = async (userId: string, amount: number) => {
    if (!window.confirm(`Grant ${amount} credits to this user?`)) return;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { credits: increment(amount), plan: 'pro' });
    fetchUsers(); // Refresh table
  };

  const filtered = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 animate-fade-in pb-32">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Shield className="text-red-600" size={36} /> Admin Console
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Manage users, credits, and plans.</p>
        </div>
        <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2">
          <Database size={16} className="text-slate-400" />
          {users.length} Total Users
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search users by email..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium text-lg"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Django-Style Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">User Identity</th>
              <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">Current Plan</th>
              <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">Credit Balance</th>
              <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-5">
                  <div className="font-bold text-slate-900">{user.email || 'Unknown Email'}</div>
                  <div className="text-xs font-mono text-slate-400 mt-1">{user.id}</div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    user.plan === 'pro' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.plan || 'Free'}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-700 text-lg">
                    <Zap size={16} className={user.credits > 0 ? "text-yellow-500 fill-yellow-500" : "text-slate-300"} />
                    {user.credits}
                  </div>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => giftCredits(user.id, 100)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
                  >
                    <Gift size={16} /> Grant 100 Credits
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && filtered.length === 0 && (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center">
             <AlertTriangle size={48} className="mb-4 opacity-20" />
             <p>No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;