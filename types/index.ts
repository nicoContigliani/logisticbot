export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface LogisticsRecord {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  date: string;
  weight?: number;
  dimensions?: string;
  carrier?: string;
  cost?: number;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFile {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

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

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface LogisticsStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  pending: number;
  totalCost: number;
}

export interface DashboardData {
  stats: LogisticsStats;
  recentShipments: LogisticsRecord[];
  uploadedFiles: UploadedFile[];
}
