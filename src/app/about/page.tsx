'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Sparkles, HeartHandshake, ArrowUpRight } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const PILLARS = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'Trust, built in',
    body: 'Government-compliant KYC, secure escrow payments, and gated, monitored buildings. The boring parts, handled properly.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Designed, not decorated',
    body: 'Every suite is styled with intent — warm materials, considered lighting, and the small comforts that make a stay feel like yours.',
  },
  {
    icon: <HeartHandshake size={20} />,
    title: 'Hospitality that answers',
    body: 'A real person on the other end of every message, with a median response time under fifteen minutes.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      <SiteHeader />

      {/* Hero */}
      <section className="pt-32 pb-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-amber-800 text-xs font-semibold uppercase tracking-[0.2em] mb-3">About Sweet Nest</p>
            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold leading-[1.05]">
              A better way to stay,<br />without the hotel.
            </h1>
            <p className="mt-5 text-stone-600 text-[15px] leading-[1.8] max-w-lg">
              Sweet Nest began with a simple frustration: short stays in great cities meant choosing
              between sterile hotel rooms and unpredictable rentals. So we built the middle —
              fully serviced apartments with the polish of a boutique hotel and the ease of home.
            </p>
            <p className="mt-4 text-stone-600 text-[15px] leading-[1.8] max-w-lg">
              Sweet Nest is a child company of <span className="font-semibold text-stone-900">DABLA INFO SYSTEMS PVT. LTD.</span> and is owned by <span className="font-semibold text-stone-900">Mr. Hemant Sharma</span>.
            </p>
            <Link
              href="/suites"
              className="inline-flex items-center gap-1.5 mt-7 text-sm font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-full px-6 py-3 transition-colors"
            >
              Explore our suites <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image src="/property-hero.png" alt="Sweet Nest interior" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-5 sm:px-8 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-stone-200 bg-white p-7">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="font-playfair text-lg font-semibold mt-5">{p.title}</h3>
              <p className="text-stone-600 text-[14px] leading-relaxed mt-2">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / closing band */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-6xl mx-auto rounded-3xl bg-stone-950 text-white px-8 sm:px-12 py-14">
          <div className="grid sm:grid-cols-3 gap-10 text-center">
            {[
              { n: '4.9/5', l: 'Average guest rating' },
              { n: '15 min', l: 'Median support response' },
              { n: '100%', l: 'KYC-verified bookings' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-playfair text-4xl font-semibold text-amber-400">{s.n}</p>
                <p className="text-stone-400 text-sm mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
