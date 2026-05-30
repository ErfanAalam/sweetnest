'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Users, BedDouble, Bath, Maximize, Clock, ArrowLeft,
  Check, Loader2, Play, ChevronLeft, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { Property, effectiveRate, parseAmenities } from '@/lib/property-types';

export default function SuiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProperty(d.property);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <SiteHeader />
        <div className="pt-32 flex items-center justify-center text-stone-300">
          <Loader2 size={26} className="animate-spin" />
        </div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <SiteHeader />
        <div className="flex-1 pt-32 px-6 text-center">
          <p className="font-playfair text-2xl text-stone-800">Suite not found</p>
          <p className="text-stone-500 text-sm mt-2">This suite may have been removed or is no longer available.</p>
          <Link href="/suites" className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-amber-800">
            <ArrowLeft size={15} /> Back to all suites
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const media = property.media.length ? property.media : [];
  const current = media[active];
  const rate = effectiveRate(property.pricePerNight, property.discountPercent);
  const taxAmt = Math.round((rate * property.taxPercent) / 100);
  const amenities = parseAmenities(property.amenities);

  const specs = [
    { icon: <BedDouble size={17} />, label: `${property.bedrooms} Bedroom${property.bedrooms === 1 ? '' : 's'}` },
    { icon: <Bath size={17} />, label: `${property.bathrooms} Bathroom${property.bathrooms === 1 ? '' : 's'}` },
    { icon: <Users size={17} />, label: `Up to ${property.maxGuests} guests` },
    ...(property.sqft ? [{ icon: <Maximize size={17} />, label: `${property.sqft} ft²` }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        <Link href="/suites" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-500 hover:text-stone-900 transition-colors mb-5">
          <ArrowLeft size={15} /> All suites
        </Link>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-semibold leading-tight">{property.name}</h1>
            {property.address && (
              <p className="flex items-center gap-1.5 text-stone-500 text-sm mt-2">
                <MapPin size={14} className="text-amber-700" /> {property.address}
              </p>
            )}
          </div>
          {property.googleMapsUrl && (
            <a
              href={property.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-700 border border-stone-300 rounded-full px-4 py-2 hover:border-stone-900 transition-colors w-fit"
            >
              View on map <ArrowUpRight size={14} />
            </a>
          )}
        </div>

        {/* Gallery */}
        {media.length > 0 && (
          <div className="mb-12">
            <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-stone-100">
              {current?.type === 'VIDEO' ? (
                <video src={current.url} controls className="w-full h-full object-cover" />
              ) : current ? (
                <Image
                  src={current.url}
                  alt={current.caption || property.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : null}

              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setActive((a) => (a - 1 + media.length) % media.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-stone-700 hover:bg-white shadow-sm"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActive((a) => (a + 1) % media.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-stone-700 hover:bg-white shadow-sm"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                {media.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setActive(i)}
                    className={`relative h-16 w-24 shrink-0 rounded-lg overflow-hidden ring-2 transition-all ${
                      i === active ? 'ring-amber-700' : 'ring-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {m.type === 'VIDEO' ? (
                      <div className="absolute inset-0 bg-stone-800 flex items-center justify-center text-white/80">
                        <Play size={16} />
                      </div>
                    ) : (
                      <Image src={m.url} alt="" fill className="object-cover" unoptimized />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Body grid */}
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Specs */}
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {specs.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 text-stone-700">
                  <span className="text-amber-700">{s.icon}</span>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              ))}
            </div>

            {property.description && (
              <div>
                <h2 className="font-playfair text-xl font-semibold mb-3">About this suite</h2>
                <p className="text-stone-600 text-[15px] leading-[1.8] whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div>
                <h2 className="font-playfair text-xl font-semibold mb-4">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2.5 text-stone-700 text-sm">
                      <Check size={15} className="text-amber-700 shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Check-in/out */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3">
                <Clock size={16} className="text-amber-700" />
                <div>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wide">Check-in</p>
                  <p className="text-sm font-semibold">{property.checkInTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-3">
                <Clock size={16} className="text-amber-700" />
                <div>
                  <p className="text-[11px] text-stone-400 uppercase tracking-wide">Check-out</p>
                  <p className="text-sm font-semibold">{property.checkOutTime}</p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className="font-playfair text-xl font-semibold mb-1">Availability</h2>
              <p className="text-stone-500 text-sm mb-4">Open nights are highlighted — no login required to check.</p>
              <AvailabilityCalendar />
            </div>
          </div>

          {/* Right: sticky booking card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.25)]">
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-3xl font-semibold">₹{rate.toLocaleString('en-IN')}</span>
                <span className="text-stone-400 text-sm">/ night</span>
              </div>
              {property.discountPercent > 0 && (
                <p className="text-sm text-stone-400 mt-1">
                  <span className="line-through">₹{property.pricePerNight.toLocaleString('en-IN')}</span>
                  <span className="text-emerald-700 font-semibold ml-2">{property.discountPercent}% off</span>
                </p>
              )}

              <div className="mt-5 space-y-2 text-sm border-t border-stone-100 pt-4">
                <div className="flex justify-between text-stone-500">
                  <span>Nightly rate</span><span>₹{rate.toLocaleString('en-IN')}</span>
                </div>
                {property.taxPercent > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Taxes ({property.taxPercent}%)</span><span>₹{taxAmt.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-stone-900 border-t border-stone-100 pt-2">
                  <span>Per night total</span><span>₹{(rate + taxAmt).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/booking"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-full py-3.5 transition-colors"
              >
                Reserve your dates
              </Link>
              <p className="text-[11px] text-stone-400 text-center mt-3">
                You can browse freely — login is only needed to confirm a booking.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
