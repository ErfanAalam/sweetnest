'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentCreated, setPaymentCreated] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      router.push('/booking');
      return;
    }

    const token = localStorage.getItem('token');
    fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const book = data.bookings.find((b: any) => b.id === bookingId);
          setBooking(book);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookingId, router]);

  const handlePayment = async () => {
    setError('');
    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, action: 'create' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Payment creation failed');
        setProcessing(false);
        return;
      }

      setPaymentCreated(true);
      setTimeout(() => {
        router.push(`/kyc?bookingId=${bookingId}&paymentId=${data.payment.id}`);
      }, 2000);
    } catch {
      setError('An error occurred. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-700 mx-auto mb-3"></div>
          <p className="text-stone-500 text-sm">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">Booking not found</p>
          <Link href="/booking" className="btn-primary text-sm">
            Go Back to Booking
          </Link>
        </div>
      </div>
    );
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
          {paymentCreated ? (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
              <h1 className="heading-1 mb-2">Payment Initiated!</h1>
              <p className="text-stone-500 text-sm">Redirecting to KYC verification...</p>
            </div>
          ) : (
            <>
              <h1 className="heading-1 mb-1">Complete Payment</h1>
              <p className="text-stone-500 text-sm mb-6">Secure payment for your booking</p>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Booking Summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 mb-6">
                <h2 className="heading-3 mb-4">Booking Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Check-in</span>
                    <span className="text-stone-900 font-semibold">
                      {new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Check-out</span>
                    <span className="text-stone-900 font-semibold">
                      {new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Guests</span>
                    <span className="text-stone-900 font-semibold">{booking.numberOfGuests}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
                    <span className="text-stone-900 font-semibold">Total Amount</span>
                    <span className="text-amber-700 font-bold text-xl">₹{booking.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h2 className="heading-3 mb-3">Payment Method</h2>
                <label className="flex items-center gap-4 p-4 border-2 border-amber-700 rounded-lg bg-amber-50/40 cursor-pointer">
                  <input type="radio" name="payment" checked readOnly className="w-4 h-4 accent-amber-700" />
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-amber-700" size={20} />
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">Cashfree Payment Gateway</p>
                      <p className="text-xs text-stone-500">Secure online payment</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Lock className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-green-700 font-semibold text-sm">Your payment is secure</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    We use industry-standard encryption and comply with all Indian payment regulations
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/terms" className="btn-secondary flex-1 text-center text-sm">
                  Go Back
                </Link>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
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
      <PaymentContent />
    </Suspense>
  );
}
