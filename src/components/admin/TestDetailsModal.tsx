'use client';

import React from 'react';
import { ChemicalTest } from '@/lib/firebase-tests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BeakerIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import PrintButton from '../print/PrintButton';

interface TestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: ChemicalTest | null;
  translations: any;
  isRTL: boolean;
}

export default function TestDetailsModal({
  isOpen,
  onClose,
  test,
  translations,
  isRTL
}: TestDetailsModalProps) {
  if (!test) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'specialized': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BeakerIcon className="h-6 w-6 text-blue-600" />
            {isRTL ? test.method_name_ar : test.method_name}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? test.description_ar : test.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {isRTL ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="preparation">
              {isRTL ? 'التحضير' : 'Preparation'}
            </TabsTrigger>
            <TabsTrigger value="results">
              {isRTL ? 'النتائج' : 'Results'}
            </TabsTrigger>
            <TabsTrigger value="reference">
              {isRTL ? 'المراجع' : 'Reference'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    {isRTL ? 'معلومات أساسية' : 'Basic Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'رقم الاختبار:' : 'Test Number:'}
                    </label>
                    <p className="text-sm">{test.test_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'نوع الاختبار:' : 'Test Type:'}
                    </label>
                    <div className="mt-1">
                      <Badge variant="outline">{test.test_type || 'N/A'}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'الفئة:' : 'Category:'}
                    </label>
                    <div className="mt-1">
                      <Badge className={getCategoryColor(test.category || '')}>
                        {test.category || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'مستوى الأمان:' : 'Safety Level:'}
                    </label>
                    <div className="mt-1">
                      <Badge className={getSafetyLevelColor(test.safety_level || '')}>
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        {test.safety_level || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    {isRTL ? 'معلومات التوقيت' : 'Timing Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'وقت التحضير:' : 'Preparation Time:'}
                    </label>
                    <p className="text-sm">
                      {test.preparation_time ? `${test.preparation_time} ${isRTL ? 'دقيقة' : 'minutes'}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'تاريخ الإنشاء:' : 'Created At:'}
                    </label>
                    <p className="text-sm">{formatDate(test.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'آخر تحديث:' : 'Last Updated:'}
                    </label>
                    <p className="text-sm">{formatDate(test.updated_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'أنشئ بواسطة:' : 'Created By:'}
                    </label>
                    <p className="text-sm">{test.created_by || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preparation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BeakerIcon className="h-5 w-5" />
                  {isRTL ? 'تعليمات التحضير' : 'Preparation Instructions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      {isRTL ? 'التعليمات (العربية):' : 'Instructions (Arabic):'}
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-right" dir="rtl">
                        {test.prepare_ar || (isRTL ? 'لا توجد تعليمات متاحة' : 'No instructions available')}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      {isRTL ? 'التعليمات (الإنجليزية):' : 'Instructions (English):'}
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm" dir="ltr">
                        {test.prepare || 'No instructions available'}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <EyeIcon className="h-5 w-5" />
                  {isRTL ? 'النتائج المتوقعة' : 'Expected Results'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'نتيجة اللون:' : 'Color Result:'}
                    </label>
                    <p className="text-sm mt-1">
                      {isRTL ? test.color_result_ar : test.color_result}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {isRTL ? 'المادة المحتملة:' : 'Possible Substance:'}
                    </label>
                    <p className="text-sm mt-1">
                      {isRTL ? test.possible_substance_ar : test.possible_substance}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reference" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5" />
                  {isRTL ? 'المرجع العلمي' : 'Scientific Reference'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm">
                    {test.reference || (isRTL ? 'لا يوجد مرجع متاح' : 'No reference available')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <PrintButton
            test={test}
            variant="outline"
            size="sm"
          />
          <Button onClick={onClose} variant="outline">
            {isRTL ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
