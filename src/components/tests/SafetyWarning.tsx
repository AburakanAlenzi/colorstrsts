'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface SafetyWarningProps {
  safetyLevel: 'low' | 'medium' | 'high';
  isRTL?: boolean;
  testName?: string;
}

export default function SafetyWarning({ safetyLevel, isRTL = false, testName }: SafetyWarningProps) {
  const getSafetyConfig = () => {
    switch (safetyLevel) {
      case 'high':
        return {
          icon: ShieldExclamationIcon,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          title: isRTL ? 'تحذير أمان عالي الخطورة' : 'HIGH RISK SAFETY WARNING',
          warnings: isRTL ? [
            'هذا الاختبار للمهنيين المدربين فقط',
            'يتطلب بيئة مختبرية آمنة ومجهزة',
            'استخدم معدات الحماية الشخصية الكاملة',
            'تأكد من وجود تهوية مناسبة',
            'احتفظ بمواد الإسعافات الأولية جاهزة',
            'لا تقم بالاختبار بدون إشراف مختصين'
          ] : [
            'This test is for trained professionals only',
            'Requires safe, equipped laboratory environment',
            'Use complete personal protective equipment',
            'Ensure proper ventilation',
            'Keep first aid materials ready',
            'Do not perform without expert supervision'
          ]
        };
      case 'medium':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          title: isRTL ? 'تحذير أمان متوسط' : 'MEDIUM RISK SAFETY WARNING',
          warnings: isRTL ? [
            'استخدم معدات الحماية الأساسية',
            'تأكد من التهوية المناسبة',
            'اتبع إجراءات السلامة المعيارية',
            'احتفظ بمواد الإسعافات الأولية قريباً'
          ] : [
            'Use basic protective equipment',
            'Ensure adequate ventilation',
            'Follow standard safety procedures',
            'Keep first aid materials nearby'
          ]
        };
      case 'low':
      default:
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700',
          title: isRTL ? 'تحذير أمان أساسي' : 'BASIC SAFETY WARNING',
          warnings: isRTL ? [
            'استخدم النظارات الواقية',
            'تجنب ملامسة الجلد المباشرة',
            'اغسل اليدين بعد الاختبار',
            'احتفظ بالمواد بعيداً عن الأطفال'
          ] : [
            'Use safety glasses',
            'Avoid direct skin contact',
            'Wash hands after testing',
            'Keep materials away from children'
          ]
        };
    }
  };

  const config = getSafetyConfig();
  const IconComponent = config.icon;

  return (
    <Alert className={`${config.bgColor} border-l-4 mb-4`}>
      <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
      <AlertTitle className={`${config.titleColor} font-bold text-right`}>
        <div className="flex items-center justify-between">
          <span className="text-sm">{config.title}</span>
          {testName && (
            <span className="text-xs opacity-75">
              {isRTL ? `اختبار: ${testName}` : `Test: ${testName}`}
            </span>
          )}
        </div>
      </AlertTitle>
      <AlertDescription className={`${config.textColor} mt-2`}>
        <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
          <ul className={`space-y-1 ${isRTL ? 'list-none' : 'list-disc list-inside'}`}>
            {config.warnings.map((warning, index) => (
              <li key={index} className="text-sm">
                {isRTL && '• '}{warning}
              </li>
            ))}
          </ul>
        </div>
        
        {safetyLevel === 'high' && (
          <div className={`mt-3 p-3 bg-red-100 rounded-md ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-red-800 font-semibold text-sm">
              {isRTL 
                ? '⚠️ تحذير خاص: يحتوي هذا الاختبار على مواد كيميائية خطيرة مثل الكلوروفورم. لا تقم بالتنفيذ إلا في مختبر مرخص.'
                : '⚠️ SPECIAL WARNING: This test contains hazardous chemicals like chloroform. Only perform in licensed laboratory.'
              }
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
