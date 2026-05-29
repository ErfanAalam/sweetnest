'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setRefreshing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin?type=stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = [
    { 
      label: 'Revenue', 
      value: stats?.totalRevenue != null ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '₹0', 
      icon: <TrendingUp size={18} />, 
      href: '/admin/payments', 
      colorClass: 'bg-emerald-55 text-emerald-800 border-emerald-100/50',
      iconBg: 'bg-emerald-100/60'
    },
    { 
      label: 'Bookings', 
      value: stats?.totalBookings ?? '0', 
      icon: <BookOpen size={18} />, 
      href: '/admin/bookings', 
      colorClass: 'bg-blue-55 text-blue-800 border-blue-100/50',
      iconBg: 'bg-blue-100/60'
    },
    { 
      label: 'Users', 
      value: stats?.totalUsers ?? '0', 
      icon: <Users size={18} />, 
      href: '/admin/users', 
      colorClass: 'bg-purple-55 text-purple-800 border-purple-100/50',
      iconBg: 'bg-purple-100/60'
    },
    { 
      label: 'Pending KYC', 
      value: stats?.pendingKYC ?? '0', 
      icon: <FileText size={18} />, 
      href: '/admin/kyc', 
      colorClass: 'bg-amber-55 text-amber-800 border-amber-100/50',
      iconBg: 'bg-amber-100/60',
      alert: stats?.pendingKYC > 0 
    },
    { 
      label: 'Open Support', 
      value: stats?.openTickets ?? '0', 
      icon: <MessageSquare size={18} />, 
      href: '/admin/support', 
      colorClass: 'bg-rose-55 text-rose-800 border-rose-100/50',
      iconBg: 'bg-rose-100/60',
      alert: stats?.openTickets > 0 
    },
  ];

  const quickActions = [
    { label: 'Review KYC Docs', href: '/admin/kyc', icon: <FileText size={16} />, desc: 'Approve or reject pending verifications', badge: stats?.pendingKYC > 0 ? `${stats.pendingKYC} pending` : null },
    { label: 'Manage Calendar', href: '/admin/calendar', icon: <Clock size={16} />, desc: 'Block or unblock booking dates', badge: null },
    { label: 'View Stays Log', href: '/admin/bookings', icon: <BookOpen size={16} />, desc: 'Track guest schedules and status', badge: null },
    { label: 'Support Queue', href: '/admin/support', icon: <MessageSquare size={16} />, desc: 'Reply to guest complaints & requests', badge: stats?.openTickets > 0 ? `${stats.openTickets} open` : null },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={11} />
            <span>Operations Hub</span>
          </div>
          <h1 className="font-playfair text-2xl font-bold text-stone-900 mt-2">Console Overview</h1>
          <p className="text-stone-400 text-xs mt-0.5">Real-time metrics and actions</p>
        </div>

        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="p-2.5 bg-white border border-stone-200/60 hover:bg-stone-50 text-stone-600 rounded-full active:scale-90 transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Widgets Scroll Container */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Live Metrics</h3>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-700/20 active:scale-98 transition-all duration-200 flex flex-col justify-between h-28 relative group"
              >
                {card.alert && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-white" />
                )}
                
                <div className={`p-2 rounded-xl w-fit ${card.iconBg} text-stone-800`}>
                  {card.icon}
                </div>
                
                <div>
                  <p className="text-lg font-black text-stone-900 leading-none tabular-nums truncate">
                    {card.value}
                  </p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">{card.label}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Feed */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Tactile Console Actions</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white border border-stone-200/60 p-4 rounded-2xl shadow-sm hover:border-amber-700/20 active:bg-stone-50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-800 flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-stone-900 text-xs leading-none">{action.label}</p>
                    {action.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[8px] font-black uppercase tracking-wider">{action.badge}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">{action.desc}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Administrative Guides */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle size={15} className="text-amber-800" />
          <h3 className="font-playfair text-sm font-bold text-stone-950">Status Color Codes</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
          {[
            { label: 'Pending', colorClass: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Guest has requested stay, payment/KYC pending' },
            { label: 'Confirmed', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Payment received & KYC documents verified' },
            { label: 'Cancelled', colorClass: 'bg-red-50 text-red-700 border-red-200', desc: 'Reservation cancelled, lock code revoked' },
            { label: 'Completed', colorClass: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Checkout complete, room cleaning scheduled' },
          ].map(s => (
            <div key={s.label} className="border border-stone-100 rounded-xl p-3 space-y-1.5 flex flex-col justify-between bg-stone-50/50">
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit border text-[8px] ${s.colorClass}`}>{s.label}</span>
              <p className="text-stone-400 leading-normal">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
