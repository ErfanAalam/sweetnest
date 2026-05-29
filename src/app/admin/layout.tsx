'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Sparkles,
  Settings,
  Building2
} from 'lucide-react';
import Image from 'next/image';

const DESKTOP_NAV_ITEMS = [
  { href: '/admin', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { href: '/admin/properties', icon: <Building2 size={17} />, label: 'Properties' },
  { href: '/admin/bookings', icon: <BookOpen size={17} />, label: 'Bookings' },
  { href: '/admin/kyc', icon: <FileText size={17} />, label: 'KYC Review' },
  { href: '/admin/calendar', icon: <CalendarDays size={17} />, label: 'Calendar' },
  { href: '/admin/users', icon: <Users size={17} />, label: 'Users' },
  { href: '/admin/payments', icon: <CreditCard size={17} />, label: 'Payments' },
  { href: '/admin/support', icon: <MessageSquare size={17} />, label: 'Support' },
];

const MOBILE_NAV_ITEMS = [
  { href: '/admin', icon: <LayoutDashboard size={19} />, label: 'Overview' },
  { href: '/admin/properties', icon: <Building2 size={19} />, label: 'Properties' },
  { href: '/admin/bookings', icon: <BookOpen size={19} />, label: 'Bookings' },
  { href: '/admin/kyc', icon: <FileText size={19} />, label: 'KYC' },
];

const MORE_NAV_ITEMS = [
  { href: '/admin/calendar', icon: <CalendarDays size={16} className="text-blue-600" />, label: 'Calendar', desc: 'Block and manage availability' },
  { href: '/admin/users', icon: <Users size={16} className="text-purple-600" />, label: 'User Directory', desc: 'Manage registered traveler accounts' },
  { href: '/admin/payments', icon: <CreditCard size={16} className="text-emerald-600" />, label: 'Transactions', desc: 'Track Cashfree payment histories' },
  { href: '/admin/support', icon: <MessageSquare size={16} className="text-amber-600" />, label: 'Support Desk', desc: 'Reply to traveler help queries' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { router.push('/login'); return; }
    const u = JSON.parse(storedUser);
    if (u.role !== 'ADMIN') { router.push('/dashboard'); return; }
    setUser(u);
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  // Find page title for active header
  const activeNavItem = DESKTOP_NAV_ITEMS.find(item => item.href === pathname);
  const pageTitle = activeNavItem ? activeNavItem.label : 'Admin';

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col md:flex-row text-[#1C1917] font-poppins selection:bg-amber-100 selection:text-amber-950 antialiased">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-stone-200/60 p-6 space-y-8 flex-shrink-0 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-3 group px-2">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-500/20 shadow-sm">
            <Image src="/logo.png" alt="Sweet Nest Logo" fill className="object-cover" priority />
          </div>
          <span className="font-playfair text-lg font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
            Sweet Nest
          </span>
        </Link>

        {/* Admin Tag */}
        <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center gap-3 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center font-bold text-sm text-white">
            {user.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles size={8} /> Admin
            </div>
            <p className="text-sm font-bold truncate leading-tight mt-1">{user.name}</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1">
          {DESKTOP_NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-amber-800 text-white shadow-md'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom */}
        <div className="pt-4 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-150"
          >
            <LogOut size={18} />
            <span>Logout Panel</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE STICKY HEADER ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/50 px-5 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/20">
            <Image src="/logo.png" alt="Sweet Nest Logo" fill className="object-cover" />
          </div>
          <span className="font-playfair text-base font-bold text-stone-900">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Admin
          </span>
        </div>
      </header>

      {/* ─── MOBILE APP-STYLE TAB BAR (MOBILE ONLY) ─── */}
      <nav className="app-bottom-bar">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreSheetOpen(false)}
              className={`app-tab-btn ${active && !moreSheetOpen ? 'active' : ''}`}
            >
              <div className="app-tab-icon">{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreSheetOpen(!moreSheetOpen)}
          className={`app-tab-btn ${moreSheetOpen ? 'active' : ''}`}
        >
          <Settings size={19} className="app-tab-icon" />
          <span>More</span>
        </button>
      </nav>

      {/* ─── MOBILE BOTTOM DRAWER SHEET FOR MORE MENU ─── */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center md:hidden">
          <div className="fixed inset-0" onClick={() => setMoreSheetOpen(false)} />
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-4 shadow-2xl relative z-10 animate-slide-up pb-24">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-playfair text-base font-bold text-stone-900">Administrative Tools</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Manage additional database records</p>
              </div>
              <button 
                onClick={() => setMoreSheetOpen(false)}
                className="p-1.5 bg-stone-100 text-stone-600 rounded-full active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {MORE_NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreSheetOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl active:bg-stone-50 transition-colors ${
                      active ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-stone-50 rounded-xl">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-stone-900">{item.label}</p>
                        <p className="text-[9px] text-stone-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-stone-300" />
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={() => { setMoreSheetOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-red-50/50 active:bg-red-50 text-red-650 font-bold transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={16} className="text-red-600" />
                  <span>Logout Admin Session</span>
                </div>
                <ChevronRight size={14} className="text-red-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── WORKSPACE CONTENT ─── */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-7xl mx-auto w-full min-h-screen">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

    </div>
  );
}
