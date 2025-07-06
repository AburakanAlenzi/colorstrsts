// خدمة الإيميل البديلة بدون تبعيات خارجية
// Alternative Email Service without external dependencies

interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface EmailData {
  to_email: string;
  to_name: string;
  subject: string;
  verification_code: string;
  message: string;
  language: string;
}

class EmailService {
  private static instance: EmailService;
  private isInitialized = false;

  // إعدادات الإيميل (يمكن تكوينها لاحقاً)
  private config = {
    serviceId: 'service_admin_recovery',
    templateId: 'template_verification',
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
  };

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * تهيئة خدمة الإيميل البديلة
   * Initialize alternative email service
   */
  async initialize(): Promise<boolean> {
    try {
      // في بيئة التطوير، نستخدم محاكاة
      if (process.env.NODE_ENV === 'development') {
        this.isInitialized = true;
        console.log('📧 Email service initialized in development mode');
        return true;
      }

      // في بيئة الإنتاج، يمكن إضافة خدمة حقيقية لاحقاً
      this.isInitialized = true;
      console.log('📧 Email service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      return false;
    }
  }

  /**
   * إرسال رمز التحقق عبر الإيميل
   * Send verification code via email
   */
  async sendVerificationCode(
    email: string,
    code: string,
    lang: 'ar' | 'en' = 'ar'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // التحقق من التهيئة
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Email service not initialized');
        }
      }

      // في بيئة التطوير، نستخدم محاكاة
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV] Simulating email send to:', email);
        console.log('📧 [DEV] Verification code:', code);

        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
          success: true,
          messageId: `dev_email_${Date.now()}`
        };
      }

      // في بيئة الإنتاج، استخدم خدمة حقيقية
      return await this.sendViaWebService(email, code, lang);

    } catch (error) {
      console.error('Email sending failed:', error);

      // في حالة فشل الخدمة الأساسية، استخدم الطريقة البديلة
      return await this.fallbackEmailSend(email, code, lang);
    }
  }

  /**
   * إرسال رسالة اتصال عبر الإيميل
   * Send contact message via email
   */
  async sendContactMessage(
    formData: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // في بيئة التطوير، نستخدم محاكاة
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV] Simulating contact message send');
        console.log('📧 [DEV] From:', formData.email);
        console.log('📧 [DEV] Subject:', formData.subject);

        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
          success: true,
          messageId: `dev_contact_${Date.now()}`
        };
      }

      // في بيئة الإنتاج، استخدم خدمة حقيقية
      return await this.sendContactViaWebService(formData);

    } catch (error) {
      console.error('Contact message sending failed:', error);

      // استخدام الطريقة البديلة
      return await this.fallbackContactSend(formData);
    }
  }

  /**
   * إنشاء محتوى الإيميل
   * Generate email message content
   */
  private generateEmailMessage(code: string, lang: 'ar' | 'en'): string {
    if (lang === 'ar') {
      return `
مرحباً،

تم طلب استعادة كلمة مرور حساب المدير لنظام اختبارات الألوان للكشف عن المخدرات.

رمز التحقق الخاص بك هو: ${code}

هذا الرمز صالح لمدة 5 دقائق فقط.

تنبيه أمني:
• لا تشارك هذا الرمز مع أي شخص
• إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة
• تأكد من أنك تستخدم الموقع الرسمي

مع تحيات،
فريق نظام اختبارات الألوان
وزارة الصحة - المملكة العربية السعودية
      `;
    } else {
      return `
Hello,

A password recovery request has been made for the admin account of the Color Testing System for Drug Detection.

Your verification code is: ${code}

This code is valid for 5 minutes only.

Security Warning:
• Do not share this code with anyone
• If you didn't request this code, ignore this message
• Make sure you're using the official website

Best regards,
Color Testing System Team
Ministry of Health - Saudi Arabia
      `;
    }
  }

  /**
   * إرسال عبر خدمة ويب مجانية
   * Send via free web service
   */
  private async sendViaWebService(
    email: string,
    code: string,
    lang: 'ar' | 'en'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const subject = lang === 'ar'
        ? 'رمز التحقق - استعادة كلمة مرور الأدمن'
        : 'Verification Code - Admin Password Recovery';

      const message = this.generateEmailMessage(code, lang);

      // استخدام خدمة FormSubmit (مجانية)
      const response = await fetch('https://formsubmit.co/aburakan4551@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Color Testing System',
          email: 'noreply@colortest.system',
          subject: subject,
          message: message,
          _captcha: 'false',
          _template: 'table'
        })
      });

      if (response.ok) {
        return {
          success: true,
          messageId: `formsubmit_${Date.now()}`
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('Web service email failed:', error);
      throw error;
    }
  }

  /**
   * إرسال رسالة اتصال عبر خدمة ويب
   * Send contact message via web service
   */
  private async sendContactViaWebService(
    formData: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // استخدام خدمة FormSubmit (مجانية)
      const response = await fetch('https://formsubmit.co/aburakan4551@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `[Color Testing] ${formData.subject}`,
          message: `
From: ${formData.name} (${formData.email})
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from Color Testing Drug Detection App
Date: ${new Date().toLocaleString()}
          `.trim(),
          _captcha: 'false',
          _template: 'table'
        })
      });

      if (response.ok) {
        return {
          success: true,
          messageId: `contact_${Date.now()}`
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('Contact web service failed:', error);
      throw error;
    }
  }

  /**
   * طريقة بديلة لإرسال الإيميل (mailto)
   * Fallback email method (mailto)
   */
  private async fallbackEmailSend(
    email: string,
    code: string,
    lang: 'ar' | 'en'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const subject = encodeURIComponent(
        lang === 'ar'
          ? 'رمز التحقق - استعادة كلمة مرور الأدمن'
          : 'Verification Code - Admin Password Recovery'
      );

      const body = encodeURIComponent(this.generateEmailMessage(code, lang));

      // فتح تطبيق الإيميل الافتراضي
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

      if (typeof window !== 'undefined') {
        window.open(mailtoLink, '_blank');
      }

      console.log('📧 Fallback: Email client opened');

      return {
        success: true,
        messageId: 'fallback_mailto'
      };

    } catch (error) {
      console.error('Fallback email failed:', error);
      return {
        success: false,
        error: 'All email methods failed'
      };
    }
  }

  /**
   * طريقة بديلة لإرسال رسالة الاتصال
   * Fallback contact message method
   */
  private async fallbackContactSend(
    formData: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const emailBody = `
From: ${formData.name} (${formData.email})
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from Color Testing Drug Detection App
Date: ${new Date().toLocaleString()}
      `.trim();

      const mailtoLink = `mailto:aburakan4551@gmail.com?subject=${encodeURIComponent(`[Color Testing] ${formData.subject}`)}&body=${encodeURIComponent(emailBody)}`;

      if (typeof window !== 'undefined') {
        window.open(mailtoLink, '_blank');
      }

      return {
        success: true,
        messageId: 'fallback_contact_mailto'
      };

    } catch (error) {
      console.error('Fallback contact failed:', error);
      return {
        success: false,
        error: 'All contact methods failed'
      };
    }
  }

  /**
   * التحقق من صحة الإيميل
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * تكوين إعدادات الإيميل
   * Configure email settings
   */
  configure(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
    this.isInitialized = false; // إعادة التهيئة مطلوبة
  }
}

export const emailService = EmailService.getInstance();

// إعدادات الإيميل للإنتاج
// Email configuration for production
export const EMAIL_CONFIG = {
  // يمكن إضافة إعدادات خدمة الإيميل هنا لاحقاً
  SERVICE_ID: 'service_admin_recovery',
  TEMPLATE_ID: 'template_verification',
  PUBLIC_KEY: 'YOUR_EMAIL_SERVICE_KEY',

  // ملاحظة: يمكن إضافة خدمات إيميل حقيقية مثل:
  // - EmailJS (يتطلب @emailjs/browser)
  // - SendGrid (يتطلب @sendgrid/mail)
  // - Nodemailer (للخوادم)
  // - AWS SES (يتطلب aws-sdk)
};

// دليل الإعداد
// Setup Guide
export const SETUP_GUIDE = {
  ar: `
إعداد خدمة الإيميل:

الحالة الحالية: النظام يعمل في وضع المحاكاة للتطوير

لإضافة خدمة إيميل حقيقية:

1. اختيار خدمة الإيميل:
   - EmailJS (للمتصفحات): npm install @emailjs/browser
   - SendGrid (للخوادم): npm install @sendgrid/mail
   - AWS SES: npm install aws-sdk
   - Nodemailer: npm install nodemailer

2. تحديث email-service.ts:
   - إضافة التبعية المطلوبة
   - تكوين الخدمة المختارة
   - تحديث دالة sendVerificationCode

3. إعداد المتغيرات:
   - إضافة مفاتيح API في متغيرات البيئة
   - تحديث EMAIL_CONFIG

ملاحظة: النظام الحالي يعمل بدون تبعيات خارجية
  `,
  en: `
Email Service Setup:

Current Status: System works in simulation mode for development

To add real email service:

1. Choose Email Service:
   - EmailJS (for browsers): npm install @emailjs/browser
   - SendGrid (for servers): npm install @sendgrid/mail
   - AWS SES: npm install aws-sdk
   - Nodemailer: npm install nodemailer

2. Update email-service.ts:
   - Add required dependency
   - Configure chosen service
   - Update sendVerificationCode function

3. Setup Variables:
   - Add API keys in environment variables
   - Update EMAIL_CONFIG

Note: Current system works without external dependencies
  `
};
