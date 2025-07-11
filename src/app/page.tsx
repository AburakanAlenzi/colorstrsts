import { RootAuthRedirect } from '@/components/auth/RootAuthRedirect';

export default function RootPage() {
  // Handle authentication-based routing with language detection
  return <RootAuthRedirect defaultLang="en" />;
}
