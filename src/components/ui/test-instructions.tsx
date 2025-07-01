'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { DataService } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  ShieldCheckIcon,
  ClockIcon,
  BeakerIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TestInstruction {
  id: string;
  step: number;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  warning?: {
    ar: string;
    en: string;
  };
  icon: string;
  duration?: string;
}

interface TestInstructionsProps {
  testId: string;
  lang: Language;
  onComplete: () => void;
  onCancel: () => void;
}

export function TestInstructions({ testId, lang, onComplete, onCancel }: TestInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [testData, setTestData] = useState<any>(null);
  const [prepareSteps, setPrepareSteps] = useState<string[]>([]);
  const t = getTranslationsSync(lang);

  useEffect(() => {
    // Load test data
    const test = DataService.getChemicalTestById(testId);
    setTestData(test);

    if (test?.prepare) {
      // Parse prepare field into steps
      const steps = (lang === 'ar' ? test.prepare_ar || test.prepare : test.prepare)
        .split('\n')
        .filter(step => step.trim() !== '')
        .map(step => step.replace(/^\d+\.\s*/, '')); // Remove numbering
      setPrepareSteps(steps);
    }
  }, [testId, lang]);

  // Default instructions for all tests
  const defaultInstructions: TestInstruction[] = [
    {
      id: 'safety',
      step: 1,
      title: {
        ar: 'إجراءات السلامة والحماية',
        en: 'Safety and Protection Procedures'
      },
      description: {
        ar: 'ارتدِ القفازات المقاومة للمواد الكيميائية ونظارات الأمان الواقية. تأكد من وجود تهوية ممتازة في المكان وإبعاد المواد القابلة للاشتعال.',
        en: 'Wear chemical-resistant gloves and protective safety goggles. Ensure excellent ventilation and remove any flammable materials from the area.'
      },
      warning: {
        ar: 'خطر: لا تلمس الكواشف الكيميائية مباشرة - قد تسبب حروق كيميائية شديدة',
        en: 'DANGER: Never touch chemical reagents directly - may cause severe chemical burns'
      },
      icon: 'shield',
      duration: '3 min'
    },
    {
      id: 'preparation',
      step: 2,
      title: {
        ar: 'تحضير العينة والأدوات',
        en: 'Sample and Equipment Preparation'
      },
      description: {
        ar: 'ضع كمية صغيرة جداً من العينة (حجم حبة الأرز) على طبق خزفي أبيض نظيف. استخدم ملقط أو أداة معدنية نظيفة لنقل العينة.',
        en: 'Place a very small amount of sample (rice grain size) on a clean white ceramic plate. Use clean tweezers or metal tool to transfer the sample.'
      },
      warning: {
        ar: 'تجنب استخدام الأسطح البلاستيكية - قد تتفاعل مع الكواشف',
        en: 'Avoid plastic surfaces - they may react with reagents'
      },
      icon: 'beaker',
      duration: '2 min'
    },
    {
      id: 'reagent',
      step: 3,
      title: {
        ar: 'إضافة الكاشف الكيميائي',
        en: 'Add Chemical Reagent'
      },
      description: {
        ar: 'باستخدام قطارة زجاجية نظيفة، أضف قطرة واحدة فقط من الكاشف على العينة. أمسك القطارة بزاوية 45 درجة وأضف القطرة ببطء.',
        en: 'Using a clean glass dropper, add exactly one drop of reagent to the sample. Hold the dropper at 45-degree angle and add the drop slowly.'
      },
      warning: {
        ar: 'تحذير: لا تضع أكثر من قطرة واحدة - قد يؤثر على دقة النتائج',
        en: 'WARNING: Do not add more than one drop - may affect result accuracy'
      },
      icon: 'eye',
      duration: '1 min'
    },
    {
      id: 'observation',
      step: 4,
      title: {
        ar: 'مراقبة وتسجيل التفاعل',
        en: 'Observe and Record Reaction'
      },
      description: {
        ar: 'راقب تغير اللون فوراً بعد إضافة الكاشف. سجل اللون الأولي الذي يظهر خلال أول 15-30 ثانية. لا تنتظر أكثر من دقيقة واحدة.',
        en: 'Observe color change immediately after adding reagent. Record the initial color that appears within the first 15-30 seconds. Do not wait more than one minute.'
      },
      warning: {
        ar: 'مهم: اللون الأولي هو الأكثر دقة - التغيرات اللاحقة قد تكون مضللة',
        en: 'IMPORTANT: Initial color is most accurate - later changes may be misleading'
      },
      icon: 'clock',
      duration: '1 min'
    },
    {
      id: 'cleanup',
      step: 5,
      title: {
        ar: 'التنظيف والتخلص الآمن',
        en: 'Safe Cleanup and Disposal'
      },
      description: {
        ar: 'اتركي العينة والكاشف يجفان تماماً، ثم تخلص منهما في حاوية النفايات الكيميائية المخصصة. اغسل جميع الأدوات بالماء والصابون، ثم اغسل يديك جيداً.',
        en: 'Allow sample and reagent to dry completely, then dispose in designated chemical waste container. Wash all tools with soap and water, then wash hands thoroughly.'
      },
      warning: {
        ar: 'ممنوع: لا تتخلص من الكواشف في المجاري أو سلة المهملات العادية',
        en: 'PROHIBITED: Never dispose of reagents in drains or regular trash'
      },
      icon: 'check',
      duration: '3 min'
    }
  ];

  // Generate instructions based on test data
  const generateInstructions = (): TestInstruction[] => {
    if (!testData || prepareSteps.length === 0) {
      // Return default instructions if no specific prepare data
      return defaultInstructions;
    }

    const instructions: TestInstruction[] = [];

    // Add safety instruction first
    instructions.push({
      id: 'safety',
      step: 1,
      title: {
        ar: 'إجراءات السلامة والحماية',
        en: 'Safety and Protection Procedures'
      },
      description: {
        ar: 'ارتدِ القفازات المقاومة للمواد الكيميائية ونظارات الأمان الواقية. تأكد من وجود تهوية ممتازة في المكان.',
        en: 'Wear chemical-resistant gloves and protective safety goggles. Ensure excellent ventilation in the area.'
      },
      warning: {
        ar: `خطر: ${testData.method_name_ar} يتطلب احتياطات خاصة`,
        en: `DANGER: ${testData.method_name} requires special precautions`
      },
      icon: 'shield',
      duration: '3 min'
    });

    // Add prepare steps
    prepareSteps.forEach((step, index) => {
      instructions.push({
        id: `prepare-${index + 1}`,
        step: index + 2,
        title: {
          ar: `خطوة ${index + 1}: ${step.substring(0, 30)}...`,
          en: `Step ${index + 1}: ${step.substring(0, 30)}...`
        },
        description: {
          ar: step,
          en: step
        },
        warning: index === 0 ? {
          ar: 'تأكد من استخدام كمية صغيرة جداً من العينة',
          en: 'Ensure to use a very small amount of sample'
        } : undefined,
        icon: index === 0 ? 'beaker' : index === prepareSteps.length - 1 ? 'eye' : 'clock',
        duration: '2 min'
      });
    });

    // Add cleanup step
    instructions.push({
      id: 'cleanup',
      step: instructions.length + 1,
      title: {
        ar: 'التنظيف والتخلص الآمن',
        en: 'Cleanup and Safe Disposal'
      },
      description: {
        ar: 'تخلص من جميع المواد بطريقة آمنة واغسل يديك جيداً.',
        en: 'Dispose of all materials safely and wash hands thoroughly.'
      },
      warning: {
        ar: 'لا تتخلص من الكواشف في المجاري العادية',
        en: 'Never dispose of reagents in regular drains'
      },
      icon: 'check',
      duration: '3 min'
    });

    return instructions;
  };

  const instructions = generateInstructions();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <ShieldCheckIcon className="h-6 w-6" />;
      case 'beaker':
        return <BeakerIcon className="h-6 w-6" />;
      case 'eye':
        return <EyeIcon className="h-6 w-6" />;
      case 'clock':
        return <ClockIcon className="h-6 w-6" />;
      case 'check':
        return <CheckCircleIcon className="h-6 w-6" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6" />;
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    const newCompleted = [...completed];
    newCompleted[stepIndex] = true;
    setCompleted(newCompleted);

    if (stepIndex < instructions.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  const allStepsCompleted = completed.length === instructions.length && 
    completed.every(step => step === true);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {lang === 'ar' ? 'تعليمات الاختبار الكيميائي' : 'Chemical Test Instructions'}
        </h1>
        <p className="text-muted-foreground mb-4">
          {lang === 'ar'
            ? 'اتبع هذه الخطوات بدقة وحذر شديد لضمان سلامتك الشخصية والحصول على نتائج موثوقة ودقيقة'
            : 'Follow these steps precisely and with extreme caution to ensure your personal safety and obtain reliable, accurate results'
          }
        </p>
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200 font-bold">
            {lang === 'ar'
              ? '⚠️ تحذير مهم: هذه الاختبارات للمتخصصين المدربين فقط في بيئة مختبرية آمنة ومجهزة'
              : '⚠️ IMPORTANT WARNING: These tests are for trained professionals only in a safe, equipped laboratory environment'
            }
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {lang === 'ar' ? 'التقدم' : 'Progress'}
          </span>
          <span className="text-sm text-muted-foreground">
            {completed.filter(Boolean).length} / {instructions.length}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(completed.filter(Boolean).length / instructions.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Instructions Steps */}
      <div className="space-y-6">
        {instructions.map((instruction, index) => (
          <div
            key={instruction.id}
            className={`
              border rounded-lg p-6 transition-all duration-300
              ${index === currentStep 
                ? 'border-primary bg-primary-50 dark:bg-primary-950' 
                : completed[index]
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-border bg-background'
              }
              ${index > currentStep ? 'opacity-50' : 'opacity-100'}
            `}
          >
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              {/* Step Icon */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                ${completed[index]
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }
              `}>
                {completed[index] ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  getIcon(instruction.icon)
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {lang === 'ar' ? `${instruction.step}. ${instruction.title.ar}` : `${instruction.step}. ${instruction.title.en}`}
                  </h3>
                  {instruction.duration && (
                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {instruction.duration}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">
                  {lang === 'ar' ? instruction.description.ar : instruction.description.en}
                </p>

                {instruction.warning && (
                  <div className="flex items-start space-x-2 rtl:space-x-reverse p-3 bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg mb-4">
                    <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      <strong>{lang === 'ar' ? 'تحذير: ' : 'Warning: '}</strong>
                      {lang === 'ar' ? instruction.warning.ar : instruction.warning.en}
                    </p>
                  </div>
                )}

                {/* Step Action Button */}
                {index === currentStep && !completed[index] && (
                  <Button
                    onClick={() => handleStepComplete(index)}
                    className="mt-4"
                  >
                    {lang === 'ar' ? 'تم إكمال هذه الخطوة' : 'Complete This Step'}
                  </Button>
                )}

                {completed[index] && (
                  <div className="mt-4 flex items-center space-x-2 rtl:space-x-reverse text-green-600">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {lang === 'ar' ? 'تم إكمال هذه الخطوة' : 'Step Completed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>

        <Button
          onClick={handleFinish}
          disabled={!allStepsCompleted}
          className={allStepsCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {lang === 'ar' ? 'بدء الاختبار' : 'Start Test'}
        </Button>
      </div>


    </div>
  );
}
