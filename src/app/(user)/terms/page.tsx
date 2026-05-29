'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function TermsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      router.push('/booking');
    }
  }, [bookingId, router]);

  const handleContinue = async () => {
    if (!agreed) {
      setError('You must agree to the terms and conditions');
      return;
    }
    setLoading(true);
    router.push(`/payment?bookingId=${bookingId}`);
  };

  if (!bookingId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm flex-shrink-0">
              <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" />
            </div>
            <span className="font-playfair text-base font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">Sweet Nest</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="card-premium">
          <h1 className="heading-1 mb-1">Terms & Conditions</h1>
          <p className="text-stone-500 text-sm mb-6">Please read and accept our terms before proceeding</p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 max-h-80 overflow-y-auto mb-6 text-sm">
            <h2 className="heading-3 mb-3">1. Rental Agreement</h2>
            <p className="text-stone-600 mb-4">
              By booking an apartment through Sweet Nest, you agree to abide by all terms and conditions outlined in this agreement.
              Sweet Nest provides premium 1 BHK apartments for short-term rental purposes.
            </p>

            <h2 className="heading-3 mb-3">2. Guest Responsibilities</h2>
            <ul className="text-stone-600 mb-4 space-y-1.5">
              <li>• Maintain the apartment in good condition</li>
              <li>• Report any damages or issues immediately</li>
              <li>• Follow all house rules and regulations</li>
              <li>• Not engage in illegal activities</li>
              <li>• Respect quiet hours (10 PM – 7 AM)</li>
            </ul>

            <h2 className="heading-3 mb-3">3. Payment & Cancellation</h2>
            <p className="text-stone-600 mb-4">
              Payment must be completed before check-in. Cancellations made 7 days before check-in will receive a full refund.
              Cancellations within 7 days will forfeit 50% of the amount.
            </p>

            <h2 className="heading-3 mb-3">4. ID Verification (KYC)</h2>
            <p className="text-stone-600 mb-4">
              As per Indian hospitality guidelines, valid ID verification is mandatory. Accepted documents include Aadhaar Card,
              PAN Card, Passport, or Driving License. All information must be current and valid.
            </p>

            <h2 className="heading-3 mb-3">5. Data Privacy</h2>
            <p className="text-stone-600 mb-4">
              Your personal and identity information is stored securely and encrypted. Sweet Nest complies with all Indian data
              protection laws and will never share your information with third parties without consent.
            </p>

            <h2 className="heading-3 mb-3">6. Liability</h2>
            <p className="text-stone-600 mb-4">
              Sweet Nest is not liable for personal belongings left in the apartment. Guests are responsible for their own belongings
              and should use provided safes for valuables.
            </p>

            <h2 className="heading-3 mb-3">7. Indian Compliance</h2>
            <p className="text-stone-600">
              All bookings are subject to Indian rental and hospitality laws. Sweet Nest maintains compliance with GST regulations,
              local taxation requirements, and consumer protection laws.
            </p>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setError('');
              }}
              className="w-4 h-4 mt-0.5 rounded accent-amber-700 cursor-pointer flex-shrink-0"
            />
            <span className="text-stone-600 text-sm leading-relaxed">
              I have read and agree to the <span className="text-amber-700 font-semibold">Terms & Conditions</span> and understand
              the rental policies, cancellation terms, and data privacy practices of Sweet Nest. I also confirm that I will comply
              with all applicable Indian laws.
            </span>
          </label>

          <div className="flex gap-3">
            <Link href="/booking" className="btn-secondary flex-1 text-center text-sm">
              Go Back
            </Link>
            <button
              onClick={handleContinue}
              disabled={!agreed || loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Processing...' : 'Agree & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700 mx-auto mb-3"></div>
            <p className="text-stone-500 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <TermsContent />
    </Suspense>
  );
}
