import { redirect } from 'next/navigation';

export default function RootPage() {
  // For static export, always redirect to English (default language)
  // Client-side language detection will be handled by the layout
  redirect('/en');
}
