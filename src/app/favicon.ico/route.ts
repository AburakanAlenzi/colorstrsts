import { NextResponse } from 'next/server';

export async function GET() {
  // Simple redirect to SVG favicon for static export
  return NextResponse.redirect(new URL('/favicon.svg', 'https://colortest2.netlify.app'));
}
