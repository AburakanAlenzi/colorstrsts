'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  color_result: string;
  color_result_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  prepare: string;
  test_type: string;
  test_number: string;
  reference: string;
}

interface TestsManagementProps {
  isRTL: boolean;
}

export default function TestsManagement({ isRTL }: TestsManagementProps) {
  // Default tests data
  const defaultTests: ChemicalTest[] = [
    {
      id: '1',
      method_name: 'Marquis Test',
      method_name_ar: 'اختبار ماركيز',
      color_result: 'Purple/Black',
      color_result_ar: 'بنفسجي/أسود',
      possible_substance: 'MDMA/Amphetamines',
      possible_substance_ar: 'إم دي إم إيه/أمفيتامينات',
      prepare: 'Add 2-3 drops of reagent',
      test_type: 'Presumptive',
      test_number: '1',
      reference: 'DEA Guidelines'
    },
    {
      id: '2',
      method_name: 'Mecke Test',
      method_name_ar: 'اختبار ميك',
      color_result: 'Blue/Green',
      color_result_ar: 'أزرق/أخضر',
      possible_substance: 'Opiates',
      possible_substance_ar: 'مواد أفيونية',
      prepare: 'Add 2-3 drops of reagent',
      test_type: 'Presumptive',
      test_number: '2',
      reference: 'UNODC Manual'
    }
  ];

  // Use safe localStorage hook
  const [tests, setTests] = useLocalStorage<ChemicalTest[]>('chemical_tests', defaultTests);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ChemicalTest | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTest, setNewTest] = useState<Partial<ChemicalTest>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const saveTests = (updatedTests: ChemicalTest[]) => {
    setTests(updatedTests);
  };

  const handleEdit = (test: ChemicalTest) => {
    setEditingId(test.id);
    setEditForm({ ...test });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    
    const updatedTests = tests.map(test => 
      test.id === editingId ? editForm : test
    );
    saveTests(updatedTests);
    setEditingId(null);
    setEditForm(null);
    setMessage({
      type: 'success',
      text: isRTL ? 'تم تحديث الاختبار بنجاح' : 'Test updated successfully'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this test?')) {
      const updatedTests = tests.filter(test => test.id !== id);
      saveTests(updatedTests);
      setMessage({
        type: 'success',
        text: isRTL ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully'
      });
    }
  };

  const handleAddTest = () => {
    if (!newTest.method_name || !newTest.method_name_ar) {
      setMessage({
        type: 'error',
        text: isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields'
      });
      return;
    }

    const testToAdd: ChemicalTest = {
      id: Date.now().toString(),
      method_name: newTest.method_name || '',
      method_name_ar: newTest.method_name_ar || '',
      color_result: newTest.color_result || '',
      color_result_ar: newTest.color_result_ar || '',
      possible_substance: newTest.possible_substance || '',
      possible_substance_ar: newTest.possible_substance_ar || '',
      prepare: newTest.prepare || '',
      test_type: newTest.test_type || 'Presumptive',
      test_number: newTest.test_number || '',
      reference: newTest.reference || ''
    };

    const updatedTests = [...tests, testToAdd];
    saveTests(updatedTests);
    setNewTest({});
    setShowAddForm(false);
    setMessage({
      type: 'success',
      text: isRTL ? 'تم إضافة الاختبار بنجاح' : 'Test added successfully'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إدارة الاختبارات الكيميائية' : 'Chemical Tests Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'إضافة وتحرير وحذف الاختبارات' : 'Add, edit, and delete tests'}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          {isRTL ? 'إضافة اختبار جديد' : 'Add New Test'}
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:bg-green-900/20'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Add New Test Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'إضافة اختبار جديد' : 'Add New Test'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? 'اسم الاختبار (إنجليزي)' : 'Test Name (English)'}
                </label>
                <input
                  type="text"
                  value={newTest.method_name || ''}
                  onChange={(e) => setNewTest({...newTest, method_name: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Marquis Test"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={newTest.method_name_ar || ''}
                  onChange={(e) => setNewTest({...newTest, method_name_ar: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="اختبار ماركيز"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? 'نتيجة اللون (إنجليزي)' : 'Color Result (English)'}
                </label>
                <input
                  type="text"
                  value={newTest.color_result || ''}
                  onChange={(e) => setNewTest({...newTest, color_result: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Purple/Black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isRTL ? 'نتيجة اللون (عربي)' : 'Color Result (Arabic)'}
                </label>
                <input
                  type="text"
                  value={newTest.color_result_ar || ''}
                  onChange={(e) => setNewTest({...newTest, color_result_ar: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="بنفسجي/أسود"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTest} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex items-center gap-2">
                <XMarkIcon className="h-4 w-4" />
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests List */}
      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BeakerIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">
                      {isRTL ? test.method_name_ar : test.method_name}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? test.color_result_ar : test.color_result}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(test)}
                    className="flex items-center gap-1"
                  >
                    <PencilIcon className="h-3 w-3" />
                    {isRTL ? 'تحرير' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(test.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-3 w-3" />
                    {isRTL ? 'حذف' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {editingId === test.id && editForm ? (
              <CardContent className="space-y-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? 'اسم الاختبار (إنجليزي)' : 'Test Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={editForm.method_name}
                      onChange={(e) => setEditForm({...editForm, method_name: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isRTL ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={editForm.method_name_ar}
                      onChange={(e) => setEditForm({...editForm, method_name_ar: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    {isRTL ? 'حفظ' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2">
                    <XMarkIcon className="h-4 w-4" />
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{isRTL ? 'المادة المحتملة:' : 'Possible Substance:'}</span>
                    <p>{isRTL ? test.possible_substance_ar : test.possible_substance}</p>
                  </div>
                  <div>
                    <span className="font-medium">{isRTL ? 'نوع الاختبار:' : 'Test Type:'}</span>
                    <p>{test.test_type}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {tests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isRTL ? 'لا توجد اختبارات متاحة' : 'No tests available'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
