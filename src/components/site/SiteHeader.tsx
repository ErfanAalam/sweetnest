'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/suites', label: 'Suites' },
  { href: '/amenities', label: 'Amenities' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faqs', label: 'FAQs' },
];

export default function SiteHeader({ overDark = false }: { overDark?: boolean }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAuthed = !isLoading && !!user;
  const homeHref = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  // Light text while transparent over a dark hero; reverts once scrolled.
  const light = overDark && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FDFBF7]/85 backdrop-blur-xl border-b border-stone-200/70'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-stone-900/10">
            <Image src="/logo.png" alt="Sweet Nest" fill sizes="36px" className="object-cover" priority />
          </div>
          <span className={`font-playfair text-lg font-semibold tracking-tight transition-colors ${light ? 'text-white' : 'text-stone-900'}`}>
            Sweet&nbsp;Nest
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative text-[13px] font-medium tracking-wide transition-colors ${
                  active
                    ? light ? 'text-amber-300' : 'text-amber-800'
                    : light ? 'text-white/80 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px transition-all duration-300 ${light ? 'bg-amber-300' : 'bg-amber-800'} ${
                    active ? 'w-full' : 'w-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthed ? (
            <Link
              href={homeHref}
              className={`inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-4 py-2 transition-colors ${
                light ? 'text-white border border-white/40 hover:border-white' : 'text-stone-900 border border-stone-300 hover:border-stone-900'
              }`}
            >
              My Dashboard <ArrowUpRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" className={`text-[13px] font-medium transition-colors ${light ? 'text-white/80 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`}>
                Login
              </Link>
              <Link
                href="/suites"
                className={`text-[13px] font-semibold rounded-full px-5 py-2 transition-colors ${
                  light ? 'text-stone-900 bg-white hover:bg-amber-50' : 'text-white bg-stone-900 hover:bg-amber-800'
                }`}
              >
                Book a Stay
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 -mr-2 transition-colors ${light ? 'text-white' : 'text-stone-800'}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#FDFBF7] border-t border-stone-200 animate-slide-down">
          <nav className="px-5 py-4 flex flex-col">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-3 text-[15px] font-medium text-stone-700 border-b border-stone-100"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-5">
              {isAuthed ? (
                <Link href={homeHref} className="flex-1 text-center text-sm font-semibold text-white bg-stone-900 rounded-full py-3">
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1 text-center text-sm font-semibold text-stone-800 border border-stone-300 rounded-full py-3">
                    Login
                  </Link>
                  <Link href="/suites" className="flex-1 text-center text-sm font-semibold text-white bg-stone-900 rounded-full py-3">
                    Book a Stay
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
