'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BeakerIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { firebaseTestsService, ChemicalTest, TestResult } from '@/lib/firebase-tests-service';
import toast from 'react-hot-toast';

interface TestFormProps {
  lang: Language;
  test?: ChemicalTest | null;
  onClose: () => void;
  onSave: () => void;
}

export function TestForm({ lang, test, onClose, onSave }: TestFormProps) {
  const [formData, setFormData] = useState<Omit<ChemicalTest, 'id' | 'created_at' | 'updated_at'>>({
    method_name: '',
    method_name_ar: '',
    test_type: '',
    test_number: '',
    prepare: '',
    prepare_ar: '',
    reference: '',
    results: [],
    created_by: 'admin'
  });
  const [loading, setLoading] = useState(false);

  const t = getTranslationsSync(lang);

  useEffect(() => {
    if (test) {
      setFormData({
        method_name: test.method_name,
        method_name_ar: test.method_name_ar,
        test_type: test.test_type,
        test_number: test.test_number,
        prepare: test.prepare,
        prepare_ar: test.prepare_ar,
        reference: test.reference || '',
        results: test.results,
        created_by: test.created_by || 'admin'
      });
    }
  }, [test]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddResult = () => {
    const newResult: TestResult = {
      color_result: '',
      color_result_ar: '',
      possible_substance: '',
      possible_substance_ar: '',
      hex_color: '',
      rgb_color: '',
      confidence_level: 100
    };

    setFormData(prev => ({
      ...prev,
      results: [...prev.results, newResult]
    }));
  };

  const handleUpdateResult = (index: number, field: keyof TestResult, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results.map((result, i) => 
        i === index ? { ...result, [field]: value } : result
      )
    }));
  };

  const handleDeleteResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.method_name || !formData.method_name_ar) {
      toast.error(lang === 'ar' ? 'يرجى إدخال اسم الاختبار' : 'Please enter test name');
      return;
    }

    if (formData.results.length === 0) {
      toast.error(lang === 'ar' ? 'يرجى إضافة نتيجة واحدة على الأقل' : 'Please add at least one result');
      return;
    }

    setLoading(true);
    try {
      if (test?.id) {
        // Update existing test
        await firebaseTestsService.updateTest(test.id, formData);
        toast.success(lang === 'ar' ? 'تم تحديث الاختبار' : 'Test updated successfully');
      } else {
        // Add new test
        await firebaseTestsService.addTest(formData);
        toast.success(lang === 'ar' ? 'تم إضافة الاختبار' : 'Test added successfully');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error(lang === 'ar' ? 'خطأ في حفظ الاختبار' : 'Error saving test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-foreground">
            {test ? 
              (lang === 'ar' ? 'تحرير الاختبار' : 'Edit Test') : 
              (lang === 'ar' ? 'إضافة اختبار جديد' : 'Add New Test')
            }
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'اسم الاختبار (إنجليزي)' : 'Test Name (English)'}
              </label>
              <input
                type="text"
                value={formData.method_name}
                onChange={(e) => handleInputChange('method_name', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.method_name_ar}
                onChange={(e) => handleInputChange('method_name_ar', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'نوع الاختبار' : 'Test Type'}
              </label>
              <select
                value={formData.test_type}
                onChange={(e) => handleInputChange('test_type', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{lang === 'ar' ? 'اختر النوع' : 'Select Type'}</option>
                <option value="F/L">F/L - Fluorescent/Light</option>
                <option value="L">L - Light</option>
                <option value="UV">UV - Ultraviolet</option>
                <option value="Chemical">Chemical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'رقم الاختبار' : 'Test Number'}
              </label>
              <input
                type="text"
                value={formData.test_number}
                onChange={(e) => handleInputChange('test_number', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'خطوات التحضير (إنجليزي)' : 'Preparation Steps (English)'}
              </label>
              <textarea
                value={formData.prepare}
                onChange={(e) => handleInputChange('prepare', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'خطوات التحضير (عربي)' : 'Preparation Steps (Arabic)'}
              </label>
              <textarea
                value={formData.prepare_ar}
                onChange={(e) => handleInputChange('prepare_ar', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {lang === 'ar' ? 'المرجع العلمي' : 'Scientific Reference'}
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Test Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {lang === 'ar' ? 'النتائج المحتملة' : 'Possible Results'}
              </h3>
              <Button type="button" onClick={handleAddResult} size="sm">
                <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {lang === 'ar' ? 'إضافة نتيجة' : 'Add Result'}
              </Button>
            </div>

            <div className="space-y-4">
              {formData.results.map((result, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">
                      {lang === 'ar' ? `النتيجة ${index + 1}` : `Result ${index + 1}`}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResult(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        {lang === 'ar' ? 'اللون (إنجليزي)' : 'Color (English)'}
                      </label>
                      <input
                        type="text"
                        value={result.color_result}
                        onChange={(e) => handleUpdateResult(index, 'color_result', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        {lang === 'ar' ? 'اللون (عربي)' : 'Color (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={result.color_result_ar}
                        onChange={(e) => handleUpdateResult(index, 'color_result_ar', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        {lang === 'ar' ? 'المادة (إنجليزي)' : 'Substance (English)'}
                      </label>
                      <input
                        type="text"
                        value={result.possible_substance}
                        onChange={(e) => handleUpdateResult(index, 'possible_substance', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        {lang === 'ar' ? 'المادة (عربي)' : 'Substance (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={result.possible_substance_ar}
                        onChange={(e) => handleUpdateResult(index, 'possible_substance_ar', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-border rounded focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 
                (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') :
                (test ? 
                  (lang === 'ar' ? 'تحديث' : 'Update') : 
                  (lang === 'ar' ? 'إضافة' : 'Add')
                )
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
