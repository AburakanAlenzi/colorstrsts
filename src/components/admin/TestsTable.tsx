'use client';

import React, { useState } from 'react';
import { ChemicalTest } from '@/lib/firebase-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TestDetailsModal from './TestDetailsModal';
import PrintButton from '../print/PrintButton';
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Printer
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TestsTableProps {
  tests: ChemicalTest[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  testTypeFilter: string;
  onTestTypeFilterChange: (type: string) => void;
  substanceFilter: string;
  onSubstanceFilterChange: (substance: string) => void;
  testTypes: string[];
  substances: string[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (test: ChemicalTest) => void;
  onEdit: (test: ChemicalTest) => void;
  onDelete: (test: ChemicalTest) => void;
  translations: any;
  isRTL: boolean;
}

export default function TestsTable({
  tests,
  loading,
  error,
  searchTerm,
  onSearchChange,
  testTypeFilter,
  onTestTypeFilterChange,
  substanceFilter,
  onSubstanceFilterChange,
  testTypes,
  substances,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  translations,
  isRTL
}: TestsTableProps) {
  const [selectedTest, setSelectedTest] = useState<ChemicalTest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewTest = (test: ChemicalTest) => {
    setSelectedTest(test);
    setIsDetailsModalOpen(true);
    onView(test); // Keep the original callback
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedTest(null);
  };
  const [itemsPerPage] = useState(15);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, tests.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">{translations.table.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">{translations.table.error}</div>
        <div className="text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={translations.search}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={testTypeFilter} onValueChange={onTestTypeFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={translations.filterByType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{translations.allTypes}</SelectItem>
              {testTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={substanceFilter} onValueChange={onSubstanceFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={translations.filterBySubstance} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{translations.allSubstances}</SelectItem>
              {substances.map((substance) => (
                <SelectItem key={substance} value={substance}>
                  {substance}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Print Button */}
          <PrintButton
            tests={tests}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{translations.table.id}</TableHead>
              <TableHead>{translations.table.methodName}</TableHead>
              <TableHead className="w-[120px]">{translations.table.testType}</TableHead>
              <TableHead>{translations.table.substance}</TableHead>
              <TableHead>{translations.table.colorResult}</TableHead>
              <TableHead className="w-[120px]">{translations.table.createdAt}</TableHead>
              <TableHead className="w-[100px] text-center">{translations.table.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {translations.table.noTests}
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <TableRow key={test.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">
                    {test.id?.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {isRTL ? test.method_name_ar : test.method_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {isRTL ? test.method_name : test.method_name_ar}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {test.test_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {isRTL ? test.possible_substance_ar : test.possible_substance}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {isRTL ? test.color_result_ar : test.color_result}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(test.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewTest(test)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {translations.table.view}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(test)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {translations.table.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="p-0"
                        >
                          <div className="w-full">
                            <PrintButton test={test} variant="ghost" size="sm" className="w-full justify-start p-2 h-auto font-normal" />
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(test)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {translations.table.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {tests.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {translations.pagination.showing} {startIndex} {translations.pagination.to} {endIndex} {translations.pagination.of} {tests.length} {translations.pagination.results}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {translations.pagination.previous}
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {translations.pagination.next}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Test Details Modal */}
      <TestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        test={selectedTest}
        translations={translations}
        isRTL={isRTL}
      />
    </div>
  );
}
