import type { Metadata } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import '../styles/print.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Color Testing for Drug and Psychoactive Substance Detection | اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية',
    template: '%s | Color Testing System',
  },
  description: 'Advanced color testing system for drug and psychoactive substance detection using chemical reagents. نظام متقدم لاختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية باستخدام الكواشف الكيميائية.',
  keywords: [
    'drug testing',
    'color testing',
    'chemical analysis',
    'forensic science',
    'اختبارات المخدرات',
    'اختبارات الألوان',
    'التحليل الكيميائي',
    'العلوم الجنائية',
  ],
  authors: [
    { name: 'Mohammed Nafa Al-Ruwaili' },
    { name: 'Youssef Musayyir Al-Anzi' },
  ],
  creator: 'Mohammed Nafa Al-Ruwaili & Youssef Musayyir Al-Anzi',
  publisher: 'Color Testing System',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
    title: 'Color Testing for Drug Detection | اختبارات الألوان للكشف عن المخدرات',
    description: 'Advanced color testing system for drug detection using chemical reagents.',
    siteName: 'Color Testing System',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Color Testing System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Testing for Drug Detection',
    description: 'Advanced color testing system for drug detection using chemical reagents.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Colors */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />

        {/* Apple Mobile Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Color Testing | اختبارات الألوان" />

        {/* Mobile Web App */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Color Testing" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileImage" content="/icon-512.svg" />

        {/* Additional PWA Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${notoSansArabic.variable} font-arabic antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div id="root">
            {children}
          </div>
          <div id="modal-root" />
          <div id="toast-root" />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
