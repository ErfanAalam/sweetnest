'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-purple-50 text-purple-700',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin?type=payments', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setPayments(data.payments);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, colorClass: 'text-green-700 bg-green-50' },
    { label: 'Successful', value: payments.filter(p => p.status === 'SUCCESS').length, colorClass: 'text-green-700 bg-green-50' },
    { label: 'Pending', value: payments.filter(p => p.status === 'PENDING').length, colorClass: 'text-amber-700 bg-amber-50' },
    { label: 'Failed', value: payments.filter(p => p.status === 'FAILED').length, colorClass: 'text-red-700 bg-red-50' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="heading-1">Payments</h1>
          <p className="text-stone-400 text-sm mt-1">{payments.length} total transactions</p>
        </div>
        <button onClick={fetchPayments} className="btn-secondary flex items-center gap-2 py-2 px-3.5 text-xs">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} className="card text-center">
            <div className={`text-xl font-bold ${s.colorClass.split(' ')[0]} mb-0.5`}>{s.value}</div>
            <div className="text-xs text-stone-400">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">No payment records</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  {['Order ID', 'Guest', 'Amount', 'Status', 'Method', 'Date'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-amber-700 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-stone-400">{p.orderId?.slice(0, 16) || p.id.slice(0, 10)}…</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-stone-900 text-sm">{p.booking?.user?.name || '—'}</p>
                      <p className="text-xs text-stone-400">{p.booking?.user?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-semibold text-sm">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] || ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-400 text-xs">{p.paymentMethod || '—'}</td>
                    <td className="py-3 px-4 text-stone-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
