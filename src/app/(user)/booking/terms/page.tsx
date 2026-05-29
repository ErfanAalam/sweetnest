'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle, CheckCircle, ScrollText } from 'lucide-react';
import Image from 'next/image';

export default function TermsPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (!token || !pendingBooking) {
      router.push('/booking');
      return;
    }
    setBooking(JSON.parse(pendingBooking));
  }, [router]);

  const handleProceed = () => {
    if (!agreed) return;
    setLoading(true);
    localStorage.setItem('termsAccepted', 'true');
    router.push('/booking/payment');
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex justify-between items-center">
          <Link href="/booking" className="flex items-center gap-2 group">
            <ChevronLeft size={15} className="text-amber-700" />
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm flex-shrink-0">
              <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" />
            </div>
            <span className="font-playfair text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">Sweet Nest</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400">
            <span>1. Dates</span><span>→</span>
            <span className="text-amber-700 font-semibold">2. Terms</span>
            <span>→</span><span>3. Payment</span><span>→</span><span>4. KYC</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-amber-50 rounded-lg">
            <ScrollText size={22} className="text-amber-700" />
          </div>
          <div>
            <h1 className="heading-1">Terms &amp; Conditions</h1>
            <p className="text-stone-400 text-xs mt-0.5">Please read carefully before proceeding to payment</p>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="card mb-5 border-amber-100">
          <h2 className="text-sm font-semibold text-amber-700 mb-3">Your Booking</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-stone-400 text-xs">Check-in</p>
              <p className="font-semibold text-stone-900 mt-0.5">{new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs">Check-out</p>
              <p className="font-semibold text-stone-900 mt-0.5">{new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-stone-400 text-xs">Total Amount</p>
              <p className="font-bold text-amber-700 text-base mt-0.5">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Terms Document */}
        <div className="card mb-5 max-h-96 overflow-y-auto text-sm leading-relaxed">
          <div className="space-y-5 text-stone-600">

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">1. Booking &amp; Payment</h3>
              <p>1.1. All bookings are subject to availability and confirmed only upon full payment of the specified amount.</p>
              <p className="mt-1">1.2. Payment must be completed through our authorised gateway (Cashfree). No cash payments accepted.</p>
              <p className="mt-1">1.3. The total amount displayed is inclusive of all applicable taxes (GST).</p>
              <p className="mt-1">1.4. Prices are quoted in Indian Rupees (INR) and are non-negotiable.</p>
            </div>

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">2. KYC Verification (Mandatory)</h3>
              <p>2.1. All guests are required to upload a valid government-issued photo ID (Aadhaar, PAN, Passport, or Driving Licence) within 24 hours of payment.</p>
              <p className="mt-1">2.2. Failure to submit KYC documents may result in automatic cancellation of the booking without refund.</p>
              <p className="mt-1">2.3. Documents are stored securely and used solely for identity verification as per Indian hospitality regulations.</p>
              <p className="mt-1">2.4. The management reserves the right to reject a booking if KYC verification fails.</p>
            </div>

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">3. Check-in / Check-out</h3>
              <p>3.1. Standard check-in time is 12:00 PM (noon) and check-out is 11:00 AM.</p>
              <p className="mt-1">3.2. Early check-in or late check-out is subject to availability and may attract additional charges.</p>
              <p className="mt-1">3.3. Guests must carry original ID documents matching the KYC submission at check-in.</p>
            </div>

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">4. Cancellation &amp; Refund Policy</h3>
              <p>4.1. Cancellations made 7 or more days before check-in: 75% refund.</p>
              <p className="mt-1">4.2. Cancellations made 3–6 days before check-in: 50% refund.</p>
              <p className="mt-1">4.3. Cancellations made within 48 hours of check-in: No refund.</p>
              <p className="mt-1">4.4. No-shows will be charged the full booking amount.</p>
              <p className="mt-1">4.5. Refunds, where applicable, will be processed within 7–10 business days to the original payment method.</p>
            </div>

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">5. Guest Conduct &amp; Property Use</h3>
              <p>5.1. The property is strictly for residential short-stay use. Commercial, illegal, or immoral activities are strictly prohibited.</p>
              <p className="mt-1">5.2. Guests are responsible for any damage caused to the property during their stay.</p>
              <p className="mt-1">5.3. Smoking inside the apartment is not permitted. Designated outdoor areas may be used.</p>
              <p className="mt-1">5.4. Parties, events, and gatherings exceeding registered guests are not permitted.</p>
              <p className="mt-1">5.5. Quiet hours are between 10:00 PM and 7:00 AM.</p>
            </div>

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">6. Data Privacy</h3>
              <p>6.1. Personal data and identity documents are collected as required under Indian hospitality compliance regulations.</p>
              <p className="mt-1">6.2. Data is stored securely and will not be shared with third parties except as required by law.</p>
              <p className="mt-1">6.3. We comply with applicable data protection guidelines under Indian IT law.</p>
            </div>

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">7. Liability</h3>
              <p>7.1. The management is not liable for loss of personal belongings during the stay.</p>
              <p className="mt-1">7.2. Guests stay at their own risk. The management is not responsible for personal injury or illness.</p>
              <p className="mt-1">7.3. Force majeure events (natural disasters, government restrictions, etc.) may result in rebooking or voucher issuance in lieu of refund.</p>
            </div>

            <div>
              <h3 className="text-amber-700 font-bold text-sm mb-2">8. Governing Law</h3>
              <p>These Terms &amp; Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-5">
          <AlertTriangle size={16} className="text-amber-700 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-amber-700">Important:</span> KYC verification is mandatory after payment.
            Your booking will not be confirmed until identity documents are verified.
          </p>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-7 group">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 mt-0.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
              agreed ? 'bg-amber-700 border-amber-700' : 'border-stone-300 group-hover:border-amber-500'
            }`}
          >
            {agreed && <CheckCircle size={13} className="text-white" />}
          </div>
          <span className="text-stone-600 text-sm leading-relaxed">
            I have read, understood, and agree to the <span className="text-amber-700 font-semibold">Terms &amp; Conditions</span> above.
            I confirm that the information I provide is accurate and I consent to mandatory KYC verification as per Indian hospitality regulations.
          </span>
        </label>

        <div className="flex gap-3">
          <Link href="/booking" className="btn-secondary flex-1 text-center">
            ← Go Back
          </Link>
          <button
            onClick={handleProceed}
            disabled={!agreed || loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Proceed to Payment →'}
          </button>
        </div>
      </div>
    </div>
  );
}
