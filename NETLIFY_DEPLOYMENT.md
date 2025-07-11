# Netlify Deployment Guide
# دليل النشر على Netlify

## مشاكل البناء المحلولة | Fixed Build Issues

### 1. مشكلة rewrites/redirects مع static export
**المشكلة**: `rewrites` و `redirects` لا تعمل مع `output: export`

**الحل**: تم تعديل `next.config.js` لتعطيل هذه الميزات في بيئة الإنتاج:
```javascript
// Remove rewrites and redirects for static export
...(!(process.env.NETLIFY || process.env.NODE_ENV === 'production') && {
  async redirects() { ... },
  async rewrites() { ... },
}),
```

### 2. إعدادات البناء المحسنة
**التحديثات**:
- تحديث `netlify.toml` لإزالة `@netlify/plugin-nextjs`
- إضافة `NPM_FLAGS = "--legacy-peer-deps"`
- تحديث سكريبت البناء في `package.json`

### 3. مكتبة recharts
**تم إضافة**: `recharts@^2.12.7` للمخططات الإحصائية

### 4. مشكلة cross-env
**المشكلة**: `cross-env: not found` في بيئة Netlify
**الحل**:
- نقل `cross-env` من devDependencies إلى dependencies
- إنشاء سكريبت بديل `build:simple` بدون cross-env
- إنشاء `build-netlify.js` كحل احتياطي

### 5. خطأ في بناء الجملة (Syntax Error)
**المشكلة**: `Expected ',', got '{'` في admin-dashboard.tsx السطر 850
**الحل**: إصلاح بنية JSX - وضع Button داخل div container مناسب

## إعدادات Netlify المطلوبة | Required Netlify Settings

### Build Settings
```
Build command: npm run build:simple
Publish directory: out
Node version: 18
```

### Alternative Build Commands
إذا واجهت مشاكل مع `cross-env`:
```
npm run build:simple    # بناء بسيط بدون cross-env
npm run build:netlify   # بناء مخصص لـ Netlify
npm run build:debug     # بناء مع التشخيص
npm run test-build      # اختبار البناء محلياً
npm run check-build     # فحص إعدادات البناء
```

### Environment Variables
يجب إضافة هذه المتغيرات في Netlify Dashboard:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=colorstests-573ef.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://colorstests-573ef.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=colorstests-573ef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=colorstests-573ef.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_ADMIN_PASSWORD_HASH=8dacfb011f9ed4c4545fefb97acf99624fb02d876716ff03ae584173cd00822e
NEXT_PUBLIC_AUTH_SALT=b84997540de9ae822a6aa27e333cd8c8ce6b79079cf448ff6b8a027a845a666b
NEXT_PUBLIC_ADMIN_EMAIL=admin@colortest.local
NEXT_PUBLIC_ADMIN_SESSION_DURATION=3600000
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5
NEXT_PUBLIC_LOCKOUT_DURATION=900000

NODE_ENV=production
NETLIFY=true
NEXT_TELEMETRY_DISABLED=1
```

## الملفات المحدثة | Updated Files

### 1. `next.config.js`
- إزالة rewrites/redirects في بيئة الإنتاج
- تحسين إعدادات static export

### 2. `netlify.toml`
- إزالة Next.js plugin
- إضافة NPM flags
- تحسين إعدادات البناء

### 3. `package.json`
- تحديث سكريپت البناء
- إضافة recharts dependency
- إضافة سكريپت التشخيص

### 4. `public/_redirects`
- إعدادات التوجيه للـ SPA

## التشخيص | Debugging

### تشغيل التشخيص محلياً
```bash
npm run build:debug
```

### فحص البناء محلياً
```bash
npm run build
```

### فحص الملفات المُنتجة
```bash
ls -la out/
```

## المميزات الجديدة | New Features

### 1. مخططات الإحصائيات
- مخططات تفاعلية باستخدام recharts
- دعم اللغة العربية والإنجليزية
- ثلاثة أنواع مخططات (يومي، أنواع، شهري)

### 2. تصدير واستيراد البيانات المحسن
- تصدير شامل من Firebase و localStorage
- تصدير محدد لأنواع البيانات
- استيراد ذكي مع دمج البيانات

### 3. واجهة إدارة محسنة
- تصميم محسن للوحة الإدارة
- أزرار منفصلة للتصدير
- معلومات مفصلة عن العمليات

## استكشاف الأخطاء | Troubleshooting

### خطأ في البناء
1. تحقق من متغيرات البيئة
2. تأكد من تثبيت جميع المكتبات
3. شغل `npm run build:debug`

### مشاكل Firebase
1. تحقق من صحة إعدادات Firebase
2. تأكد من صحة API keys
3. تحقق من أذونات قاعدة البيانات

### مشاكل التوجيه
1. تحقق من ملف `_redirects`
2. تأكد من إعدادات `netlify.toml`
3. تحقق من بنية المجلدات في `out/`

## الدعم | Support

للحصول على المساعدة:
1. راجع سجلات البناء في Netlify
2. شغل سكريپت التشخيص
3. تحقق من هذا الدليل
4. تواصل مع فريق الدعم التقني

---

**آخر تحديث**: 2025-01-11
**الإصدار**: 2.1.0
