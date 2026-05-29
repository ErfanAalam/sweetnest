'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Props { reservedUntil: string }

export default function ReservationTimer({ reservedUntil }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const target = new Date(reservedUntil).getTime();
    const tick = () => {
      const diff = Math.floor((target - Date.now()) / 1000);
      if (diff <= 0) { setExpired(true); setSecondsLeft(0); }
      else setSecondsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [reservedUntil]);

  const mins      = Math.floor(secondsLeft / 60);
  const secs      = secondsLeft % 60;
  const pct       = Math.min(100, Math.round((secondsLeft / 600) * 100));
  const isUrgent  = secondsLeft < 120 && !expired;

  if (expired) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
        <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-700 text-sm">Reservation expired</p>
          <p className="text-red-600 text-xs mt-0.5">
            Your 10-minute hold has expired.{' '}
            <Link href="/booking" className="underline font-semibold">Select dates again →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl mb-5 border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock size={14} className={`flex-shrink-0 ${isUrgent ? 'text-red-600 animate-pulse' : 'text-amber-700'}`} />
          <span className={`text-xs font-semibold ${isUrgent ? 'text-red-700' : 'text-amber-800'}`}>
            {isUrgent ? 'Expiring soon — act now!' : 'Dates temporarily reserved'}
          </span>
        </div>
        <span className={`text-base font-bold tabular-nums font-mono ${isUrgent ? 'text-red-700' : 'text-amber-800'}`}>
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="h-1 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-amber-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-[10px] mt-1.5 ${isUrgent ? 'text-red-600' : 'text-amber-700'}`}>
        {isUrgent ? 'Complete payment immediately or dates will be released' : 'Complete payment within 10 minutes to confirm'}
      </p>
    </div>
  );
}
