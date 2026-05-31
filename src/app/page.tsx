'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, ArrowUpRight, Star, MapPin, BedDouble, Bath, Users,
  ShieldCheck, Sparkles, Headphones, CheckCircle, Download, Share,
  ChevronRight, Smartphone,
} from 'lucide-react';
import { usePWA } from '@/components/PWAProvider';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Property, coverPhoto, effectiveRate } from '@/lib/property-types';

/* ── PWA install button — platform-aware ── */
function PWALandingButton() {
  const { canInstall, isIOS, isInstalled, installPrompt } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);

  if (isInstalled || done) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
        <CheckCircle size={16} /> <span>App installed</span>
      </div>
    );
  }

  if (canInstall) {
    return (
      <button
        onClick={async () => { setInstalling(true); await installPrompt(); setInstalling(false); setDone(true); }}
        disabled={installing}
        className="inline-flex items-center gap-2 bg-white text-stone-900 hover:bg-amber-50 font-semibold text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-60"
      >
        <Download size={16} className="text-amber-700" />
        {installing ? 'Installing…' : 'Install App'}
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className="space-y-2 text-left">
        {[
          <><Share size={12} className="inline" /> Tap <strong>Share</strong> in Safari</>,
          <><ChevronRight size={12} className="inline" /> Tap <strong>Add to Home Screen</strong></>,
          <><Smartphone size={12} className="inline" /> Tap <strong>Add</strong></>,
        ].map((step, i) => (
          <p key={i} className="text-xs text-stone-300 flex items-center gap-1.5">
            <span className="w-4 h-4 bg-amber-700 text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</span>
            <span>{step}</span>
          </p>
        ))}
      </div>
    );
  }

  return <p className="text-xs text-stone-500 max-w-[180px] leading-relaxed">Open in Chrome or Safari to install the app.</p>;
}

export default function LandingPage() {
  const [suites, setSuites] = useState<Property[]>([]);

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((d) => { if (d.success) setSuites(d.properties.slice(0, 3)); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 selection:bg-amber-100">
      <SiteHeader overDark />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-amber-300 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-6 h-px bg-amber-400" /> Rooms &amp; Farmhouses · Book your escape
            </div>
            <h1 className="font-playfair text-[2.8rem] sm:text-7xl font-semibold leading-[1.03] mt-5 text-white">
              Feel at home,<br />
              <span className="italic text-amber-300">anywhere</span> you stay.
            </h1>
            <p className="mt-6 text-stone-200 text-[15px] sm:text-lg leading-[1.8] max-w-xl">
              From boutique city suites to serene countryside farmhouses — discover handpicked stays
              with the polish of a hotel and the ease of home. Browse freely, book in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-9">
              <Link href="/suites" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 bg-white hover:bg-amber-50 rounded-full px-7 py-3.5 transition-colors shadow-lg">
                Explore stays <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-amber-300 px-3 py-3.5 transition-colors">
                Our story <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                <span className="text-white font-semibold ml-1">4.9</span>
              </div>
              <span className="h-4 w-px bg-white/30" />
              <span className="flex items-center gap-1.5 text-stone-200"><MapPin size={14} className="text-amber-300" /> Prime locations across India</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/70">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="w-px h-8 bg-gradient-to-b from-white/70 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── Featured suites ── */}
      <section className="px-5 sm:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <span className="w-6 h-px bg-amber-700" /> Stay with us
              </div>
              <h2 className="font-playfair text-3xl sm:text-5xl font-semibold mt-4">Featured stays</h2>
              <p className="text-stone-600 text-[15px] leading-relaxed mt-3">
                A handpicked selection of our most-loved rooms and farmhouses — each one verified, beautifully kept, and ready to book.
              </p>
            </div>
            <Link href="/suites" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 border border-stone-300 rounded-full px-5 py-2.5 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-colors shrink-0">
              View all stays <ArrowUpRight size={15} />
            </Link>
          </div>

          {suites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center">
              <p className="font-playfair text-2xl text-stone-800">New stays arriving soon</p>
              <p className="text-stone-500 text-sm mt-2">Our collection is being prepared — check back shortly.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suites.map((p) => {
                const cover = coverPhoto(p.media);
                const rate = effectiveRate(p.pricePerNight, p.discountPercent);
                return (
                  <Link key={p.id} href={`/suites/${p.id}`} className="group rounded-3xl overflow-hidden border border-stone-200 bg-white hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.28)] hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-60 bg-stone-100 overflow-hidden">
                      {cover ? (
                        <Image src={cover.url} alt={p.name} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-700" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-300"><BedDouble size={34} /></div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
                      <div className="absolute bottom-3 left-3 inline-flex items-baseline gap-1 bg-white/90 backdrop-blur-md rounded-full px-3.5 py-1.5">
                        <span className="font-playfair font-semibold text-stone-900">₹{rate.toLocaleString('en-IN')}</span>
                        <span className="text-stone-400 text-[11px]">/ night</span>
                      </div>
                      <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-playfair text-lg font-semibold group-hover:text-amber-800 transition-colors">{p.name}</h3>
                      {p.address && <p className="flex items-center gap-1.5 text-stone-400 text-xs mt-1"><MapPin size={11} /><span className="truncate">{p.address}</span></p>}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100 text-[12px] text-stone-500">
                        <span className="flex items-center gap-1"><BedDouble size={13} /> {p.bedrooms} bed</span>
                        <span className="flex items-center gap-1"><Bath size={13} /> {p.bathrooms} bath</span>
                        <span className="flex items-center gap-1"><Users size={13} /> {p.maxGuests} guests</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <Link href="/suites" className="sm:hidden mt-8 w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-stone-900 rounded-full py-3.5">
            View all stays <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Why Sweet Nest ── */}
      <section className="px-5 sm:px-8 py-20 bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12">
            <div className="inline-flex items-center gap-2 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-6 h-px bg-amber-700" /> Why Sweet Nest
            </div>
            <h2 className="font-playfair text-3xl sm:text-5xl font-semibold mt-4">Stays you can trust</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {[
              { icon: <ShieldCheck size={22} />, title: 'Verified & secure', body: 'Digital KYC, escrow payments, and gated properties — booked with total peace of mind.' },
              { icon: <Sparkles size={22} />, title: 'Thoughtfully designed', body: 'Warm materials, considered lighting, and the comforts that make a space feel like yours.' },
              { icon: <Headphones size={22} />, title: 'Always reachable', body: 'A real concierge on every message, with a median response time under fifteen minutes.' },
            ].map((c) => (
              <div key={c.title} className="group rounded-3xl border border-stone-200 p-7 hover:border-amber-200 hover:bg-amber-50/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-800 group-hover:text-white transition-colors">{c.icon}</div>
                <h3 className="font-playfair text-xl font-semibold mt-5">{c.title}</h3>
                <p className="text-stone-600 text-[14px] leading-relaxed mt-2">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-12 pt-8 border-t border-stone-100 text-sm">
            <Link href="/amenities" className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-amber-800 transition-colors">See all amenities <ArrowUpRight size={14} /></Link>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-amber-800 transition-colors">View pricing <ArrowUpRight size={14} /></Link>
            <Link href="/faqs" className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-amber-800 transition-colors">Read FAQs <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ── PWA install ── */}
      <section className="px-5 sm:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-stone-950 overflow-hidden px-8 sm:px-12 py-12">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-white/15 shrink-0">
                <Image src="/logo.png" alt="Sweet Nest app" fill className="object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-white">Take Sweet Nest with you</h2>
                <p className="text-stone-400 text-sm leading-relaxed mt-2 max-w-md mx-auto md:mx-0">
                  Install the app for instant access, check-in reminders, and a smoother booking experience — no app store needed.
                </p>
              </div>
              <div className="shrink-0"><PWALandingButton /></div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
