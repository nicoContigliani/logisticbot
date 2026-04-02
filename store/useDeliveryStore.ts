import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExcelData } from '@/lib/excel-utils';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  data?: ExcelData;
  error?: string;
}

export interface BroadcastRecord {
  id: string;
  userId: string;
  companyName: string;
  message: string;
  shift: 'morning' | 'afternoon';
  deliveryPerson: { name: string; phone: string };
  clients: { name?: string; phone: string; address?: string }[];
  status: 'pending' | 'sent' | 'error';
  createdAt: string;
  sentAt?: string;
}

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  rowCount: number;
  uploadedAt: string;
  updatedAt: string;
  mergeCount: number;
  wasUpdated: boolean;
}

export interface DateGroup {
  date: string;
  totalUploads: number;
  totalRows: number;
  lastUpload: string;
  uploads: UploadHistoryItem[];
}

export type DeliveryTab = 'registros' | 'modificaciones' | 'mensajes';

interface DeliveryState {
  activeTab: DeliveryTab;
  uploadedFiles: UploadedFile[];
  selectedFileId: string | null;
  activeSheet: number;
  searchTerm: string;
  currentPage: number;
  rowsPerPage: number;
  deliveryPersonName: string;
  deliveryPersonPhone: string;
  shift: 'morning' | 'afternoon';
  sentPhones: string[];

  setActiveTab: (tab: DeliveryTab) => void;
  setUploadedFiles: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void;
  setSelectedFileId: (id: string | null) => void;
  setActiveSheet: (index: number) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (size: number) => void;
  setDeliveryPersonName: (name: string) => void;
  setDeliveryPersonPhone: (phone: string) => void;
  setShift: (shift: 'morning' | 'afternoon') => void;
  addSentPhones: (phones: string[]) => void;
  clearSentPhones: () => void;
  resetView: () => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      activeTab: 'registros',
      uploadedFiles: [],
      selectedFileId: null,
      activeSheet: 0,
      searchTerm: '',
      currentPage: 1,
      rowsPerPage: 10,
      deliveryPersonName: '',
      deliveryPersonPhone: '',
      shift: 'morning',
      sentPhones: [],

      setActiveTab: (activeTab) => set({ activeTab }),
      setUploadedFiles: (files) =>
        set((state) => ({
          uploadedFiles: typeof files === 'function' ? files(state.uploadedFiles) : files,
        })),
      setSelectedFileId: (selectedFileId) => set({ selectedFileId }),
      setActiveSheet: (activeSheet) => set({ activeSheet }),
      setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setRowsPerPage: (rowsPerPage) => set({ rowsPerPage, currentPage: 1 }),
      setDeliveryPersonName: (deliveryPersonName) => set({ deliveryPersonName }),
      setDeliveryPersonPhone: (deliveryPersonPhone) => set({ deliveryPersonPhone }),
      setShift: (shift) => set({ shift }),
      addSentPhones: (phones) =>
        set((state) => ({
          sentPhones: [...new Set([...state.sentPhones, ...phones])],
        })),
      clearSentPhones: () => set({ sentPhones: [] }),
      resetView: () =>
        set({
          activeSheet: 0,
          searchTerm: '',
          currentPage: 1,
        }),
    }),
    {
      name: 'logisticbot-delivery-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        selectedFileId: state.selectedFileId,
        deliveryPersonName: state.deliveryPersonName,
        deliveryPersonPhone: state.deliveryPersonPhone,
        shift: state.shift,
        sentPhones: state.sentPhones,
        rowsPerPage: state.rowsPerPage,
      }),
    }
  )
);
