'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="bg-stone-950 text-stone-400">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/15">
                <Image src="/logo.png" alt="Sweet Nest" fill sizes="32px" className="object-cover" />
              </div>
              <span className="font-playfair text-lg font-semibold text-white">Sweet Nest</span>
            </div>
            <p className="text-[13px] leading-relaxed text-stone-500 max-w-xs">
              Premium serviced apartments in Mumbai — designed for travellers who expect more
              than a hotel room.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em]">Explore</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
              <li><Link href="/suites" className="hover:text-amber-400 transition-colors">Suites</Link></li>
              <li><Link href="/amenities" className="hover:text-amber-400 transition-colors">Amenities</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Guest */}
          <div className="space-y-3">
            <h4 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em]">Guest</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/faqs" className="hover:text-amber-400 transition-colors">FAQs</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/login" className="hover:text-amber-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em]">Contact</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-amber-500/80 shrink-0" /> Mumbai, India</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-amber-500/80 shrink-0" /> support@sweetne.st</li>
              <li className="flex items-center gap-2"><Clock size={14} className="text-amber-500/80 shrink-0" /> Replies within 15 min</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-stone-600">
          <p>© 2026 Sweet Nest. All rights reserved.</p>
          <p>Secure payments by Cashfree · SSL encrypted</p>
        </div>
      </div>
    </footer>
  );
}
