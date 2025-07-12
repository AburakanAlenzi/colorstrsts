'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ChemicalTest } from '@/lib/firebase-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TestFormData {
  method_name: string;
  method_name_ar: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference?: string;
  category?: string;
  safety_level?: string;
  preparation_time?: number;
  description?: string;
  description_ar?: string;
}

interface TestFormNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestFormData) => Promise<void>;
  test?: ChemicalTest | null;
  loading: boolean;
  translations: any;
  isRTL: boolean;
}

const TEST_TYPES = ['F/L', 'P/L', 'C/L', 'S/L', 'M/L', 'L', 'Other'];
const CATEGORIES = ['basic', 'advanced', 'specialized'];
const SAFETY_LEVELS = ['low', 'medium', 'high', 'extreme'];

export default function TestFormNew({
  isOpen,
  onClose,
  onSubmit,
  test,
  loading,
  translations,
  isRTL
}: TestFormNewProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TestFormData>();

  const isEditing = !!test;

  // Safe translations access with fallbacks
  const safeTranslations = {
    form: {
      editTitle: translations?.form?.editTitle || 'Edit Test',
      addTitle: translations?.form?.addTitle || 'Add New Test',
      title: translations?.form?.title || 'Test Form',
      methodName: translations?.form?.methodName || 'Method Name',
      methodNameAr: translations?.form?.methodNameAr || 'Method Name (Arabic)',
      testType: translations?.form?.testType || 'Test Type',
      testNumber: translations?.form?.testNumber || 'Test Number',
      colorResult: translations?.form?.colorResult || 'Color Result',
      colorResultAr: translations?.form?.colorResultAr || 'Color Result (Arabic)',
      possibleSubstance: translations?.form?.possibleSubstance || 'Possible Substance',
      possibleSubstanceAr: translations?.form?.possibleSubstanceAr || 'Possible Substance (Arabic)',
      prepare: translations?.form?.prepare || 'Preparation Steps',
      prepareAr: translations?.form?.prepareAr || 'Preparation Steps (Arabic)',
      reference: translations?.form?.reference || 'Reference',
      cancel: translations?.form?.cancel || 'Cancel',
      save: translations?.form?.save || 'Save',
      validation: {
        methodNameRequired: translations?.form?.validation?.methodNameRequired || 'Method name is required',
        methodNameArRequired: translations?.form?.validation?.methodNameArRequired || 'Arabic method name is required',
        testTypeRequired: translations?.form?.validation?.testTypeRequired || 'Test type is required',
        testNumberRequired: translations?.form?.validation?.testNumberRequired || 'Test number is required',
        colorResultRequired: translations?.form?.validation?.colorResultRequired || 'Color result is required',
        colorResultArRequired: translations?.form?.validation?.colorResultArRequired || 'Arabic color result is required',
        substanceRequired: translations?.form?.validation?.substanceRequired || 'Possible substance is required',
        substanceArRequired: translations?.form?.validation?.substanceArRequired || 'Arabic possible substance is required',
        prepareRequired: translations?.form?.validation?.prepareRequired || 'Preparation steps are required',
        prepareArRequired: translations?.form?.validation?.prepareArRequired || 'Arabic preparation steps are required'
      }
    }
  };

  useEffect(() => {
    if (test) {
      // Populate form with test data for editing
      setValue('method_name', test.method_name);
      setValue('method_name_ar', test.method_name_ar);
      setValue('color_result', test.color_result);
      setValue('color_result_ar', test.color_result_ar);
      setValue('possible_substance', test.possible_substance);
      setValue('possible_substance_ar', test.possible_substance_ar);
      setValue('prepare', test.prepare);
      setValue('prepare_ar', test.prepare_ar);
      setValue('test_type', test.test_type);
      setValue('test_number', test.test_number);
      setValue('reference', test.reference || '');
      setValue('category', test.category || '');
      setValue('safety_level', test.safety_level || '');
      setValue('preparation_time', test.preparation_time || 0);
      setValue('description', test.description || '');
      setValue('description_ar', test.description_ar || '');
    } else {
      // Reset form for new test
      reset();
    }
  }, [test, setValue, reset]);

  const handleFormSubmit = async (data: TestFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? safeTranslations.form.editTitle : safeTranslations.form.addTitle}
          </DialogTitle>
          <DialogDescription>
            {safeTranslations.form.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method Name - English */}
            <div className="space-y-2">
              <Label htmlFor="method_name">
                {translations.form.methodName} *
              </Label>
              <Input
                id="method_name"
                {...register('method_name', {
                  required: translations.form.validation.methodNameRequired
                })}
                placeholder="e.g., Marquis Test"
                className={errors.method_name ? 'border-red-500' : ''}
              />
              {errors.method_name && (
                <p className="text-sm text-red-500">{errors.method_name.message}</p>
              )}
            </div>

            {/* Method Name - Arabic */}
            <div className="space-y-2">
              <Label htmlFor="method_name_ar">
                {translations.form.methodNameAr} *
              </Label>
              <Input
                id="method_name_ar"
                {...register('method_name_ar', {
                  required: translations.form.validation.methodNameArRequired
                })}
                placeholder="مثال: اختبار ماركيز"
                className={errors.method_name_ar ? 'border-red-500' : ''}
                dir="rtl"
              />
              {errors.method_name_ar && (
                <p className="text-sm text-red-500">{errors.method_name_ar.message}</p>
              )}
            </div>

            {/* Test Type */}
            <div className="space-y-2">
              <Label htmlFor="test_type">
                {translations.form.testType} *
              </Label>
              <Select
                value={watch('test_type')}
                onValueChange={(value) => setValue('test_type', value)}
              >
                <SelectTrigger className={errors.test_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register('test_type', {
                  required: translations.form.validation.testTypeRequired
                })}
              />
              {errors.test_type && (
                <p className="text-sm text-red-500">{errors.test_type.message}</p>
              )}
            </div>

            {/* Test Number */}
            <div className="space-y-2">
              <Label htmlFor="test_number">
                {translations.form.testNumber} *
              </Label>
              <Input
                id="test_number"
                {...register('test_number', {
                  required: translations.form.validation.testNumberRequired
                })}
                placeholder="e.g., 001, A1, etc."
                className={errors.test_number ? 'border-red-500' : ''}
              />
              {errors.test_number && (
                <p className="text-sm text-red-500">{errors.test_number.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                {isRTL ? 'الفئة' : 'Category'}
              </Label>
              <Select onValueChange={(value) => setValue('category', value)} value={watch('category')}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder={isRTL ? 'اختر الفئة' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Safety Level */}
            <div className="space-y-2">
              <Label htmlFor="safety_level">
                {isRTL ? 'مستوى الأمان' : 'Safety Level'}
              </Label>
              <Select onValueChange={(value) => setValue('safety_level', value)} value={watch('safety_level')}>
                <SelectTrigger className={errors.safety_level ? 'border-red-500' : ''}>
                  <SelectValue placeholder={isRTL ? 'اختر مستوى الأمان' : 'Select safety level'} />
                </SelectTrigger>
                <SelectContent>
                  {SAFETY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.safety_level && (
                <p className="text-sm text-red-500">{errors.safety_level.message}</p>
              )}
            </div>

            {/* Preparation Time */}
            <div className="space-y-2">
              <Label htmlFor="preparation_time">
                {isRTL ? 'وقت التحضير (دقائق)' : 'Preparation Time (minutes)'}
              </Label>
              <Input
                id="preparation_time"
                type="number"
                min="1"
                max="60"
                {...register('preparation_time', {
                  valueAsNumber: true,
                  min: { value: 1, message: isRTL ? 'الحد الأدنى دقيقة واحدة' : 'Minimum 1 minute' },
                  max: { value: 60, message: isRTL ? 'الحد الأقصى 60 دقيقة' : 'Maximum 60 minutes' }
                })}
                placeholder={isRTL ? 'مثال: 5' : 'e.g., 5'}
                className={errors.preparation_time ? 'border-red-500' : ''}
              />
              {errors.preparation_time && (
                <p className="text-sm text-red-500">{errors.preparation_time.message}</p>
              )}
            </div>

            {/* Color Result - English */}
            <div className="space-y-2">
              <Label htmlFor="color_result">
                {translations.form.colorResult} *
              </Label>
              <Input
                id="color_result"
                {...register('color_result', {
                  required: translations.form.validation.colorResultRequired
                })}
                placeholder="e.g., Purple to Black"
                className={errors.color_result ? 'border-red-500' : ''}
              />
              {errors.color_result && (
                <p className="text-sm text-red-500">{errors.color_result.message}</p>
              )}
            </div>

            {/* Color Result - Arabic */}
            <div className="space-y-2">
              <Label htmlFor="color_result_ar">
                {translations.form.colorResultAr} *
              </Label>
              <Input
                id="color_result_ar"
                {...register('color_result_ar', {
                  required: translations.form.validation.colorResultArRequired
                })}
                placeholder="مثال: بنفسجي إلى أسود"
                className={errors.color_result_ar ? 'border-red-500' : ''}
                dir="rtl"
              />
              {errors.color_result_ar && (
                <p className="text-sm text-red-500">{errors.color_result_ar.message}</p>
              )}
            </div>

            {/* Possible Substance - English */}
            <div className="space-y-2">
              <Label htmlFor="possible_substance">
                {translations.form.possibleSubstance} *
              </Label>
              <Input
                id="possible_substance"
                {...register('possible_substance', {
                  required: translations.form.validation.substanceRequired
                })}
                placeholder="e.g., MDMA, Amphetamines"
                className={errors.possible_substance ? 'border-red-500' : ''}
              />
              {errors.possible_substance && (
                <p className="text-sm text-red-500">{errors.possible_substance.message}</p>
              )}
            </div>

            {/* Possible Substance - Arabic */}
            <div className="space-y-2">
              <Label htmlFor="possible_substance_ar">
                {translations.form.possibleSubstanceAr} *
              </Label>
              <Input
                id="possible_substance_ar"
                {...register('possible_substance_ar', {
                  required: translations.form.validation.substanceArRequired
                })}
                placeholder="مثال: إم دي إم إيه، أمفيتامينات"
                className={errors.possible_substance_ar ? 'border-red-500' : ''}
                dir="rtl"
              />
              {errors.possible_substance_ar && (
                <p className="text-sm text-red-500">{errors.possible_substance_ar.message}</p>
              )}
            </div>

            {/* Description - English */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the test purpose and application"
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Description - Arabic */}
            <div className="space-y-2">
              <Label htmlFor="description_ar">
                {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </Label>
              <Textarea
                id="description_ar"
                {...register('description_ar')}
                placeholder="وصف مختصر لغرض الاختبار وتطبيقه"
                className={errors.description_ar ? 'border-red-500' : ''}
                rows={3}
                dir="rtl"
              />
              {errors.description_ar && (
                <p className="text-sm text-red-500">{errors.description_ar.message}</p>
              )}
            </div>
          </div>

          {/* Preparation Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prepare - English */}
            <div className="space-y-2">
              <Label htmlFor="prepare">
                {translations.form.prepare} *
              </Label>
              <Textarea
                id="prepare"
                {...register('prepare', {
                  required: translations.form.validation.prepareRequired
                })}
                placeholder="Detailed preparation steps in English..."
                rows={6}
                className={errors.prepare ? 'border-red-500' : ''}
              />
              {errors.prepare && (
                <p className="text-sm text-red-500">{errors.prepare.message}</p>
              )}
            </div>

            {/* Prepare - Arabic */}
            <div className="space-y-2">
              <Label htmlFor="prepare_ar">
                {translations.form.prepareAr} *
              </Label>
              <Textarea
                id="prepare_ar"
                {...register('prepare_ar', {
                  required: translations.form.validation.prepareArRequired
                })}
                placeholder="خطوات التحضير المفصلة بالعربية..."
                rows={6}
                className={errors.prepare_ar ? 'border-red-500' : ''}
                dir="rtl"
              />
              {errors.prepare_ar && (
                <p className="text-sm text-red-500">{errors.prepare_ar.message}</p>
              )}
            </div>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">
              {translations.form.reference}
            </Label>
            <Input
              id="reference"
              {...register('reference')}
              placeholder="Reference source (optional)"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {translations.form.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {translations.form.save}
                </div>
              ) : (
                translations.form.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
