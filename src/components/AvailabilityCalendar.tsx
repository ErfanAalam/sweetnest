'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['S','M','T','W','T','F','S'];

/**
 * Public, read-only availability calendar.
 * Fetches globally blocked dates from /api/calendar (no auth required) and
 * shows which nights are open. Used on public suite pages so visitors can
 * check availability before logging in.
 */
export default function AvailabilityCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch('/api/calendar')
      .then((r) => r.json())
      .then((d) => { if (alive && d.blockedDates) setBlocked(new Set<string>(d.blockedDates)); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const dk = (d: Date) => d.toISOString().split('T')[0];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const atFirstMonth = year === today.getFullYear() && month === today.getMonth();
  const prev = () => { if (atFirstMonth) return; month === 0 ? (setMonth(11), setYear((y) => y - 1)) : setMonth((m) => m - 1); };
  const next = () => { month === 11 ? (setMonth(0), setYear((y) => y + 1)) : setMonth((m) => m + 1); };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prev}
          disabled={atFirstMonth}
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-playfair text-base font-semibold text-stone-900">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={next} className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center text-stone-300">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 mb-2">
            {DOW.map((d, i) => (
              <div key={i} className="text-center text-[11px] font-semibold text-stone-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const past = date < today;
              const isBlocked = blocked.has(dk(date));
              const unavailable = past || isBlocked;

              return (
                <div
                  key={day}
                  className={[
                    'aspect-square flex items-center justify-center text-[13px] rounded-lg font-medium',
                    past ? 'text-stone-200' : '',
                    !past && isBlocked ? 'text-stone-300 line-through bg-stone-50' : '',
                    !unavailable ? 'text-stone-700 bg-emerald-50/60 ring-1 ring-inset ring-emerald-100' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-5 mt-5 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-50 ring-1 ring-inset ring-emerald-200 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-stone-100 inline-block" /> Booked / blocked
            </span>
          </div>
        </>
      )}
    </div>
  );
}
