'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check } from 'lucide-react';
import {
  requestNotificationPermission,
  subscribeToPush,
  scheduleCheckInReminder,
  rehydrateScheduledNotifs,
} from '@/lib/pwa';

interface Props {
  booking: { id: string; checkInDate: string };
  onDismiss?: () => void;
}

export default function NotificationPermissionBanner({ booking, onDismiss }: Props) {
  const [status, setStatus]   = useState<'idle' | 'asking' | 'granted' | 'denied'>('idle');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    // Check-in must be more than 1 hour away to be worth scheduling
    const msLeft = new Date(booking.checkInDate).getTime() - Date.now() - 60 * 60 * 1000;
    if (msLeft <= 0) return;

    if (Notification.permission === 'granted') {
      // Already have permission — silently set up everything
      const token = localStorage.getItem('token') || '';
      subscribeToPush(token);
      scheduleCheckInReminder(booking);
      rehydrateScheduledNotifs();
      return;
    }

    if (Notification.permission === 'denied') return;

    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [booking]);

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const handleAllow = async () => {
    setStatus('asking');
    const perm = await requestNotificationPermission();

    if (perm === 'granted') {
      const token = localStorage.getItem('token') || '';
      // 1. Subscribe via VAPID (server-side push — works even when app is closed)
      await subscribeToPush(token);
      // 2. Schedule local fallback (works when app is open)
      scheduleCheckInReminder(booking);
      rehydrateScheduledNotifs();
      setStatus('granted');
      setTimeout(dismiss, 2800);
    } else {
      setStatus('denied');
      setTimeout(dismiss, 2500);
    }
  };

  if (!visible) return null;

  const checkInLabel = new Date(booking.checkInDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md animate-slide-up">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl p-5">

        {status === 'granted' ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={17} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Reminder set!</p>
              <p className="text-xs text-stone-500 mt-0.5">
                You'll be notified 1 hour before check-in on {checkInLabel} — even if the app is closed.
              </p>
            </div>
          </div>
        ) : status === 'denied' ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BellOff size={15} className="text-stone-500" />
            </div>
            <p className="text-sm text-stone-500">
              Notifications blocked. Enable them in your browser settings to receive check-in reminders.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell size={18} className="text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">Get a check-in reminder?</p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  We'll send you a push notification{' '}
                  <strong className="text-stone-700">1 hour before your check-in</strong> on{' '}
                  <span className="text-amber-700 font-semibold">{checkInLabel}</span>.{' '}
                  Works even when the app is closed.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button onClick={dismiss} className="btn-ghost flex-1 text-xs py-2 border border-stone-200">
                Not now
              </button>
              <button
                onClick={handleAllow}
                disabled={status === 'asking'}
                className="btn-primary flex-1 text-xs py-2 disabled:opacity-50"
              >
                {status === 'asking' ? 'Setting up…' : '🔔 Allow Notifications'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
