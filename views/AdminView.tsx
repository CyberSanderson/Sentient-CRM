import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Users, DollarSign, Activity } from 'lucide-react';

const AdminView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const totalDossiers = users.reduce((acc, curr) => acc + (curr.dossiersGenerated || 0), 0);

  if (loading) return <div className="p-10 text-center">Loading User Data...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">Admin Access Only</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Pro Subscribers</p>
              <h3 className="text-2xl font-bold text-slate-900">{proUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Dossiers Generated</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalDossiers}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">User Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Email / User ID</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold">Credits Left</th>
                <th className="px-6 py-4 font-bold">Total Usage</th>
                <th className="px-6 py-4 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{u.email}</div>
                    <div className="text-xs text-slate-400 font-mono">{u.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                      u.plan === 'pro' 
                        ? 'bg-brand-100 text-brand-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{u.credits}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{u.dossiersGenerated}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;