import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface SafetyPageProps {
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
    title: lang === 'ar' ? 'إرشادات السلامة' : 'Safety Guidelines',
    description: lang === 'ar' 
      ? 'إرشادات السلامة المهمة لاستخدام الكواشف الكيميائية في اختبارات الألوان'
      : 'Important safety guidelines for using chemical reagents in color testing',
  };
}

export default async function Safety({ params }: SafetyPageProps) {
  const { lang } = await params;

  const safetyRules = [
    {
      ar: 'استخدم القفازات المقاومة للمواد الكيميائية دائماً',
      en: 'Always use chemical-resistant gloves'
    },
    {
      ar: 'تأكد من التهوية الممتازة أو استخدم خزانة الأبخرة',
      en: 'Ensure excellent ventilation or use a fume hood'
    },
    {
      ar: 'لا تلمس الكواشف مباشرة - قد تسبب حروق شديدة',
      en: 'Do not touch reagents directly - may cause severe burns'
    },
    {
      ar: 'احتفظ بالكواشف بعيداً عن الأطفال والمواد القابلة للاشتعال',
      en: 'Keep reagents away from children and flammable materials'
    },
    {
      ar: 'اتبع إجراءات التخلص الآمن للنفايات الكيميائية',
      en: 'Follow safe disposal procedures for chemical waste'
    },
    {
      ar: 'هذه الاختبارات للمتخصصين المدربين فقط في بيئة مختبرية آمنة',
      en: 'These tests are for trained professionals only in a safe laboratory environment'
    }
  ];

  const emergencySteps = [
    {
      ar: 'في حالة ملامسة الجلد: اغسل فوراً بالماء البارد لمدة 15 دقيقة',
      en: 'In case of skin contact: Immediately wash with cold water for 15 minutes'
    },
    {
      ar: 'في حالة ملامسة العين: اغسل بالماء الجاري لمدة 15 دقيقة واطلب المساعدة الطبية',
      en: 'In case of eye contact: Rinse with running water for 15 minutes and seek medical help'
    },
    {
      ar: 'في حالة الاستنشاق: انتقل إلى الهواء الطلق فوراً',
      en: 'In case of inhalation: Move to fresh air immediately'
    },
    {
      ar: 'في حالة البلع: لا تحفز القيء واطلب المساعدة الطبية فوراً',
      en: 'In case of ingestion: Do not induce vomiting and seek medical help immediately'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {lang === 'ar' ? 'إرشادات السلامة' : 'Safety Guidelines'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {lang === 'ar' 
                ? 'تعليمات السلامة الحرجة للعمل مع الكواشف الكيميائية'
                : 'Critical safety instructions for working with chemical reagents'
              }
            </p>
          </div>

          {/* Critical Warning */}
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
                  {lang === 'ar' ? 'تحذير هام' : 'Important Warning'}
                </h2>
                <p className="text-red-700 dark:text-red-300">
                  {lang === 'ar' 
                    ? 'هذا النظام مخصص للمتخصصين المدربين فقط. الكواشف الكيميائية خطيرة ويجب التعامل معها بحذر شديد في بيئة مختبرية مناسبة.'
                    : 'This system is for trained professionals only. Chemical reagents are dangerous and must be handled with extreme caution in an appropriate laboratory environment.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Safety Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-foreground">
                {lang === 'ar' ? 'قواعد السلامة الأساسية' : 'Basic Safety Rules'}
              </h2>
            </div>
            <div className="space-y-4">
              {safetyRules.map((rule, index) => (
                <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {lang === 'ar' ? rule.ar : rule.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Procedures */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-foreground">
                {lang === 'ar' ? 'إجراءات الطوارئ' : 'Emergency Procedures'}
              </h2>
            </div>
            <div className="space-y-4">
              {emergencySteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 text-sm font-bold">!</span>
                  </div>
                  <p className="text-muted-foreground">
                    {lang === 'ar' ? step.ar : step.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {lang === 'ar' ? 'المعدات المطلوبة' : 'Required Equipment'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {lang === 'ar' ? 'معدات الحماية الشخصية' : 'Personal Protective Equipment'}
                </h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {lang === 'ar' ? 'قفازات مقاومة للكيماويات' : 'Chemical-resistant gloves'}</li>
                  <li>• {lang === 'ar' ? 'نظارات واقية' : 'Safety goggles'}</li>
                  <li>• {lang === 'ar' ? 'معطف المختبر' : 'Lab coat'}</li>
                  <li>• {lang === 'ar' ? 'حذاء مغلق' : 'Closed-toe shoes'}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {lang === 'ar' ? 'معدات المختبر' : 'Laboratory Equipment'}
                </h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {lang === 'ar' ? 'خزانة الأبخرة' : 'Fume hood'}</li>
                  <li>• {lang === 'ar' ? 'غسالة عيون طوارئ' : 'Emergency eyewash station'}</li>
                  <li>• {lang === 'ar' ? 'دش أمان' : 'Safety shower'}</li>
                  <li>• {lang === 'ar' ? 'طفاية حريق' : 'Fire extinguisher'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
