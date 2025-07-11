# دليل تصدير واستيراد البيانات
# Data Export & Import Guide

## نظرة عامة | Overview

تم تحسين نظام إدارة البيانات في لوحة الإدارة ليوفر تصدير واستيراد شامل لجميع البيانات مع إمكانية التعديل.

The data management system in the admin dashboard has been enhanced to provide comprehensive export and import of all data with editing capabilities.

## أنواع التصدير | Export Types

### 1. التصدير الشامل | Complete Export
يصدر جميع البيانات من جميع المصادر:
- **الاختبارات الكيميائية** (Firebase + localStorage)
- **نتائج الاختبارات**
- **جلسات الاختبار**
- **نتائج الألوان**
- **بيانات المستخدمين**
- **الاشتراكات**
- **تاريخ اختبارات المستخدمين**
- **إعدادات المستخدم**
- **بيانات الإدارة**
- **إعدادات التطبيق**
- **بيانات الدفع**
- **إحصائيات الاستخدام**

### 2. التصدير المحدد | Specific Export
يصدر نوع بيانات محدد:
- **الاختبارات الكيميائية فقط**
- **نتائج الاختبارات فقط**
- **المستخدمون والاشتراكات فقط**

## تنسيق البيانات المصدرة | Exported Data Format

```json
{
  "chemicalTests": {
    "firebase": [...],
    "localStorage": [...]
  },
  "testResults": [...],
  "users": [...],
  "subscriptions": [...],
  "exportInfo": {
    "exportDate": "2025-01-11T...",
    "version": "2.1.0",
    "totalRecords": 150,
    "dataTypes": [...]
  }
}
```

## كيفية التعديل | How to Edit

### 1. تحرير الاختبارات الكيميائية | Editing Chemical Tests

```json
{
  "chemicalTests": {
    "localStorage": [
      {
        "id": "test-001",
        "method_name": "Marquis Test",
        "method_name_ar": "اختبار ماركيز",
        "color_result": "Purple to Black",
        "color_result_ar": "بنفسجي إلى أسود",
        "possible_substance": "MDMA, Amphetamine",
        "possible_substance_ar": "إم دي إم إيه، أمفيتامين",
        "test_type": "basic",
        "reference": "REF-001"
      }
    ]
  }
}
```

### 2. تحرير بيانات المستخدمين | Editing User Data

```json
{
  "users": [
    {
      "id": "user-001",
      "email": "user@example.com",
      "name": "اسم المستخدم",
      "subscriptionType": "premium",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

## عملية الاستيراد | Import Process

### 1. التحضير | Preparation
- تأكد من صحة تنسيق JSON
- احتفظ بنسخة احتياطية من البيانات الحالية
- تحقق من صحة البيانات المعدلة

### 2. الاستيراد | Import
1. اضغط على زر "استيراد البيانات"
2. اختر ملف JSON المعدل
3. انتظر رسالة التأكيد
4. سيتم إعادة تحميل الصفحة تلقائياً

### 3. دمج البيانات | Data Merging
- البيانات الجديدة تُدمج مع الموجودة
- البيانات المتطابقة (نفس المعرف) تُحدث
- البيانات الجديدة تُضاف

## الحقول المطلوبة | Required Fields

### للاختبارات الكيميائية | For Chemical Tests
```
- id: معرف فريد
- method_name: اسم الاختبار بالإنجليزية
- method_name_ar: اسم الاختبار بالعربية
- color_result: النتيجة اللونية بالإنجليزية
- color_result_ar: النتيجة اللونية بالعربية
- possible_substance: المواد المحتملة بالإنجليزية
- possible_substance_ar: المواد المحتملة بالعربية
- test_type: نوع الاختبار (basic/intermediate/advanced)
- reference: المرجع (REF-XXX)
```

## نصائح مهمة | Important Tips

### ✅ افعل | Do
- احتفظ بنسخة احتياطية قبل التعديل
- تحقق من صحة JSON قبل الاستيراد
- استخدم محرر JSON مع التحقق من الأخطاء
- اختبر التعديلات على بيانات صغيرة أولاً

### ❌ لا تفعل | Don't
- لا تحذف حقل `exportInfo`
- لا تغير تنسيق التواريخ
- لا تستخدم معرفات مكررة
- لا تحذف الحقول المطلوبة

## استكشاف الأخطاء | Troubleshooting

### خطأ في تنسيق JSON | JSON Format Error
```
خطأ في استيراد البيانات - تأكد من صحة تنسيق الملف
```
**الحل:** تحقق من صحة JSON باستخدام محرر JSON

### فشل في الاستيراد | Import Failed
```
لم يتم العثور على بيانات صالحة للاستيراد
```
**الحل:** تأكد من وجود البيانات في التنسيق الصحيح

### بيانات مفقودة | Missing Data
**الحل:** تحقق من وجود جميع الحقول المطلوبة

## أمثلة عملية | Practical Examples

### إضافة اختبار جديد | Adding New Test
```json
{
  "chemicalTests": {
    "localStorage": [
      {
        "id": "new-test-001",
        "method_name": "New Test",
        "method_name_ar": "اختبار جديد",
        "color_result": "Red to Blue",
        "color_result_ar": "أحمر إلى أزرق",
        "possible_substance": "New Substance",
        "possible_substance_ar": "مادة جديدة",
        "test_type": "basic",
        "reference": "REF-NEW-001"
      }
    ]
  }
}
```

### تحديث اختبار موجود | Updating Existing Test
```json
{
  "chemicalTests": {
    "localStorage": [
      {
        "id": "existing-test-id",
        "method_name": "Updated Test Name",
        "method_name_ar": "اسم الاختبار المحدث",
        // باقي الحقول...
      }
    ]
  }
}
```

## الدعم | Support

للحصول على المساعدة:
- تحقق من سجلات المتصفح (Console)
- راجع هذا الدليل
- تواصل مع فريق الدعم التقني

For assistance:
- Check browser console logs
- Review this guide
- Contact technical support team
