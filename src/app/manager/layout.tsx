'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { router.push('/login'); return; }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-[#1C1917] font-poppins antialiased">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/60 px-5 py-3.5 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/20 shadow-sm">
            <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" priority />
          </div>
          <span className="font-playfair text-base font-bold text-stone-900">Sweet Nest</span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <CalendarDays size={10} /> Calendar Manager
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
