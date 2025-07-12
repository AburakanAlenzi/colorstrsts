'use client';

import React, { Suspense } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Lazy load the actual component to avoid SSR issues
const SubscriptionSettings = React.lazy(() => import('./SubscriptionSettings'));

interface SubscriptionSettingsWrapperProps {
  lang: Language;
}

// Loading component
function SubscriptionSettingsLoading({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error boundary component
class SubscriptionSettingsErrorBoundary extends React.Component<
  { children: React.ReactNode; isRTL: boolean },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; isRTL: boolean }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SubscriptionSettings Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                {this.props.isRTL 
                  ? 'خطأ في تحميل إعدادات الاشتراكات' 
                  : 'Error loading subscription settings'
                }
              </p>
              <p className="text-sm text-gray-600">
                {this.props.isRTL 
                  ? 'يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً' 
                  : 'Please refresh the page or try again later'
                }
              </p>
              {this.state.error && (
                <details className="text-xs">
                  <summary>
                    {this.props.isRTL ? 'تفاصيل الخطأ' : 'Error details'}
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default function SubscriptionSettingsWrapper({ lang }: SubscriptionSettingsWrapperProps) {
  const isRTL = lang === 'ar';

  return (
    <SubscriptionSettingsErrorBoundary isRTL={isRTL}>
      <Suspense fallback={<SubscriptionSettingsLoading isRTL={isRTL} />}>
        <SubscriptionSettings lang={lang} />
      </Suspense>
    </SubscriptionSettingsErrorBoundary>
  );
}
