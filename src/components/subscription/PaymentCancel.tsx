'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  XCircleIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  RefreshCcwIcon
} from '@heroicons/react/24/outline';

interface PaymentCancelProps {
  lang: Language;
}

export function PaymentCancel({ lang }: PaymentCancelProps) {
  const router = useRouter();
  const isRTL = lang === 'ar';

  useEffect(() => {
    // مسح البيانات المؤقتة عند الإلغاء
    localStorage.removeItem('pending_subscription');
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-background dark:to-red-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {isRTL ? 'تم إلغاء الدفع' : 'Payment Cancelled'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isRTL 
                ? 'لم تكتمل عملية الدفع. لا توجد رسوم على حسابك'
                : 'The payment process was not completed. No charges have been made to your account'
              }
            </p>
          </div>

          {/* Information Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <CreditCardIcon className="h-5 w-5 text-gray-600" />
                <span>{isRTL ? 'ماذا حدث؟' : 'What happened?'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'تم إلغاء عملية الدفع قبل اكتمالها'
                      : 'The payment process was cancelled before completion'
                    }
                  </p>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'لم يتم خصم أي مبلغ من حسابك'
                      : 'No amount has been deducted from your account'
                    }
                  </p>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'يمكنك المحاولة مرة أخرى في أي وقت'
                      : 'You can try again at any time'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Possible Reasons */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {isRTL ? 'أسباب محتملة للإلغاء' : 'Possible reasons for cancellation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'ضغطت على زر "إلغاء" أو "رجوع" في صفحة الدفع'
                      : 'You clicked "Cancel" or "Back" on the payment page'
                    }
                  </p>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'انتهت مهلة الجلسة (timeout)'
                      : 'The session timed out'
                    }
                  </p>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'مشكلة تقنية مؤقتة في نظام الدفع'
                      : 'Temporary technical issue with the payment system'
                    }
                  </p>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'إغلاق المتصفح أو فقدان الاتصال بالإنترنت'
                      : 'Browser closed or internet connection lost'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => router.push(`/${lang}/subscription`)}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <RefreshCcwIcon className="h-4 w-4" />
              <span>{isRTL ? 'المحاولة مرة أخرى' : 'Try Again'}</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/${lang}/dashboard`)}
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <ArrowLeftIcon className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              {isRTL ? 'تحتاج مساعدة؟' : 'Need help?'}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {isRTL 
                ? 'إذا كنت تواجه مشاكل متكررة في الدفع، يرجى التواصل مع فريق الدعم الفني'
                : 'If you are experiencing recurring payment issues, please contact our technical support team'
              }
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/${lang}/contact`)}
              className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
            >
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
