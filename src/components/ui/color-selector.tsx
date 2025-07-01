'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { DataService, ColorResult as DataServiceColorResult } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { ImageColorAnalyzer } from '@/components/ui/image-color-analyzer';
import {
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
  ArrowRightIcon,
  PhotoIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

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

interface ColorSelectorProps {
  colorResults: ColorResult[];
  lang: Language;
  selectedColorResult: ColorResult | null;
  onColorSelect: (colorResult: ColorResult) => void;
  onComplete: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  testId: string;
}

// Convert DataService ColorResult to ColorSelector ColorResult
const convertColorResult = (dsColor: DataServiceColorResult): ColorResult => {
  return {
    id: dsColor.id,
    test_id: dsColor.test_id,
    hex_code: dsColor.color_hex,
    color_name: {
      ar: dsColor.color_result_ar,
      en: dsColor.color_result
    },
    substances: {
      ar: [dsColor.possible_substance_ar],
      en: [dsColor.possible_substance]
    },
    confidence: getConfidenceScore(dsColor.confidence_level),
    confidence_level: dsColor.confidence_level
  };
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

export function ColorSelector({
  colorResults,
  lang,
  selectedColorResult,
  onColorSelect,
  onComplete,
  notes,
  onNotesChange,
  testId
}: ColorSelectorProps) {
  const [availableColors, setAvailableColors] = useState<ColorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const t = getTranslationsSync(lang);

  useEffect(() => {
    const loadColors = async () => {
      try {
        setLoading(true);

        // If colorResults are provided, use them
        if (colorResults && colorResults.length > 0) {
          setAvailableColors(colorResults);
        } else {
          // Otherwise load all color results and convert them
          const allColors = DataService.getColorResults();
          const convertedColors = allColors.map(convertColorResult);
          setAvailableColors(convertedColors);
        }
      } catch (error) {
        console.error('Error loading colors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadColors();
  }, [colorResults]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 75) return 'text-green-500 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (confidence >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 85) return lang === 'ar' ? 'عالي جداً' : 'Very High';
    if (confidence >= 75) return lang === 'ar' ? 'عالي' : 'High';
    if (confidence >= 60) return lang === 'ar' ? 'متوسط' : 'Medium';
    if (confidence >= 40) return lang === 'ar' ? 'منخفض' : 'Low';
    return lang === 'ar' ? 'منخفض جداً' : 'Very Low';
  };

  // Handle color detected from image
  const handleImageColorDetected = (detectedHex: string) => {
    // Find the closest matching color from available colors
    const closestColor = findClosestColor(detectedHex, availableColors);
    if (closestColor) {
      onColorSelect(closestColor);
    } else {
      // Create a custom color result if no close match found
      const customColor: ColorResult = {
        id: `custom-${Date.now()}`,
        test_id: testId,
        hex_code: detectedHex,
        color_name: {
          ar: 'لون مكتشف من الصورة',
          en: 'Color detected from image'
        },
        substances: {
          ar: ['يتطلب تحليل إضافي'],
          en: ['Requires additional analysis']
        },
        confidence: 70,
        confidence_level: 'medium'
      };
      onColorSelect(customColor);
    }
  };

  // Find closest color match
  const findClosestColor = (targetHex: string, colors: ColorResult[]): ColorResult | null => {
    if (colors.length === 0) return null;

    const targetRgb = hexToRgb(targetHex);
    if (!targetRgb) return null;

    let closestColor = colors[0];
    let minDistance = Infinity;

    colors.forEach(color => {
      const colorRgb = hexToRgb(color.hex_code);
      if (colorRgb) {
        const distance = Math.sqrt(
          Math.pow(targetRgb.r - colorRgb.r, 2) +
          Math.pow(targetRgb.g - colorRgb.g, 2) +
          Math.pow(targetRgb.b - colorRgb.b, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = color;
        }
      }
    });

    // Only return if the distance is reasonable (less than 100 in RGB space)
    return minDistance < 100 ? closestColor : null;
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'جاري تحميل الألوان...' : 'Loading colors...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
          <EyeIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'ar' ? 'اختر اللون المُلاحظ' : 'Select Observed Color'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {lang === 'ar'
            ? 'انقر على اللون الذي لاحظته بعد إضافة الكاشف'
            : 'Click on the color you observed after adding the reagent'
          }
        </p>

        {/* Color Selection Methods */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
            <SwatchIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'اختيار يدوي' : 'Manual Selection'}</span>
          </div>

          <div className="text-muted-foreground">
            {lang === 'ar' ? 'أو' : 'or'}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowImageAnalyzer(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <PhotoIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'تحليل بالصورة' : 'Image Analysis'}</span>
          </Button>
        </div>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {availableColors.map((color) => (
          <div
            key={color.id}
            onClick={() => onColorSelect(color)}
            className={`
              relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg
              ${selectedColorResult?.id === color.id 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
                : 'border-border bg-background hover:border-primary-300'
              }
            `}
          >
            {/* Color Circle */}
            <div className="flex flex-col items-center space-y-3">
              <div 
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: color.hex_code }}
              />
              
              {/* Color Name */}
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm">
                  {lang === 'ar' ? color.color_name.ar : color.color_name.en}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {color.hex_code}
                </p>
              </div>

              {/* Confidence Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(color.confidence)}`}>
                {color.confidence}% {getConfidenceText(color.confidence)}
              </div>

              {/* Selection Indicator */}
              {selectedColorResult?.id === color.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Color Details */}
      {selectedColorResult && (
        <div className="bg-background border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {lang === 'ar' ? 'تفاصيل اللون المختار' : 'Selected Color Details'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Info */}
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: selectedColorResult.hex_code }}
                />
                <div>
                  <h4 className="font-medium text-foreground">
                    {lang === 'ar' ? selectedColorResult.color_name.ar : selectedColorResult.color_name.en}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedColorResult.hex_code}
                  </p>
                </div>
              </div>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(selectedColorResult.confidence)}`}>
                <SwatchIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {selectedColorResult.confidence}% {getConfidenceText(selectedColorResult.confidence)}
              </div>
            </div>

            {/* Possible Substances */}
            <div>
              <h4 className="font-medium text-foreground mb-2">
                {lang === 'ar' ? 'المواد المحتملة' : 'Possible Substances'}
              </h4>
              {selectedColorResult.substances[lang]?.length > 0 ? (
                <div className="space-y-1">
                  {selectedColorResult.substances[lang].map((substance, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                      <span className="text-muted-foreground">{substance}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'لا توجد مواد محددة' : 'No specific substances identified'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          {lang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={lang === 'ar' 
            ? 'أضف أي ملاحظات حول الاختبار...'
            : 'Add any notes about the test...'
          }
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedColorResult ? (
            <span className="flex items-center space-x-1 rtl:space-x-reverse text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span>
                {lang === 'ar' ? 'تم اختيار اللون' : 'Color selected'}
              </span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>
                {lang === 'ar' ? 'يرجى اختيار لون' : 'Please select a color'}
              </span>
            </span>
          )}
        </div>

        <Button
          onClick={() => {
            console.log('View Results clicked, selectedColorResult:', selectedColorResult);
            if (selectedColorResult) {
              onComplete();
            }
          }}
          disabled={!selectedColorResult}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <span>{lang === 'ar' ? 'عرض النتائج' : 'View Results'}</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Important Notice */}
      <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg">
        <div className="flex items-start space-x-2 rtl:space-x-reverse">
          <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-warning-700 dark:text-warning-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'تنبيه مهم:' : 'Important Notice:'}
            </p>
            <p>
              {lang === 'ar' 
                ? 'اختر اللون الأقرب لما لاحظته. إذا لم تجد اللون المطابق تماماً، اختر الأقرب إليه.'
                : 'Select the color closest to what you observed. If you cannot find an exact match, choose the closest one.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Image Color Analyzer Modal */}
      {showImageAnalyzer && (
        <ImageColorAnalyzer
          lang={lang}
          testId={testId}
          onColorDetected={handleImageColorDetected}
          onClose={() => setShowImageAnalyzer(false)}
        />
      )}
    </div>
  );
}
