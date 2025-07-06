'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { useAuth } from '@/components/providers';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface UserProfileProps {
  lang: Language;
}

export function UserProfile({ lang }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const t = getTranslationsSync(lang);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.full_name || '');

  if (!user) {
    return null;
  }

  const handleSaveEdit = () => {
    // هنا يمكن إضافة منطق حفظ التعديلات
    console.log('Saving edited name:', editedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(user?.full_name || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return lang === 'ar' ? 'مدير' : 'Administrator';
      case 'super_admin':
        return lang === 'ar' ? 'مدير عام' : 'Super Administrator';
      default:
        return lang === 'ar' ? 'مستخدم' : 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'super_admin':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      default:
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* معلومات المستخدم الأساسية */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
          </h2>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* صورة المستخدم والاسم */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground"
                    placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  />
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button size="sm" onClick={handleSaveEdit}>
                      <CheckIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                      {lang === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <XMarkIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-foreground">
                    {user.full_name || user.email?.split('@')[0] || t('navigation.user')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* البريد الإلكتروني */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </p>
            </div>
          </div>

          {/* تاريخ الإنشاء */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">
                {formatDate(user.created_at)}
              </p>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'تاريخ الانضمام' : 'Member Since'}
              </p>
            </div>
          </div>

          {/* الدور */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleText(user.role)}
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === 'ar' ? 'نوع الحساب' : 'Account Type'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* إعدادات الحساب */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {lang === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <CogIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {lang === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.preferred_language === 'ar' ? 'العربية' : 'English'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {lang === 'ar' ? 'تغيير' : 'Change'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'آخر تحديث منذ شهر' : 'Last updated a month ago'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {lang === 'ar' ? 'تغيير' : 'Change'}
            </Button>
          </div>
        </div>
      </div>

      {/* إجراءات الحساب */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {lang === 'ar' ? 'إجراءات الحساب' : 'Account Actions'}
        </h2>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut()}
          >
            {lang === 'ar' ? 'تسجيل الخروج من جميع الأجهزة' : 'Sign out from all devices'}
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => {
              if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف الحساب؟' : 'Are you sure you want to delete your account?')) {
                console.log('Delete account requested');
              }
            }}
          >
            {lang === 'ar' ? 'حذف الحساب' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </div>
  );
}
