'use client';

import Link from 'next/link';
import {
  Wifi, Car, Coffee, Tv, ShieldCheck, KeyRound, Sparkles, Headphones,
  Wind, UtensilsCrossed, WashingMachine, ArrowUpRight,
} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const GROUPS = [
  {
    title: 'Connectivity & entertainment',
    items: [
      { icon: <Wifi size={18} />, name: 'Fibre Wi-Fi', desc: '100+ Mbps, work-ready' },
      { icon: <Tv size={18} />, name: 'Smart TV', desc: 'Netflix, Prime & more' },
    ],
  },
  {
    title: 'Comfort & living',
    items: [
      { icon: <Wind size={18} />, name: 'Climate control', desc: 'Air conditioning throughout' },
      { icon: <UtensilsCrossed size={18} />, name: 'Full kitchen', desc: 'Cookware, stove & microwave' },
      { icon: <Coffee size={18} />, name: 'Coffee & tea', desc: 'Complimentary on arrival' },
      { icon: <WashingMachine size={18} />, name: 'Laundry', desc: 'In-unit washing machine' },
    ],
  },
  {
    title: 'Access & security',
    items: [
      { icon: <KeyRound size={18} />, name: 'Smart lock', desc: 'Digital, self check-in' },
      { icon: <ShieldCheck size={18} />, name: '24/7 security', desc: 'Gated, CCTV-monitored' },
      { icon: <Car size={18} />, name: 'Private parking', desc: 'Secure basement spot' },
    ],
  },
  {
    title: 'Service',
    items: [
      { icon: <Sparkles size={18} />, name: 'Housekeeping', desc: 'Professional daily cleaning' },
      { icon: <Headphones size={18} />, name: 'Concierge', desc: 'Real support, any hour' },
    ],
  },
];

export default function AmenitiesPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      <SiteHeader />

      <section className="pt-32 pb-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-amber-800 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Amenities</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-semibold leading-[1.05] max-w-2xl">
            Everything you need, already here.
          </h1>
          <p className="mt-4 text-stone-600 text-[15px] leading-relaxed max-w-xl">
            We stock each suite so you can arrive with a carry-on and feel settled within minutes.
          </p>
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="font-playfair text-xl font-semibold mb-5">{g.title}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {g.items.map((it) => (
                  <div key={it.name} className="flex items-start gap-3.5 rounded-xl border border-stone-200 bg-white p-5">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                      {it.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-stone-900">{it.name}</p>
                      <p className="text-stone-500 text-[13px] mt-0.5">{it.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-6xl mx-auto rounded-2xl border border-stone-200 bg-white px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="font-playfair text-2xl font-semibold">See it for yourself</h3>
            <p className="text-stone-500 text-sm mt-1">Browse our suites and check live availability.</p>
          </div>
          <Link
            href="/suites"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-full px-6 py-3 transition-colors shrink-0"
          >
            View suites <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
