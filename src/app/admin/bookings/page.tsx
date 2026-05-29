'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: 'bg-stone-100 text-stone-500',
  SUCCESS: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-purple-50 text-purple-700',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin?type=bookings', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'update-booking', id, status }),
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const filtered = bookings.filter(b =>
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.phone?.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="heading-1">Bookings</h1>
          <p className="text-stone-400 text-sm mt-1">{bookings.length} total bookings</p>
        </div>
        <button onClick={fetchBookings} className="btn-secondary flex items-center gap-2 py-2 px-3.5 text-xs">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search by guest name, mobile, or booking ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">No bookings found</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  {['Booking ID', 'Guest', 'Dates', 'Amount', 'Status', 'Payment', 'KYC', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-amber-700 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-stone-400">{b.id.slice(0, 10)}…</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-stone-900 text-sm">{b.user?.name}</p>
                      <p className="text-xs text-stone-400">{b.user?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <p className="text-xs">{new Date(b.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-xs text-stone-400">→ {new Date(b.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-semibold text-sm">₹{b.totalPrice?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[b.status] || 'bg-stone-100 text-stone-500'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_COLORS[b.paymentStatus] || ''}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        b.kycStatus === 'VERIFIED' ? 'bg-green-50 text-green-700' :
                        b.kycStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' :
                        'bg-stone-100 text-stone-400'
                      }`}>
                        {b.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {b.status === 'PENDING' && b.paymentStatus === 'SUCCESS' && (
                          <button
                            onClick={() => updateStatus(b.id, 'CONFIRMED')}
                            disabled={updating === b.id}
                            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
                          >
                            Confirm
                          </button>
                        )}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <button
                            onClick={() => updateStatus(b.id, 'CANCELLED')}
                            disabled={updating === b.id}
                            className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
