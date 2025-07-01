'use client';

import { useState, useRef, useCallback } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { 
  PhotoIcon,
  CloudArrowUpIcon,
  EyeDropperIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface DetectedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  position: { x: number; y: number };
  confidence: number;
}

interface ImageColorAnalyzerProps {
  lang: Language;
  onColorDetected: (color: string) => void;
  onClose: () => void;
  testId: string;
}

export function ImageColorAnalyzer({ lang, onColorDetected, onClose, testId }: ImageColorAnalyzerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedColors, setDetectedColors] = useState<DetectedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<DetectedColor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const t = getTranslationsSync(lang);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(lang === 'ar' ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError(lang === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)' : 'File size too large (max 10MB)');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      analyzeImage(result);
    };
    reader.readAsDataURL(file);
  }, [lang]);

  // Analyze image for colors
  const analyzeImage = useCallback((imageSrc: string) => {
    setIsAnalyzing(true);
    setError(null);

    // Set timeout for analysis (30 seconds)
    timeoutRef.current = setTimeout(() => {
      console.error('Image analysis timeout after 30 seconds');
      setIsAnalyzing(false);
      setError(
        lang === 'ar'
          ? 'انتهت مهلة تحليل الصورة. يرجى المحاولة بصورة أصغر.'
          : 'Image analysis timeout. Please try with a smaller image.'
      );
    }, 30000);

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Extract dominant colors
        const colors = extractDominantColors(ctx, img.width, img.height);
        setDetectedColors(colors);
        setIsAnalyzing(false);

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } catch (error) {
        console.error('Error during image analysis:', error);
        setIsAnalyzing(false);
        setError(
          lang === 'ar'
            ? 'فشل في معالجة الصورة. يرجى المحاولة بصورة أخرى.'
            : 'Failed to process image. Please try another image.'
        );
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    img.onerror = () => {
      setIsAnalyzing(false);
      setError(
        lang === 'ar'
          ? 'فشل في تحميل الصورة. يرجى التأكد من صحة الملف.'
          : 'Failed to load image. Please check the file is valid.'
      );
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    img.src = imageSrc;
  }, [lang]);

  // Extract dominant colors from image
  const extractDominantColors = (ctx: CanvasRenderingContext2D, width: number, height: number): DetectedColor[] => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const colorMap = new Map<string, { count: number; rgb: { r: number; g: number; b: number }; positions: { x: number; y: number }[] }>();

    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue; // Skip transparent pixels

      // Group similar colors
      const colorKey = `${Math.floor(r / 20) * 20}-${Math.floor(g / 20) * 20}-${Math.floor(b / 20) * 20}`;
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      if (colorMap.has(colorKey)) {
        const existing = colorMap.get(colorKey)!;
        existing.count++;
        existing.positions.push({ x, y });
      } else {
        colorMap.set(colorKey, {
          count: 1,
          rgb: { r, g, b },
          positions: [{ x, y }]
        });
      }
    }

    // Get top 5 most common colors
    const sortedColors = Array.from(colorMap.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([, colorData], index) => {
        const avgPosition = colorData.positions.reduce(
          (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
          { x: 0, y: 0 }
        );
        avgPosition.x = Math.floor(avgPosition.x / colorData.positions.length);
        avgPosition.y = Math.floor(avgPosition.y / colorData.positions.length);

        return {
          hex: rgbToHex(colorData.rgb.r, colorData.rgb.g, colorData.rgb.b),
          rgb: colorData.rgb,
          position: avgPosition,
          confidence: Math.min(95, 60 + (index === 0 ? 35 : 25 - index * 5))
        };
      });

    return sortedColors;
  };

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Handle canvas click for manual color selection
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];

    const clickedColor: DetectedColor = {
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      position: { x, y },
      confidence: 85
    };

    setSelectedColor(clickedColor);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmColor = () => {
    if (selectedColor) {
      onColorDetected(selectedColor.hex);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <PhotoIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'تحليل اللون بالصورة' : 'Image Color Analysis'}
            </h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {lang === 'ar' ? 'تعليمات التصوير:' : 'Photography Guidelines:'}
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {lang === 'ar' ? 'استخدم إضاءة جيدة وطبيعية' : 'Use good natural lighting'}</li>
              <li>• {lang === 'ar' ? 'تأكد من وضوح الصورة' : 'Ensure image is clear and focused'}</li>
              <li>• {lang === 'ar' ? 'اجعل العينة في وسط الصورة' : 'Center the sample in the image'}</li>
              <li>• {lang === 'ar' ? 'تجنب الظلال والانعكاسات' : 'Avoid shadows and reflections'}</li>
            </ul>
          </div>

          {!uploadedImage ? (
            /* Upload Area */
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {lang === 'ar' ? 'ارفع صورة نتيجة الاختبار' : 'Upload Test Result Image'}
              </h3>
              <p className="text-gray-500 mb-4">
                {lang === 'ar' ? 'اسحب وأفلت الصورة هنا أو انقر للاختيار' : 'Drag and drop image here or click to select'}
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 rtl:space-x-reverse mx-auto"
              >
                <PhotoIcon className="h-4 w-4" />
                <span>{lang === 'ar' ? 'اختيار صورة' : 'Select Image'}</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            /* Image Analysis */
            <div className="space-y-6">
              {/* Image Display */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair"
                  style={{ maxHeight: '400px' }}
                />
                {selectedColor && (
                  <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg"
                    style={{
                      left: `${(selectedColor.position.x / (canvasRef.current?.width || 1)) * 100}%`,
                      top: `${(selectedColor.position.y / (canvasRef.current?.height || 1)) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
              </div>

              {/* Detected Colors */}
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">
                    {lang === 'ar' ? 'جاري تحليل الألوان...' : 'Analyzing colors...'}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {lang === 'ar' ? 'الألوان المكتشفة:' : 'Detected Colors:'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {detectedColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedColor?.hex === color.hex
                            ? 'border-primary-500 ring-2 ring-primary-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded mb-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          {color.hex}
                        </p>
                        <p className="text-xs text-gray-500">
                          {color.confidence}% {lang === 'ar' ? 'ثقة' : 'confidence'}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected Color Preview */}
                  {selectedColor && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        {lang === 'ar' ? 'اللون المحدد:' : 'Selected Color:'}
                      </h4>
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div
                          className="w-16 h-16 rounded-lg border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <div>
                          <p className="font-mono text-lg">{selectedColor.hex}</p>
                          <p className="text-sm text-gray-500">
                            RGB({selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b})
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedColor.confidence}% {lang === 'ar' ? 'مستوى الثقة' : 'confidence level'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedImage(null);
                        setDetectedColors([]);
                        setSelectedColor(null);
                        setError(null);
                      }}
                    >
                      {lang === 'ar' ? 'تحليل صورة أخرى' : 'Analyze Another Image'}
                    </Button>

                    <div className="flex space-x-3 rtl:space-x-reverse">
                      <Button variant="outline" onClick={onClose}>
                        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button
                        onClick={handleConfirmColor}
                        disabled={!selectedColor}
                        className="flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'استخدام هذا اللون' : 'Use This Color'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2 rtl:space-x-reverse">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p className="font-medium mb-1">
                  {lang === 'ar' ? 'تنبيه مهم:' : 'Important Notice:'}
                </p>
                <p>
                  {lang === 'ar' 
                    ? 'دقة تحليل الألوان تعتمد على جودة الصورة والإضاءة. يُنصح بالتحقق من النتائج يدوياً.'
                    : 'Color analysis accuracy depends on image quality and lighting. Manual verification is recommended.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
