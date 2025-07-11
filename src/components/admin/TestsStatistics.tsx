'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BeakerIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Language } from '@/types';

interface TestsStatisticsProps {
  lang: Language;
  tests: any[];
  onRefresh?: () => void;
}

interface StatsSummary {
  total: number;
  byCategory: Record<string, number>;
  bySafetyLevel: Record<string, number>;
  byTestType: Record<string, number>;
  avgPreparationTime: number;
  completionRate: number;
  missingData: string[];
}

export default function TestsStatistics({ lang, tests, onRefresh }: TestsStatisticsProps) {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const isRTL = lang === 'ar';

  useEffect(() => {
    calculateStatistics();
  }, [tests]);

  const calculateStatistics = () => {
    setLoading(true);
    
    try {
      const total = tests.length;
      const byCategory: Record<string, number> = {};
      const bySafetyLevel: Record<string, number> = {};
      const byTestType: Record<string, number> = {};
      const missingData: string[] = [];
      
      let totalPreparationTime = 0;
      let validPreparationTimes = 0;
      let completeTests = 0;

      tests.forEach((test, index) => {
        // Count by category
        const category = test.category || 'unknown';
        byCategory[category] = (byCategory[category] || 0) + 1;

        // Count by safety level
        const safetyLevel = test.safety_level || 'unknown';
        bySafetyLevel[safetyLevel] = (bySafetyLevel[safetyLevel] || 0) + 1;

        // Count by test type
        const testType = test.test_type || 'unknown';
        byTestType[testType] = (byTestType[testType] || 0) + 1;

        // Calculate preparation time
        if (test.preparation_time && test.preparation_time > 0) {
          totalPreparationTime += test.preparation_time;
          validPreparationTimes++;
        }

        // Check completeness
        const requiredFields = [
          'method_name', 'method_name_ar', 'description', 'description_ar',
          'prepare', 'prepare_ar', 'test_type', 'test_number', 'reference',
          'category', 'safety_level', 'preparation_time'
        ];

        const missingFields = requiredFields.filter(field => 
          !test[field] || (typeof test[field] === 'string' && test[field].trim() === '')
        );

        if (missingFields.length === 0) {
          completeTests++;
        } else {
          missingData.push(`Test ${index + 1}: ${missingFields.join(', ')}`);
        }
      });

      const avgPreparationTime = validPreparationTimes > 0 
        ? Math.round(totalPreparationTime / validPreparationTimes) 
        : 0;

      const completionRate = total > 0 ? Math.round((completeTests / total) * 100) : 0;

      setStats({
        total,
        byCategory,
        bySafetyLevel,
        byTestType,
        avgPreparationTime,
        completionRate,
        missingData
      });
    } catch (error) {
      console.error('Error calculating statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'specialized': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إحصائيات الاختبارات' : 'Tests Statistics'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isRTL ? 'تحليل شامل لبيانات الاختبارات' : 'Comprehensive analysis of tests data'}
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}
            </CardTitle>
            <BeakerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'معدل الاكتمال' : 'Completion Rate'}
            </CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'من البيانات مكتملة' : 'of data complete'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'متوسط وقت التحضير' : 'Avg Prep Time'}
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPreparationTime}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'دقيقة' : 'minutes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'البيانات الناقصة' : 'Missing Data'}
            </CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.missingData.length}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'اختبارات ناقصة' : 'incomplete tests'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isRTL ? 'توزيع الفئات' : 'Categories Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <Badge className={getCategoryColor(category)}>
                  {category}
                </Badge>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isRTL ? 'مستويات الأمان' : 'Safety Levels'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.bySafetyLevel).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <Badge className={getSafetyLevelColor(level)}>
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  {level}
                </Badge>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Test Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isRTL ? 'أنواع الاختبارات' : 'Test Types'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.byTestType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <Badge variant="outline">
                  {type}
                </Badge>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Missing Data Details */}
      {stats.missingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-orange-600">
              {isRTL ? 'تفاصيل البيانات الناقصة' : 'Missing Data Details'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'الاختبارات التي تحتاج إلى إكمال البيانات' : 'Tests that need data completion'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stats.missingData.slice(0, 10).map((item, index) => (
                <div key={index} className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  {item}
                </div>
              ))}
              {stats.missingData.length > 10 && (
                <p className="text-sm text-gray-500">
                  {isRTL ? `و ${stats.missingData.length - 10} أخرى...` : `and ${stats.missingData.length - 10} more...`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
