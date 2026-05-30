'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Calendar,
  FileText,
  Clock,
  User,
  PlusCircle,
  ArrowUpRight,
  Compass,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Home,
  MessageSquare,
  ChevronRight,
  Plus,
  Send,
  Loader,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
  Fingerprint,
  Headphones,
  MapPin,
  Map,
  ExternalLink,
  Wifi,
  Car,
  Coffee,
  Tv,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'kyc' | 'support'>('home');
  
  // Data States
  const [bookings, setBookings]   = useState<any[]>([]);
  const [tickets, setTickets]     = useState<any[]>([]);
  const [kyc, setKyc]             = useState<any>(null);
  const [property, setProperty]   = useState<any>(null); // first active property
  
  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [now, setNow] = useState<Date | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState('');

  // Greeting — explicit IST so Vercel UTC never interferes
  useEffect(() => {
    const update = () => {
      const h = parseInt(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          hour12: false,
        }).format(new Date()),
        10
      );
      if (h >= 5  && h < 12) setGreeting('Good morning');
      else if (h >= 12 && h < 17) setGreeting('Good afternoon');
      else if (h >= 17 && h < 21) setGreeting('Good evening');
      else setGreeting('Good night');
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // Live clock for countdown — ticks every second
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (!storedUser || !storedToken) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    setToken(storedToken);

    loadAllData(storedToken);
  }, [router]);

  const loadAllData = async (jwtToken: string) => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchBookings(jwtToken),
        fetchTickets(jwtToken),
        fetchKyc(jwtToken),
        fetchProperty(),
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProperty = async () => {
    try {
      const res  = await fetch('/api/properties');
      const data = await res.json();
      if (data.success && data.properties.length > 0) setProperty(data.properties[0]);
    } catch { /* silent */ }
  };

  const fetchBookings = async (jwtToken: string) => {
    try {
      const response = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await response.json();
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchTickets = async (jwtToken: string) => {
    try {
      const response = await fetch('/api/support', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await response.json();
      if (data.success) setTickets(data.tickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    }
  };

  const fetchKyc = async (jwtToken: string) => {
    try {
      const response = await fetch('/api/kyc', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await response.json();
      if (data.success) setKyc(data.kyc);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    logout(); // clears localStorage + shared auth context
    router.push('/');
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError('');
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketError('Please fill out all fields');
      return;
    }

    setTicketSubmitting(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setTicketSubject('');
        setTicketMessage('');
        setSupportModalOpen(false);
        fetchTickets(token);
      } else {
        setTicketError(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      setTicketError('Server connection error. Please try again.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-[#1C1917] font-poppins selection:bg-amber-100 selection:text-amber-950 antialiased flex flex-col md:flex-row">
      
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

        {/* User Card */}
        <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-stone-400 font-semibold tracking-wider uppercase">Traveler</p>
            <p className="text-sm font-bold text-stone-900 truncate leading-tight mt-0.5">{user.name}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1">
          {[
            { id: 'home', label: 'Home Feed', icon: Home },
            { id: 'bookings', label: 'My Bookings', icon: Calendar },
            { id: 'kyc', label: 'Identity (KYC)', icon: Fingerprint },
            { id: 'support', label: 'Support Center', icon: Headphones },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active 
                    ? 'bg-amber-800 text-white shadow-md' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </div>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-150"
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE STICKY HEADER ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/50 px-5 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/20">
            <Image src="/logo.png" alt="Sweet Nest Logo" fill className="object-cover" />
          </div>
          <span className="font-playfair text-base font-bold text-stone-900">Sweet Nest</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => loadAllData(token)}
            disabled={refreshing}
            className="p-2 text-stone-500 hover:text-stone-900 active:scale-90 transition-all rounded-full bg-stone-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-red-600 hover:text-red-700 active:scale-90 transition-all rounded-full bg-red-50"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT VIEWPORT ─── */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-4xl mx-auto w-full min-h-screen">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader className="w-8 h-8 text-amber-800 animate-spin" />
            <p className="text-stone-400 text-xs font-semibold">Configuring your personal suite...</p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            
            {/* ───── TAB 1: HOME FEED ───── */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                
                {/* Mobile Welcome Greeting */}
                <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles size={11} />
                      <span>Sweet Nest Premium Club</span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-playfair text-2xl md:text-3xl font-bold">{greeting || 'Hello'}, {user.name.split(' ')[0]}!</h2>
                      <p className="text-stone-300 text-xs leading-relaxed max-w-md">
                        Your private luxury apartment stay portal. Review bookings, coordinate security verification, or connect with our VIP helpdesk.
                      </p>
                    </div>
                    
                    <Link 
                      href="/booking" 
                      className="inline-flex items-center gap-2 bg-white text-stone-950 hover:bg-amber-50 font-bold text-xs px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all w-fit"
                    >
                      <PlusCircle size={14} className="text-amber-800" />
                      <span>Reserve Stay Room</span>
                    </Link>
                  </div>
                </div>

                {/* Dashboard Widget Cards */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Stays Summary Widget */}
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className="bg-white border border-stone-200/60 p-4 rounded-2xl shadow-sm text-left active:scale-98 transition-all hover:border-amber-700/20 flex flex-col justify-between h-32 group"
                  >
                    <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl w-fit">
                      <Compass size={18} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-stone-900 tabular-nums">{bookings.length}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Total Stays</p>
                    </div>
                  </button>

                  {/* KYC Verification status Widget */}
                  <button 
                    onClick={() => setActiveTab('kyc')}
                    className="bg-white border border-stone-200/60 p-4 rounded-2xl shadow-sm text-left active:scale-98 transition-all hover:border-amber-700/20 flex flex-col justify-between h-32"
                  >
                    <div className="p-2.5 bg-stone-50 text-stone-700 rounded-xl w-fit">
                      <ShieldCheck size={18} className="text-amber-800" />
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        kyc?.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' :
                        kyc?.verificationStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' :
                        kyc?.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {kyc?.verificationStatus || 'PENDING'}
                      </span>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1.5">KYC Identity</p>
                    </div>
                  </button>

                </div>

                {/* ── Upcoming Retreat Card ── */}
                {(() => {
                  const nextBooking = bookings
                    .filter(b => b.status === 'CONFIRMED')
                    .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())[0];

                  if (!nextBooking) {
                    return (
                      <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-6 text-center space-y-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                          <Calendar size={18} className="text-amber-700" />
                        </div>
                        <p className="text-xs text-stone-500 font-medium">No confirmed stay scheduled yet.</p>
                        <Link href="/booking" className="btn-secondary py-2 px-4 rounded-full text-xs font-bold w-fit mx-auto">
                          Reserve a Stay
                        </Link>
                      </div>
                    );
                  }

                  const checkIn  = new Date(nextBooking.checkInDate);
                  const checkOut = new Date(nextBooking.checkOutDate);
                  const msLeft   = now ? checkIn.getTime() - now.getTime() : null;
                  const msInStay = now ? checkOut.getTime() - now.getTime() : null;
                  const isActive = msLeft !== null && msLeft <= 0 && msInStay !== null && msInStay > 0;
                  const isPast   = msInStay !== null && msInStay <= 0;
                  const nights   = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);

                  const fmtCountdown = () => {
                    if (!now || msLeft === null || isPast || isActive) return null;
                    const s = Math.floor(msLeft / 1000);
                    const d = Math.floor(s / 86400);
                    const h = Math.floor((s % 86400) / 3600);
                    const m = Math.floor((s % 3600) / 60);
                    const sec = s % 60;
                    if (d > 0) return `${d}d ${h}h ${m}m`;
                    if (h > 0) return `${h}h ${m}m ${sec}s`;
                    return `${m}m ${sec}s`;
                  };
                  const countdown = fmtCountdown();

                  // Property helpers
                  const coverMedia  = property?.media?.find((m: any) => m.isCover && m.type === 'PHOTO')
                                   ?? property?.media?.find((m: any) => m.type === 'PHOTO');
                  const amenities   = (() => { try { return JSON.parse(property?.amenities || '[]'); } catch { return []; } })();
                  const mapsUrl = property?.googleMapsUrl;

                  // Build an embed src from provided embed URL OR construct one from address
                  const embedSrc = (() => {
                    if (mapsUrl && (mapsUrl.includes('/embed') || mapsUrl.includes('embed?') || mapsUrl.includes('output=embed'))) {
                      return mapsUrl;
                    }
                    if (property?.address) {
                      return `https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed&z=15`;
                    }
                    return null;
                  })();

                  // City label: first part before comma, or full address
                  const cityLabel = (() => {
                    const addr = property?.address || '';
                    if (!addr) return property?.name || 'India';
                    const parts = addr.split(',').map((p: string) => p.trim());
                    return parts.length >= 2 ? parts.slice(-3).join(', ') : addr;
                  })();

                  return (
                    <>
                    <div className="bg-white border border-stone-200/60 rounded-2xl shadow-sm overflow-hidden">

                      {/* ── Cover Photo ── */}
                      {coverMedia && (
                        <div className="relative h-36 bg-stone-100">
                          <Image src={coverMedia.url} alt={property?.name || 'Property'} fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end justify-between">
                            <div>
                              <p className="text-white font-bold text-sm leading-tight font-playfair">
                                {property?.name || 'Sweet Nest Premium Suite'}
                              </p>
                              {property?.address && (
                                <p className="text-stone-300 text-[10px] flex items-center gap-1 mt-0.5">
                                  <MapPin size={9} />{property.address}
                                </p>
                              )}
                            </div>
                            {isActive ? (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white animate-pulse">LIVE</span>
                            ) : isPast ? (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-500 text-white">PAST</span>
                            ) : (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">CONFIRMED</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-4 space-y-3">
                        {/* Header row (no cover photo fallback) */}
                        {!coverMedia && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-amber-700" />
                              <span className="text-xs font-bold text-stone-900">Upcoming Retreat</span>
                            </div>
                            {isActive ? (
                              <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 animate-pulse">IN PROGRESS</span>
                            ) : isPast ? (
                              <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">COMPLETED</span>
                            ) : (
                              <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">CONFIRMED</span>
                            )}
                          </div>
                        )}

                        {/* Date row */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-stone-50 rounded-xl p-2.5">
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Check-in</p>
                            <p className="text-xs font-bold text-stone-900 mt-0.5">
                              {checkIn.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </p>
                            <p className="text-[9px] text-stone-500">{property?.checkInTime || '12:00 PM'}</p>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-2.5">
                            <p className="text-[9px] text-amber-700 font-bold uppercase tracking-wider">Duration</p>
                            <p className="text-base font-black text-amber-800 leading-tight">{nights}</p>
                            <p className="text-[9px] text-amber-600">night{nights !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="bg-stone-50 rounded-xl p-2.5">
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Check-out</p>
                            <p className="text-xs font-bold text-stone-900 mt-0.5">
                              {checkOut.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </p>
                            <p className="text-[9px] text-stone-500">{property?.checkOutTime || '11:00 AM'}</p>
                          </div>
                        </div>

                        {/* Countdown / status banner */}
                        {!isActive && !isPast && countdown && (
                          <div className="bg-gradient-to-r from-amber-700 to-amber-600 rounded-xl px-4 py-3 text-center shadow-md">
                            <p className="text-[9px] text-amber-200 font-bold uppercase tracking-widest mb-0.5">Check-in countdown</p>
                            <p className="text-2xl font-black text-white tabular-nums font-mono tracking-tight leading-none">{countdown}</p>
                          </div>
                        )}
                        {isActive && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-center">
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Stay in progress</p>
                            <p className="text-xs text-blue-700 font-semibold mt-0.5">
                              Check-out {checkOut.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} at {property?.checkOutTime || '11:00 AM'}
                            </p>
                          </div>
                        )}
                        {isPast && (
                          <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-center">
                            <p className="text-xs text-stone-500 font-medium">Stay completed — hope you had a wonderful time! 🏡</p>
                          </div>
                        )}

                        {/* Amenities row */}
                        {amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {amenities.slice(0, 5).map((a: string) => (
                              <span key={a} className="text-[9px] font-semibold bg-stone-50 border border-stone-100 text-stone-600 px-2 py-1 rounded-full">
                                {a}
                              </span>
                            ))}
                            {amenities.length > 5 && (
                              <span className="text-[9px] font-semibold bg-stone-50 border border-stone-100 text-stone-400 px-2 py-1 rounded-full">
                                +{amenities.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* View booking link */}
                        <Link
                          href={`/booking/confirmation?bookingId=${nextBooking.id}`}
                          className="flex items-center justify-between px-3 py-2 bg-stone-50 hover:bg-amber-50 rounded-xl transition-colors group"
                        >
                          <span className="text-xs font-semibold text-stone-700 group-hover:text-amber-800">View Booking Details</span>
                          <div className="flex items-center gap-1 text-stone-400 group-hover:text-amber-700">
                            <span className="text-[10px] font-mono">#{nextBooking.id.slice(0, 8).toUpperCase()}</span>
                            <ArrowUpRight size={13} />
                          </div>
                        </Link>
                      </div>

                    </div>

                      {/* ── "Where you'll be" map card ── */}
                      {(embedSrc || property?.address) && (
                        <div className="bg-white border border-stone-200/60 rounded-2xl shadow-sm overflow-hidden mt-3">

                          {/* Heading */}
                          <div className="px-4 pt-4 pb-2">
                            <h3 className="font-playfair text-base font-bold text-stone-900">Where you'll be</h3>
                            {cityLabel && (
                              <p className="text-xs text-stone-500 mt-0.5">{cityLabel}</p>
                            )}
                          </div>

                          {/* Interactive Map */}
                          {embedSrc ? (
                            <div className="relative mx-3 rounded-xl overflow-hidden border border-stone-100" style={{ height: 220 }}>
                              <iframe
                                src={embedSrc}
                                width="100%"
                                height="220"
                                style={{ border: 0, display: 'block' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Property location map"
                              />
                            </div>
                          ) : (
                            /* Fallback: styled placeholder if no embed and no address */
                            <div className="mx-3 rounded-xl overflow-hidden bg-stone-100 h-40 flex items-center justify-center">
                              <MapPin size={28} className="text-stone-400" />
                            </div>
                          )}

                          {/* Footer */}
                          <div className="px-4 pt-3 pb-4 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 bg-stone-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle2 size={12} className="text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-stone-900 leading-snug">This listing's location is verified.</p>
                                {property?.address && (
                                  <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">{property.address}</p>
                                )}
                              </div>
                            </div>
                            {(mapsUrl || property?.address) && (
                              <a
                                href={mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(property?.address || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 transition-colors whitespace-nowrap flex-shrink-0 mt-0.5"
                              >
                                Get directions <ExternalLink size={9} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Brand Showcase */}
                <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-inner flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-playfair text-sm font-bold text-amber-300">24/7 Digital Check-In</h4>
                    <p className="text-[10px] text-stone-300">No physical keys required. Digital code shared post KYC verification approval.</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-amber-300 flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                </div>

              </div>
            )}

            {/* ───── TAB 2: MY BOOKINGS ───── */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-playfair text-lg font-bold text-stone-900">Your Bookings Log</h3>
                  <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-full">{bookings.length} total</span>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white border border-stone-200/50 rounded-3xl p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-amber-800">
                      <Compass size={22} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-stone-900">No Reservations Found</p>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto">Bookings you complete using Cashfree Gateway will appear in this screen logs.</p>
                    </div>
                    <Link href="/booking" className="btn-primary py-2 px-6 rounded-full text-xs font-bold inline-block">
                      Reserve First Suite
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm hover:border-amber-700/20 transition-all space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-amber-800 font-mono">#SN-{booking.id.slice(0, 8).toUpperCase()}</span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-stone-900">
                              <span>₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
                              <span className="text-stone-300">•</span>
                              <span className="text-stone-400 font-normal">{booking.numberOfGuests} Guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 border ${
                            booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-250/40' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              booking.status === 'CONFIRMED' ? 'bg-emerald-500' : booking.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            {booking.status}
                          </span>
                        </div>

                        {/* Dates View */}
                        <div className="grid grid-cols-2 gap-4 bg-stone-50 rounded-xl p-3 text-xs">
                          <div>
                            <p className="text-[9px] text-stone-400 font-bold uppercase">Check-In Date</p>
                            <p className="font-bold text-stone-850 mt-0.5">
                              {new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-400 font-bold uppercase">Check-Out Date</p>
                            <p className="font-bold text-stone-850 mt-0.5">
                              {new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {/* Detail Link */}
                        <div className="flex justify-between items-center text-[10px] font-bold pt-1">
                          <span className="text-stone-400 font-medium">Payment status: <span className="text-stone-700 capitalize">{booking.paymentStatus.toLowerCase()}</span></span>
                          <Link 
                            href={`/booking/confirmation?bookingId=${booking.id}`}
                            className="text-amber-800 hover:text-amber-900 inline-flex items-center gap-0.5"
                          >
                            <span>Receipt details</span>
                            <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ───── TAB 3: KYC IDENTITY ───── */}
            {activeTab === 'kyc' && (
              <div className="space-y-5">
                <h3 className="font-playfair text-lg font-bold text-stone-900">Compliance &amp; KYC Verification</h3>
                
                {/* Status Board */}
                <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                      kyc?.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' :
                      kyc?.verificationStatus === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' :
                      kyc?.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {kyc?.verificationStatus === 'VERIFIED' ? <CheckCircle2 size={24} /> :
                       kyc?.verificationStatus === 'REJECTED' ? <XCircle size={24} /> :
                       <ShieldCheck size={24} />}
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Status Board</p>
                      <h4 className="font-bold text-stone-900">
                        {kyc?.verificationStatus === 'VERIFIED' ? 'Verified Account Profile' :
                         kyc?.verificationStatus === 'SUBMITTED' ? 'Reviewing Your Documents' :
                         kyc?.verificationStatus === 'REJECTED' ? 'Verification Rejected' :
                         'Verification Required'}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed">
                    Under standard compliance regulations, we require verified identity proofs (Aadhaar &amp; PAN) before check-in details and lock code can be released.
                  </p>

                  {kyc?.rejectionReason && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-xs flex items-start gap-2">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Rejection Feedback:</p>
                        <p className="mt-0.5">{kyc.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document checklist */}
                <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Documents Checked</h4>
                  <div className="divide-y divide-stone-100 text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-stone-400 font-medium">Aadhaar Proof</span>
                      <span className="font-semibold text-stone-800">{kyc?.aadharUrl ? '✅ Submitted' : '❌ Missing'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-stone-400 font-medium">PAN Card Proof</span>
                      <span className="font-semibold text-stone-800">{kyc?.panUrl ? '✅ Submitted' : '❌ Missing'}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-stone-400 font-medium">Passport (Optional)</span>
                      <span className="font-semibold text-stone-500">{kyc?.passportUrl ? '✅ Submitted' : '—'}</span>
                    </div>
                  </div>
                  
                  {(!kyc || kyc.verificationStatus === 'REJECTED' || kyc.verificationStatus === 'PENDING') && (
                    <Link 
                      href="/kyc" 
                      className="btn-primary w-full text-center py-3 rounded-full text-xs font-bold block mt-4"
                    >
                      Upload Documents Now
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* ───── TAB 4: SUPPORT CENTER ───── */}
            {activeTab === 'support' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-playfair text-lg font-bold text-stone-900">VIP Support Center</h3>
                  <button 
                    onClick={() => setSupportModalOpen(true)}
                    className="inline-flex items-center gap-1 bg-amber-800 text-white px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-all shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Open Ticket</span>
                  </button>
                </div>

                {/* Ticket Feed list */}
                {tickets.length === 0 ? (
                  <div className="bg-white border border-stone-200/60 rounded-3xl p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-amber-800">
                      <MessageSquare size={22} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-stone-900">No Support Tickets</p>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto">Open a ticket if you need custom assistance, amenities checks, or checkout changes.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm space-y-3 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">{ticket.subject}</h4>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">#{ticket.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            ticket.status === 'CLOSED' ? 'bg-stone-50 text-stone-500 border-stone-150' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>

                        <p className="text-stone-600 leading-relaxed">{ticket.message}</p>

                        {ticket.adminReply && (
                          <div className="bg-stone-50 border-l-2 border-amber-700/80 p-3 rounded-r-xl space-y-1">
                            <p className="text-[10px] font-bold text-amber-850">Concierge Desk Reply</p>
                            <p className="text-stone-700 italic">{ticket.adminReply}</p>
                            <p className="text-[9px] text-stone-400">
                              {new Date(ticket.repliedAt || ticket.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ─── BOTTOM APP-STYLE TAB BAR (MOBILE ONLY) ─── */}
      <nav className="fixed bottom-4 left-4 right-4 h-16 bg-stone-950/95 border border-stone-850 shadow-2xl rounded-2xl flex items-center justify-around px-2 z-40 backdrop-blur-md md:hidden">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'bookings', label: 'Stays', icon: Calendar },
          { id: 'kyc', label: 'Identity', icon: Fingerprint },
          { id: 'support', label: 'Support', icon: Headphones },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-[0.88] ${
                active ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all duration-200 ${
                active ? 'bg-amber-400/10 scale-105 text-amber-400' : 'text-stone-400'
              }`}>
                <Icon size={18} />
              </div>
              <span className={`text-[9px] font-bold tracking-wide transition-all mt-0.5 ${
                active ? 'opacity-100 font-extrabold text-amber-400' : 'opacity-75'
              }`}>{tab.label}</span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_#f59e0b]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ─── SLIDE-UP SUPPORT DRAWER/MODAL ─── */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div 
            className="fixed inset-0" 
            onClick={() => setSupportModalOpen(false)} 
          />
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative z-10 animate-slide-up flex flex-col max-h-[85vh] md:max-h-none">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-playfair text-lg font-bold text-stone-900">New Support Ticket</h3>
                <p className="text-stone-400 text-[10px] mt-0.5">Concierge desk will reply within 15 minutes</p>
              </div>
              <button 
                onClick={() => setSupportModalOpen(false)}
                className="p-1.5 bg-stone-100 hover:bg-stone-250/20 text-stone-600 rounded-full active:scale-90 transition-all"
              >
                <XCircle size={18} />
              </button>
            </div>

            {ticketError && (
              <div className="bg-red-50 border border-red-200/40 rounded-xl p-3 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{ticketError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase">Subject</label>
                <input 
                  type="text" 
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. WiFi issue, lock code request" 
                  className="input-field" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase">Message</label>
                <textarea 
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Explain your issue in detail..." 
                  className="input-field resize-none" 
                  required
                />
              </div>

              <button
                type="submit"
                disabled={ticketSubmitting}
                className="btn-primary w-full py-3 rounded-xl bg-stone-950 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {ticketSubmitting ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit to Concierge</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
