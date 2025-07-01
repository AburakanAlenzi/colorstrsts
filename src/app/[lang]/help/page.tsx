import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';

interface HelpPageProps {
  params: Promise<{
    lang: Language;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: lang === 'ar' ? 'المساعدة' : 'Help',
    description: lang === 'ar' 
      ? 'دليل المساعدة لاستخدام نظام اختبارات الألوان للكشف عن المخدرات'
      : 'Help guide for using the color testing system for drug detection',
  };
}

export default async function Help({ params }: HelpPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {lang === 'ar' ? 'المساعدة' : 'Help'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {lang === 'ar' 
                ? 'دليل شامل لاستخدام نظام اختبارات الألوان'
                : 'Comprehensive guide to using the color testing system'
              }
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'كيفية البدء' : 'Getting Started'}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {lang === 'ar' 
                    ? '1. اختر نوع الاختبار المناسب من صفحة الاختبارات'
                    : '1. Choose the appropriate test type from the tests page'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '2. اقرأ تعليمات السلامة بعناية'
                    : '2. Read the safety instructions carefully'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '3. اتبع خطوات الاختبار المحددة'
                    : '3. Follow the specified test steps'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '4. اختر اللون المُلاحظ بعد إضافة الكاشف'
                    : '4. Select the observed color after adding the reagent'
                  }
                </p>
                <p>
                  {lang === 'ar' 
                    ? '5. احفظ النتائج للمراجعة اللاحقة'
                    : '5. Save results for later review'
                  }
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {lang === 'ar' 
                      ? 'ما مدى دقة النتائج؟'
                      : 'How accurate are the results?'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === 'ar' 
                      ? 'النتائج تقديرية وتحتاج تأكيد مخبري متخصص للحصول على نتائج نهائية.'
                      : 'Results are preliminary and require specialized laboratory confirmation for final results.'
                    }
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {lang === 'ar' 
                      ? 'هل يمكنني استخدام النظام بدون خبرة مسبقة؟'
                      : 'Can I use the system without prior experience?'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === 'ar' 
                      ? 'هذا النظام مخصص للمتخصصين المدربين في بيئة مختبرية آمنة.'
                      : 'This system is designed for trained professionals in a safe laboratory environment.'
                    }
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {lang === 'ar' 
                      ? 'كيف أحفظ النتائج؟'
                      : 'How do I save results?'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === 'ar' 
                      ? 'انقر على زر "حفظ النتيجة" في صفحة النتائج، ويمكنك مراجعتها في صفحة النتائج.'
                      : 'Click the "Save Result" button on the results page, and you can review them in the results page.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'الدعم التقني' : 'Technical Support'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {lang === 'ar' 
                  ? 'إذا واجهت أي مشاكل تقنية، يرجى التواصل معنا:'
                  : 'If you encounter any technical issues, please contact us:'
                }
              </p>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong>
                    {lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                  </strong> mnalruwaili@moh.gov.sa
                </p>
                <p className="text-muted-foreground">
                  <strong>
                    {lang === 'ar' ? 'أو:' : 'Or:'}
                  </strong> Yalenzi@moh.gov.sa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
