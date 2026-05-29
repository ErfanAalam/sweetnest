'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle,
  Calendar,
  FileText,
  Home,
  Phone,
  Clock,
  Sparkles,
  Compass,
  ArrowRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner';
import PWAInstallPopup from '@/components/PWAInstallPopup';

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const pendingBooking = localStorage.getItem('pendingBooking');
    const token = localStorage.getItem('token');

    if (!token || !pendingBooking) {
      router.push('/booking');
      return;
    }

    setUser(storedUser ? JSON.parse(storedUser) : null);
    const b = JSON.parse(pendingBooking);
    setBooking(b);

    // Clean up temporary booking data from storage
    localStorage.removeItem('termsAccepted');
    localStorage.removeItem('pendingPayment');
  }, [router]);

  if (!booking) return null;

  const nights = Math.round(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-poppins selection:bg-amber-100 selection:text-amber-950 flex flex-col justify-between relative overflow-hidden antialiased">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-100/35 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-[200px] h-[200px] bg-amber-200/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm flex-shrink-0">
              <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" />
            </div>
            <span className="font-playfair text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">Sweet Nest</span>
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto px-6 py-12 space-y-8 animate-fade-in flex-grow flex flex-col justify-center">
        
        {/* Animated Celebration Burst */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            {/* Pulsing Backglow */}
            <div className="absolute inset-0 bg-emerald-500/15 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
            
            {/* Golden Star Glows */}
            <div className="absolute -top-1 -right-1 text-amber-500 animate-pulse">
              <Sparkles size={20} />
            </div>
            <div className="absolute -bottom-1 -left-2 text-amber-600 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Sparkles size={16} />
            </div>
            
            {/* Center Success Ring */}
            <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-transform hover:scale-105 duration-300">
              <CheckCircle size={44} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-amber-700 uppercase bg-amber-50 border border-amber-250/20 px-3.5 py-1 rounded-full">
              Reservation Submitted
            </span>
            <h1 className="font-playfair text-3xl font-bold tracking-tight text-stone-900 pt-1.5">
              Sweet Journey Awaits!
            </h1>
            <p className="text-stone-500 text-xs md:text-sm max-w-sm mx-auto">
              Wonderful! Thank you, <strong>{user?.name?.split(' ')[0] || 'Guest'}</strong>. Your booking verification complies with guest hosting guidelines.
            </p>
          </div>
        </div>

        {/* Premium Booking Summary Card */}
        <div className="bg-white border border-stone-200/60 rounded-3xl shadow-xl overflow-hidden relative group transition-all duration-300 hover:shadow-2xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-850 p-4 text-white flex justify-between items-center px-6">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-amber-400" />
              <span className="font-playfair font-bold text-xs tracking-wide">Sweet Nest Premium Suite</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full">
              <MapPin size={10} />
              <span>India</span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div className="space-y-3.5 text-xs md:text-sm">
              
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold flex items-center gap-2">
                  <Calendar size={14} className="text-amber-700" /> Check-in Date
                </span>
                <span className="font-bold text-stone-900">
                  {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
                    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold flex items-center gap-2">
                  <Calendar size={14} className="text-amber-700" /> Check-out Date
                </span>
                <span className="font-bold text-stone-900">
                  {new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
                    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold">Stay Duration</span>
                <span className="font-bold text-stone-900">{nights} Night{nights !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold">Reservation ID</span>
                <span className="font-mono text-xs font-bold text-stone-400">#SN-{booking.id?.slice(0, 12).toUpperCase()}</span>
              </div>

              <div className="flex justify-between items-center py-2.5 pt-3">
                <span className="text-stone-450 font-bold">Total Paid (Secure)</span>
                <span className="font-extrabold text-amber-800 text-lg">₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
              </div>

            </div>
          </div>
        </div>

        {/* Timeline Next Steps Card */}
        <div className="bg-white border border-stone-200/50 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-stone-900">Your Journey Checklist</h3>
          
          <div className="space-y-4 relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-stone-100" />

            {[
              {
                icon: <FileText size={13} />,
                title: 'Reviewing KYC Documents',
                desc: 'Our hospitality compliance desk validates your travel IDs (usually completed under 2 hours).',
                status: 'pending'
              },
              {
                icon: <Phone size={13} />,
                title: 'SMS Booking Confirmation',
                desc: 'An automated receipt is forwarded to your mobile with details of payment execution.',
                status: 'active'
              },
              {
                icon: <Clock size={13} />,
                title: 'Check-in Guide & Navigation',
                desc: 'Arrival instructions, key lockbox codes, and parking guides are sent 24 hours prior to check-in.',
                status: 'future'
              }
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${
                  step.status === 'active' 
                    ? 'bg-amber-700 border-amber-800 text-white animate-pulse'
                    : step.status === 'pending'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}>
                  {step.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-stone-900">{step.title}</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="flex items-center gap-2 text-[11px] text-stone-400 justify-center">
          <ShieldCheck size={13} className="text-amber-700" />
          <span>Need quick assistance? Call stay desk at <span className="text-stone-600 font-bold">+91 99999-99999</span></span>
        </div>

        {/* Custom Actions */}
        <div className="flex gap-4">
          <Link 
            href="/dashboard" 
            className="btn-primary py-3.5 rounded-xl shadow-lg flex-1 text-center font-bold bg-stone-900 hover:bg-stone-850 text-white text-xs md:text-sm flex items-center justify-center gap-1"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={14} />
          </Link>
          <Link 
            href="/" 
            className="btn-secondary py-3.5 rounded-xl flex-1 text-center font-bold text-xs md:text-sm border border-stone-200 hover:bg-stone-50 text-stone-700"
          >
            Return to Home
          </Link>
        </div>

      </div>

      {/* Corporate branding */}
      <footer className="text-center py-6 border-t border-stone-150/40 text-[10px] text-stone-400">
        © 2026 Sweet Nest Luxury Hospitality. All reservation rights protected.
      </footer>

      {/* Notification permission — appears 1.2s after page loads */}
      <NotificationPermissionBanner booking={booking} />

      {/* PWA install popup — slides up 4s after booking confirmed */}
      <PWAInstallPopup delay={4000} />
    </div>
  );
}
