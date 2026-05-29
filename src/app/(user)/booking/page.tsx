'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Users, Info, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Image from 'next/image';

const PRICE_PER_NIGHT = 5000;
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function BookingPage() {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [checkIn, setCheckIn]   = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests]   = useState(1);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetch('/api/calendar')
      .then(r => r.json())
      .then(d => { if (d.blockedDates) setBlockedDates(d.blockedDates); })
      .catch(() => {});
  }, [router]);

  const dk      = (d: Date) => d.toISOString().split('T')[0];
  const isPast  = (d: Date) => d < today;
  const isBlk   = (d: Date) => blockedDates.includes(dk(d));
  const isSel   = (d: Date) => (checkIn?.getTime() === d.getTime()) || (checkOut?.getTime() === d.getTime());
  const inRange = (d: Date) => !!(checkIn && checkOut && d > checkIn && d < checkOut);

  const handleDate = (date: Date) => {
    if (isPast(date) || isBlk(date)) return;
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(null); }
    else if (date > checkIn) setCheckOut(date);
    else { setCheckIn(date); setCheckOut(null); }
  };

  const nights     = checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000) : 0;
  const totalPrice = nights * PRICE_PER_NIGHT;

  const handleProceed = async () => {
    if (!checkIn || !checkOut || nights < 1) { setError('Please select check-in and check-out dates'); return; }
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    try {
      const res  = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ checkInDate: checkIn.toISOString(), checkOutDate: checkOut.toISOString(), numberOfGuests: guests, totalPrice }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create booking'); setLoading(false); return; }
      localStorage.setItem('pendingBooking', JSON.stringify(data.booking));
      router.push('/booking/terms');
    } catch { setError('An error occurred. Please try again.'); setLoading(false); }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonth   = () => currentMonth === 0  ? (setCurrentMonth(11), setCurrentYear(y => y - 1)) : setCurrentMonth(m => m - 1);
  const nextMonth   = () => currentMonth === 11 ? (setCurrentMonth(0),  setCurrentYear(y => y + 1)) : setCurrentMonth(m => m + 1);

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Nav with step indicator */}
      <nav className="flow-nav">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <ChevronLeft size={15} className="text-amber-700" />
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm flex-shrink-0">
              <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" />
            </div>
            <span className="font-playfair text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">Sweet Nest</span>
          </Link>
          <ol className="hidden sm:flex items-center step-nav">
            {['Dates','Terms','Payment','KYC'].map((s, i) => (
              <li key={s} className="flex items-center">
                {i > 0 && <span className="step-nav-sep mx-1.5">›</span>}
                <span className={`step-nav-item ${i === 0 ? 'active' : 'upcoming'}`}>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="heading-1 mb-1">Select Your Dates</h1>
        <p className="text-stone-400 text-xs sm:text-sm mb-6">Tap to set check-in, tap again to set check-out</p>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ─── Calendar ─── */}
          <div className="lg:col-span-2 card-premium animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-stone-100 text-amber-700 active:scale-95 transition-all">
                <ChevronLeft size={18} />
              </button>
              <h2 className="font-playfair text-base sm:text-lg font-bold text-stone-900">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-stone-100 text-amber-700 active:scale-95 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1.5">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-stone-400 py-1.5">{d}</div>
              ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {[...Array(firstDay)].map((_,i) => <div key={`e${i}`} />)}
              {[...Array(daysInMonth)].map((_,i) => {
                const day  = i + 1;
                const date = new Date(currentYear, currentMonth, day);
                const past = isPast(date), blk = isBlk(date), sel = isSel(date), rng = inRange(date);

                return (
                  <button
                    key={day}
                    onClick={() => handleDate(date)}
                    disabled={past || blk}
                    className={[
                      'h-8 sm:h-9 w-full text-xs sm:text-sm rounded-lg font-medium transition-all relative',
                      sel  ? 'bg-amber-700 text-white font-bold shadow-sm scale-105 z-10' : '',
                      rng && !sel ? 'bg-amber-50 text-amber-800' : '',
                      !sel && !rng && !past && !blk ? 'hover:bg-stone-100 text-stone-700 hover:scale-105' : '',
                      past || blk ? 'text-stone-200 cursor-not-allowed' : '',
                      blk && !past ? 'line-through' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] sm:text-xs text-stone-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-700 inline-block" />Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block" />Your stay</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-stone-100 border border-stone-200 inline-block" />Unavailable</span>
            </div>
          </div>

          {/* ─── Summary panel ─── */}
          <div className="space-y-4 animate-slide-up">

            {/* Booking summary */}
            <div className="card-premium">
              <h3 className="font-playfair text-sm font-bold text-amber-700 mb-4">Booking Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400 text-xs">Check-in</span>
                  <span className="font-semibold text-stone-900 text-xs">
                    {checkIn ? checkIn.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : <span className="text-stone-300">—</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 text-xs">Check-out</span>
                  <span className="font-semibold text-stone-900 text-xs">
                    {checkOut ? checkOut.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : <span className="text-stone-300">—</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 text-xs">Duration</span>
                  <span className="font-semibold text-stone-900 text-xs">{nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '—'}</span>
                </div>
                <div className="border-t border-stone-100 pt-2.5 flex justify-between">
                  <span className="text-stone-400 text-xs">Rate</span>
                  <span className="text-stone-600 text-xs">₹5,000 / night</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="font-bold text-sm text-stone-900">Total</span>
                  <span className={`font-bold text-base ${totalPrice > 0 ? 'text-amber-700' : 'text-stone-300'}`}>
                    {totalPrice > 0 ? `₹${totalPrice.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="card-premium">
              <h3 className="font-playfair text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                <Users size={14} className="text-amber-700" /> Guests
              </h3>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setGuests(g => Math.max(1, g - 1))}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 font-bold text-lg leading-none transition-colors active:scale-95"
                >−</button>
                <span className="text-lg font-bold text-stone-900 tabular-nums">{guests}</span>
                <button
                  onClick={() => setGuests(g => Math.min(2, g + 1))}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 font-bold text-lg leading-none transition-colors active:scale-95"
                >+</button>
              </div>
              <p className="text-[10px] text-stone-400 mt-2 flex items-center gap-1">
                <Info size={10} /> Max 2 guests
              </p>
            </div>

            {/* Includes */}
            <div className="card">
              {['WiFi & Amenities','Daily Housekeeping','24/7 Support','Secure Parking'].map(item => (
                <div key={item} className="flex items-center gap-2 py-1 text-xs text-stone-500">
                  <CheckCircle size={11} className="text-amber-700 flex-shrink-0" />{item}
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
                <AlertCircle size={14} className="flex-shrink-0" />{error}
              </div>
            )}

            <button
              onClick={handleProceed}
              disabled={loading || !checkIn || !checkOut || nights < 1}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader size={14} className="animate-spin" /> Processing…</> : 'Continue to Terms →'}
            </button>

            {checkIn && checkOut && (
              <p className="text-[10px] text-center text-stone-400 flex items-center justify-center gap-1">
                <Info size={10} />Dates held for 10 min after confirmation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
