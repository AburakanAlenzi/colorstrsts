# دليل استكشاف أخطاء Google Sign-In وإصلاحها
# Google Sign-In Troubleshooting Guide

## 🔍 الأخطاء الشائعة والحلول

### 1. خطأ "النطاق غير مصرح له" (Unauthorized Domain)

#### المشكلة:
```
auth/unauthorized-domain
```

#### الحل:
1. انتقل إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. انتقل إلى **Authentication** > **Settings** > **Authorized domains**
4. أضف النطاقات التالية:
   - `localhost` (للتطوير)
   - `127.0.0.1` (للتطوير)
   - `your-domain.com` (للإنتاج)

### 2. خطأ "تسجيل الدخول بـ Google غير مفعل" (Operation Not Allowed)

#### المشكلة:
```
auth/operation-not-allowed
```

#### الحل:
1. في Firebase Console، انتقل إلى **Authentication** > **Sign-in method**
2. فعّل **Google** كطريقة تسجيل دخول
3. أدخل **Project support email**
4. احفظ التغييرات

### 3. خطأ "النافذة المنبثقة محجوبة" (Popup Blocked)

#### المشكلة:
```
auth/popup-blocked
```

#### الحل:
1. **للمستخدمين**: السماح بالنوافذ المنبثقة في المتصفح
2. **للمطورين**: استخدام `signInWithRedirect` بدلاً من `signInWithPopup`

#### تطبيق الحل البديل:
```typescript
// في AuthProvider.tsx
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

// استخدام Redirect بدلاً من Popup
const signInWithGoogleRedirect = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Google redirect error:', error);
    throw error;
  }
};

// التحقق من نتيجة Redirect عند تحميل الصفحة
useEffect(() => {
  const checkRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('Google sign in successful via redirect');
      }
    } catch (error) {
      console.error('Redirect result error:', error);
    }
  };
  
  checkRedirectResult();
}, []);
```

### 4. خطأ "تم إغلاق النافذة بواسطة المستخدم" (Popup Closed by User)

#### المشكلة:
```
auth/popup-closed-by-user
```

#### الحل:
هذا خطأ طبيعي عندما يغلق المستخدم النافذة. لا حاجة لإصلاح، فقط معالجة مناسبة للخطأ.

### 5. خطأ "خطأ في الشبكة" (Network Request Failed)

#### المشكلة:
```
auth/network-request-failed
```

#### الحل:
1. تحقق من اتصال الإنترنت
2. تحقق من إعدادات Firewall
3. تحقق من صحة إعدادات Firebase

## 🛠️ خطوات التشخيص

### 1. فحص إعدادات Firebase Console

```bash
# تحقق من الإعدادات في Firebase Console:
# 1. Authentication > Sign-in method > Google (مفعل)
# 2. Authentication > Settings > Authorized domains (يحتوي على النطاق)
# 3. Project Settings > General > Your apps (Web app مُعد)
```

### 2. فحص إعدادات المتصفح

```javascript
// في Developer Console
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

// فحص حالة المصادقة
import { auth } from '@/lib/firebase';
console.log('Auth instance:', auth);
console.log('Current user:', auth.currentUser);
```

### 3. اختبار الاتصال

```javascript
// اختبار بسيط لـ Google Sign-In
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const testGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('Success:', result.user);
  } catch (error) {
    console.error('Error:', error.code, error.message);
  }
};

// تشغيل الاختبار
testGoogleSignIn();
```

## 🔧 إعدادات متقدمة

### 1. إعداد Google OAuth Client ID

إذا كنت تحتاج لمزيد من التحكم:

1. انتقل إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروعك أو أنشئ مشروع جديد
3. فعّل **Google+ API**
4. انتقل إلى **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. أضف النطاقات المصرح بها:
   - `http://localhost:3000` (للتطوير)
   - `http://localhost:3001` (للتطوير)
   - `https://your-domain.com` (للإنتاج)

### 2. إعداد متغيرات البيئة الإضافية

```env
# في .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. استخدام Google Identity Services (الطريقة الجديدة)

```typescript
// تثبيت المكتبة
npm install @google-cloud/identity

// الاستخدام
import { GoogleAuth } from '@google-cloud/identity';

const googleAuth = new GoogleAuth({
  scopes: ['email', 'profile']
});
```

## 🧪 اختبار Google Sign-In

### سكريبت اختبار شامل:

```javascript
// scripts/test-google-signin.js
const testGoogleSignIn = async () => {
  console.log('🔍 Testing Google Sign-In Configuration...');
  
  // 1. فحص متغيرات البيئة
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    return;
  }
  
  console.log('✅ Environment variables OK');
  
  // 2. فحص Firebase Auth
  try {
    const { auth } = await import('../src/lib/firebase');
    console.log('✅ Firebase Auth initialized');
    console.log('Auth Domain:', auth.config.authDomain);
  } catch (error) {
    console.error('❌ Firebase Auth error:', error);
    return;
  }
  
  // 3. فحص Google Provider
  try {
    const { GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    console.log('✅ Google Auth Provider created');
  } catch (error) {
    console.error('❌ Google Provider error:', error);
    return;
  }
  
  console.log('🎉 Google Sign-In configuration looks good!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Ensure Google is enabled in Firebase Console');
  console.log('2. Add authorized domains in Firebase Console');
  console.log('3. Test in browser with popup allowed');
};

testGoogleSignIn();
```

## 📞 الدعم والمساعدة

### إذا استمرت المشاكل:

1. **تحقق من سجلات Firebase Console**
2. **فحص Network tab في Developer Tools**
3. **تجربة متصفح مختلف**
4. **تعطيل Ad Blockers مؤقتاً**
5. **مراجعة Firebase Documentation**

### روابط مفيدة:

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ قائمة التحقق السريعة

- [ ] Google مفعل في Firebase Console
- [ ] النطاقات مضافة في Authorized domains
- [ ] متغيرات البيئة صحيحة
- [ ] النوافذ المنبثقة مسموحة في المتصفح
- [ ] لا توجد Ad Blockers تحجب Google APIs
- [ ] اتصال إنترنت مستقر
