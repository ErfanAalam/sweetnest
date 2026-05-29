'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Shield, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin?type=users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="heading-1">Users</h1>
          <p className="text-stone-400 text-sm mt-1">{users.filter(u => u.role === 'USER').length} registered guests</p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary flex items-center gap-2 py-2 px-3.5 text-xs">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search users by name or mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">No users found</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(u => (
            <div key={u.id} className="card hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    u.role === 'ADMIN' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{u.name || 'Unknown'}</p>
                    <p className="text-xs text-stone-400">{u.phone}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  u.role === 'ADMIN' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {u.role === 'ADMIN' ? <Shield size={10} /> : <User size={10} />}
                  {u.role}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-50 flex justify-between text-xs text-stone-400">
                <span>Joined: {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
