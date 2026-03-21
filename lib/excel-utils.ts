import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

// ==================== EXCEL OPERATIONS ====================

export interface ExcelRow {
  [key: string]: any;
}

export interface ExcelSheet {
  name: string;
  data: ExcelRow[];
}

export interface ExcelData {
  sheets: ExcelSheet[];
  fileName: string;
}

/**
 * Create an Excel file from data
 */
export function createExcelFile(
  data: ExcelRow[] | ExcelSheet[],
  fileName: string = 'export.xlsx',
  options: {
    sheetName?: string;
    headers?: string[];
  } = {}
): Blob {
  const { sheetName = 'Sheet1' } = options;

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  if (Array.isArray(data) && data.length > 0 && !Array.isArray(data[0])) {
    // It's an array of objects (single sheet)
    const worksheet = XLSX.utils.json_to_sheet(data as ExcelRow[]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  } else if (Array.isArray(data) && data.length > 0 && Array.isArray((data[0] as ExcelSheet).data)) {
    // It's multiple sheets
    (data as ExcelSheet[]).forEach((sheet) => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });
  }

  // Generate buffer
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create blob
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Download Excel file
 */
export function downloadExcelFile(
  data: ExcelRow[] | ExcelSheet[],
  fileName: string = 'export.xlsx'
): void {
  const blob = createExcelFile(data, fileName);
  saveAs(blob, fileName);
}

/**
 * Read Excel file
 */
export function readExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: ExcelSheet[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          return {
            name: sheetName,
            data: json as ExcelRow[],
          };
        });

        resolve({
          sheets,
          fileName: file.name,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read Excel file from URL
 */
export async function readExcelFromUrl(url: string): Promise<ExcelData> {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], 'file.xlsx');
  return readExcelFile(file);
}

// ==================== CSV OPERATIONS ====================

/**
 * Create CSV from data
 */
export function createCsvFile(
  data: Record<string, any>[],
  fileName: string = 'export.csv'
): Blob {
  const csv = Papa.unparse(data);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Download CSV file
 */
export function downloadCsvFile(
  data: Record<string, any>[],
  fileName: string = 'export.csv'
): void {
  const blob = createCsvFile(data, fileName);
  saveAs(blob, fileName);
}

/**
 * Read CSV file
 */
export function readCsvFile(file: File): Promise<ExcelRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
        } else {
          resolve(results.data as ExcelRow[]);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Read CSV from URL
 */
export async function readCsvFromUrl(url: string): Promise<ExcelRow[]> {
  const response = await fetch(url);
  const text = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
        } else {
          resolve(results.data as ExcelRow[]);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// ==================== DATA TRANSFORMATION ====================

/**
 * Convert Excel data to JSON
 */
export function excelToJson(workbook: XLSX.WorkBook): ExcelSheet[] {
  return workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    return {
      name: sheetName,
      data: XLSX.utils.sheet_to_json(worksheet) as ExcelRow[],
    };
  });
}

/**
 * Convert JSON to Excel worksheet
 */
export function jsonToExcel(data: ExcelRow[]): XLSX.WorkSheet {
  return XLSX.utils.json_to_sheet(data);
}

/**
 * Merge multiple Excel sheets into one
 */
export function mergeExcelSheets(sheets: ExcelSheet[]): ExcelRow[] {
  return sheets.flatMap((sheet) => sheet.data);
}

/**
 * Filter Excel data by column
 */
export function filterExcelData(
  data: ExcelRow[],
  column: string,
  value: any
): ExcelRow[] {
  return data.filter((row) => row[column] === value);
}

/**
 * Sort Excel data by column
 */
export function sortExcelData(
  data: ExcelRow[],
  column: string,
  order: 'asc' | 'desc' = 'asc'
): ExcelRow[] {
  return [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Group Excel data by column
 */
export function groupExcelData(
  data: ExcelRow[],
  column: string
): Record<string, ExcelRow[]> {
  return data.reduce((acc, row) => {
    const key = row[column];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {} as Record<string, ExcelRow[]>);
}
