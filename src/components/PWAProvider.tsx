'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { registerSW, rehydrateScheduledNotifs } from '@/lib/pwa';

export interface PWACtx {
  canInstall:    boolean;   // Android/Chrome install prompt available
  isIOS:         boolean;   // iOS Safari (needs manual share-sheet install)
  isInstalled:   boolean;   // already running as standalone PWA
  installPrompt: () => Promise<void>;
}

const Ctx = createContext<PWACtx>({
  canInstall:    false,
  isIOS:         false,
  isInstalled:   false,
  installPrompt: async () => {},
});

export const usePWA = () => useContext(Ctx);

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS,          setIsIOS]          = useState(false);
  const [isInstalled,    setIsInstalled]    = useState(false);

  useEffect(() => {
    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Detect standalone (already installed as PWA)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    setIsInstalled(standalone);

    // Register service worker & rehydrate local notifications
    registerSW().then(reg => {
      if (reg && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        rehydrateScheduledNotifs();
      }
    });

    // Chrome/Edge/Android install prompt
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // Mark installed when user accepts
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, []);

  const installPrompt = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <Ctx.Provider value={{
      canInstall:  !!deferredPrompt,
      isIOS,
      isInstalled,
      installPrompt,
    }}>
      {children}
    </Ctx.Provider>
  );
}
