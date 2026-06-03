'use client';

import { useState, useEffect } from 'react';
import { Building2, CalendarX, ShieldAlert } from 'lucide-react';
import PropertyCalendarEditor from '@/components/PropertyCalendarEditor';

interface ManagedProperty {
  id: string;
  name: string;
  address?: string | null;
  media: { url: string }[];
}

export default function ManagerPage() {
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/manager/properties', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setProperties(data.properties);
          if (data.properties.length) setSelectedId(data.properties[0].id);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <div className="card-premium text-stone-400 text-sm">Loading your properties…</div>;
  }

  if (properties.length === 0) {
    return (
      <div className="card-premium text-center py-12">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={22} className="text-amber-700" />
        </div>
        <h2 className="font-playfair text-lg font-bold text-stone-900 mb-1">No properties assigned</h2>
        <p className="text-stone-400 text-sm max-w-sm mx-auto">
          You haven&apos;t been assigned to manage any property calendars yet. Please contact an administrator.
        </p>
      </div>
    );
  }

  const selected = properties.find(p => p.id === selectedId);

  return (
    <div>
      <h1 className="heading-1 mb-1.5 flex items-center gap-2">
        <CalendarX size={20} className="text-amber-700" /> Manage Availability
      </h1>
      <p className="text-stone-400 text-sm mb-5">
        Block or open dates for the properties assigned to you. Click a date to toggle it.
      </p>

      {properties.length > 1 && (
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
      )}

      {properties.length === 1 && selected && (
        <div className="card-premium mb-5 flex items-center gap-3">
          <Building2 size={16} className="text-amber-700" />
          <div>
            <p className="text-sm font-bold text-stone-900">{selected.name}</p>
            {selected.address && <p className="text-xs text-stone-400">{selected.address}</p>}
          </div>
        </div>
      )}

      {selectedId && <PropertyCalendarEditor key={selectedId} propertyId={selectedId} />}
    </div>
  );
}
