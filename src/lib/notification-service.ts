// خدمة الإشعارات الآمنة للأدمن
// Secure Admin Notification Service

import { emailService } from './email-service';

interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface SMSConfig {
  to: string;
  message: string;
}

interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private emailProvider: string = 'emailjs'; // أو 'sendgrid', 'nodemailer'
  private smsProvider: string = 'twilio'; // أو 'aws-sns', 'nexmo'

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * إرسال بريد إلكتروني آمن
   * Send secure email
   */
  async sendEmail(config: EmailConfig): Promise<NotificationResponse> {
    try {
      // في بيئة التطوير، نقوم بمحاكاة الإرسال
      if (process.env.NODE_ENV === 'development') {
        return this.simulateEmailSend(config);
      }

      // في بيئة الإنتاج، استخدم خدمة حقيقية
      switch (this.emailProvider) {
        case 'emailjs':
          return await this.sendViaEmailJS(config);
        case 'sendgrid':
          return await this.sendViaSendGrid(config);
        default:
          throw new Error('Email provider not configured');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * إرسال رسالة نصية آمنة
   * Send secure SMS
   */
  async sendSMS(config: SMSConfig): Promise<NotificationResponse> {
    try {
      // في بيئة التطوير، نقوم بمحاكاة الإرسال
      if (process.env.NODE_ENV === 'development') {
        return this.simulateSMSSend(config);
      }

      // في بيئة الإنتاج، استخدم خدمة حقيقية
      switch (this.smsProvider) {
        case 'twilio':
          return await this.sendViaTwilio(config);
        case 'aws-sns':
          return await this.sendViaAWSSNS(config);
        default:
          throw new Error('SMS provider not configured');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * إرسال رمز التحقق عبر الإيميل
   * Send verification code via email
   */
  async sendVerificationEmail(email: string, code: string, lang: 'ar' | 'en' = 'ar'): Promise<NotificationResponse> {
    try {
      // استخدام خدمة الإيميل الحقيقية
      const result = await emailService.sendVerificationCode(email, code, lang);

      if (result.success) {
        return {
          success: true,
          messageId: result.messageId
        };
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email service failed, using fallback:', error);

      // استخدام الطريقة البديلة
      return await this.sendEmailFallback(email, code, lang);
    }
  }

  /**
   * طريقة بديلة لإرسال الإيميل
   * Fallback email method
   */
  private async sendEmailFallback(email: string, code: string, lang: 'ar' | 'en' = 'ar'): Promise<NotificationResponse> {
    const subject = lang === 'ar'
      ? 'رمز التحقق - استعادة كلمة مرور الأدمن'
      : 'Verification Code - Admin Password Recovery';

    const body = lang === 'ar' ? `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">🔐 رمز التحقق</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">نظام اختبارات الألوان للكشف عن المخدرات</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">مرحباً،</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            تم طلب استعادة كلمة مرور حساب المدير. استخدم الرمز التالي للمتابعة:
          </p>
          
          <div style="background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</div>
            <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">صالح لمدة 5 دقائق</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ تنبيه أمني:</strong><br>
              • لا تشارك هذا الرمز مع أي شخص<br>
              • إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة<br>
              • الرمز صالح لمدة 5 دقائق فقط
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            هذه رسالة آلية، لا تقم بالرد عليها.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2025 نظام اختبارات الألوان - وزارة الصحة</p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Verification Code</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Color Testing System for Drug Detection</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello,</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            A password recovery request has been made for the admin account. Use the following code to continue:
          </p>
          
          <div style="background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</div>
            <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">Valid for 5 minutes</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Security Warning:</strong><br>
              • Do not share this code with anyone<br>
              • If you didn't request this code, ignore this message<br>
              • Code is valid for 5 minutes only
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message, do not reply.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2025 Color Testing System - Ministry of Health</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject,
      body,
      isHtml: true
    });
  }

  /**
   * إرسال رمز التحقق عبر الرسائل النصية
   * Send verification code via SMS
   */
  async sendVerificationSMS(phone: string, code: string, lang: 'ar' | 'en' = 'ar'): Promise<NotificationResponse> {
    const message = lang === 'ar'
      ? `🔐 رمز التحقق: ${code}\n\nنظام اختبارات الألوان\nصالح لمدة 5 دقائق\nلا تشارك هذا الرمز مع أحد`
      : `🔐 Verification Code: ${code}\n\nColor Testing System\nValid for 5 minutes\nDo not share this code`;

    return await this.sendSMS({
      to: phone,
      message
    });
  }

  // محاكاة إرسال الإيميل في بيئة التطوير
  private async simulateEmailSend(config: EmailConfig): Promise<NotificationResponse> {
    console.log('📧 [DEV] Email Simulation:');
    console.log('To:', config.to);
    console.log('Subject:', config.subject);
    console.log('Body:', config.body.substring(0, 100) + '...');
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      messageId: `dev_email_${Date.now()}`
    };
  }

  // محاكاة إرسال الرسائل النصية في بيئة التطوير
  private async simulateSMSSend(config: SMSConfig): Promise<NotificationResponse> {
    console.log('📱 [DEV] SMS Simulation:');
    console.log('To:', config.to);
    console.log('Message:', config.message);
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      messageId: `dev_sms_${Date.now()}`
    };
  }

  // إرسال عبر EmailJS (للإنتاج)
  private async sendViaEmailJS(config: EmailConfig): Promise<NotificationResponse> {
    // تحتاج إلى تكوين EmailJS
    // npm install @emailjs/browser
    
    try {
      // const emailjs = await import('@emailjs/browser');
      // const result = await emailjs.send(
      //   'YOUR_SERVICE_ID',
      //   'YOUR_TEMPLATE_ID',
      //   {
      //     to_email: config.to,
      //     subject: config.subject,
      //     message: config.body
      //   },
      //   'YOUR_PUBLIC_KEY'
      // );
      
      // return {
      //   success: true,
      //   messageId: result.text
      // };
      
      throw new Error('EmailJS not configured');
    } catch (error) {
      throw error;
    }
  }

  // إرسال عبر SendGrid (للإنتاج)
  private async sendViaSendGrid(config: EmailConfig): Promise<NotificationResponse> {
    // تحتاج إلى تكوين SendGrid
    // npm install @sendgrid/mail
    
    throw new Error('SendGrid not configured');
  }

  // إرسال عبر Twilio (للإنتاج)
  private async sendViaTwilio(config: SMSConfig): Promise<NotificationResponse> {
    // تحتاج إلى تكوين Twilio
    // npm install twilio
    
    throw new Error('Twilio not configured');
  }

  // إرسال عبر AWS SNS (للإنتاج)
  private async sendViaAWSSNS(config: SMSConfig): Promise<NotificationResponse> {
    // تحتاج إلى تكوين AWS SNS
    // npm install aws-sdk
    
    throw new Error('AWS SNS not configured');
  }
}

export const notificationService = NotificationService.getInstance();
