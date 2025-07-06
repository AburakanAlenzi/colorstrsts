import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "Color Testing for Drug Detection | اختبارات الألوان للكشف عن المخدرات",
    short_name: "Color Testing | اختبارات الألوان",
    description: "Advanced color testing system for drug and psychoactive substance detection using chemical reagents | نظام متقدم لاختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#3B82F6",
    orientation: "portrait-primary",
    scope: "/",
    lang: "ar",
    dir: "rtl",
    categories: ["medical", "education", "science", "utilities"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "any"
      }
    ],
    shortcuts: [
      {
        name: "Quick Test | اختبار سريع",
        short_name: "Test | اختبار",
        description: "Start a quick color test | بدء اختبار سريع للألوان",
        url: "/ar/tests",
        icons: [
          {
            src: "/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          }
        ]
      },
      {
        name: "Results | النتائج",
        short_name: "Results | النتائج",
        description: "View test results | عرض نتائج الاختبارات",
        url: "/ar/results",
        icons: [
          {
            src: "/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          }
        ]
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
