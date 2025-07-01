import * as XLSX from 'xlsx';

export interface ExcelData {
  headers: string[];
  rows: string[][];
  fileName: string;
  fileSize: string;
  rowCount: number;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ExcelValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data: ExcelData | null;
}

// Expected headers for chemical test data
export const EXPECTED_HEADERS = [
  'test_id',
  'test_name',
  'test_name_ar',
  'color_result',
  'color_result_ar',
  'color_hex',
  'possible_substance',
  'possible_substance_ar',
  'confidence_level',
  'category'
];

// Required headers (must be present)
export const REQUIRED_HEADERS = [
  'test_id',
  'test_name',
  'color_result',
  'color_hex',
  'possible_substance'
];

/**
 * Read and parse Excel file
 */
export async function readExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        if (jsonData.length === 0) {
          throw new Error('Empty file');
        }
        
        const headers = jsonData[0] || [];
        const rows = jsonData.slice(1);
        
        const excelData: ExcelData = {
          headers,
          rows,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          rowCount: rows.length
        };
        
        resolve(excelData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate Excel data structure and content
 */
export function validateExcelData(data: ExcelData, lang: 'ar' | 'en' = 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check required headers
  REQUIRED_HEADERS.forEach(header => {
    if (!data.headers.includes(header)) {
      errors.push({
        row: 0,
        column: header,
        message: lang === 'ar' 
          ? `العمود المطلوب "${header}" غير موجود`
          : `Required column "${header}" is missing`
      });
    }
  });
  
  // Check data rows
  data.rows.forEach((row, index) => {
    const rowNumber = index + 1;
    
    // Check row length
    if (row.length !== data.headers.length) {
      errors.push({
        row: rowNumber,
        column: 'general',
        message: lang === 'ar' 
          ? 'عدد الأعمدة غير متطابق'
          : 'Column count mismatch'
      });
    }
    
    // Check required fields
    REQUIRED_HEADERS.forEach(header => {
      const columnIndex = data.headers.indexOf(header);
      if (columnIndex !== -1) {
        const cellValue = row[columnIndex];
        if (!cellValue || cellValue.toString().trim() === '') {
          errors.push({
            row: rowNumber,
            column: header,
            message: lang === 'ar' 
              ? `الحقل المطلوب "${header}" فارغ`
              : `Required field "${header}" is empty`
          });
        }
      }
    });
    
    // Validate color hex codes
    const colorHexIndex = data.headers.indexOf('color_hex');
    if (colorHexIndex !== -1) {
      const hexValue = row[colorHexIndex];
      if (hexValue && !isValidHexColor(hexValue.toString())) {
        errors.push({
          row: rowNumber,
          column: 'color_hex',
          message: lang === 'ar' 
            ? 'كود اللون غير صحيح (يجب أن يكون بصيغة #RRGGBB)'
            : 'Invalid hex color code (must be in #RRGGBB format)'
        });
      }
    }
    
    // Validate test_id format
    const testIdIndex = data.headers.indexOf('test_id');
    if (testIdIndex !== -1) {
      const testId = row[testIdIndex];
      if (testId && !isValidTestId(testId.toString())) {
        errors.push({
          row: rowNumber,
          column: 'test_id',
          message: lang === 'ar' 
            ? 'معرف الاختبار غير صحيح (يجب أن يحتوي على أحرف وأرقام وشرطات فقط)'
            : 'Invalid test ID (must contain only letters, numbers, and hyphens)'
        });
      }
    }
  });
  
  return errors;
}

/**
 * Export data to Excel format
 */
export function exportToExcel(data: any[], filename: string = 'export'): void {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Create backup before importing data
 */
export function createBackup(data: any[], backupName: string = 'backup'): void {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      data: data
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backupName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}

/**
 * Convert Excel data to database format
 */
export function convertExcelToDatabase(excelData: ExcelData): any[] {
  const result: any[] = [];
  
  excelData.rows.forEach(row => {
    const record: any = {};
    
    excelData.headers.forEach((header, index) => {
      record[header] = row[index] || '';
    });
    
    // Add metadata
    record.id = generateId();
    record.created_at = new Date().toISOString();
    record.updated_at = new Date().toISOString();
    
    result.push(record);
  });
  
  return result;
}

/**
 * Helper functions
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

function isValidTestId(testId: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(testId);
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Get sample Excel template data
 */
export function getSampleExcelData(): any[] {
  return [
    {
      test_id: 'marquis-test',
      test_name: 'Marquis Test',
      test_name_ar: 'اختبار ماركيز',
      color_result: 'Purple to Violet',
      color_result_ar: 'بنفسجي إلى بنفسجي داكن',
      color_hex: '#800080',
      possible_substance: 'MDMA, Amphetamines',
      possible_substance_ar: 'إم دي إم إيه، الأمفيتامينات',
      confidence_level: '85',
      category: 'basic'
    },
    {
      test_id: 'mecke-test',
      test_name: 'Mecke Test',
      test_name_ar: 'اختبار ميكي',
      color_result: 'Blue to Green',
      color_result_ar: 'أزرق إلى أخضر',
      color_hex: '#008B8B',
      possible_substance: 'Cocaine, Heroin',
      possible_substance_ar: 'الكوكايين، الهيروين',
      confidence_level: '90',
      category: 'basic'
    },
    {
      test_id: 'ferric-sulfate-test',
      test_name: 'Ferric Sulfate Test',
      test_name_ar: 'اختبار كبريتات الحديد',
      color_result: 'Orange to Brown',
      color_result_ar: 'برتقالي إلى بني',
      color_hex: '#FFA500',
      possible_substance: 'Morphine, Heroin',
      possible_substance_ar: 'المورفين، الهيروين',
      confidence_level: '80',
      category: 'advanced'
    }
  ];
}

/**
 * Download sample Excel template
 */
export function downloadSampleTemplate(): void {
  const sampleData = getSampleExcelData();
  exportToExcel(sampleData, 'chemical-tests-template');
}
