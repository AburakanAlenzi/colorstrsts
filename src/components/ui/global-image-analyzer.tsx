'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

interface GlobalImageAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelected: (color: string) => void;
  lang: Language;
}

export function GlobalImageAnalyzer({ isOpen, onClose, onColorSelected, lang }: GlobalImageAnalyzerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedColors, setDetectedColors] = useState<DetectedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<DetectedColor | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analysisStartTime = useRef<number>(0);

  const t = getTranslationsSync(lang);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clear timeout when analysis completes
  const clearAnalysisTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Handle analysis timeout
  const handleAnalysisTimeout = useCallback(() => {
    console.error('Image analysis timeout after 30 seconds');
    setIsAnalyzing(false);
    setAnalysisProgress('');
    setError(
      lang === 'ar'
        ? 'انتهت مهلة تحليل الصورة. يرجى المحاولة بصورة أصغر أو استخدام الاختيار اليدوي.'
        : 'Image analysis timeout. Please try with a smaller image or use manual color selection.'
    );
    clearAnalysisTimeout();
  }, [lang, clearAnalysisTimeout]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('image_analysis.invalid_file'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError(t('image_analysis.file_too_large'));
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
  }, [t]);

  // Analyze image for colors
  const analyzeImage = useCallback((imageSrc: string) => {
    console.log('🔍 Starting image analysis...');
    analysisStartTime.current = Date.now();
    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(lang === 'ar' ? 'جاري تحميل الصورة...' : 'Loading image...');

    // Set timeout for analysis (increased to 30 seconds)
    timeoutRef.current = setTimeout(handleAnalysisTimeout, 30000); // 30 seconds timeout

    const img = new Image();

    img.onload = () => {
      try {
        console.log('✅ Image loaded successfully:', img.width, 'x', img.height);
        setAnalysisProgress(lang === 'ar' ? 'جاري معالجة الصورة...' : 'Processing image...');

        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas element not found');
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas 2D context');
        }

        // Validate image dimensions
        if (img.width === 0 || img.height === 0) {
          throw new Error('Invalid image dimensions');
        }

        // Limit canvas size for performance (max 1000x1000)
        const maxSize = 1000;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
          console.log('📏 Resizing image for performance:', width, 'x', height);
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        console.log('🎨 Drawing image to canvas...');
        setAnalysisProgress(lang === 'ar' ? 'جاري رسم الصورة...' : 'Drawing image...');

        // Draw image (scaled if necessary)
        ctx.drawImage(img, 0, 0, width, height);

        console.log('🔬 Extracting colors...');
        setAnalysisProgress(lang === 'ar' ? 'جاري استخراج الألوان...' : 'Extracting colors...');

        // Extract dominant colors with error handling
        const colors = extractDominantColors(ctx, width, height);

        console.log('✅ Analysis complete! Found', colors.length, 'colors');
        console.log('⏱️ Analysis took:', Date.now() - analysisStartTime.current, 'ms');

        setDetectedColors(colors);
        setIsAnalyzing(false);
        setAnalysisProgress('');
        clearAnalysisTimeout();

        // Auto-select first color if available
        if (colors.length > 0) {
          setSelectedColor(colors[0]);
        }

      } catch (error) {
        console.error('❌ Error during image analysis:', error);
        setIsAnalyzing(false);
        setAnalysisProgress('');
        setError(
          lang === 'ar'
            ? 'فشل في معالجة الصورة. يرجى المحاولة بصورة أخرى.'
            : 'Failed to process image. Please try another image.'
        );
        clearAnalysisTimeout();
      }
    };

    img.onerror = (error) => {
      console.error('❌ Error loading image:', error);
      setIsAnalyzing(false);
      setAnalysisProgress('');
      setError(
        lang === 'ar'
          ? 'فشل في تحميل الصورة. يرجى التأكد من صحة الملف.'
          : 'Failed to load image. Please check the file is valid.'
      );
      clearAnalysisTimeout();
    };

    img.src = imageSrc;
  }, [lang, handleAnalysisTimeout, clearAnalysisTimeout]);

  // Extract dominant colors from image
  const extractDominantColors = (ctx: CanvasRenderingContext2D, width: number, height: number): DetectedColor[] => {
    try {
      console.log('🎨 Getting image data from canvas...');
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      if (!data || data.length === 0) {
        throw new Error('No image data available');
      }

      console.log('📊 Processing', data.length / 4, 'pixels...');
      const colorMap = new Map<string, { count: number; rgb: { r: number; g: number; b: number }; positions: { x: number; y: number }[] }>();

      // Adaptive sampling based on image size for better performance
      const totalPixels = data.length / 4;
      const sampleRate = totalPixels > 100000 ? 80 : totalPixels > 50000 ? 40 : 20; // Adjust sampling based on image size

      console.log('🔍 Sampling every', sampleRate / 4, 'pixels for performance...');

      let processedPixels = 0;
      for (let i = 0; i < data.length; i += sampleRate) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip transparent or invalid pixels
        if (a < 128 || r === undefined || g === undefined || b === undefined) continue;

        // Group similar colors (increased grouping for better performance)
        const colorKey = `${Math.floor(r / 25) * 25}-${Math.floor(g / 25) * 25}-${Math.floor(b / 25) * 25}`;
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

        processedPixels++;
      }

      console.log('✅ Processed', processedPixels, 'pixels, found', colorMap.size, 'unique color groups');

      if (colorMap.size === 0) {
        console.warn('⚠️ No colors found, creating fallback colors');
        // Fallback: create some basic colors if no colors were detected
        return [
          {
            hex: '#808080',
            rgb: { r: 128, g: 128, b: 128 },
            position: { x: width / 2, y: height / 2 },
            confidence: 50
          }
        ];
      }

      // Get top 5 most common colors
      const sortedColors = Array.from(colorMap.entries())
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([, colorData], index) => {
          // Calculate average position safely
          const positions = colorData.positions;
          const avgPosition = positions.reduce(
            (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
            { x: 0, y: 0 }
          );
          avgPosition.x = Math.floor(avgPosition.x / positions.length);
          avgPosition.y = Math.floor(avgPosition.y / positions.length);

          const confidence = Math.min(95, 60 + (index === 0 ? 35 : 25 - index * 5));

          return {
            hex: rgbToHex(colorData.rgb.r, colorData.rgb.g, colorData.rgb.b),
            rgb: colorData.rgb,
            position: avgPosition,
            confidence
          };
        });

      console.log('🎯 Extracted', sortedColors.length, 'dominant colors:', sortedColors.map(c => c.hex));
      return sortedColors;

    } catch (error) {
      console.error('❌ Error extracting colors:', error);
      throw new Error('Failed to extract colors from image');
    }
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
      onColorSelected(selectedColor.hex);
      // Reset state
      setUploadedImage(null);
      setDetectedColors([]);
      setSelectedColor(null);
      setError(null);
      onClose();
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetting image analyzer...');
    clearAnalysisTimeout();
    setUploadedImage(null);
    setDetectedColors([]);
    setSelectedColor(null);
    setError(null);
    setIsAnalyzing(false);
    setAnalysisProgress('');
    setDragActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <PhotoIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('image_analysis.title')}
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
              {t('image_analysis.photography_guidelines')}
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {t('image_analysis.good_lighting')}</li>
              <li>• {t('image_analysis.clear_image')}</li>
              <li>• {t('image_analysis.center_sample')}</li>
              <li>• {t('image_analysis.avoid_shadows')}</li>
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
                {t('image_analysis.upload_image')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('image_analysis.drag_drop')}
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 rtl:space-x-reverse mx-auto"
              >
                <PhotoIcon className="h-4 w-4" />
                <span>{t('image_analysis.select_image')}</span>
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
                  <p className="text-gray-500 mb-2">
                    {t('image_analysis.analyzing')}
                  </p>
                  {analysisProgress && (
                    <p className="text-sm text-gray-400">
                      {analysisProgress}
                    </p>
                  )}
                  <div className="mt-4 max-w-xs mx-auto">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              ) : detectedColors.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                    <p className="text-lg font-medium">
                      {lang === 'ar' ? 'لم يتم العثور على ألوان' : 'No colors detected'}
                    </p>
                    <p className="text-sm mt-2">
                      {lang === 'ar'
                        ? 'يرجى المحاولة بصورة أخرى أو النقر على الصورة لاختيار لون يدوياً'
                        : 'Please try another image or click on the image to select a color manually'
                      }
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="mx-auto"
                  >
                    {t('image_analysis.analyze_another')}
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {t('image_analysis.detected_colors')}
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
                          {color.confidence}% {t('image_analysis.confidence')}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected Color Preview */}
                  {selectedColor && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        {t('image_analysis.selected_color')}
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
                            {selectedColor.confidence}% {t('image_analysis.confidence_level')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                    >
                      {t('image_analysis.analyze_another')}
                    </Button>

                    <div className="flex space-x-3 rtl:space-x-reverse">
                      <Button variant="outline" onClick={onClose}>
                        {t('image_analysis.cancel')}
                      </Button>
                      <Button
                        onClick={handleConfirmColor}
                        disabled={!selectedColor}
                        className="flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>{t('image_analysis.use_color')}</span>
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
                  {t('image_analysis.important_notice')}
                </p>
                <p>
                  {t('image_analysis.accuracy_notice')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
