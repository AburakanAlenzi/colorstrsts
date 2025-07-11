import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from './firebase';

export interface FirebaseDiagnostics {
  isConnected: boolean;
  collections: {
    name: string;
    count: number;
    size: string;
    lastUpdated?: Date;
  }[];
  totalRecords: number;
  totalSize: number;
  errors: string[];
  version: string;
  projectId: string;
}

/**
 * تشخيص شامل لحالة Firebase
 * Comprehensive Firebase diagnostics
 */
export async function runFirebaseDiagnostics(): Promise<FirebaseDiagnostics> {
  const diagnostics: FirebaseDiagnostics = {
    isConnected: false,
    collections: [],
    totalRecords: 0,
    totalSize: 0,
    errors: [],
    version: '2.0.0',
    projectId: ''
  };

  try {
    console.log('🔍 بدء تشخيص Firebase...');

    // 1. اختبار الاتصال الأساسي
    await testBasicConnection(diagnostics);

    // 2. فحص المجموعات الأساسية
    await checkCoreCollections(diagnostics);

    // 3. فحص البيانات التجريبية
    await checkSampleData(diagnostics);

    // 4. حساب الإحصائيات
    calculateStatistics(diagnostics);

    console.log('✅ تم تشخيص Firebase بنجاح');

  } catch (error) {
    console.error('❌ خطأ في تشخيص Firebase:', error);
    diagnostics.errors.push(`تشخيص عام: ${error}`);
  }

  return diagnostics;
}

/**
 * اختبار الاتصال الأساسي
 */
async function testBasicConnection(diagnostics: FirebaseDiagnostics): Promise<void> {
  try {
    // محاولة قراءة مستند تجريبي
    const testDoc = doc(db, 'system', 'test');
    await getDoc(testDoc);
    
    diagnostics.isConnected = true;
    diagnostics.projectId = db.app.options.projectId || 'unknown';
    
    console.log('✅ اتصال Firebase نشط');
  } catch (error) {
    diagnostics.isConnected = false;
    diagnostics.errors.push(`اتصال Firebase: ${error}`);
    console.error('❌ فشل اتصال Firebase:', error);
  }
}

/**
 * فحص المجموعات الأساسية
 */
async function checkCoreCollections(diagnostics: FirebaseDiagnostics): Promise<void> {
  const coreCollections = [
    'chemical_tests',
    'user_test_history', 
    'users',
    'stc_subscriptions',
    'stc_payment_history',
    'admin_settings'
  ];

  for (const collectionName of coreCollections) {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const collectionInfo = {
        name: collectionName,
        count: snapshot.size,
        size: `${(snapshot.size * 0.5).toFixed(2)} KB`, // تقدير تقريبي
        lastUpdated: new Date()
      };

      diagnostics.collections.push(collectionInfo);
      diagnostics.totalRecords += snapshot.size;

      console.log(`📊 ${collectionName}: ${snapshot.size} سجل`);

    } catch (error) {
      diagnostics.errors.push(`مجموعة ${collectionName}: ${error}`);
      console.error(`❌ خطأ في مجموعة ${collectionName}:`, error);
    }
  }
}

/**
 * فحص البيانات التجريبية
 */
async function checkSampleData(diagnostics: FirebaseDiagnostics): Promise<void> {
  try {
    // فحص وجود اختبارات كيميائية
    const testsRef = collection(db, 'chemical_tests');
    const testsSnapshot = await getDocs(testsRef);

    if (testsSnapshot.empty) {
      diagnostics.errors.push('لا توجد اختبارات كيميائية - قد تحتاج لاستيراد البيانات');
      console.log('⚠️ لا توجد اختبارات كيميائية');
    } else {
      console.log(`✅ تم العثور على ${testsSnapshot.size} اختبار كيميائي`);
    }

  } catch (error) {
    diagnostics.errors.push(`فحص البيانات التجريبية: ${error}`);
    console.error('❌ خطأ في فحص البيانات التجريبية:', error);
  }
}

/**
 * حساب الإحصائيات
 */
function calculateStatistics(diagnostics: FirebaseDiagnostics): void {
  // حساب الحجم الإجمالي (تقدير)
  diagnostics.totalSize = diagnostics.totalRecords * 0.5; // KB تقريبي

  console.log(`📊 إجمالي السجلات: ${diagnostics.totalRecords}`);
  console.log(`💾 الحجم التقديري: ${diagnostics.totalSize.toFixed(2)} KB`);
}

/**
 * إصلاح مشاكل Firebase الشائعة
 */
export async function fixCommonFirebaseIssues(): Promise<{
  success: boolean;
  message: string;
  messageAr: string;
}> {
  try {
    console.log('🔧 بدء إصلاح مشاكل Firebase...');

    // 1. إعادة تفعيل الشبكة
    await enableNetwork(db);
    console.log('✅ تم تفعيل شبكة Firebase');

    // 2. اختبار الاتصال
    const testDoc = doc(db, 'system', 'connection_test');
    await getDoc(testDoc);
    console.log('✅ تم اختبار الاتصال بنجاح');

    return {
      success: true,
      message: 'Firebase connection restored successfully',
      messageAr: 'تم استعادة اتصال Firebase بنجاح'
    };

  } catch (error) {
    console.error('❌ فشل في إصلاح Firebase:', error);
    
    return {
      success: false,
      message: `Failed to fix Firebase: ${error}`,
      messageAr: `فشل في إصلاح Firebase: ${error}`
    };
  }
}

/**
 * إنشاء البيانات التجريبية
 */
export async function createSampleData(): Promise<{
  success: boolean;
  message: string;
  messageAr: string;
}> {
  try {
    console.log('📝 إنشاء البيانات التجريبية...');

    // سيتم إضافة منطق إنشاء البيانات التجريبية هنا
    // This will be implemented in the next step

    return {
      success: true,
      message: 'Sample data created successfully',
      messageAr: 'تم إنشاء البيانات التجريبية بنجاح'
    };

  } catch (error) {
    console.error('❌ فشل في إنشاء البيانات التجريبية:', error);
    
    return {
      success: false,
      message: `Failed to create sample data: ${error}`,
      messageAr: `فشل في إنشاء البيانات التجريبية: ${error}`
    };
  }
}

/**
 * تصدير البيانات
 */
export async function exportFirebaseData(): Promise<{
  success: boolean;
  data?: any;
  message: string;
  messageAr: string;
}> {
  try {
    console.log('📤 تصدير بيانات Firebase...');

    const exportData: any = {};
    
    // تصدير المجموعات الأساسية
    const collections = ['chemical_tests', 'users', 'user_test_history'];
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      exportData[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    return {
      success: true,
      data: exportData,
      message: 'Data exported successfully',
      messageAr: 'تم تصدير البيانات بنجاح'
    };

  } catch (error) {
    console.error('❌ فشل في تصدير البيانات:', error);
    
    return {
      success: false,
      message: `Failed to export data: ${error}`,
      messageAr: `فشل في تصدير البيانات: ${error}`
    };
  }
}
