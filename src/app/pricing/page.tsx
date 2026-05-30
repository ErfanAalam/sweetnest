'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ArrowUpRight } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Property, effectiveRate } from '@/lib/property-types';

const INCLUDED = [
  'Fibre Wi-Fi & smart TV',
  'Daily housekeeping',
  'Secure private parking',
  'Self check-in with smart lock',
  '24/7 concierge support',
  'All taxes shown upfront',
];

export default function PricingPage() {
  const [fromRate, setFromRate] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.properties.length) {
          const rates = (d.properties as Property[]).map((p) => effectiveRate(p.pricePerNight, p.discountPercent));
          setFromRate(Math.min(...rates));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      <SiteHeader />

      <section className="pt-32 pb-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-800 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-semibold leading-[1.05]">
            One price. No surprises.
          </h1>
          <p className="mt-4 text-stone-600 text-[15px] leading-relaxed max-w-xl mx-auto">
            What you see is what you pay — taxes included, no cleaning fees, no service charges
            added at checkout.
          </p>
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-[0_20px_60px_-30px_rgba(0,0,0,0.3)]">
            <div className="bg-stone-950 text-white px-8 py-10 text-center">
              <p className="text-stone-400 text-xs uppercase tracking-[0.18em]">Starting from</p>
              <p className="font-playfair text-5xl font-semibold mt-2">
                {fromRate != null ? `₹${fromRate.toLocaleString('en-IN')}` : '₹5,000'}
                <span className="text-base font-normal text-stone-400"> / night</span>
              </p>
              <p className="text-stone-400 text-sm mt-2">Per suite · taxes included</p>
            </div>
            <div className="px-8 py-8">
              <ul className="space-y-3.5">
                {INCLUDED.map((i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-stone-700">
                    <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                      <Check size={12} />
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                href="/suites"
                className="mt-8 w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-full py-3.5 transition-colors"
              >
                Browse suites & dates <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <p className="text-center text-stone-400 text-xs mt-6 leading-relaxed">
            Rates vary by suite and season. Final pricing for your dates is shown before you pay.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
