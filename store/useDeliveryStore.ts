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

export type DeliveryTab = 'registros' | 'historial' | 'mensajes';

interface DeliveryState {
  activeTab: DeliveryTab;
  uploadedFiles: UploadedFile[];
  selectedFileId: string | null;
  searchTerm: string;
  currentPage: number;
  rowsPerPage: number;
  deliveryPersonName: string;
  deliveryPersonPhone: string;
  shift: 'morning' | 'afternoon';
  sentPhones: Record<string, string[]>;

  setActiveTab: (tab: DeliveryTab) => void;
  setUploadedFiles: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void;
  setSelectedFileId: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (size: number) => void;
  setDeliveryPersonName: (name: string) => void;
  setDeliveryPersonPhone: (phone: string) => void;
  setShift: (shift: 'morning' | 'afternoon') => void;
  addSentPhones: (type: string, phones: string[]) => void;
  clearSentPhones: () => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      activeTab: 'registros',
      uploadedFiles: [],
      selectedFileId: null,
      searchTerm: '',
      currentPage: 1,
      rowsPerPage: 10,
      deliveryPersonName: '',
      deliveryPersonPhone: '',
      shift: 'morning',
      sentPhones: {},

      setActiveTab: (activeTab) => set({ activeTab }),
      setUploadedFiles: (files) =>
        set((state) => ({
          uploadedFiles: typeof files === 'function' ? files(state.uploadedFiles) : files,
        })),
      setSelectedFileId: (selectedFileId) => set({ selectedFileId }),
      setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setRowsPerPage: (rowsPerPage) => set({ rowsPerPage, currentPage: 1 }),
      setDeliveryPersonName: (deliveryPersonName) => set({ deliveryPersonName }),
      setDeliveryPersonPhone: (deliveryPersonPhone) => set({ deliveryPersonPhone }),
      setShift: (shift) => set({ shift }),
      addSentPhones: (type, phones) =>
        set((state) => {
          const current = state.sentPhones[type] || [];
          return {
            sentPhones: {
              ...state.sentPhones,
              [type]: [...new Set([...current, ...phones])],
            },
          };
        }),
      clearSentPhones: () => set({ sentPhones: {} }),
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
