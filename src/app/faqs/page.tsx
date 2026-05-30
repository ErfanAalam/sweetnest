'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const FAQS = [
  {
    q: 'Where are the suites located?',
    a: 'All Sweet Nest suites are in prime, secure residential pockets of Mumbai with strong connectivity to business districts and shopping. The exact address and a map link are shown on each suite page.',
  },
  {
    q: 'What are the check-in and check-out times?',
    a: 'Standard check-in is from 12:00 PM and check-out is by 11:00 AM. Exact times are listed on each suite. Self check-in via smart lock means you are not tied to a front desk.',
  },
  {
    q: 'Do I need to log in to see availability?',
    a: 'No. You can browse every suite and view its live availability calendar without an account. You only need to log in when you are ready to confirm and pay for a booking.',
  },
  {
    q: 'Is ID verification (KYC) mandatory?',
    a: 'Yes. As per Indian hospitality and local government rules, a valid government ID (Aadhaar, PAN, Passport, or Driving License) is required before check-in. Our KYC step is digital and usually takes a couple of minutes.',
  },
  {
    q: 'How does payment work?',
    a: 'Payments are processed securely through Cashfree, one of India’s leading gateways. You can pay by UPI, credit/debit card, or netbanking, and you receive instant confirmation.',
  },
  {
    q: 'Can I cancel or change my dates?',
    a: 'Reserved dates are held for a short window while you complete checkout. For changes or cancellations after booking, reach our concierge from your dashboard — we typically respond within fifteen minutes.',
  },
];

export default function FaqsPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      <SiteHeader />

      <section className="pt-32 pb-12 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-800 text-xs font-semibold uppercase tracking-[0.2em] mb-3">FAQs</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-semibold leading-[1.05]">
            Questions, answered.
          </h1>
          <p className="mt-4 text-stone-600 text-[15px] leading-relaxed">
            Everything you need to know before you book. Still stuck? Our concierge is one message away.
          </p>
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-20">
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium text-[15px] text-stone-900">{f.q}</span>
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 -mt-1 text-stone-600 text-[14px] leading-[1.8]">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-3xl mx-auto rounded-2xl bg-stone-950 text-white px-8 py-10 text-center">
          <h3 className="font-playfair text-2xl font-semibold">Ready when you are</h3>
          <p className="text-stone-400 text-sm mt-2">Find your suite and check available dates — no login required.</p>
          <Link
            href="/suites"
            className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-stone-900 bg-white hover:bg-amber-50 rounded-full px-6 py-3 transition-colors"
          >
            Explore suites <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
