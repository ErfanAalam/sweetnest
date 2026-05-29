'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Shield, Lock, AlertCircle, Loader, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import ReservationTimer from '@/components/ReservationTimer';

export default function PaymentPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const isMockMode = !process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID || 
                     process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID === 'your-cashfree-client-id';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const pendingBooking = localStorage.getItem('pendingBooking');
    const termsAccepted = localStorage.getItem('termsAccepted');

    if (!token || !pendingBooking) {
      router.push('/booking');
      return;
    }
    if (!termsAccepted) {
      router.push('/booking/terms');
      return;
    }
    setBooking(JSON.parse(pendingBooking));
  }, [router]);

  const handlePayment = async () => {
    if (!booking) return;
    setLoading(true);
    setError('');
    setPaymentStatus('processing');

    const token = localStorage.getItem('token');
    try {
      // Create payment order
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          action: 'create',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to initiate payment');
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      const { payment } = data;
      localStorage.setItem('pendingPayment', JSON.stringify(payment));

      if (isMockMode || payment.paymentSessionId?.startsWith('mock_')) {
        // Mock payment auto-success skip
        setPaymentStatus('success');
        
        // Mark payment as confirmed on the server side
        await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'verify',
            orderId: payment.orderId,
            status: 'SUCCESS',
          }),
        });

        setTimeout(() => {
          router.push(`/booking/kyc?bookingId=${booking.id}`);
        }, 1000);
        return;
      }

      // Load Cashfree SDK and open checkout
      if (typeof window !== 'undefined') {
        const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';

        // Dynamically load Cashfree JS SDK
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
          const cashfree = (window as any).Cashfree({ mode: cashfreeEnv });
          cashfree.checkout({
            paymentSessionId: payment.paymentSessionId,
            redirectTarget: '_self',
          }).then((result: any) => {
            if (result.error) {
              setError(result.error.message || 'Payment failed');
              setPaymentStatus('failed');
              setLoading(false);
            }
          });
        };
        script.onerror = () => {
          // Fallback: redirect to Cashfree checkout URL if available
          if (payment.paymentUrl) {
            window.location.href = payment.paymentUrl;
          } else {
            setError('Payment gateway unavailable. Please try again.');
            setPaymentStatus('failed');
            setLoading(false);
          }
        };
        document.head.appendChild(script);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  if (!booking) return null;

  const nights = Math.round(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-poppins selection:bg-amber-100 selection:text-amber-950 antialiased">
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/booking/terms" className="flex items-center gap-2 group">
            <ChevronLeft size={15} className="text-amber-700" />
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm flex-shrink-0">
              <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" />
            </div>
            <span className="font-playfair text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">Sweet Nest</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-semibold">
            <span>1. Dates</span><span>→</span>
            <span>2. Terms</span><span>→</span>
            <span className="text-amber-700">3. Payment</span>
            <span>→</span><span>4. KYC</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in space-y-6">
        
        {/* Banner */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700 w-fit">
            <CreditCard size={22} />
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-stone-900">Secure Checkout</h1>
            <p className="text-stone-500 text-xs mt-0.5">Authorize and secure your reservation details</p>
          </div>
        </div>

        {/* Reservation Timer */}
        {booking.reservedUntil && (
          <ReservationTimer reservedUntil={booking.reservedUntil} />
        )}

        {/* Sandbox Warning Banner */}
        {isMockMode && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-800 font-medium space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span>🧪 Sandbox Mode Enabled</span>
            </div>
            <p className="leading-relaxed">
              No Cashfree credentials configured. You can skip real payment processing. Clicking "Pay" will successfully simulate the payment transaction!
            </p>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white border border-stone-200/60 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="font-playfair text-lg font-bold text-amber-700">Order Summary</h2>
          
          <div className="space-y-3.5 text-xs md:text-sm">
            <div className="flex justify-between">
              <span className="text-stone-400">Property</span>
              <span className="font-semibold text-stone-900">Sweet Nest 1 BHK Suite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Check-in</span>
              <span className="font-semibold text-stone-900">
                {new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Check-out</span>
              <span className="font-semibold text-stone-900">
                {new Date(booking.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Duration</span>
              <span className="font-semibold text-stone-900">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Guests</span>
              <span className="font-semibold text-stone-900">{booking.numberOfGuests} Guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
            </div>

            <div className="border-t border-stone-100 pt-3.5">
              <div className="flex justify-between">
                <span className="text-stone-400">Subtotal (Excl. Tax)</span>
                <span className="text-stone-700 font-medium">₹{(booking.totalPrice * 0.82).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-stone-400">GST Compliance Tax (18%)</span>
                <span className="text-stone-700 font-medium">₹{(booking.totalPrice * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3.5 flex justify-between font-bold text-base md:text-lg">
              <span className="text-amber-800">Total Payable</span>
              <span className="text-amber-800">₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white border border-stone-200/50 p-4 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm">
            <Shield size={18} className="text-amber-700" />
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">SSL Secured</span>
          </div>
          <div className="bg-white border border-stone-200/50 p-4 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm">
            <Lock size={18} className="text-amber-700" />
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">Encrypted</span>
          </div>
          <div className="bg-white border border-stone-200/50 p-4 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm">
            <CreditCard size={18} className="text-amber-700" />
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">PCI Compliant</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-stone-200/55 p-5 rounded-3xl space-y-2">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Supported Channels</p>
          <div className="flex gap-2 flex-wrap">
            {['UPI (GPay/PhonePe)', 'Credit Card', 'Debit Card', 'Net Banking', 'Corporate Wallets'].map(m => (
              <span key={m} className="text-[11px] font-semibold bg-stone-50 text-stone-650 px-3 py-1 rounded-full border border-stone-250/20">
                {m}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-250/30 rounded-xl p-4 text-rose-700 text-xs font-semibold">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paymentStatus === 'processing' && (
          <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-xs font-semibold text-center">
            <Loader size={16} className="animate-spin" />
            <span>Redirecting to Cashfree secure checkout gateway...</span>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-xs font-semibold text-center">
            <CheckCircle2 size={16} className="text-emerald-600 animate-pulse" />
            <span>Simulating secure transaction success...</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || paymentStatus === 'processing'}
          className="btn-primary w-full py-3.5 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          {loading || paymentStatus === 'processing' ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Redirecting...</span>
            </>
          ) : (
            <span>Pay ₹{booking.totalPrice?.toLocaleString('en-IN')} Securely</span>
          )}
        </button>

        <p className="text-[11px] text-center text-stone-400 leading-relaxed pt-2">
          🔒 By executing payment you authorize secure billing processing. After successful verification, you will proceed to instant regulatory guest KYC matching.
        </p>
      </div>
    </div>
  );
}
