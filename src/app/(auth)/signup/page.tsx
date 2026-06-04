'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, ShieldCheck, User, AlertCircle, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recaptchaRef   = useRef<RecaptchaVerifier | null>(null);
  const containerRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      clearVerifier();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Where to land after authenticating: admins go to their console; guests who were
  // mid-booking resume that booking, everyone else lands on their dashboard.
  const postLoginDestination = (role: string) => {
    if (role === 'ADMIN') return '/admin';
    return localStorage.getItem('pendingDates') ? '/booking' : '/dashboard';
  };

  // Already authenticated? Skip the signup screen entirely.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(postLoginDestination(user.role));
    }
  }, [authLoading, user, router]);

  const clearVerifier = () => {
    try { recaptchaRef.current?.clear(); } catch {}
    recaptchaRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = '';
  };

  const freshVerifier = () => {
    clearVerifier();
    if (!containerRef.current) throw new Error('reCAPTCHA container not mounted');
    const el = document.createElement('div');
    containerRef.current.appendChild(el);
    const v = new RecaptchaVerifier(auth, el, { size: 'invisible' });
    recaptchaRef.current = v;
    return v;
  };

  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const firebaseErrorMessage = (err: any): string => {
    const code: string = err?.code || '';
    if (code === 'auth/invalid-phone-number') return 'Invalid phone number format.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
    if (code === 'auth/operation-not-allowed') return 'Phone sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.';
    if (code === 'auth/captcha-check-failed') return 'reCAPTCHA failed. Please refresh the page and try again.';
    if (code === 'auth/invalid-api-key' || code === 'auth/app-not-authorized') return 'Firebase configuration error. Check your NEXT_PUBLIC_FIREBASE_* env variables.';
    if (code === 'auth/unauthorized-domain') return 'This domain is not authorized in Firebase Console. Add it under Authentication → Settings → Authorized domains.';
    if (code === 'auth/quota-exceeded') return 'SMS quota exceeded. Please try again tomorrow.';
    return `OTP send failed (${code || err?.message || 'unknown error'})`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, freshVerifier());
      confirmationRef.current = result;
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      console.error('[Firebase OTP error]', err);
      clearVerifier();
      setError(firebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationRef.current!.confirm(otp);
      const idToken = await result.user.getIdToken();

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'firebase-auth', mode: 'signup', idToken, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      setSuccess(true);
      setTimeout(() => router.push(postLoginDestination(data.user.role)), 2000);
    } catch (err: any) {
      setError(
        err.code === 'auth/invalid-verification-code'
          ? 'Incorrect OTP. Please try again.'
          : `Verification failed (${err.code || err.message})`
      );
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, freshVerifier());
      confirmationRef.current = result;
      startResendTimer();
    } catch (err: any) {
      console.error('[Firebase resend error]', err);
      clearVerifier();
      setError(firebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div ref={containerRef} />

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-amber-500/20 shadow-md transition-transform duration-300 group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Sweet Nest Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <span className="font-playfair text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
              Sweet Nest
            </span>
          </Link>
          <p className="text-stone-500 text-xs">Unlock your luxury retreat reservation</p>
        </div>

        {/* Card Frame */}
        <div className="bg-white border border-stone-200/60 p-8 rounded-3xl shadow-xl space-y-6">
          
          {success ? (
            <div className="text-center py-8 space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="font-playfair text-xl font-bold text-stone-900">Welcome To The Nest!</h2>
                <p className="text-stone-500 text-xs">Your traveler account was successfully created.</p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-stone-400 font-medium pt-2">
                <div className="w-4 h-4 border border-stone-400 border-t-transparent rounded-full animate-spin" />
                <span>Entering personal dashboard...</span>
              </div>
            </div>
          ) : step === 'details' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-playfair text-xl font-bold text-stone-900">Create Account</h2>
                <p className="text-stone-400 text-xs">Register to start booking luxury suites</p>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200/40 rounded-xl p-3 text-rose-700 text-xs font-semibold">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your legal name"
                    className="input-field pl-9"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-stone-50 border border-r-0 border-stone-200 rounded-l-xl text-stone-600 text-sm font-semibold">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="input-field pl-9 rounded-l-none w-full"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer pt-1">
                <input type="checkbox" className="w-4 h-4 rounded border-stone-200 accent-amber-700 mt-0.5" required />
                <span className="leading-normal">I agree to the Sweet Nest terms of stay &amp; rental policies.</span>
              </label>

              <button
                type="submit"
                disabled={loading || !name.trim() || phone.length !== 10}
                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-stone-500 text-xs">
                  Already have an account?{' '}
                  <Link href="/login" className="text-amber-800 hover:text-amber-900 font-bold transition-colors">
                    Login
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <button
                type="button"
                onClick={() => { setStep('details'); setOtp(''); setError(''); }}
                className="flex items-center gap-1.5 text-stone-500 hover:text-amber-800 text-xs font-bold transition-colors"
              >
                <ArrowLeft size={14} /> Back to details
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 text-amber-700">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="font-playfair text-base font-bold text-stone-900">Verify Number</h2>
                  <p className="text-stone-400 text-xs">OTP sent to +91 {phone}</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200/40 rounded-xl p-3 text-rose-700 text-xs font-semibold">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">6-Digit Verification Code</label>
                <input
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="input-field text-center text-xl tracking-[0.6em] font-mono w-full py-3"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify &amp; Create Account</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className="text-amber-800 hover:text-amber-900 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Request new code in ${resendTimer}s` : 'Resend Verification Code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
