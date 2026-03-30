// ==================== BUSINESS LOGIC LAYER ====================
// This file provides the structure for business logic integration
// Extend these services as needed for your logistics platform

import { supabase } from './supabase';
import { uploadImage, deleteImage, validateImageFile } from './file-utils';
import { createExcelFile, downloadExcelFile, readExcelFile } from './excel-utils';

// ==================== TYPES ====================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

// ==================== BASE SERVICE ====================

/**
 * Base service class for CRUD operations
 */
export abstract class BaseService<T extends { id?: string }> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findAll(params?: PaginationParams & FilterParams): Promise<PaginatedResult<T>> {
    let query = supabase.from(this.tableName).select('*', { count: 'exact' });

    // Apply pagination
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    // Apply sorting
    if (params?.sortBy) {
      query = query.order(params.sortBy, { ascending: params.sortOrder !== 'desc' });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as T[],
      total: count || 0,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: Math.ceil((count || 0) / (params?.limit || 10)),
    };
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as T;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async search(searchTerm: string, fields: string[]): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');
    
    const orCondition = fields.map(field => 
      `${field}.ilike.%${searchTerm}%`
    ).join(',');

    query = query.or(orCondition);

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }
}

// ==================== FILE UPLOAD SERVICE ====================

export class FileService {
  private defaultBucket = 'files';

  async uploadProfileImage(
    userId: string,
    file: File
  ): Promise<{ url: string; path: string }> {
    // Validate file
    const validation = validateImageFile(file, {
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const folder = `profiles/${userId}`;
    const result = await uploadImage(file, this.defaultBucket, folder);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data!;
  }

  async uploadCourseMaterial(
    courseId: string,
    file: File,
    type: 'video' | 'document' | 'image'
  ): Promise<{ url: string; path: string }> {
    const folder = `courses/${courseId}/${type}`;
    const result = await uploadImage(file, this.defaultBucket, folder);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data!;
  }

  async deleteFile(path: string): Promise<void> {
    const result = await deleteImage(path, this.defaultBucket);
    if (!result.success) {
      throw new Error(result.error);
    }
  }
}

// ==================== REPORT SERVICE ====================

export class ReportService {
  // Education-related methods removed
}

// ==================== NOTIFICATION SERVICE ====================

export interface Notification {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
}

export class NotificationService {
  async send(notification: Notification): Promise<void> {
    // Store notification in database
    await supabase.from('notifications').insert({
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read || false,
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  }
}

// ==================== VALIDATION UTILITIES ====================

export const ValidationRules = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  },
  
  required: (value: any) => {
    return value ? null : 'This field is required';
  },
  
  minLength: (min: number) => (value: string) => {
    return value.length >= min ? null : `Minimum ${min} characters required`;
  },
  
  maxLength: (max: number) => (value: string) => {
    return value.length <= max ? null : `Maximum ${max} characters allowed`;
  },
  
  phone: (value: string) => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(value) ? null : 'Invalid phone number';
  },
  
  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },
};

// ==================== EXPORT DEFAULT SERVICE ====================

export const fileService = new FileService();
export const reportService = new ReportService();
export const notificationService = new NotificationService();
