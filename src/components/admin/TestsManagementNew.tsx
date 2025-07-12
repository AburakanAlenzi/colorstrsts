'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getChemicalTestsLocal,
  initializeLocalStorage,
  ChemicalTest
} from '@/lib/local-data-service';
// Keep Firebase imports as fallback
import {
  getTests,
  createTest,
  updateTest,
  deleteTest,
  getTestsStatistics,
  exportTests,
  importTests,
  getTestTypes,
  getSubstances,
  TestsFilter,
  TestsPagination
} from '@/lib/firebase-tests';
import TestsTable from './TestsTable';
import TestFormNew from './TestFormNew';
import TestsStatistics from './TestsStatistics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Download, 
  Upload, 
  BarChart3,
  TestTube,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface TestsManagementNewProps {
  translations?: any;
  isRTL: boolean;
  lang?: 'ar' | 'en';
}

export default function TestsManagementNew({ translations = {}, isRTL, lang = 'en' }: TestsManagementNewProps) {
  // Add safety check for browser environment
  if (typeof window === 'undefined') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  const { user } = useAuth();

  // Provide fallback translations if not provided
  const safeTranslations = translations || {
    title: lang === 'ar' ? 'إدارة الاختبارات' : 'Tests Management',
    addTest: lang === 'ar' ? 'إضافة اختبار' : 'Add Test',
    editTest: lang === 'ar' ? 'تحرير اختبار' : 'Edit Test',
    deleteTest: lang === 'ar' ? 'حذف اختبار' : 'Delete Test',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    error: lang === 'ar' ? 'حدث خطأ' : 'An error occurred',
    success: lang === 'ar' ? 'تم بنجاح' : 'Success',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    save: lang === 'ar' ? 'حفظ' : 'Save',
    delete: lang === 'ar' ? 'حذف' : 'Delete',
    confirm: lang === 'ar' ? 'تأكيد' : 'Confirm',
    messages: {
      loadError: lang === 'ar' ? 'فشل في تحميل الاختبارات' : 'Failed to load tests',
      createSuccess: lang === 'ar' ? 'تم إنشاء الاختبار بنجاح' : 'Test created successfully',
      createError: lang === 'ar' ? 'فشل في إنشاء الاختبار' : 'Failed to create test',
      updateSuccess: lang === 'ar' ? 'تم تحديث الاختبار بنجاح' : 'Test updated successfully',
      updateError: lang === 'ar' ? 'فشل في تحديث الاختبار' : 'Failed to update test',
      deleteSuccess: lang === 'ar' ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully',
      deleteError: lang === 'ar' ? 'فشل في حذف الاختبار' : 'Failed to delete test',
      importSuccess: lang === 'ar' ? 'تم الاستيراد بنجاح' : 'Import completed successfully'
    }
  };
  
  // State management
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ChemicalTest | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<ChemicalTest | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState('');
  const [substanceFilter, setSubstanceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [testTypes, setTestTypes] = useState<string[]>([]);
  const [substances, setSubstances] = useState<string[]>([]);
  
  const itemsPerPage = 15;

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadFilters();
    loadStatistics();
  }, []);

  // Reload tests when filters change
  useEffect(() => {
    loadTests();
  }, [searchTerm, testTypeFilter, substanceFilter, currentPage]);

  const loadData = async () => {
    await Promise.all([
      loadTests(),
      loadFilters(),
      loadStatistics()
    ]);
  };

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from localStorage first
      try {
        initializeLocalStorage();
        let localTests = getChemicalTestsLocal();

        // Apply filters if any
        if (searchTerm) {
          localTests = localTests.filter(test =>
            test.method_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.method_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.description_ar?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (testTypeFilter) {
          localTests = localTests.filter(test => test.test_type === testTypeFilter);
        }

        if (substanceFilter) {
          localTests = localTests.filter(test =>
            test.possible_substance?.toLowerCase().includes(substanceFilter.toLowerCase()) ||
            test.possible_substance_ar?.toLowerCase().includes(substanceFilter.toLowerCase())
          );
        }

        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedTests = localTests.slice(startIndex, startIndex + itemsPerPage);

        console.log(`📊 Loaded ${paginatedTests.length} tests from localStorage (page ${currentPage})`);
        setTests(paginatedTests);
        return;

      } catch (localError) {
        console.warn('Failed to load from localStorage, trying Firebase:', localError);
      }

      // Fallback to Firebase if localStorage fails
      const filters: TestsFilter = {
        search: searchTerm,
        test_type: testTypeFilter,
        possible_substance: substanceFilter
      };

      const pagination: TestsPagination = {
        page: currentPage,
        limit: itemsPerPage
      };

      console.log('Loading tests from Firebase with filters:', filters, 'pagination:', pagination);
      const result = await getTests(pagination, filters);
      console.log('Loaded tests result from Firebase:', result);
      setTests(result.tests || []);

    } catch (err) {
      console.error('Error loading tests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tests');
      toast.error(safeTranslations?.messages?.loadError || safeTranslations.error);
      // Fallback to empty array to prevent UI crashes
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [typesData, substancesData] = await Promise.all([
        getTestTypes(),
        getSubstances()
      ]);
      setTestTypes(typesData || []);
      setSubstances(substancesData || []);
    } catch (err) {
      console.error('Failed to load filters:', err);
      // Fallback to default values
      setTestTypes(['marquis', 'mecke', 'liebermann', 'simon', 'ehrlich', 'ferric-sulfate']);
      setSubstances(['MDMA', 'Cocaine', 'Heroin', 'LSD', 'Cannabis', 'Amphetamine']);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getTestsStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      // Fallback statistics
      setStatistics({
        totalTests: tests.length,
        totalResults: 0,
        uniqueSubstances: 0,
        uniqueColors: 0,
        testsByType: {}
      });
    }
  };

  const handleCreateTest = async (testData: any) => {
    if (!user) return;
    
    try {
      setFormLoading(true);
      await createTest(testData, user.uid, user.email || '');
      toast.success(translations?.messages?.createSuccess || 'Test created successfully');
      await loadData(); // Reload all data
      setIsFormOpen(false);
      setEditingTest(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (translations?.messages?.createError || 'Failed to create test');
      toast.error(errorMessage);
      throw err; // Re-throw to prevent form from closing
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTest = async (testData: any) => {
    if (!user || !editingTest) return;
    
    try {
      setFormLoading(true);
      await updateTest(editingTest.id!, testData, user.uid, user.email || '');
      toast.success(translations?.messages?.updateSuccess || "Test updated successfully");
      await loadData(); // Reload all data
      setIsFormOpen(false);
      setEditingTest(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : translations?.messages?.updateError || "Failed to update test";
      toast.error(errorMessage);
      throw err; // Re-throw to prevent form from closing
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!user || !testToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteTest(testToDelete.id!, user.uid, user.email || '');
      toast.success(translations?.messages?.deleteSuccess || "Test deleted successfully");
      await loadData(); // Reload all data
      setDeleteConfirmOpen(false);
      setTestToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : translations?.messages?.deleteError || "Failed to delete test";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      console.log('Starting export process...');

      // Get all tests without pagination to ensure complete export
      const allTests = await exportTests();
      console.log(`Exporting ${allTests.length} tests`);

      if (allTests.length === 0) {
        toast.error(translations?.messages?.noDataToExport || 'No data to export');
        return;
      }

      // Format data for export with all required fields
      const exportData = allTests.map(test => ({
        test_id: test.id || '',
        test_name: test.method_name || '',
        test_name_ar: test.method_name_ar || '',
        color_result: test.color_result || '',
        color_result_ar: test.color_result_ar || '',
        color_hex: '#FFFFFF', // Default color if not available
        possible_substance: test.possible_substance || '',
        possible_substance_ar: test.possible_substance_ar || '',
        confidence_level: '75', // Default confidence level
        category: test.test_type || 'basic',
        reference: test.reference || `REF-${test.id?.slice(-3) || '000'}`
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chemical-tests-complete-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(translations?.messages?.exportSuccess || `Export completed successfully - ${allTests.length} tests exported`);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error(translations?.messages?.exportError || 'Export failed');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    try {
      const text = await file.text();
      const testsData = JSON.parse(text);
      
      if (!Array.isArray(testsData)) {
        throw new Error('Invalid file format');
      }
      
      const result = await importTests(testsData, user.uid, user.email || '');
      
      if (result.success > 0) {
        toast.success(`${translations?.messages?.importSuccess || "Import completed successfully"}: ${result.success} tests`);
        await loadData();
      }
      
      if (result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
      }
    } catch (err) {
      toast.error(translations?.messages?.importError || "Import failed");
    }
    
    // Reset file input
    event.target.value = '';
  };

  const openEditForm = (test: ChemicalTest) => {
    setEditingTest(test);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (test: ChemicalTest) => {
    setTestToDelete(test);
    setDeleteConfirmOpen(true);
  };

  const handleExportExcel = async () => {
    try {
      console.log('Starting Excel export...');
      const allTests = await exportTests();

      if (allTests.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Import Excel utility dynamically
      const { exportToExcel } = await import('@/lib/excel-utils');

      // Format data for Excel export
      const excelData = allTests.map(test => ({
        test_id: test.id || '',
        test_name: test.method_name || '',
        test_name_ar: test.method_name_ar || '',
        color_result: test.color_result || '',
        color_result_ar: test.color_result_ar || '',
        color_hex: '#FFFFFF',
        possible_substance: test.possible_substance || '',
        possible_substance_ar: test.possible_substance_ar || '',
        confidence_level: '75',
        category: test.test_type || 'basic',
        reference: test.reference || `REF-${test.id?.slice(-3) || '000'}`
      }));

      await exportToExcel(excelData, `chemical-tests-${new Date().toISOString().split('T')[0]}`);
      toast.success(`Excel export completed - ${allTests.length} tests exported`);
    } catch (err) {
      console.error('Excel export failed:', err);
      toast.error('Excel export failed');
    }
  };

  const totalPages = Math.ceil(tests.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {translations?.title || 'Tests Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {translations?.subtitle || 'Manage chemical tests'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {translations?.addNew || 'Add New'}
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {translations?.export || 'Export JSON'}
          </Button>

          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            {translations?.exportExcel || 'Export Excel'}
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {translations?.import || 'Import'}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <TestsStatistics
        lang={lang}
        tests={tests}
        onRefresh={loadStatistics}
      />

      {/* Tests Table */}
      <TestsTable
        tests={tests}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        testTypeFilter={testTypeFilter}
        onTestTypeFilterChange={setTestTypeFilter}
        substanceFilter={substanceFilter}
        onSubstanceFilterChange={setSubstanceFilter}
        testTypes={testTypes}
        substances={substances}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={(test) => {/* TODO: Implement view modal */}}
        onEdit={openEditForm}
        onDelete={openDeleteConfirm}
        translations={translations}
        isRTL={isRTL}
      />

      {/* Test Form Modal */}
      <TestFormNew
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTest(null);
        }}
        onSubmit={editingTest ? handleUpdateTest : handleCreateTest}
        test={editingTest}
        loading={formLoading}
        translations={translations}
        isRTL={isRTL}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translations?.delete?.title || "Delete Test"}</DialogTitle>
            <DialogDescription>
              {translations?.delete?.message || "Are you sure you want to delete this test?"}
            </DialogDescription>
          </DialogHeader>
          
          {testToDelete && (
            <div className="py-4">
              <div className="text-sm text-gray-600 mb-2">
                {translations?.delete?.testName || "Test Name"}:
              </div>
              <div className="font-medium">
                {isRTL ? testToDelete.method_name_ar : testToDelete.method_name}
              </div>
              <div className="text-sm text-red-600 mt-2">
                {translations?.delete?.warning || "This action cannot be undone."}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleteLoading}
            >
              {translations?.delete?.cancel || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTest}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {translations?.delete?.confirm || "Delete"}
                </div>
              ) : (
                translations?.delete?.confirm || "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
