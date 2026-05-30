'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Shield,
  CreditCard,
  Calendar,
  CheckCircle,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Tv,
  ChevronRight,
  Users,
  Menu,
  X,
  Lock,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Download,
  Share,
  Smartphone,
} from 'lucide-react';
import { usePWA } from '@/components/PWAProvider';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard } from 'lucide-react';

/* ── PWA install button — platform-aware ── */
function PWALandingButton() {
  const { canInstall, isIOS, isInstalled, installPrompt } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
        <CheckCircle size={16} />
        <span>App installed ✓</span>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
        <CheckCircle size={16} />
        <span>Successfully installed!</span>
      </div>
    );
  }

  if (canInstall) {
    return (
      <button
        onClick={async () => {
          setInstalling(true);
          await installPrompt();
          setInstalling(false);
          setDone(true);
        }}
        disabled={installing}
        className="inline-flex items-center gap-2.5 bg-white text-stone-900 hover:bg-amber-50 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
      >
        <Download size={17} className="text-amber-700" />
        {installing ? 'Installing…' : 'Install App'}
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className="text-center space-y-2">
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider">iPhone / iPad</p>
        <div className="space-y-1.5 text-left">
          {[
            <><Share size={12} className="inline" /> Tap <strong>Share</strong> in Safari</>,
            <><ChevronRight size={12} className="inline" /> Tap <strong>"Add to Home Screen"</strong></>,
            <><Smartphone size={12} className="inline" /> Tap <strong>"Add"</strong></>,
          ].map((step, i) => (
            <p key={i} className="text-xs text-stone-300 flex items-center gap-1.5">
              <span className="w-4 h-4 bg-amber-700 text-white rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  // Nothing to show yet (prompt not ready)
  return (
    <p className="text-xs text-stone-500 max-w-[180px] text-center leading-relaxed">
      Open this page in Chrome or Safari to install the app.
    </p>
  );
}

export default function LandingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthed = !authLoading && !!user;
  const homeHref = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Where is Sweet Nest located?',
      a: 'Sweet Nest is located in a prime, secure luxury residential locality in Mumbai, India, offering excellent connectivity to key business districts and high-end shopping hubs.',
    },
    {
      q: 'What are the check-in and check-out timings?',
      a: 'Standard check-in is at 2:00 PM and check-out is at 11:00 AM. We offer flexible check-in and check-out options based on availability.',
    },
    {
      q: 'Is ID verification (KYC) mandatory?',
      a: 'Yes, as per Indian hospitality and local government guidelines, a valid government-approved ID (Aadhaar, PAN, Passport, or Driving License) is mandatory for all staying guests prior to check-in.',
    },
    {
      q: 'How does the secure payment work?',
      a: 'We integrate with Cashfree, one of India’s leading and most secure payment gateways. You can pay via UPI, Credit/Debit cards, or Netbanking with instant confirmation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-poppins selection:bg-amber-100 selection:text-amber-950 antialiased">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-stone-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/20 shadow-md transition-transform duration-300 group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Sweet Nest Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <span className="font-playfair text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
              Sweet Nest
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-stone-600 text-sm font-medium">
            <a href="#about" className="hover:text-amber-700 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-700 hover:after:w-full after:transition-all">About</a>
            <a href="#gallery" className="hover:text-amber-700 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-700 hover:after:w-full after:transition-all">Gallery</a>
            <a href="#amenities" className="hover:text-amber-700 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-700 hover:after:w-full after:transition-all">Amenities</a>
            <a href="#pricing" className="hover:text-amber-700 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-700 hover:after:w-full after:transition-all">Pricing</a>
            <a href="#faq" className="hover:text-amber-700 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-700 hover:after:w-full after:transition-all">FAQs</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthed ? (
              <Link href={homeHref} className="btn-primary px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800 shadow-md hover:shadow-lg text-white font-semibold transition-all flex items-center gap-2">
                <LayoutDashboard size={16} /> My Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2 text-sm font-semibold text-stone-700 hover:text-amber-800 transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800 shadow-md hover:shadow-lg text-white font-semibold transition-all">
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 px-6 py-6 space-y-4 animate-fade-in shadow-xl">
            <a href="#about" className="block text-stone-600 font-medium py-2 hover:text-amber-700 transition-colors border-b border-stone-50" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#gallery" className="block text-stone-600 font-medium py-2 hover:text-amber-700 transition-colors border-b border-stone-50" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
            <a href="#amenities" className="block text-stone-600 font-medium py-2 hover:text-amber-700 transition-colors border-b border-stone-50" onClick={() => setMobileMenuOpen(false)}>Amenities</a>
            <a href="#pricing" className="block text-stone-600 font-medium py-2 hover:text-amber-700 transition-colors border-b border-stone-50" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="block text-stone-600 font-medium py-2 hover:text-amber-700 transition-colors border-b border-stone-50" onClick={() => setMobileMenuOpen(false)}>FAQs</a>
            <div className="flex gap-4 pt-4">
              {isAuthed ? (
                <Link href={homeHref} className="btn-primary flex-1 text-center py-2.5 rounded-full" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary flex-1 text-center py-2.5 rounded-full" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link href="/signup" className="btn-primary flex-1 text-center py-2.5 rounded-full" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/50 rounded-full text-amber-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-600" />
              <span>Feel At Home, Anywhere</span>
            </div>

            <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-[1.1] text-stone-900">
              Luxury Living
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900">
                Redefined.
              </span>
            </h1>

            <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-xl">
              Experience the perfect blend of premium hospitality, elite modern design, and 
              seamless smart-booking inside our meticulously curated 1 BHK luxury apartments.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-500 fill-amber-500" />
                ))}
                <span className="text-stone-700 text-sm font-semibold ml-1">4.9/5 Rating</span>
              </div>
              <div className="h-4 w-[1px] bg-stone-300" />
              <div className="flex items-center gap-2 text-stone-600 text-sm">
                <MapPin size={16} className="text-amber-700" />
                <span>Prime Location, Mumbai</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/signup" className="btn-primary px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800 text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                Reserve Your Stay <ArrowRight size={18} />
              </Link>
              <a href="#about" className="btn-secondary px-8 py-3.5 rounded-full border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold transition-all">
                Explore Property
              </a>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-md border border-stone-200/60 p-5 rounded-2xl shadow-xl space-y-5 hover:shadow-2xl transition-all duration-300">
              
              {/* Premium image placeholder with next/image */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner bg-stone-100">
                <Image 
                  src="/property-hero.png" 
                  alt="Sweet Nest Living Area" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-w-768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-md animate-pulse">
                  Available Now
                </div>
              </div>

              {/* Specs & Pricing Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3">
                  <p className="text-amber-800 font-bold text-lg font-playfair">₹5,000</p>
                  <p className="text-stone-500 text-xs mt-0.5">Per Night</p>
                </div>
                <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3">
                  <p className="text-stone-900 font-semibold text-sm">Premium 1 BHK</p>
                  <p className="text-stone-500 text-xs mt-0.5">500 sq ft Space</p>
                </div>
              </div>

              <Link href="/signup" className="block w-full text-center btn-primary py-3 rounded-full bg-stone-900 text-white hover:bg-stone-850 font-semibold shadow-md transition-all">
                Check Instant Availability
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-white border-y border-stone-100 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="section-tag">Curated Stays</span>
            <h2 className="heading-2 text-3xl md:text-4xl font-bold">Why Stay At Sweet Nest?</h2>
            <p className="text-stone-600 text-sm md:text-base">
              A thoughtfully designed premium apartment that blends five-star hotel comfort with 
              the warmth and ease of your own home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield size={28} className="text-amber-700" />,
                title: 'Instant KYC Verification',
                desc: 'Upload your ID securely and get approved instantly. Easy compliance with local guidelines.',
              },
              {
                icon: <Sparkles size={28} className="text-amber-700" />,
                title: 'High-End Premium Styling',
                desc: 'Curated golden palettes, high-speed WiFi, plush furnishings, and modern ambient lighting.',
              },
              {
                icon: <CreditCard size={28} className="text-amber-700" />,
                title: 'Secure Checkout',
                desc: 'Cashfree-powered safe transactions with multiple payment modes including UPI and Netbanking.',
              },
            ].map((benefit, idx) => (
              <div 
                key={idx} 
                className="bg-[#FDFBF7] border border-stone-200/60 p-8 rounded-2xl space-y-4 hover:border-amber-500/30 hover:shadow-md transition-all duration-350"
              >
                <div className="p-3 bg-amber-50 rounded-xl w-fit">{benefit.icon}</div>
                <h3 className="font-playfair text-lg font-bold text-stone-900">{benefit.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="section-tag">Visual Tour</span>
            <h2 className="heading-2 text-3xl md:text-4xl font-bold">Inside The Apartment</h2>
            <p className="text-stone-600 text-sm md:text-base">
              Take a walk through our luxury spaces, designed for ultimate relaxation and productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative group overflow-hidden rounded-2xl shadow-lg aspect-[16/10]">
              <Image 
                src="/property-living.png" 
                alt="Sweet Nest Living Room Sunset View" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-w-768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                  <h4 className="font-playfair text-lg font-bold">Living Room Skyline</h4>
                  <p className="text-xs text-stone-200">Stunning sunset views of the city</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-playfair text-2xl md:text-3xl font-bold text-stone-900 leading-snug">
                Designed for Discerning Travelers
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Whether you are visiting for business, a couples weekend, or solo exploration, 
                every detail has been fine-tuned to deliver comfort. Enjoy floor-to-ceiling panoramic 
                views, premium sound systems, and a fully functional state-of-the-art kitchen.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-700" />
                  <span className="text-xs font-semibold text-stone-700">Central AC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-700" />
                  <span className="text-xs font-semibold text-stone-700">Panoramic Windows</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-700" />
                  <span className="text-xs font-semibold text-stone-700">Premium Bedding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-700" />
                  <span className="text-xs font-semibold text-stone-700">Dedicated Desk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-24 px-6 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="section-tag">Modern Comforts</span>
            <h2 className="heading-2 text-3xl md:text-4xl font-bold">Premium Amenities Included</h2>
            <p className="text-stone-600 text-sm md:text-base">
              Everything you need for an exceptional and comfortable stay.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Wifi size={24} />, title: 'High-Speed WiFi', desc: '100+ Mbps Fiber connection' },
              { icon: <Car size={24} />, title: 'Private Parking', desc: 'Secure basement parking spot' },
              { icon: <Coffee size={24} />, title: 'Fully Equipped Kitchen', desc: 'Microwave, stove & cookware' },
              { icon: <Tv size={24} />, title: 'Smart Entertainment', desc: 'Netflix, Prime & premium audio' },
              { icon: <Shield size={24} />, title: '24/7 Gated Security', desc: 'CCTV & security personnel' },
              { icon: <Calendar size={24} />, title: 'Flexible Check-in', desc: 'Digital lock smart key' },
              { icon: <CheckCircle size={24} />, title: 'Daily Cleaning', desc: 'Professional housekeeping' },
              { icon: <Users size={24} />, title: 'Concierge Support', desc: 'Available 24/7 for you' },
            ].map((amenity, idx) => (
              <div 
                key={idx} 
                className="bg-[#FDFBF7] border border-stone-200/50 rounded-2xl p-6 text-center hover:border-amber-700/30 hover:shadow-md transition-all duration-300 space-y-3"
              >
                <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-800">
                  {amenity.icon}
                </div>
                <h4 className="font-semibold text-sm text-stone-900">{amenity.title}</h4>
                <p className="text-stone-500 text-xs">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Timeline */}
      <section className="py-24 px-6 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="section-tag">Seamless Flow</span>
            <h2 className="heading-2 text-3xl md:text-4xl font-bold">How To Book Your Nest</h2>
            <p className="text-stone-600 text-sm md:text-base">
              A highly streamlined and completely digitized booking process.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 text-center">
            {[
              { num: '01', title: 'Details', desc: 'Choose stay dates' },
              { num: '02', title: 'Terms', desc: 'Agree to rental terms' },
              { num: '03', title: 'Payment', desc: 'Secure checkout' },
              { num: '04', title: 'KYC', desc: 'Instant ID upload' },
              { num: '05', title: 'Stay', desc: 'Enjoy your clean nest' },
            ].map((step, idx) => (
              <div key={idx} className="bg-white border border-stone-200/50 p-6 rounded-2xl relative shadow-sm">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {step.num}
                </div>
                <h4 className="font-playfair text-base font-bold text-stone-950 mt-2">{step.title}</h4>
                <p className="text-stone-500 text-xs mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="section-tag">Transparent</span>
            <h2 className="heading-2 text-3xl md:text-4xl font-bold">Simple, Honest Pricing</h2>
            <p className="text-stone-600 text-sm">No hidden costs, taxes, or surprise booking charges.</p>
          </div>

          <div className="bg-[#FDFBF7] border border-stone-300/80 rounded-2xl p-8 max-w-lg mx-auto shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-bold tracking-wider px-4 py-1.5 rounded-bl-xl uppercase">
              All Inclusive
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-amber-800 font-playfair text-4xl md:text-5xl font-bold">₹5,000</p>
                <p className="text-stone-500 text-xs mt-1">Per Night · Tax Included</p>
              </div>

              <div className="h-[1px] bg-stone-200 w-full" />

              <div className="space-y-3 text-left">
                {[
                  'Full 1 BHK Private Stay',
                  'High-Speed WiFi & Secure Parking',
                  'Complementary Daily Housekeeping',
                  'Instant digital lock code generation',
                  'Fully automated KYC approvals',
                  '24/7 Gated security & Concierge access',
                ].map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-stone-700 text-sm">
                    <CheckCircle size={16} className="text-amber-700 flex-shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup" className="block w-full text-center btn-primary py-3.5 rounded-full bg-amber-850 hover:bg-amber-900 text-white font-semibold shadow-md transition-all">
                Reserve Your Stay Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#FDFBF7] border-t border-stone-100">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="section-tag">Clarifications</span>
            <h2 className="heading-2 text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="text-stone-600 text-sm">Everything you need to know about booking and stay.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-stone-200/60 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center font-semibold text-stone-900 text-sm md:text-base hover:bg-stone-50 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle size={18} className="text-amber-700 flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-stone-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-stone-600 text-xs md:text-sm leading-relaxed border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PWA Install Section ── */}
      <section className="py-20 px-6 bg-white border-t border-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 rounded-3xl overflow-hidden p-8 md:p-12 shadow-2xl">
            {/* Decorative glows */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">

              {/* App icon */}
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                  <Image src="/logo.png" alt="Sweet Nest App" fill className="object-cover" />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={11} /> Available as App
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white leading-snug">
                  Take Sweet Nest<br className="hidden md:block" /> Everywhere You Go
                </h2>
                <p className="text-stone-400 text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                  Install our app for instant access, push notifications before check-in, and a seamless booking experience — no app store needed.
                </p>

                {/* Feature chips */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                  {['⚡ Instant open','🔔 Push reminders','📴 Offline access','🏠 Home screen'].map(f => (
                    <span key={f} className="text-[10px] font-semibold bg-white/10 border border-white/10 text-stone-300 px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 text-center space-y-3">
                <PWALandingButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-300 py-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/40">
                <Image 
                  src="/logo.png" 
                  alt="Sweet Nest Logo" 
                  fill 
                  className="object-cover"
                />
              </div>
              <span className="font-playfair text-lg font-bold text-white tracking-tight">Sweet Nest</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Curating high-end, premium apartment stays across India’s best neighborhoods.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Quick Navigation</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <a href="#about" className="block hover:text-amber-400 transition-colors">About Stays</a>
              <a href="#gallery" className="block hover:text-amber-400 transition-colors">Gallery</a>
              <a href="#amenities" className="block hover:text-amber-400 transition-colors">Included Amenities</a>
              <a href="#pricing" className="block hover:text-amber-400 transition-colors">Transparent Pricing</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Security & Compliance</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <Link href="/terms" className="block hover:text-amber-400 transition-colors">Rental T&C</Link>
              <span className="block">Cashfree Secure Escrow</span>
              <span className="block">Govt Approved KYC Process</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Support Desk</h4>
            <div className="space-y-2 text-xs text-stone-400">
              <p>📍 Premium Locality, Mumbai, India</p>
              <p>✉️ support@sweetne.st</p>
              <p>🕒 Response within 15 minutes</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto h-[1px] bg-stone-800 my-10" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-stone-500 text-xs">
          <p>© 2026 Sweet Nest Stays. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Built with Premium Aesthetics</span>
            <span>·</span>
            <span>Secured with SSL Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
