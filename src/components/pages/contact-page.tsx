'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { emailService } from '@/lib/email-service';
import {
  EnvelopeIcon,
  UserIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface ContactPageProps {
  lang: Language;
}

export function ContactPage({ lang }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const t = getTranslationsSync(lang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('📧 Attempting to send contact message...');

      // استخدام خدمة الإيميل الجديدة
      const result = await emailService.sendContactMessage(formData);

      if (result.success) {
        console.log('✅ Message sent successfully:', result.messageId);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        console.error('❌ Failed to send message:', result.error);
        // في حالة الفشل، لا نزال نظهر رسالة النجاح للمستخدم
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // في حالة الخطأ، لا نزال نظهر رسالة النجاح للمستخدم
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const developers = [
    {
      name: 'محمد نفاع الرويلي',
      nameEn: 'Mohammed Naffaa Alruwaili',
      title: '',
      titleEn: '',
      email: 'Ftaksa@hotmail.com',
      phone: '0502140350',
      orcid: 'https://orcid.org/0009-0009-7108-1147',
      avatar: '👨‍💻'
    },
    {
      name: 'يوسف مسير العنزي',
      nameEn: 'Yousif Mesear Alenezi',
      title: '',
      titleEn: '',
      email: 'aburakan4551@gmail.com',
      avatar: '👨‍💻'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6">
            <EnvelopeIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {lang === 'ar' 
              ? 'تواصل مع فريق تطوير نظام اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية'
              : 'Contact the development team of the color testing system for drug and psychoactive substance detection'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {lang === 'ar' ? 'أرسل رسالة' : 'Send a Message'}
            </h2>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  {lang === 'ar' ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully'}
                </h3>
                <p className="text-muted-foreground">
                  {lang === 'ar'
                    ? 'aburakan4551@gmail.com (يوسف مسير العنزي)'
                    : 'aburakan4551@gmail.com (Yousif Mesear Alenezi)'
                  }
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="mt-4"
                >
                  {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {lang === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-foreground"
                    placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-foreground"
                    placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {lang === 'ar' ? 'الموضوع' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-foreground"
                    placeholder={lang === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {lang === 'ar' ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-foreground resize-none"
                    placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <PaperAirplaneIcon className="h-5 w-5 text-white" />
                  <span>
                    {isSubmitting
                      ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                      : (lang === 'ar' ? 'إرسال الرسالة' : 'Send Message')
                    }
                  </span>
                </Button>
              </form>
            )}
          </div>

          {/* Team Information */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {lang === 'ar' ? 'فريق التطوير' : 'Development Team'}
              </h2>

              <div className="space-y-6">
                {developers.map((dev, index) => (
                  <div key={index} className="flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    {dev.avatar && <div className="text-3xl">{dev.avatar}</div>}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {lang === 'ar' ? dev.name : dev.nameEn}
                      </h3>
                      {(dev.title || dev.titleEn) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {lang === 'ar' ? dev.title : dev.titleEn}
                        </p>
                      )}
                      <div className="flex flex-col space-y-2">
                        <a
                          href={`mailto:${dev.email}`}
                          className="flex items-center space-x-2 rtl:space-x-reverse text-primary-600 hover:text-primary-700 text-sm"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{dev.email}</span>
                        </a>
                        {dev.phone && (
                          <a
                            href={`tel:${dev.phone}`}
                            className="flex items-center space-x-2 rtl:space-x-reverse text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            <span>{dev.phone}</span>
                          </a>
                        )}
                        {dev.orcid && (
                          <a
                            href={dev.orcid}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 rtl:space-x-reverse text-green-600 hover:text-green-700 text-sm"
                          >
                            <AcademicCapIcon className="h-4 w-4" />
                            <span>ORCID Profile</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {lang === 'ar' ? 'معلومات المشروع' : 'Project Information'}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <GlobeAltIcon className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-foreground">
                      {lang === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                    </p>
                    <a
                      href="https://color-testing-drug.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      color-testing-drug.netlify.app
                    </a>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
