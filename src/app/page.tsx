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
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-5 sm:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-6 h-px bg-amber-700" /> Serviced apartments · Mumbai
            </div>
            <h1 className="font-playfair text-[2.6rem] sm:text-6xl font-semibold leading-[1.04] mt-5">
              Feel at home,<br />
              <span className="italic text-amber-800">anywhere</span> you stay.
            </h1>
            <p className="mt-6 text-stone-600 text-[15px] sm:text-base leading-[1.8] max-w-md">
              Boutique-styled suites with the polish of a hotel and the ease of home.
              Browse availability freely — book in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link href="/suites" className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-full px-7 py-3.5 transition-colors">
                Explore suites <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-stone-900 px-3 py-3.5 transition-colors">
                Our story <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-9 text-sm">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-500 text-amber-500" />)}
                <span className="text-stone-700 font-semibold ml-1">4.9</span>
              </div>
              <span className="h-4 w-px bg-stone-300" />
              <span className="flex items-center gap-1.5 text-stone-600"><MapPin size={14} className="text-amber-700" /> Prime Mumbai</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] rounded-3xl overflow-hidden">
              <Image src="/property-hero.png" alt="Sweet Nest suite" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/85 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-stone-500 uppercase tracking-wide">Premium 1 BHK</p>
                  <p className="font-playfair text-lg font-semibold">From ₹5,000<span className="text-xs font-normal text-stone-400"> / night</span></p>
                </div>
                <Link href="/suites" className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-amber-800 transition-colors">
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured suites ── */}
      <section className="px-5 sm:px-8 py-16 border-t border-stone-200/70">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-amber-800 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Stay with us</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-semibold">Featured suites</h2>
            </div>
            <Link href="/suites" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-amber-800 transition-colors">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>

          {suites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center">
              <p className="font-playfair text-xl text-stone-800">New suites arriving soon</p>
              <p className="text-stone-500 text-sm mt-2">Our collection is being prepared — check back shortly.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suites.map((p) => {
                const cover = coverPhoto(p.media);
                const rate = effectiveRate(p.pricePerNight, p.discountPercent);
                return (
                  <Link key={p.id} href={`/suites/${p.id}`} className="group rounded-2xl overflow-hidden border border-stone-200 bg-white hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] transition-all duration-300">
                    <div className="relative h-52 bg-stone-100 overflow-hidden">
                      {cover ? (
                        <Image src={cover.url} alt={p.name} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-300"><BedDouble size={34} /></div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-playfair text-lg font-semibold">{p.name}</h3>
                      {p.address && <p className="flex items-center gap-1.5 text-stone-400 text-xs mt-1"><MapPin size={11} /><span className="truncate">{p.address}</span></p>}
                      <div className="flex items-center gap-4 mt-3 text-[12px] text-stone-500">
                        <span className="flex items-center gap-1"><BedDouble size={13} /> {p.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath size={13} /> {p.bathrooms}</span>
                        <span className="flex items-center gap-1"><Users size={13} /> {p.maxGuests}</span>
                      </div>
                      <p className="mt-4 pt-4 border-t border-stone-100"><span className="font-semibold text-lg">₹{rate.toLocaleString('en-IN')}</span><span className="text-stone-400 text-xs"> / night</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Why Sweet Nest ── */}
      <section className="px-5 sm:px-8 py-16 bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={22} />, title: 'Verified & secure', body: 'Digital KYC, escrow payments, and gated buildings — booked with total peace of mind.' },
              { icon: <Sparkles size={22} />, title: 'Thoughtfully designed', body: 'Warm materials, considered lighting, and the comforts that make a space feel like yours.' },
              { icon: <Headphones size={22} />, title: 'Always reachable', body: 'A real concierge on every message, with a median response time under fifteen minutes.' },
            ].map((c) => (
              <div key={c.title}>
                <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">{c.icon}</div>
                <h3 className="font-playfair text-lg font-semibold mt-4">{c.title}</h3>
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
