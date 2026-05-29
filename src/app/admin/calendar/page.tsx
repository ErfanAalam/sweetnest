'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle } from 'lucide-react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function AdminCalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchCalendar(); }, []);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.success) {
        setBlockedDates(data.blockedDates || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const isBlocked = (dateStr: string) => blockedDates.includes(dateStr);
  const isPast = (dateStr: string) => new Date(dateStr) < new Date(today.toISOString().split('T')[0]);

  const handleDateClick = (dateStr: string) => {
    if (isPast(dateStr)) return;
    setSelectedDate(dateStr);
    if (!isBlocked(dateStr)) {
      setShowModal(true);
    } else {
      toggleDate(dateStr, true);
    }
  };

  const toggleDate = async (dateStr: string, makeAvailable: boolean) => {
    setProcessing(dateStr);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: dateStr,
          available: makeAvailable,
          reason: makeAvailable ? null : blockReason || 'Blocked by admin',
        }),
      });
      if (res.ok) {
        if (makeAvailable) {
          setBlockedDates(prev => prev.filter(d => d !== dateStr));
          setMessage(`${dateStr} is now available`);
        } else {
          setBlockedDates(prev => [...prev, dateStr]);
          setMessage(`${dateStr} has been blocked`);
        }
        setShowModal(false);
        setBlockReason('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch { /* silent */ }
    finally { setProcessing(null); }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div>
      <h1 className="heading-1 mb-1.5">Calendar Management</h1>
      <p className="text-stone-400 text-sm mb-5">Click a date to block or unblock it</p>

      {message && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm mb-4">
          <CheckCircle size={14} /> {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="md:col-span-2 card-premium">
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-stone-100 text-amber-700 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-playfair text-lg font-bold text-stone-900">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-stone-100 text-amber-700 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-stone-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const past = isPast(dateStr);
              const blocked = isBlocked(dateStr);
              const isProcessing = processing === dateStr;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(dateStr)}
                  disabled={past || isProcessing}
                  className={[
                    'h-9 w-full text-xs rounded-lg transition-all relative font-medium',
                    past ? 'text-stone-200 cursor-not-allowed' : 'cursor-pointer',
                    blocked && !past ? 'bg-red-50 text-red-600 border border-red-100' : '',
                    !blocked && !past ? 'hover:bg-stone-100 text-stone-700' : '',
                    isProcessing ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  {isProcessing ? (
                    <span className="w-3 h-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto block" />
                  ) : day}
                  {blocked && !past && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-5 mt-4 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-50 border border-red-100 inline-block" /> Blocked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-stone-100 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-stone-50 border border-stone-100 inline-block opacity-50" /> Past
            </span>
          </div>
        </div>

        {/* Stats panel */}
        <div className="space-y-4">
          <div className="card-premium">
            <h3 className="font-playfair font-bold text-amber-700 mb-3 text-sm">This Month</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-400 text-xs">Total Days</span>
                <span className="text-stone-900 font-medium text-xs">{daysInMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 text-xs">Blocked Days</span>
                <span className="text-red-600 font-medium text-xs">
                  {blockedDates.filter(d => {
                    const [y, m] = d.split('-').map(Number);
                    return y === currentYear && m === currentMonth + 1;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 text-xs">Available Days</span>
                <span className="text-green-600 font-medium text-xs">
                  {daysInMonth - blockedDates.filter(d => {
                    const [y, m] = d.split('-').map(Number);
                    return y === currentYear && m === currentMonth + 1;
                  }).length}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-stone-900 mb-2 text-xs">How to Use</h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-start gap-2"><Lock size={11} className="text-red-400 mt-0.5 flex-shrink-0" /> Click an available date to block it</li>
              <li className="flex items-start gap-2"><Unlock size={11} className="text-green-600 mt-0.5 flex-shrink-0" /> Click a blocked date to unblock it instantly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="card-premium max-w-sm w-full">
            <h3 className="heading-2 text-base mb-1">Block Date</h3>
            <p className="text-stone-500 text-sm mb-4">
              Block <span className="text-stone-900 font-semibold">{selectedDate}</span>?
            </p>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              className="input-field mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setBlockReason(''); }} className="btn-secondary flex-1 text-xs">
                Cancel
              </button>
              <button
                onClick={() => toggleDate(selectedDate, false)}
                className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-semibold py-2.5 rounded-lg text-xs transition-colors"
              >
                Block Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
