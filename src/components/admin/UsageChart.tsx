'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface UsageChartProps {
  lang: Language;
}

interface ChartData {
  dailyUsage: Array<{
    date: string;
    tests: number;
    users: number;
  }>;
  testsByType: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    tests: number;
    users: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function UsageChart({ lang }: UsageChartProps) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'daily' | 'types' | 'monthly'>('daily');

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);
      
      // محاكاة تحميل البيانات - يمكن استبدالها بـ API حقيقي
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: ChartData = {
        dailyUsage: [
          { date: '2025-01-01', tests: 45, users: 12 },
          { date: '2025-01-02', tests: 52, users: 15 },
          { date: '2025-01-03', tests: 38, users: 10 },
          { date: '2025-01-04', tests: 67, users: 18 },
          { date: '2025-01-05', tests: 41, users: 11 },
          { date: '2025-01-06', tests: 58, users: 16 },
          { date: '2025-01-07', tests: 73, users: 20 }
        ],
        testsByType: [
          { name: lang === 'ar' ? 'اختبار ماركيز' : 'Marquis Test', value: 342, color: COLORS[0] },
          { name: lang === 'ar' ? 'اختبار ميك' : 'Mecke Test', value: 298, color: COLORS[1] },
          { name: lang === 'ar' ? 'كبريتات الحديد' : 'Ferric Sulfate', value: 187, color: COLORS[2] },
          { name: lang === 'ar' ? 'اختبار ليبرمان' : 'Liebermann Test', value: 156, color: COLORS[3] },
          { name: lang === 'ar' ? 'اختبار سايمون' : 'Simon Test', value: 134, color: COLORS[4] },
          { name: lang === 'ar' ? 'اختبار إيرليش' : 'Ehrlich Test', value: 130, color: COLORS[5] }
        ],
        monthlyTrends: [
          { month: lang === 'ar' ? 'يناير' : 'Jan', tests: 1247, users: 89 },
          { month: lang === 'ar' ? 'فبراير' : 'Feb', tests: 1356, users: 95 },
          { month: lang === 'ar' ? 'مارس' : 'Mar', tests: 1189, users: 82 },
          { month: lang === 'ar' ? 'أبريل' : 'Apr', tests: 1423, users: 103 },
          { month: lang === 'ar' ? 'مايو' : 'May', tests: 1567, users: 112 },
          { month: lang === 'ar' ? 'يونيو' : 'Jun', tests: 1678, users: 125 }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-gray-500">
          {lang === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data'}
        </p>
      </div>
    );
  }

  const renderDailyUsageChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.dailyUsage}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
          formatter={(value, name) => [
            value,
            name === 'tests' 
              ? (lang === 'ar' ? 'الاختبارات' : 'Tests')
              : (lang === 'ar' ? 'المستخدمون' : 'Users')
          ]}
        />
        <Bar dataKey="tests" fill="#0088FE" name="tests" />
        <Bar dataKey="users" fill="#00C49F" name="users" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTestTypesChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.testsByType}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.testsByType.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderMonthlyTrendsChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.monthlyTrends}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="tests" 
          stroke="#0088FE" 
          strokeWidth={2}
          name={lang === 'ar' ? 'الاختبارات' : 'Tests'}
        />
        <Line 
          type="monotone" 
          dataKey="users" 
          stroke="#00C49F" 
          strokeWidth={2}
          name={lang === 'ar' ? 'المستخدمون' : 'Users'}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveChart('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeChart === 'daily'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {lang === 'ar' ? 'الاستخدام اليومي' : 'Daily Usage'}
        </button>
        <button
          onClick={() => setActiveChart('types')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeChart === 'types'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {lang === 'ar' ? 'أنواع الاختبارات' : 'Test Types'}
        </button>
        <button
          onClick={() => setActiveChart('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeChart === 'monthly'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {lang === 'ar' ? 'الاتجاهات الشهرية' : 'Monthly Trends'}
        </button>
      </div>

      {/* Chart Content */}
      <div className="h-80">
        {activeChart === 'daily' && renderDailyUsageChart()}
        {activeChart === 'types' && renderTestTypesChart()}
        {activeChart === 'monthly' && renderMonthlyTrendsChart()}
      </div>

      {/* Chart Description */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {activeChart === 'daily' && (
          <p>
            {lang === 'ar' 
              ? 'يعرض هذا المخطط الاستخدام اليومي للاختبارات وعدد المستخدمين النشطين'
              : 'This chart shows daily test usage and active user count'
            }
          </p>
        )}
        {activeChart === 'types' && (
          <p>
            {lang === 'ar' 
              ? 'يعرض هذا المخطط توزيع أنواع الاختبارات المختلفة المستخدمة'
              : 'This chart shows the distribution of different test types used'
            }
          </p>
        )}
        {activeChart === 'monthly' && (
          <p>
            {lang === 'ar' 
              ? 'يعرض هذا المخطط الاتجاهات الشهرية للاستخدام على مدار الأشهر الماضية'
              : 'This chart shows monthly usage trends over the past months'
            }
          </p>
        )}
      </div>
    </div>
  );
}
