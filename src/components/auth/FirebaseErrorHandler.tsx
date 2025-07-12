'use client';

import React from 'react';
import { AlertCircle, ExternalLink, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface FirebaseErrorHandlerProps {
  error: any;
  onRetry?: () => void;
}

export default function FirebaseErrorHandler({ error, onRetry }: FirebaseErrorHandlerProps) {
  const getErrorInfo = (error: any) => {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    // Domain authorization error
    if (errorCode.includes('auth/unauthorized-domain') || 
        errorMessage.includes('not authorized') ||
        errorMessage.includes('domain')) {
      return {
        title: 'خطأ في تصريح النطاق',
        titleEn: 'Domain Authorization Error',
        description: 'النطاق الحالي غير مصرح له في إعدادات Firebase Authentication',
        descriptionEn: 'Current domain is not authorized in Firebase Authentication settings',
        solution: 'يجب إضافة النطاق الحالي إلى قائمة النطاقات المصرح بها في Firebase Console',
        solutionEn: 'Add current domain to authorized domains list in Firebase Console',
        actionUrl: 'https://console.firebase.google.com/project/colorstests-573ef/authentication/settings',
        actionText: 'فتح Firebase Console',
        actionTextEn: 'Open Firebase Console',
        type: 'domain'
      };
    }

    // Permission denied error
    if (errorCode.includes('permission-denied')) {
      return {
        title: 'خطأ في الأذونات',
        titleEn: 'Permission Denied Error',
        description: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        descriptionEn: 'You do not have permission to access this resource',
        solution: 'تحقق من قواعد Firestore أو تسجيل الدخول مرة أخرى',
        solutionEn: 'Check Firestore rules or sign in again',
        actionUrl: null,
        actionText: 'إعادة المحاولة',
        actionTextEn: 'Retry',
        type: 'permission'
      };
    }

    // Network error
    if (errorCode.includes('network') || errorMessage.includes('network')) {
      return {
        title: 'خطأ في الشبكة',
        titleEn: 'Network Error',
        description: 'مشكلة في الاتصال بالإنترنت أو خوادم Firebase',
        descriptionEn: 'Internet connection or Firebase servers issue',
        solution: 'تحقق من اتصال الإنترنت وأعد المحاولة',
        solutionEn: 'Check internet connection and try again',
        actionUrl: null,
        actionText: 'إعادة المحاولة',
        actionTextEn: 'Retry',
        type: 'network'
      };
    }

    // Generic error
    return {
      title: 'خطأ في Firebase',
      titleEn: 'Firebase Error',
      description: errorMessage || 'حدث خطأ غير متوقع',
      descriptionEn: errorMessage || 'An unexpected error occurred',
      solution: 'جرب إعادة تحميل الصفحة أو المحاولة مرة أخرى',
      solutionEn: 'Try refreshing the page or try again',
      actionUrl: null,
      actionText: 'إعادة المحاولة',
      actionTextEn: 'Retry',
      type: 'generic'
    };
  };

  const errorInfo = getErrorInfo(error);

  const handleAction = () => {
    if (errorInfo.actionUrl) {
      window.open(errorInfo.actionUrl, '_blank');
    } else if (onRetry) {
      onRetry();
    }
  };

  const getIconColor = () => {
    switch (errorInfo.type) {
      case 'domain':
        return 'text-orange-500';
      case 'permission':
        return 'text-red-500';
      case 'network':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Alert className="border-l-4 border-l-red-500 bg-red-50">
      <AlertCircle className={`h-4 w-4 ${getIconColor()}`} />
      <AlertTitle className="text-right">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{errorInfo.titleEn}</span>
          <span className="font-semibold">{errorInfo.title}</span>
        </div>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        {/* Error Description */}
        <div className="text-right">
          <p className="text-gray-700 mb-1">{errorInfo.description}</p>
          <p className="text-sm text-gray-500">{errorInfo.descriptionEn}</p>
        </div>

        {/* Solution */}
        <div className="bg-blue-50 p-3 rounded-md text-right">
          <p className="text-blue-800 mb-1">
            <strong>الحل:</strong> {errorInfo.solution}
          </p>
          <p className="text-sm text-blue-600">
            <strong>Solution:</strong> {errorInfo.solutionEn}
          </p>
        </div>

        {/* Domain-specific instructions */}
        {errorInfo.type === 'domain' && (
          <div className="bg-yellow-50 p-3 rounded-md text-right">
            <h4 className="font-semibold text-yellow-800 mb-2">خطوات الإصلاح:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>افتح Firebase Console</li>
              <li>اذهب إلى Authentication → Settings → Authorized domains</li>
              <li>أضف النطاق الحالي: <code className="bg-yellow-200 px-1 rounded">{window.location.origin}</code></li>
              <li>احفظ التغييرات وانتظر بضع دقائق</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          {errorInfo.actionUrl && (
            <Button
              onClick={handleAction}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {errorInfo.actionText}
            </Button>
          )}
          
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {errorInfo.actionText}
            </Button>
          )}
        </div>

        {/* Technical Details (Collapsible) */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            عرض التفاصيل التقنية / Show Technical Details
          </summary>
          <div className="mt-2 p-2 bg-gray-100 rounded text-left font-mono">
            <p><strong>Error Code:</strong> {error?.code || 'N/A'}</p>
            <p><strong>Error Message:</strong> {error?.message || 'N/A'}</p>
            <p><strong>Current Domain:</strong> {window.location.origin}</p>
          </div>
        </details>
      </AlertDescription>
    </Alert>
  );
}
