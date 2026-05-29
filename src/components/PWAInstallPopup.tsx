'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Share, ChevronRight, Smartphone, Bell, Zap, WifiOff } from 'lucide-react';
import { usePWA } from '@/components/PWAProvider';

interface Props {
  /** Delay (ms) before the popup appears. Defaults to 2500. */
  delay?: number;
}

const FEATURES = [
  { icon: Zap,      label: 'Instant launch',       desc: 'Opens in < 1 second' },
  { icon: Bell,     label: 'Push notifications',   desc: 'Check-in reminders' },
  { icon: WifiOff,  label: 'Works offline',        desc: 'View bookings anytime' },
  { icon: Smartphone, label: 'Home screen icon',   desc: 'Like a native app' },
];

export default function PWAInstallPopup({ delay = 2500 }: Props) {
  const { canInstall, isIOS, isInstalled, installPrompt } = usePWA();
  const [visible, setVisible]       = useState(false);
  const [dismissed, setDismissed]   = useState(false);
  const [installing, setInstalling] = useState(false);
  const [done, setDone]             = useState(false);

  useEffect(() => {
    // Never show if already installed or nothing to offer
    if (isInstalled) return;
    if (!canInstall && !isIOS) return;
    if (dismissed) return;

    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [isInstalled, canInstall, isIOS, delay, dismissed]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 400);
  };

  const handleInstall = async () => {
    setInstalling(true);
    await installPrompt();
    setInstalling(false);
    setDone(true);
    setTimeout(dismiss, 2000);
  };

  if (!visible || dismissed) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={dismiss}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] transition-transform duration-500 ease-out
          ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto overflow-hidden">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-stone-200 rounded-full" />
          </div>

          {/* Dismiss button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={14} className="text-stone-600" />
          </button>

          <div className="px-6 pb-8 pt-2 space-y-6">

            {done ? (
              /* ── Success state ── */
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">🎉</span>
                </div>
                <p className="font-playfair text-xl font-bold text-stone-900">App Installed!</p>
                <p className="text-sm text-stone-500">Sweet Nest is now on your home screen.</p>
              </div>
            ) : (
              <>
                {/* ── Header ── */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-100 shadow-md flex-shrink-0">
                    <Image src="/logo.png" alt="Sweet Nest" width={64} height={64} className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-playfair text-lg font-bold text-stone-900">Sweet Nest</p>
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Free</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">Premium Apartment Booking</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-amber-500 text-xs">★</span>
                      ))}
                      <span className="text-[10px] text-stone-400 ml-1">4.9</span>
                    </div>
                  </div>
                </div>

                {/* ── Feature grid ── */}
                <div className="grid grid-cols-2 gap-3">
                  {FEATURES.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-2.5 bg-stone-50 rounded-xl p-3">
                      <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-amber-700" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-stone-900 leading-tight">{label}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Android/Chrome CTA ── */}
                {canInstall && (
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="w-full bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg disabled:opacity-60"
                  >
                    <Download size={18} />
                    {installing ? 'Installing…' : 'Add to Home Screen'}
                  </button>
                )}

                {/* ── iOS instructions ── */}
                {isIOS && !canInstall && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-stone-700 text-center">Install on iPhone / iPad</p>
                    <div className="space-y-2.5">
                      {[
                        { n: 1, icon: <Share size={14} />, text: <>Tap the <strong>Share</strong> button <span className="inline-flex items-center justify-center w-5 h-5 bg-stone-200 rounded text-stone-700 text-[10px] font-mono">⬆</span> at the bottom of Safari</> },
                        { n: 2, icon: <ChevronRight size={14} />, text: <>Scroll down and tap <strong>"Add to Home Screen"</strong></> },
                        { n: 3, icon: <Smartphone size={14} />, text: <>Tap <strong>"Add"</strong> — the icon appears on your home screen</> },
                      ].map(({ n, icon, text }) => (
                        <div key={n} className="flex items-start gap-3 bg-stone-50 rounded-xl p-3">
                          <div className="w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            {n}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-amber-700">{icon}</span>
                            <span className="text-xs text-stone-600 leading-relaxed">{text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Dismiss link ── */}
                <button
                  onClick={dismiss}
                  className="w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
                >
                  Maybe later
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
