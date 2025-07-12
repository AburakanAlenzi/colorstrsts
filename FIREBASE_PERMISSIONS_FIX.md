# 🔥 حل مشاكل أذونات Firebase
# Firebase Permissions Fix Guide

## 🚨 المشكلة الحالية / Current Issue
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

هذه المشكلة تحدث لأن قواعد Firestore الحالية لا تسمح بالوصول للمجموعات المطلوبة.

## 🛠️ الحلول المتاحة / Available Solutions

### الحل الأول: نشر قواعد التطوير (الأسرع)
### Solution 1: Deploy Development Rules (Fastest)

```bash
# 1. تسجيل الدخول إلى Firebase
# Login to Firebase
npm run firebase:login

# 2. نشر قواعد التطوير المتساهلة
# Deploy permissive development rules
npm run firebase:rules:dev
```

### الحل الثاني: نشر قواعد الإنتاج (الأكثر أماناً)
### Solution 2: Deploy Production Rules (More Secure)

```bash
# نشر قواعد الإنتاج المحدودة
# Deploy restricted production rules
npm run firebase:rules:prod
```

### الحل الثالث: نشر يدوي عبر Firebase Console
### Solution 3: Manual Deploy via Firebase Console

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك
3. اذهب إلى Firestore Database > Rules
4. انسخ محتوى `firestore.rules.dev` والصقه
5. اضغط "Publish"

## 📋 قواعد التطوير المتضمنة / Included Development Rules

قواعد التطوير تسمح بـ:
- ✅ قراءة وكتابة جميع المجموعات للمستخدمين المصادق عليهم
- ✅ الوصول لجميع البيانات بدون قيود معقدة
- ⚠️ **تحذير**: هذه القواعد للتطوير فقط!

Development rules allow:
- ✅ Read/write access to all collections for authenticated users
- ✅ Access to all data without complex restrictions
- ⚠️ **Warning**: These rules are for development only!

## 🔒 المجموعات المشمولة / Covered Collections

- `users` - المستخدمون
- `chemical_tests` - الاختبارات الكيميائية
- `user_test_history` - سجل اختبارات المستخدم
- `stc_subscriptions` - اشتراكات STC
- `stc_payment_history` - تاريخ مدفوعات STC
- `admin_settings` - إعدادات المدير
- `test_results` - نتائج الاختبارات
- `test_sessions` - جلسات الاختبار
- `activity_logs` - سجلات النشاط
- `user_profiles` - ملفات المستخدمين الشخصية

## 🚀 خطوات سريعة للحل / Quick Fix Steps

```bash
# 1. تأكد من تثبيت Firebase CLI
# Ensure Firebase CLI is installed
npm install -g firebase-tools

# 2. تسجيل الدخول
# Login
firebase login

# 3. نشر قواعد التطوير
# Deploy development rules
npm run firebase:rules:dev

# 4. اختبار الاتصال
# Test connection
npm run test-firebase
```

## ⚠️ تحذيرات مهمة / Important Warnings

### للتطوير / For Development:
- ✅ استخدم `firestore.rules.dev`
- ✅ قواعد متساهلة للاختبار السريع
- ⚠️ لا تستخدم في الإنتاج!

### للإنتاج / For Production:
- ✅ استخدم `firestore.rules`
- ✅ قواعد محدودة وآمنة
- ✅ تحكم دقيق في الأذونات

## 🔧 استكشاف الأخطاء / Troubleshooting

### إذا فشل النشر / If Deployment Fails:
```bash
# تحقق من تسجيل الدخول
# Check login status
firebase projects:list

# تحقق من المشروع الحالي
# Check current project
firebase use

# تغيير المشروع إذا لزم الأمر
# Change project if needed
firebase use your-project-id
```

### إذا استمرت المشكلة / If Issues Persist:
1. تحقق من إعدادات المشروع في Firebase Console
2. تأكد من أن المستخدم له صلاحيات المدير
3. جرب إعادة تسجيل الدخول: `firebase logout && firebase login`

## 📞 الدعم / Support

إذا استمرت المشاكل، تحقق من:
- حالة خدمات Firebase: https://status.firebase.google.com
- وثائق Firebase: https://firebase.google.com/docs/firestore/security
- مجتمع Firebase: https://firebase.google.com/support

---

**ملاحظة**: بعد حل مشكلة الأذونات، تأكد من تحديث القواعد للإنتاج قبل النشر النهائي.

**Note**: After fixing permissions, make sure to update rules for production before final deployment.
