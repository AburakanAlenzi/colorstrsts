import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Try to serve the favicon.ico from public directory
    const faviconPath = join(process.cwd(), 'public', 'favicon.ico');
    const faviconBuffer = await readFile(faviconPath);

    return new NextResponse(faviconBuffer, {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    // Fallback: redirect to SVG favicon
    return NextResponse.redirect('/favicon.svg');
  }
}
