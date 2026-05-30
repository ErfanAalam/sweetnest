'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, BedDouble, Bath, ArrowUpRight, Maximize } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Property, coverPhoto, effectiveRate } from '@/lib/property-types';

export default function SuitesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProperties(d.properties);
        else setError(d.error || 'Failed to load suites');
      })
      .catch(() => setError('Unable to load suites right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      <SiteHeader />

      {/* Hero */}
      <section className="pt-32 pb-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-amber-800 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Our Suites</p>
          <h1 className="font-playfair text-4xl sm:text-5xl font-semibold leading-[1.05] max-w-2xl">
            Stay in a space that feels considered.
          </h1>
          <p className="mt-4 text-stone-600 text-[15px] leading-relaxed max-w-xl">
            Each suite is individually styled and fully serviced. Browse availability, explore the
            details, and reserve in minutes.
          </p>
        </div>
      </section>

      {/* Listing */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-stone-200 bg-white">
                  <div className="skeleton h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 text-sm">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-16 text-center">
              <p className="font-playfair text-xl text-stone-800">No suites listed yet</p>
              <p className="text-stone-500 text-sm mt-2">Please check back soon — new spaces are on the way.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const cover = coverPhoto(p.media);
                const rate = effectiveRate(p.pricePerNight, p.discountPercent);
                return (
                  <Link
                    key={p.id}
                    href={`/suites/${p.id}`}
                    className="group rounded-2xl overflow-hidden border border-stone-200 bg-white hover:border-stone-300 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] transition-all duration-300"
                  >
                    <div className="relative h-56 bg-stone-100 overflow-hidden">
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                          <BedDouble size={36} />
                        </div>
                      )}
                      {p.discountPercent > 0 && (
                        <span className="absolute top-3 left-3 bg-white/95 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {p.discountPercent}% off
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-playfair text-lg font-semibold leading-snug">{p.name}</h2>
                        <ArrowUpRight size={18} className="text-stone-300 group-hover:text-amber-800 transition-colors shrink-0 mt-1" />
                      </div>

                      {p.address && (
                        <p className="flex items-center gap-1.5 text-stone-400 text-xs mt-1.5">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{p.address}</span>
                        </p>
                      )}

                      {p.description && (
                        <p className="text-stone-600 text-[13px] leading-relaxed mt-3 line-clamp-2">
                          {p.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-4 text-[12px] text-stone-500">
                        <span className="flex items-center gap-1"><BedDouble size={13} /> {p.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath size={13} /> {p.bathrooms}</span>
                        <span className="flex items-center gap-1"><Users size={13} /> {p.maxGuests}</span>
                        {p.sqft && <span className="flex items-center gap-1"><Maximize size={13} /> {p.sqft} ft²</span>}
                      </div>

                      <div className="flex items-baseline gap-2 mt-4 pt-4 border-t border-stone-100">
                        <span className="font-semibold text-stone-900 text-lg">₹{rate.toLocaleString('en-IN')}</span>
                        <span className="text-stone-400 text-xs">/ night</span>
                        {p.discountPercent > 0 && (
                          <span className="text-stone-300 text-xs line-through ml-auto">
                            ₹{p.pricePerNight.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
