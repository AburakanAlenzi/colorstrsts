# إعداد نظام الاشتراك - Color Testing Drug Detection

## 🚀 نظرة عامة

تم تطوير نظام اشتراك متكامل يتيح:
- **5 اختبارات مجانية** لجميع المستخدمين
- **اشتراك شهري مميز** للوصول لجميع الاختبارات (29 ريال/شهر)
- **دعم الدفع في السعودية** عبر Stripe
- **إدارة المستخدمين** عبر Firebase

## 📋 المتطلبات

### 1. إعداد Firebase
1. انتقل إلى [Firebase Console](https://console.firebase.google.com)
2. أنشئ مشروع جديد أو استخدم المشروع الموجود
3. فعّل Authentication:
   - انتقل إلى Authentication > Sign-in method
   - فعّل Email/Password و Google
4. فعّل Firestore Database:
   - انتقل إلى Firestore Database
   - أنشئ قاعدة بيانات في production mode
5. انسخ إعدادات Firebase من Project Settings

### 2. إعداد Stripe
1. انتقل إلى [Stripe Dashboard](https://dashboard.stripe.com)
2. أنشئ حساب جديد أو استخدم الحساب الموجود
3. فعّل المدفوعات في السعودية:
   - انتقل إلى Settings > Business settings
   - أضف السعودية كدولة مدعومة
4. أنشئ منتجات الاشتراك:
   - انتقل إلى Products
   - أنشئ منتج "Premium Subscription"
   - أضف سعر شهري: 29 SAR
   - انسخ Price ID
5. إعداد Webhooks:
   - انتقل إلى Developers > Webhooks
   - أضف endpoint: `https://yourdomain.com/api/stripe/webhook`
   - اختر الأحداث: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - انسخ Webhook Secret

## 🔧 التثبيت والإعداد

### 1. تثبيت المكتبات
```bash
npm install firebase stripe @stripe/stripe-js
```

### 2. إعداد متغيرات البيئة
أنشئ ملف `.env.local` وأضف:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=colorstests-573ef.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=colorstests-573ef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=colorstests-573ef.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=94361461929
NEXT_PUBLIC_FIREBASE_APP_ID=1:94361461929:web:b34ad287c782710415f5b8

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Stripe Price IDs
STRIPE_PRICE_MONTHLY_SAR=price_your_monthly_sar_price_id
```

### 3. إعداد قواعد Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Test usage collection
    match /testUsage/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

## 🎯 كيفية الاستخدام

### 1. تسجيل المستخدمين
- يمكن للمستخدمين التسجيل بالإيميل أو Google
- يتم إنشاء ملف تعريف تلقائياً في Firestore

### 2. الوصول للاختبارات
- **أول 5 اختبارات**: مجانية لجميع المستخدمين
- **الاختبارات المتقدمة**: تتطلب اشتراك مميز

### 3. عملية الاشتراك
1. المستخدم يختار الخطة المميزة
2. يتم توجيهه لصفحة دفع Stripe
3. بعد الدفع الناجح، يتم تحديث حالة الاشتراك
4. يحصل على وصول فوري لجميع الاختبارات

## 🔒 الأمان

### Firebase Security Rules
- المستخدمون يمكنهم قراءة/كتابة بياناتهم فقط
- سجلات الاستخدام محمية بـ UID المستخدم

### Stripe Webhooks
- التحقق من صحة التوقيع
- معالجة آمنة للأحداث
- تحديث حالة الاشتراك تلقائياً

## 📊 المراقبة والتحليل

### Firebase Analytics
- تتبع تسجيل المستخدمين
- مراقبة استخدام الاختبارات
- تحليل معدلات التحويل

### Stripe Dashboard
- مراقبة المدفوعات
- تحليل الإيرادات
- إدارة المبالغ المستردة

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في Firebase Authentication**
   - تأكد من تفعيل طرق تسجيل الدخول
   - تحقق من صحة إعدادات Firebase

2. **فشل في الدفع**
   - تأكد من صحة Stripe Keys
   - تحقق من إعدادات الدولة في Stripe

3. **عدم تحديث حالة الاشتراك**
   - تأكد من إعداد Webhooks بشكل صحيح
   - تحقق من logs في Stripe Dashboard

## 📞 الدعم

للحصول على المساعدة:
1. تحقق من logs في Firebase Console
2. راجع Stripe Dashboard للمدفوعات
3. تواصل مع فريق التطوير

## 🔄 التحديثات المستقبلية

- إضافة خطط اشتراك متعددة
- دعم العملات الأخرى
- تحسين تجربة المستخدم
- إضافة تقارير متقدمة
