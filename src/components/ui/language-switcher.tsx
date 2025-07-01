'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface LanguageSwitcherProps {
  currentLang: Language;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLang: Language) => {
    // Replace the language in the current path
    const segments = pathname.split('/');
    segments[1] = newLang; // Replace the language segment
    const newPath = segments.join('/');
    
    router.push(newPath);
  };

  const otherLang: Language = currentLang === 'ar' ? 'en' : 'ar';
  const otherLangLabel = currentLang === 'ar' ? 'EN' : 'ع';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLanguage(otherLang)}
      className="flex items-center space-x-1 rtl:space-x-reverse"
      title={currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <GlobeAltIcon className="h-4 w-4" />
      <span className="font-medium">{otherLangLabel}</span>
    </Button>
  );
}
