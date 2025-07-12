'use client';

import React from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Import AdminDashboard directly to avoid prop passing issues
import { AdminDashboard } from './admin-dashboard';

interface AdminDashboardWrapperProps {
  lang: Language;
}

// Loading component
function AdminDashboardLoading({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 flex-shrink-0" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Error boundary component
class AdminDashboardErrorBoundary extends React.Component<
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
    console.error('AdminDashboard Error:', error, errorInfo);
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
                  ? 'خطأ في تحميل لوحة التحكم' 
                  : 'Error loading admin dashboard'
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

export default function AdminDashboardWrapper({ lang }: AdminDashboardWrapperProps) {
  // Provide fallback for lang if undefined
  const safeLang = lang || 'en';
  const isRTL = safeLang === 'ar';

  // Add safety check for lang prop with better error handling
  if (!lang) {
    console.error('AdminDashboardWrapper: lang prop is undefined, using fallback');

    // Try to get lang from URL or localStorage as fallback
    let fallbackLang: Language = 'en';

    if (typeof window !== 'undefined') {
      // Try to get from URL
      const pathLang = window.location.pathname.split('/')[1];
      if (pathLang === 'ar' || pathLang === 'en') {
        fallbackLang = pathLang as Language;
      } else {
        // Try to get from localStorage
        const storedLang = localStorage.getItem('preferred_language');
        if (storedLang === 'ar' || storedLang === 'en') {
          fallbackLang = storedLang as Language;
        }
      }
    }

    // Use fallback lang instead of showing error
    return (
      <AdminDashboardErrorBoundary isRTL={fallbackLang === 'ar'}>
        <AdminDashboard lang={fallbackLang} />
      </AdminDashboardErrorBoundary>
    );
  }

  return (
    <AdminDashboardErrorBoundary isRTL={isRTL}>
      <AdminDashboard lang={safeLang} />
    </AdminDashboardErrorBoundary>
  );
}
