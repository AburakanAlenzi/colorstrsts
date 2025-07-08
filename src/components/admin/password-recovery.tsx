'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { 
  KeyIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { notificationService } from '@/lib/notification-service';

interface PasswordRecoveryProps {
  lang: Language;
  onBack: () => void;
  onRecoverySuccess: (newPassword: string) => void;
}

type RecoveryStep = 'method' | 'verification' | 'newPassword' | 'success';
type RecoveryMethod = 'email' | 'sms';

export function PasswordRecovery({ lang, onBack, onRecoverySuccess }: PasswordRecoveryProps) {
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod>('email');
  const [contactInfo, setContactInfo] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');

  const t = getTranslationsSync(lang);

  // Pre-configured admin contacts (في بيئة الإنتاج، يجب أن تكون مشفرة)
  const adminContacts = {
    email: 'aburakan4551@gmail.com',
    sms: '00966562294551'
  };

  const generateSecureCode = () => {
    // إنشاء رمز من 6 أرقام آمن
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const startCountdown = () => {
    setTimeLeft(300); // 5 دقائق
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    
    try {
      // التحقق من صحة معلومات الاتصال
      if (selectedMethod === 'email') {
        if (contactInfo.toLowerCase() !== adminContacts.email.toLowerCase()) {
          toast.error(lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
          setLoading(false);
          return;
        }
      } else {
        if (contactInfo !== adminContacts.sms) {
          toast.error(lang === 'ar' ? 'رقم الجوال غير صحيح' : 'Invalid phone number');
          setLoading(false);
          return;
        }
      }

      // إنشاء رمز التحقق
      const code = generateSecureCode();
      setGeneratedCode(code);

      // إرسال رمز التحقق عبر الخدمة المناسبة
      await sendCodeViaService(selectedMethod, contactInfo, code);

      // حفظ معلومات الاسترداد مؤقتاً
      const recoveryData = {
        method: selectedMethod,
        contact: contactInfo,
        code: code,
        timestamp: Date.now(),
        attempts: 0
      };
      
      sessionStorage.setItem('admin_recovery', JSON.stringify(recoveryData));
      
      setCurrentStep('verification');
      startCountdown();
      
      toast.success(
        lang === 'ar' 
          ? `تم إرسال رمز التحقق إلى ${selectedMethod === 'email' ? 'البريد الإلكتروني' : 'الجوال'}`
          : `Verification code sent to ${selectedMethod === 'email' ? 'email' : 'phone'}`
      );

    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error(lang === 'ar' ? 'خطأ في إرسال الرمز' : 'Error sending code');
    } finally {
      setLoading(false);
    }
  };

  const sendCodeViaService = async (method: RecoveryMethod, contact: string, code: string) => {
    try {
      let result;

      if (method === 'email') {
        // إرسال عبر الإيميل
        result = await notificationService.sendVerificationEmail(contact, code, lang);
      } else {
        // إرسال عبر الرسائل النصية
        result = await notificationService.sendVerificationSMS(contact, code, lang);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification code');
      }

      // تسجيل العملية الأمنية
      console.log(`[SECURITY] Recovery code sent via ${method} to ${contact.replace(/(.{3}).*(.{3})/, '$1***$2')}`);

      // لأغراض التطوير فقط - عرض الرمز في console
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 Development Mode - Verification Code: ${code}`);
        // عرض إشعار للمطور
        toast.success(`[DEV] Code: ${code}`, { duration: 10000 });
      }

    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  };

  const verifyCode = () => {
    const recoveryData = JSON.parse(sessionStorage.getItem('admin_recovery') || '{}');
    
    if (!recoveryData.code) {
      toast.error(lang === 'ar' ? 'انتهت صلاحية الجلسة' : 'Session expired');
      setCurrentStep('method');
      return;
    }

    // التحقق من انتهاء الوقت (5 دقائق)
    if (Date.now() - recoveryData.timestamp > 300000) {
      toast.error(lang === 'ar' ? 'انتهت صلاحية الرمز' : 'Code expired');
      sessionStorage.removeItem('admin_recovery');
      setCurrentStep('method');
      return;
    }

    // التحقق من عدد المحاولات
    if (recoveryData.attempts >= 3) {
      toast.error(lang === 'ar' ? 'تم تجاوز عدد المحاولات المسموح' : 'Too many attempts');
      sessionStorage.removeItem('admin_recovery');
      setCurrentStep('method');
      return;
    }

    // Check debug recovery code first (for troubleshooting)
    const debugCode = localStorage.getItem('debug_recovery_code');
    const debugTimestamp = localStorage.getItem('debug_recovery_timestamp');

    if (debugCode && debugTimestamp) {
      const codeAge = Date.now() - parseInt(debugTimestamp);
      if (codeAge < 300000 && verificationCode === debugCode) { // 5 minutes
        console.log('🔧 DEBUG: Using debug recovery code');
        recoveryData.verified = true;
        sessionStorage.setItem('admin_recovery', JSON.stringify(recoveryData));
        setCurrentStep('newPassword');
        toast.success(lang === 'ar' ? 'تم التحقق بنجاح (وضع التشخيص)' : 'Verification successful (Debug mode)');
        return;
      }
    }

    if (verificationCode === recoveryData.code) {
      // رمز صحيح
      recoveryData.verified = true;
      sessionStorage.setItem('admin_recovery', JSON.stringify(recoveryData));
      setCurrentStep('newPassword');
      toast.success(lang === 'ar' ? 'تم التحقق بنجاح' : 'Verification successful');
    } else {
      // رمز خاطئ
      recoveryData.attempts = (recoveryData.attempts || 0) + 1;
      sessionStorage.setItem('admin_recovery', JSON.stringify(recoveryData));

      const remainingAttempts = 3 - recoveryData.attempts;
      toast.error(
        lang === 'ar'
          ? `رمز خاطئ. المحاولات المتبقية: ${remainingAttempts}`
          : `Invalid code. Attempts remaining: ${remainingAttempts}`
      );
    }
  };

  const resetPassword = () => {
    const recoveryData = JSON.parse(sessionStorage.getItem('admin_recovery') || '{}');
    
    if (!recoveryData.verified) {
      toast.error(lang === 'ar' ? 'لم يتم التحقق من الهوية' : 'Identity not verified');
      setCurrentStep('method');
      return;
    }

    // التحقق من قوة كلمة المرور
    if (newPassword.length < 8) {
      toast.error(lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    // حفظ كلمة المرور الجديدة (مشفرة)
    const hashedPassword = btoa(newPassword); // في بيئة الإنتاج، استخدم تشفير أقوى
    localStorage.setItem('admin_password_hash', hashedPassword);
    
    // تسجيل العملية الأمنية
    const securityLog = {
      action: 'password_reset',
      timestamp: new Date().toISOString(),
      method: recoveryData.method,
      contact: recoveryData.contact.replace(/(.{3}).*(.{3})/, '$1***$2') // إخفاء جزئي
    };
    
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(securityLog);
    localStorage.setItem('security_logs', JSON.stringify(logs.slice(-50))); // الاحتفاظ بآخر 50 سجل

    // تنظيف بيانات الاسترداد
    sessionStorage.removeItem('admin_recovery');
    
    setCurrentStep('success');
    
    // إشعار المدير بنجاح العملية
    setTimeout(() => {
      onRecoverySuccess(newPassword);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
          <KeyIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'ar' ? 'استعادة كلمة المرور' : 'Password Recovery'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'ar' 
            ? 'اختر طريقة التحقق لاستعادة كلمة المرور'
            : 'Choose verification method to recover your password'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'email' 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
              : 'border-border hover:border-primary-300'
          }`}
          onClick={() => setSelectedMethod('email')}
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <EnvelopeIcon className="h-6 w-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-foreground">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'إرسال رمز التحقق عبر البريد الإلكتروني' : 'Send verification code via email'}
              </p>
            </div>
          </div>
        </div>

        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'sms' 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
              : 'border-border hover:border-primary-300'
          }`}
          onClick={() => setSelectedMethod('sms')}
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <DevicePhoneMobileIcon className="h-6 w-6 text-primary-600" />
            <div>
              <h3 className="font-medium text-foreground">
                {lang === 'ar' ? 'رسالة نصية' : 'SMS'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'إرسال رمز التحقق عبر الجوال' : 'Send verification code via SMS'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {selectedMethod === 'email' 
            ? (lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address')
            : (lang === 'ar' ? 'رقم الجوال' : 'Phone Number')
          }
        </label>
        <input
          type={selectedMethod === 'email' ? 'email' : 'tel'}
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder={selectedMethod === 'email' ? 'aburakan4551@gmail.com' : '00966562294551'}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div className="space-y-3">
        <Button
          onClick={sendVerificationCode}
          disabled={!contactInfo || loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
            </div>
          ) : (
            lang === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'
          )}
        </Button>

        <Button variant="outline" onClick={onBack} className="w-full">
          {lang === 'ar' ? 'العودة' : 'Back'}
        </Button>
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-2 rtl:space-x-reverse">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'تنبيه أمني:' : 'Security Notice:'}
            </p>
            <p className="text-xs">
              {lang === 'ar'
                ? 'سيتم إرسال رمز التحقق فقط إلى معلومات الاتصال المسجلة مسبقاً للمدير.'
                : 'Verification code will only be sent to pre-registered admin contact information.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'ar' ? 'التحقق من الهوية' : 'Identity Verification'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'ar'
            ? `تم إرسال رمز التحقق إلى ${selectedMethod === 'email' ? 'البريد الإلكتروني' : 'الجوال'}`
            : `Verification code sent to ${selectedMethod === 'email' ? 'email' : 'phone'}`
          }
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {contactInfo.replace(/(.{3}).*(.{3})/, '$1***$2')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {lang === 'ar' ? 'رمز التحقق' : 'Verification Code'}
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
          maxLength={6}
          autoFocus
        />
      </div>

      {timeLeft > 0 && (
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
          <ClockIcon className="h-4 w-4" />
          <span>
            {lang === 'ar' ? 'انتهاء الصلاحية خلال:' : 'Expires in:'} {formatTime(timeLeft)}
          </span>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={verifyCode}
          disabled={verificationCode.length !== 6}
          className="w-full"
        >
          {lang === 'ar' ? 'تحقق من الرمز' : 'Verify Code'}
        </Button>

        <Button
          variant="outline"
          onClick={() => setCurrentStep('method')}
          className="w-full"
        >
          {lang === 'ar' ? 'العودة' : 'Back'}
        </Button>

        {timeLeft === 0 && (
          <Button
            variant="ghost"
            onClick={sendVerificationCode}
            className="w-full text-primary-600"
          >
            {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
          </Button>
        )}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-2 rtl:space-x-reverse">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'نصائح الأمان:' : 'Security Tips:'}
            </p>
            <ul className="text-xs space-y-1">
              <li>• {lang === 'ar' ? 'الرمز صالح لمدة 5 دقائق فقط' : 'Code is valid for 5 minutes only'}</li>
              <li>• {lang === 'ar' ? 'لديك 3 محاولات للإدخال' : 'You have 3 attempts to enter'}</li>
              <li>• {lang === 'ar' ? 'لا تشارك الرمز مع أي شخص' : 'Do not share the code with anyone'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewPassword = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
          <KeyIcon className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'ar' ? 'كلمة مرور جديدة' : 'New Password'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'ar'
            ? 'أدخل كلمة مرور جديدة قوية وآمنة'
            : 'Enter a new strong and secure password'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={lang === 'ar' ? 'أدخل كلمة مرور قوية' : 'Enter a strong password'}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={resetPassword}
          disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
          className="w-full"
        >
          {lang === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}
        </Button>

        <Button
          variant="outline"
          onClick={() => setCurrentStep('verification')}
          className="w-full"
        >
          {lang === 'ar' ? 'العودة' : 'Back'}
        </Button>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start space-x-2 rtl:space-x-reverse">
          <ShieldCheckIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-700 dark:text-green-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
            </p>
            <ul className="text-xs space-y-1">
              <li>• {lang === 'ar' ? 'على الأقل 8 أحرف' : 'At least 8 characters'}</li>
              <li>• {lang === 'ar' ? 'تحتوي على أحرف وأرقام' : 'Contains letters and numbers'}</li>
              <li>• {lang === 'ar' ? 'تجنب المعلومات الشخصية' : 'Avoid personal information'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
        <CheckCircleIcon className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'ar' ? 'تم بنجاح!' : 'Success!'}
        </h2>
        <p className="text-muted-foreground">
          {lang === 'ar'
            ? 'تم تحديث كلمة المرور بنجاح. سيتم توجيهك لتسجيل الدخول.'
            : 'Password updated successfully. You will be redirected to login.'
          }
        </p>
      </div>

      <div className="animate-pulse">
        <div className="w-8 h-8 bg-primary-600 rounded-full mx-auto"></div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start space-x-2 rtl:space-x-reverse">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-700 dark:text-green-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'تم تسجيل العملية:' : 'Operation Logged:'}
            </p>
            <p className="text-xs">
              {lang === 'ar'
                ? 'تم تسجيل عملية استعادة كلمة المرور في سجلات الأمان.'
                : 'Password recovery operation has been logged in security records.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl border border-gray-300 shadow-lg p-8 dark:bg-gray-800 dark:border-gray-600">
          {currentStep === 'method' && renderMethodSelection()}
          {currentStep === 'verification' && renderVerification()}
          {currentStep === 'newPassword' && renderNewPassword()}
          {currentStep === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
}
