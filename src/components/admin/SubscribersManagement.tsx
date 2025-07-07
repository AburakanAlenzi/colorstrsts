'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, CreditCard, Calendar, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  endDate: string;
  paymentMethod: 'stc_pay' | 'credit_card';
  amount: number;
  stcPayId?: string;
}

interface SubscribersManagementProps {
  isRTL: boolean;
}

export default function SubscribersManagement({ isRTL }: SubscribersManagementProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0,
    stcPayUsers: 0
  });

  useEffect(() => {
    // Load subscribers from localStorage
    const storedSubscribers = localStorage.getItem('subscribers');
    if (storedSubscribers) {
      const subs = JSON.parse(storedSubscribers);
      setSubscribers(subs);
      updateStats(subs);
    } else {
      // Default subscribers for demo
      const defaultSubscribers: Subscriber[] = [
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '+966501234567',
          plan: 'premium',
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-12-15',
          paymentMethod: 'stc_pay',
          amount: 299,
          stcPayId: 'STC_PAY_001'
        },
        {
          id: '2',
          name: 'فاطمة علي',
          email: 'fatima@example.com',
          phone: '+966507654321',
          plan: 'basic',
          status: 'active',
          startDate: '2024-02-01',
          endDate: '2024-08-01',
          paymentMethod: 'stc_pay',
          amount: 99,
          stcPayId: 'STC_PAY_002'
        },
        {
          id: '3',
          name: 'محمد السعد',
          email: 'mohammed@example.com',
          phone: '+966509876543',
          plan: 'enterprise',
          status: 'pending',
          startDate: '2024-03-01',
          endDate: '2025-03-01',
          paymentMethod: 'stc_pay',
          amount: 599,
          stcPayId: 'STC_PAY_003'
        }
      ];
      setSubscribers(defaultSubscribers);
      localStorage.setItem('subscribers', JSON.stringify(defaultSubscribers));
      updateStats(defaultSubscribers);
    }
  }, []);

  const updateStats = (subs: Subscriber[]) => {
    const stats = {
      total: subs.length,
      active: subs.filter(s => s.status === 'active').length,
      revenue: subs.reduce((sum, s) => sum + s.amount, 0),
      stcPayUsers: subs.filter(s => s.paymentMethod === 'stc_pay').length
    };
    setStats(stats);
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'pending') => {
    const updatedSubscribers = subscribers.map(sub =>
      sub.id === id ? { ...sub, status: newStatus } : sub
    );
    setSubscribers(updatedSubscribers);
    localStorage.setItem('subscribers', JSON.stringify(updatedSubscribers));
    updateStats(updatedSubscribers);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'enterprise': return 'bg-gold-100 text-gold-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'inactive': return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return isRTL ? `${amount} ريال` : `${amount} SAR`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isRTL ? 'إدارة المشتركين' : 'Subscribers Management'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isRTL ? 'إدارة المشتركين والاشتراكات ومدفوعات STC Pay' : 'Manage subscribers, subscriptions and STC Pay payments'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4 rtl:mr-4 rtl:ml-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? 'إجمالي المشتركين' : 'Total Subscribers'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4 rtl:mr-4 rtl:ml-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? 'المشتركين النشطين' : 'Active Subscribers'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4 rtl:mr-4 rtl:ml-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <div className="ml-4 rtl:mr-4 rtl:ml-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? 'مستخدمي STC Pay' : 'STC Pay Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.stcPayUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isRTL ? 'قائمة المشتركين' : 'Subscribers List'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'إدارة حالة المشتركين والاشتراكات' : 'Manage subscriber status and subscriptions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscribers.map((subscriber) => (
              <div key={subscriber.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{subscriber.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{subscriber.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{subscriber.phone}</p>
                  </div>
                  <div className="text-right rtl:text-left space-y-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscriber.plan)}`}>
                      {subscriber.plan.toUpperCase()}
                    </span>
                    <div className={`flex items-center gap-1 ${getStatusColor(subscriber.status)}`}>
                      {subscriber.status === 'active' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <span className="text-sm font-medium">
                        {isRTL ? 
                          (subscriber.status === 'active' ? 'نشط' : subscriber.status === 'inactive' ? 'غير نشط' : 'معلق') :
                          subscriber.status
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{isRTL ? 'تاريخ البداية:' : 'Start Date:'}</span>
                    <p>{new Date(subscriber.startDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                  </div>
                  <div>
                    <span className="font-medium">{isRTL ? 'تاريخ الانتهاء:' : 'End Date:'}</span>
                    <p>{new Date(subscriber.endDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                  </div>
                  <div>
                    <span className="font-medium">{isRTL ? 'المبلغ:' : 'Amount:'}</span>
                    <p>{formatCurrency(subscriber.amount)}</p>
                  </div>
                </div>

                {subscriber.paymentMethod === 'stc_pay' && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {isRTL ? 'مدفوع عبر STC Pay' : 'Paid via STC Pay'}
                      </span>
                    </div>
                    {subscriber.stcPayId && (
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        {isRTL ? 'معرف الدفع:' : 'Payment ID:'} {subscriber.stcPayId}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant={subscriber.status === 'active' ? 'outline' : 'default'}
                    onClick={() => handleStatusChange(subscriber.id, subscriber.status === 'active' ? 'inactive' : 'active')}
                  >
                    {subscriber.status === 'active' ? 
                      (isRTL ? 'إلغاء التفعيل' : 'Deactivate') : 
                      (isRTL ? 'تفعيل' : 'Activate')
                    }
                  </Button>
                  {subscriber.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(subscriber.id, 'active')}
                    >
                      {isRTL ? 'قبول الاشتراك' : 'Approve Subscription'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* STC Pay Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isRTL ? 'تكامل STC Pay' : 'STC Pay Integration'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {isRTL ? 
                'تم تكامل النظام مع STC Pay لمعالجة المدفوعات. جميع المعاملات آمنة ومشفرة.' :
                'The system is integrated with STC Pay for payment processing. All transactions are secure and encrypted.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
