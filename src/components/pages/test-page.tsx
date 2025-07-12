'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { recordTestVisit } from '@/lib/firebase-user';

import { getTestById, ChemicalTest } from '@/lib/local-data-service';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ColorSelector } from '@/components/ui/color-selector';
import { TestInstructions } from '@/components/ui/test-instructions';
import { TestResults } from '@/components/ui/test-results';
import { 
  ArrowLeftIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TestPageProps {
  lang: Language;
  testId: string;
}

type TestStep = 'instructions' | 'color-selection' | 'results';

// ColorSelector ColorResult interface
interface ColorResult {
  id: string;
  test_id: string;
  hex_code: string;
  color_name: {
    ar: string;
    en: string;
  };
  substances: {
    ar: string[];
    en: string[];
  };
  confidence: number;
  confidence_level: string;
}

interface TestInstruction {
  id: string;
  test_id: string;
  step_number: number;
  instruction_ar: string;
  instruction_en: string;
  safety_note_ar?: string;
  safety_note_en?: string;
}

interface TestSession {
  id: string;
  test_id: string;
  started_at: string;
  completed_at?: string;
  result_id?: string;
  confidence_score?: number;
  notes?: string;
}

// Create default color results for testing (since color results are not yet in Firebase)
const createDefaultColorResults = (testId: string): ColorResult[] => {
  return [
    {
      id: `${testId}-color-1`,
      test_id: testId,
      hex_code: '#8B0000',
      color_name: {
        ar: 'أحمر داكن',
        en: 'Dark Red'
      },
      substances: {
        ar: ['مادة مشتبه بها'],
        en: ['Suspected substance']
      },
      confidence: 75,
      confidence_level: 'medium'
    },
    {
      id: `${testId}-color-2`,
      test_id: testId,
      hex_code: '#4B0082',
      color_name: {
        ar: 'بنفسجي',
        en: 'Purple'
      },
      substances: {
        ar: ['مادة أخرى'],
        en: ['Other substance']
      },
      confidence: 80,
      confidence_level: 'high'
    }
  ];
};

// Convert confidence level to numeric score
const getConfidenceScore = (level: string): number => {
  switch (level) {
    case 'very_high': return 90;
    case 'high': return 80;
    case 'medium': return 65;
    case 'low': return 45;
    case 'very_low': return 25;
    default: return 50;
  }
};

export function TestPage({ lang, testId }: TestPageProps) {
  const [test, setTest] = useState<ChemicalTest | null>(null);
  const [colorResults, setColorResults] = useState<ColorResult[]>([]);
  const [instructions, setInstructions] = useState<TestInstruction[]>([]);
  const [currentStep, setCurrentStep] = useState<TestStep>('instructions');
  const [selectedColorResult, setSelectedColorResult] = useState<ColorResult | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [confidenceScore, setConfidenceScore] = useState(0.5);
  const [notes, setNotes] = useState('');
  const [visitStartTime, setVisitStartTime] = useState<Date>(new Date());

  const router = useRouter();
  const { user } = useAuth();
  const isRTL = lang === 'ar';

  useEffect(() => {
    const loadTestData = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Load test data from local storage
        const testData = getTestById(testId);

        if (!testData) {
          toast.error(lang === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data');
          router.push(`/${lang}/tests`);
          return;
        }

        console.log('🔥 Loaded test data from local storage');

        // Create default color results and instructions (since they're not in Firebase yet)
        const colorResultsData = createDefaultColorResults(testId);
        const instructionsData: TestInstruction[] = [
          {
            id: `${testId}-inst-1`,
            test_id: testId,
            step_number: 1,
            instruction_ar: 'ضع عينة صغيرة من المادة في أنبوب الاختبار',
            instruction_en: 'Place a small sample of the substance in the test tube',
            safety_note_ar: 'استخدم القفازات والنظارات الواقية',
            safety_note_en: 'Use gloves and safety goggles'
          },
          {
            id: `${testId}-inst-2`,
            test_id: testId,
            step_number: 2,
            instruction_ar: 'أضف 2-3 قطرات من الكاشف',
            instruction_en: 'Add 2-3 drops of reagent',
            safety_note_ar: 'تجنب ملامسة الكاشف للجلد',
            safety_note_en: 'Avoid reagent contact with skin'
          }
        ];

        setTest(testData);
        setColorResults(colorResultsData);
        setInstructions(instructionsData);

        // Create test session
        const newSession: TestSession = {
          id: `session-${Date.now()}`,
          test_id: testId,
          started_at: new Date().toISOString()
        };
        setSession(newSession);

        // Record test visit for authenticated users
        if (user && testData) {
          try {
            await recordTestVisit(
              user.uid,
              testId,
              testData.method_name,
              testData.method_name_ar,
              testData.test_type || 'F/L',
              testData.possible_substance || '',
              testData.possible_substance_ar || ''
            );
          } catch (error) {
            console.error('Error recording test visit:', error);
            // Don't show error to user as this is not critical
          }
        }

      } catch (error) {
        console.error('Error loading test data:', error);
        toast.error(lang === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, [testId, lang, router, user]);

  // Track visit duration when component unmounts
  useEffect(() => {
    return () => {
      if (user && test) {
        const visitDuration = Math.floor((new Date().getTime() - visitStartTime.getTime()) / 1000);
        // Record visit duration (fire and forget)
        recordTestVisit(
          user.uid,
          testId,
          test.method_name,
          test.method_name_ar,
          test.test_type || 'F/L',
          test.possible_substance || '',
          test.possible_substance_ar || '',
          visitDuration
        ).catch(error => {
          console.error('Error updating visit duration:', error);
        });
      }
    };
  }, [user, test, testId, visitStartTime]);

  const handleStepComplete = (step: TestStep) => {
    switch (step) {
      case 'instructions':
        setCurrentStep('color-selection');
        break;
      case 'color-selection':
        if (selectedColorResult && session) {
          try {
            // Complete the test session (save to localStorage for now)
            const completedSession = {
              ...session,
              completed_at: new Date().toISOString(),
              result_id: selectedColorResult.id,
              confidence_score: confidenceScore,
              notes: notes
            };

            // Save to localStorage
            const savedResults = JSON.parse(localStorage.getItem('test_results') || '[]');
            savedResults.push(completedSession);
            localStorage.setItem('test_results', JSON.stringify(savedResults));

            setCurrentStep('results');
            toast.success(lang === 'ar' ? 'تم إكمال الاختبار بنجاح' : 'Test completed successfully');
          } catch (error) {
            console.error('Error completing test session:', error);
            // Still proceed to results even if there's an error
            setCurrentStep('results');
            toast.success(lang === 'ar' ? 'تم إكمال الاختبار' : 'Test completed');
          }
        } else {
          toast.error(lang === 'ar' ? 'يرجى اختيار لون أولاً' : 'Please select a color first');
        }
        break;
      case 'results':
        router.push(`/${lang}/tests`);
        break;
    }
  };

  const handleColorSelect = (colorResult: ColorResult) => {
    setSelectedColorResult(colorResult);

    // Calculate confidence score based on confidence level
    const confidenceMap: Record<string, number> = {
      'very_low': 0.2,
      'low': 0.4,
      'medium': 0.6,
      'high': 0.8,
      'very_high': 0.9,
    };

    setConfidenceScore(confidenceMap[colorResult.confidence_level] || 0.5);
  };

  const getStepTitle = (step: TestStep) => {
    switch (step) {
      case 'instructions':
        return lang === 'ar' ? 'تعليمات السلامة' : 'Safety Instructions';
      case 'color-selection':
        return lang === 'ar' ? 'اختيار اللون المُلاحظ' : 'Select Observed Color';
      case 'results':
        return lang === 'ar' ? 'النتائج' : 'Results';
    }
  };

  const getStepIcon = (step: TestStep) => {
    switch (step) {
      case 'instructions':
        return ExclamationTriangleIcon;
      case 'color-selection':
        return BeakerIcon;
      case 'results':
        return CheckCircleIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {lang === 'ar' ? 'خطأ' : 'Error'}
          </h1>
          <Button onClick={() => router.push(`/${lang}/tests`)}>
            {lang === 'ar' ? 'العودة' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  const testName = lang === 'ar' ? test.method_name_ar : test.method_name;
  const testDescription = lang === 'ar' ? test.description_ar : test.description;
  const StepIcon = getStepIcon(currentStep);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => {
              console.log('Back button clicked - navigating to tests page');
              router.push(`/${lang}/tests`);
            }}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
            {lang === 'ar' ? 'العودة' : 'Back'}
          </Button>

          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: `${test.color_primary}20` }}
            >
              <StepIcon 
                className="h-8 w-8"
                style={{ color: test.color_primary }}
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {testName}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-4">
              {testDescription}
            </p>

            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {test.preparation_time} {lang === 'ar' ? 'دقيقة' : 'minutes'}
              </div>
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {test.safety_level === 'high' ? (lang === 'ar' ? 'عالي' : 'High') :
                 test.safety_level === 'medium' ? (lang === 'ar' ? 'متوسط' : 'Medium') :
                 (lang === 'ar' ? 'منخفض' : 'Low')}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
            {(['instructions', 'color-selection', 'results'] as TestStep[]).map((step, index) => {
              const isActive = currentStep === step;
              const isCompleted = ['instructions', 'color-selection', 'results'].indexOf(currentStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive 
                      ? 'bg-primary-600 text-white' 
                      : isCompleted 
                        ? 'bg-success-600 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      isCompleted ? 'bg-success-600' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold text-foreground">
              {getStepTitle(currentStep)}
            </h2>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'instructions' && (
            <TestInstructions
              testId={testId}
              lang={lang}
              onComplete={() => handleStepComplete('instructions')}
              onCancel={() => {
                console.log('Test instructions cancelled - navigating to tests page');
                router.push(`/${lang}/tests`);
              }}
            />
          )}

          {currentStep === 'color-selection' && (
            <ColorSelector
              colorResults={colorResults}
              lang={lang}
              selectedColorResult={selectedColorResult}
              onColorSelect={handleColorSelect}
              onComplete={() => handleStepComplete('color-selection')}
              notes={notes}
              onNotesChange={setNotes}
              testId={testId}
            />
          )}

          {currentStep === 'results' && selectedColorResult && (
            <TestResults
              testId={testId}
              selectedColor={selectedColorResult.hex_code}
              lang={lang}
              onBack={() => setCurrentStep('color-selection')}
              onNewTest={() => {
                console.log('New test requested - navigating to tests page');
                router.push(`/${lang}/tests`);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
