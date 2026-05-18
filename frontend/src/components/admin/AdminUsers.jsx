import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function AdminUsers({ BASE_URL }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, email) => {
    if (email === 'gk044996@gmail.com') {
      alert('Cannot delete the main administrator.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500 font-bold">Loading users...</div>;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50 flex flex-col">
      <h2 className="text-2xl sm:text-3xl font-black mb-6 text-slate-800 dark:text-white tracking-tight">User Management</h2>
      
      <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl w-full">
        <table className="min-w-[800px] w-full divide-y divide-slate-200 dark:divide-slate-700 text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Username / Email</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Tests Taken</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Avg / High Score</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Accuracy</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 dark:text-white">@{u.username}</div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{u.email}</div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-slate-700 dark:text-slate-300 text-lg">
                  {u.totalTests}
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-indigo-500 text-lg">{u.averageScore} <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase">avg</span></div>
                  <div className="text-sm font-bold text-emerald-500 mt-1">{u.highestScore} <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase">high</span></div>
                </td>
                <td className="px-6 py-4 font-black text-slate-700 dark:text-slate-300 text-lg">
                  {u.accuracy}%
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => deleteUser(u._id, u.email)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Delete User">
                    <TrashIcon className="w-5 h-5 stroke-[2]" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
               <tr>
                 <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-bold text-lg">No users found.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
