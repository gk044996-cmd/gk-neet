import React, { useState, useEffect } from 'react';
import { TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

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

  if (loading) return <div className="py-12 text-center text-slate-500">Loading users...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">User Management</h2>
      
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left">
        <thead>
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Name / Email</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Role</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Tests Taken</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Avg / High Score</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Accuracy</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {users.map(u => (
            <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-4">
                <div className="font-semibold text-slate-800 dark:text-white">{u.name}</div>
                <div className="text-sm text-slate-500">{u.email}</div>
                <div className="text-xs text-slate-400 mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                {u.totalTests}
              </td>
              <td className="px-4 py-4">
                <div className="font-bold text-indigo-600">{u.averageScore} <span className="text-slate-400 font-normal">avg</span></div>
                <div className="text-sm font-semibold text-emerald-600">{u.highestScore} <span className="text-slate-400 font-normal text-xs">high</span></div>
              </td>
              <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-300">
                {u.accuracy}%
              </td>
              <td className="px-4 py-4 text-right space-x-2">
                <button onClick={() => deleteUser(u._id, u.email)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete User">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
