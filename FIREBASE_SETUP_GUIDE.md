# دليل إعداد Firebase الآمن
# Firebase Security Setup Guide

## 🔒 نظرة عامة على الأمان
تم تحديث النظام لاستخدام متغيرات البيئة بدلاً من الإعدادات المكشوفة في الكود لضمان أمان أفضل.

## 📋 المتطلبات الأساسية

### 1. إعداد مشروع Firebase
1. انتقل إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد أو استخدم المشروع الحالي
3. فعّل الخدمات التالية:
   - **Authentication** (المصادقة)
   - **Firestore Database** (قاعدة بيانات Firestore)
   - **Realtime Database** (قاعدة البيانات الفورية)
   - **Analytics** (التحليلات - اختياري)

### 2. الحصول على إعدادات Firebase
1. في Firebase Console، انتقل إلى **Project Settings**
2. في تبويب **General**، انزل إلى **Your apps**
3. انقر على **Web app** أو أنشئ تطبيق ويب جديد
4. انسخ إعدادات Firebase config

## 🛠️ إعداد البيئات المختلفة

### بيئة التطوير (Development)

1. **إنشاء ملف `.env.local`**:
```bash
cp .env.local.example .env.local
```

2. **تحديث القيم في `.env.local`**:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### بيئة الإنتاج (Production)

#### Vercel Deployment
1. في Vercel Dashboard، انتقل إلى **Project Settings**
2. انتقل إلى **Environment Variables**
3. أضف المتغيرات التالية:

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
NODE_ENV = production
```

#### Netlify Deployment
1. في Netlify Dashboard، انتقل إلى **Site Settings**
2. انتقل إلى **Environment Variables**
3. أضف نفس المتغيرات المذكورة أعلاه

#### Railway/Render Deployment
1. في لوحة التحكم، انتقل إلى **Environment Variables**
2. أضف المتغيرات المطلوبة

## 🔧 التحقق من الإعداد

### 1. اختبار الاتصال محلياً
```bash
npm run dev
```

### 2. فحص وحدة التحكم
افتح Developer Tools وتحقق من عدم وجود أخطاء Firebase في Console.

### 3. اختبار الوظائف
- تسجيل الدخول/إنشاء حساب
- حفظ البيانات في Firestore
- استخدام Realtime Database

## 🚨 تنبيهات أمنية مهمة

### ✅ ما يجب فعله:
- احتفظ بملف `.env.local` آمناً ولا تشاركه
- استخدم مفاتيح مختلفة للتطوير والإنتاج
- فعّل Firebase Security Rules
- راجع صلاحيات Firebase بانتظام

### ❌ ما يجب تجنبه:
- لا ترفع ملف `.env.local` إلى Git
- لا تشارك مفاتيح Firebase في الكود
- لا تستخدم نفس المفاتيح في بيئات مختلفة
- لا تترك قواعد البيانات مفتوحة للجميع

## 🔐 إعداد Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Test usage tracking
    match /testUsage/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

### Realtime Database Rules
```json
{
  "rules": {
    "chemical_tests": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

## 🧪 اختبار الإعداد

### سكريبت اختبار الاتصال
```bash
npm run test-database
```

### فحص متغيرات البيئة
```javascript
// في Developer Console
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'
});
```

## 📞 الدعم والمساعدة

إذا واجهت مشاكل في الإعداد:
1. تحقق من صحة جميع متغيرات البيئة
2. تأكد من تفعيل الخدمات المطلوبة في Firebase
3. راجع Firebase Security Rules
4. تحقق من وحدة التحكم للأخطاء

## 📝 ملاحظات إضافية

- يتم التحقق من وجود جميع متغيرات البيئة المطلوبة عند بدء التطبيق
- في حالة نقص أي متغير، سيظهر خطأ واضح يحدد المتغيرات المفقودة
- جميع مفاتيح Firebase تبدأ بـ `NEXT_PUBLIC_` لتكون متاحة في المتصفح
