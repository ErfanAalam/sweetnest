'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, UserPlus, X, ShieldCheck, Search } from 'lucide-react';
import PropertyCalendarEditor from '@/components/PropertyCalendarEditor';

interface Property { id: string; name: string; address?: string | null }
interface ManagerUser { id: string; name: string | null; phone: string }
interface Manager { id: string; user: ManagerUser }

export default function AdminCalendarPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loadingProps, setLoadingProps] = useState(true);

  const [managers, setManagers] = useState<Manager[]>([]);
  const [allUsers, setAllUsers] = useState<ManagerUser[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const token = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  // Load properties (admin sees all).
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/properties', { headers: { Authorization: `Bearer ${token()}` } });
        const data = await res.json();
        if (data.success) {
          setProperties(data.properties);
          if (data.properties.length) setSelectedId(data.properties[0].id);
        }
      } catch { /* silent */ }
      finally { setLoadingProps(false); }
    })();
  }, []);

  const fetchManagers = useCallback(async (propertyId: string) => {
    try {
      const res = await fetch(`/api/admin/property-managers?propertyId=${propertyId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) setManagers(data.managers);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (selectedId) fetchManagers(selectedId);
  }, [selectedId, fetchManagers]);

  const openAssign = async () => {
    setShowAssign(true);
    if (allUsers.length === 0) {
      try {
        const res = await fetch('/api/admin?type=users', { headers: { Authorization: `Bearer ${token()}` } });
        const data = await res.json();
        if (data.success) setAllUsers(data.users);
      } catch { /* silent */ }
    }
  };

  const assign = async (userId: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/property-managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ userId, propertyId: selectedId }),
      });
      if (res.ok) {
        await fetchManagers(selectedId);
        setShowAssign(false);
        setUserSearch('');
      }
    } finally { setBusy(false); }
  };

  const unassign = async (userId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/property-managers?userId=${userId}&propertyId=${selectedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) await fetchManagers(selectedId);
    } finally { setBusy(false); }
  };

  const assignedIds = new Set(managers.map(m => m.user.id));
  const filteredUsers = allUsers
    .filter(u => !assignedIds.has(u.id))
    .filter(u => {
      const q = userSearch.toLowerCase();
      return !q || (u.name?.toLowerCase().includes(q)) || u.phone.includes(q);
    });

  const selectedProperty = properties.find(p => p.id === selectedId);

  return (
    <div>
      <h1 className="heading-1 mb-1.5">Calendar Management</h1>
      <p className="text-stone-400 text-sm mb-5">
        Select a property to manage its availability and assign calendar managers.
      </p>

      {loadingProps ? (
        <div className="card-premium text-stone-400 text-sm">Loading properties…</div>
      ) : properties.length === 0 ? (
        <div className="card-premium text-stone-500 text-sm">
          No properties yet. Add a property first to manage its calendar.
        </div>
      ) : (
        <>
          {/* Property selector */}
          <div className="card-premium mb-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-2">
              <Building2 size={14} className="text-amber-700" /> Property
            </label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="input-field"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Managers panel */}
          <div className="card-premium mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-playfair font-bold text-stone-900 text-sm flex items-center gap-2">
                <ShieldCheck size={15} className="text-amber-700" /> Calendar Managers
              </h3>
              <button onClick={openAssign} className="btn-secondary text-xs flex items-center gap-1.5">
                <UserPlus size={13} /> Assign user
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mb-3">
              Assigned users can edit the calendar of <span className="font-semibold text-stone-600">{selectedProperty?.name}</span> only — nothing else.
            </p>
            {managers.length === 0 ? (
              <p className="text-xs text-stone-400">No managers assigned. Only admins can edit this calendar.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {managers.map(m => (
                  <span key={m.id} className="flex items-center gap-2 bg-stone-100 rounded-full pl-3 pr-1.5 py-1 text-xs">
                    <span className="font-medium text-stone-700">{m.user.name || 'Unnamed'}</span>
                    <span className="text-stone-400">{m.user.phone}</span>
                    <button
                      onClick={() => unassign(m.user.id)}
                      disabled={busy}
                      className="w-5 h-5 rounded-full bg-stone-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                      title="Remove"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Per-property calendar */}
          {selectedId && <PropertyCalendarEditor key={selectedId} propertyId={selectedId} />}
        </>
      )}

      {/* Assign modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="card-premium max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="heading-2 text-base">Assign a Manager</h3>
              <button onClick={() => { setShowAssign(false); setUserSearch(''); }} className="p-1.5 bg-stone-100 rounded-full">
                <X size={15} />
              </button>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name or phone"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="overflow-y-auto flex-1 -mx-1 px-1 space-y-1">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No matching users.</p>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => assign(u.id)}
                    disabled={busy}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-left transition-colors disabled:opacity-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-800">{u.name || 'Unnamed'}</p>
                      <p className="text-xs text-stone-400">{u.phone}</p>
                    </div>
                    <UserPlus size={15} className="text-amber-700" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
