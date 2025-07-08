'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface EmergencyAccessProps {
  lang: Language;
  onEmergencyAccess: () => void;
}

export function EmergencyAccess({ lang, onEmergencyAccess }: EmergencyAccessProps) {
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const isRTL = lang === 'ar';

  const emergencyCodes = [
    'EMERGENCY_ADMIN_2025',
    'COLORTEST_BYPASS',
    'ADMIN_RECOVERY_KEY'
  ];

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emergencyCodes.includes(emergencyCode)) {
      console.log('🚨 Emergency access granted');
      onEmergencyAccess();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        setShowEmergency(false);
      }
    }
  };

  if (!showEmergency) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {isRTL ? 'مشاكل في الوصول؟' : 'Access Issues?'}
          </h3>
        </div>
        
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
          {isRTL 
            ? 'إذا كنت تواجه مشاكل في تسجيل الدخول، يمكنك استخدام الوصول الطارئ'
            : 'If you\'re having login issues, you can use emergency access'
          }
        </p>

        <div className="space-y-2 text-xs text-yellow-600 dark:text-yellow-400 mb-4">
          <p>• {isRTL ? 'جرب كلمات المرور: admin123, ColorTest2025!Admin, AdminAccess2025' : 'Try passwords: admin123, ColorTest2025!Admin, AdminAccess2025'}</p>
          <p>• {isRTL ? 'تحقق من وحدة التحكم للحصول على رمز الاستعادة' : 'Check browser console for recovery code'}</p>
          <p>• {isRTL ? 'استخدم أدوات المطور (F12) للتشخيص' : 'Use developer tools (F12) for debugging'}</p>
        </div>
        
        <Button
          onClick={() => setShowEmergency(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <KeyIcon className="h-4 w-4 mr-2" />
          {isRTL ? 'الوصول الطارئ' : 'Emergency Access'}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
        <ShieldCheckIcon className="h-5 w-5 text-red-600" />
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
          {isRTL ? 'الوصول الطارئ للمدير' : 'Emergency Admin Access'}
        </h3>
      </div>

      <form onSubmit={handleEmergencySubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            {isRTL ? 'رمز الطوارئ' : 'Emergency Code'}
          </label>
          <input
            type="password"
            value={emergencyCode}
            onChange={(e) => setEmergencyCode(e.target.value)}
            placeholder={isRTL ? 'أدخل رمز الطوارئ' : 'Enter emergency code'}
            className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-red-600"
          />
        </div>

        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={!emergencyCode.trim()}
          >
            {isRTL ? 'تأكيد' : 'Confirm'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowEmergency(false)}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>

        {attempts > 0 && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {isRTL 
              ? `محاولات خاطئة: ${attempts}/3`
              : `Failed attempts: ${attempts}/3`
            }
          </p>
        )}
      </form>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">
          {isRTL ? 'للمطورين:' : 'For Developers:'}
        </p>
        <p>• {isRTL ? 'تحقق من localStorage للحصول على debug_recovery_code' : 'Check localStorage for debug_recovery_code'}</p>
        <p>• {isRTL ? 'استخدم وحدة التحكم للحصول على معلومات التشخيص' : 'Use console for debugging information'}</p>
        <p>• {isRTL ? 'رموز الطوارئ متاحة في الكود المصدري' : 'Emergency codes available in source code'}</p>
      </div>
    </div>
  );
}
