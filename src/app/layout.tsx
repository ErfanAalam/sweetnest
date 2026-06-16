import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';
import PWAProvider from '@/components/PWAProvider';
import { AuthProvider } from '@/lib/auth-context';

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  weight:   ['400', '500', '600', '700'],
});

const poppins = Poppins({
  subsets:  ['latin'],
  variable: '--font-poppins',
  weight:   ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title:           'Sweet Nest — Premium Apartment Booking',
  description:     'Book luxury 1 BHK apartments with seamless payment and KYC verification. Your perfect home away from home.',
  keywords:        ['apartment booking', 'luxury stay', 'short term rental', 'India'],
  manifest:        '/manifest.json',
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'default',
    title:           'Sweet Nest',
  },
  icons: {
    icon:  '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title:       'Sweet Nest — Premium Apartment Booking',
    description: 'Luxury 1 BHK stays with seamless booking, KYC, and secure payment.',
    type:        'website',
  },
};

export const viewport: Viewport = {
  themeColor:           '#b45309',
  width:                'device-width',
  initialScale:         1,
  maximumScale:         1,
  userScalable:         false,
  viewportFit:          'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable"       content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title"   content="Sweet Nest" />
        <meta name="msapplication-TileImage"      content="/logo.png" />
        <meta name="msapplication-TileColor"      content="#b45309" />
        <meta name="cryptomus" content="c69490bc" />
      </head>
      <body className="bg-[#FAFAF9] text-stone-900 antialiased">
        <AuthProvider>
          <PWAProvider>
            {children}
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
