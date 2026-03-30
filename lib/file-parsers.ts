import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { parseStringPromise } from 'xml2js';

export interface ParsedData {
  headers: string[];
  rows: Record<string, unknown>[];
  metadata?: {
    fileName: string;
    fileType: string;
    rowCount: number;
    columnCount: number;
  };
}

export interface LogisticsRecord {
  id?: string;
  trackingNumber?: string;
  origin?: string;
  destination?: string;
  status?: string;
  date?: string;
  weight?: number;
  dimensions?: string;
  carrier?: string;
  cost?: number;
  notes?: string;
  [key: string]: unknown;
}

// Parse Excel files (.xlsx, .xls)
export async function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          reject(new Error('Empty spreadsheet'));
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).map((row) => {
          const obj: Record<string, unknown> = {};
          headers.forEach((header, index) => {
            obj[header] = (row as unknown[])[index];
          });
          return obj;
        });

        resolve({
          headers,
          rows,
          metadata: {
            fileName: file.name,
            fileType: 'excel',
            rowCount: rows.length,
            columnCount: headers.length,
          },
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Parse CSV files
export async function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          reject(new Error('Empty CSV file'));
          return;
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, unknown>[];

        resolve({
          headers,
          rows,
          metadata: {
            fileName: file.name,
            fileType: 'csv',
            rowCount: rows.length,
            columnCount: headers.length,
          },
        });
      },
      error: (error) => reject(error),
    });
  });
}

// Parse XML files
export async function parseXML(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const xmlContent = e.target?.result as string;
        const result = await parseStringPromise(xmlContent, {
          explicitArray: false,
          mergeAttrs: true,
        });

        // Extract data from XML structure
        const extractRows = (obj: unknown, path: string = ''): Record<string, unknown>[] => {
          const rows: Record<string, unknown>[] = [];
          
          if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj)) {
              obj.forEach((item, index) => {
                rows.push(...extractRows(item, `${path}[${index}]`));
              });
            } else {
              const record = obj as Record<string, unknown>;
              // Check if this object has leaf values (not nested objects)
              const hasLeafValues = Object.values(record).some(
                (v) => typeof v !== 'object' || v === null
              );
              
              if (hasLeafValues) {
                rows.push(record);
              }
              
              // Recursively process nested objects
              Object.entries(record).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  rows.push(...extractRows(value, `${path}.${key}`));
                }
              });
            }
          }
          
          return rows;
        };

        const rows = extractRows(result);
        
        if (rows.length === 0) {
          reject(new Error('No data found in XML'));
          return;
        }

        // Get all unique headers from all rows
        const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];

        resolve({
          headers,
          rows,
          metadata: {
            fileName: file.name,
            fileType: 'xml',
            rowCount: rows.length,
            columnCount: headers.length,
          },
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Parse CASL (Custom Abstract Syntax Language) files
export async function parseCASL(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter((line) => line.trim());
        
        if (lines.length === 0) {
          reject(new Error('Empty CASL file'));
          return;
        }

        // Parse CASL format (simplified - assumes tab or comma separated)
        const delimiter = content.includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map((h) => h.trim());
        
        const rows = lines.slice(1).map((line) => {
          const values = line.split(delimiter).map((v) => v.trim());
          const obj: Record<string, unknown> = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

        resolve({
          headers,
          rows,
          metadata: {
            fileName: file.name,
            fileType: 'casl',
            rowCount: rows.length,
            columnCount: headers.length,
          },
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Auto-detect file type and parse
export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    case 'csv':
      return parseCSV(file);
    case 'xml':
      return parseXML(file);
    case 'casl':
      return parseCASL(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

// Convert parsed data to logistics records
export function toLogisticsRecords(data: ParsedData): LogisticsRecord[] {
  return data.rows.map((row, index) => {
    const record: LogisticsRecord = {
      id: `LOG-${Date.now()}-${index}`,
      ...row,
    };
    
    // Map common field names to standard logistics fields
    const fieldMappings: Record<string, string[]> = {
      trackingNumber: ['tracking', 'tracking_number', 'trackingNumber', 'numero_seguimiento', 'guia'],
      origin: ['origin', 'origen', 'source', 'fuente', 'from'],
      destination: ['destination', 'destino', 'to', 'hacia'],
      status: ['status', 'estado', 'state', 'situacion'],
      date: ['date', 'fecha', 'created_at', 'createdAt', 'timestamp'],
      weight: ['weight', 'peso', 'kg', 'kilos'],
      dimensions: ['dimensions', 'dimensiones', 'size', 'tamaño', 'largo_x_ancho_x_alto'],
      carrier: ['carrier', 'transportista', 'empresa', 'company'],
      cost: ['cost', 'costo', 'precio', 'price', 'amount', 'monto'],
      notes: ['notes', 'notas', 'observaciones', 'comments', 'comentarios'],
    };
    
    // Apply field mappings
    Object.entries(fieldMappings).forEach(([targetField, sourceFields]) => {
      if (!record[targetField]) {
        for (const sourceField of sourceFields) {
          if (row[sourceField] !== undefined) {
            record[targetField] = row[sourceField];
            break;
          }
        }
      }
    });
    
    return record;
  });
}

// Export data to different formats
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function exportToExcel(data: Record<string, unknown>[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Logistics Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToXML(data: Record<string, unknown>[], filename: string): void {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<logistics>
${data
  .map(
    (record) => `  <record>
${Object.entries(record)
  .map(([key, value]) => `    <${key}>${value}</${key}>`)
  .join('\n')}
  </record>`
  )
  .join('\n')}
</logistics>`;
  
  const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xml`;
  link.click();
}
