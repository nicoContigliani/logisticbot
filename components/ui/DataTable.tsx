'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  IconButton, 
  Input, 
  Chip, 
  CircularProgress, 
  Typography, 
  Menu, 
  MenuItem, 
  Alert, 
  Checkbox
} from '@/components/metro';
import { icons } from '@/components/mui';

// ==================== TYPES ====================

/**
 * Column configuration for the data table
 * @interface ColumnConfig
 * @description Defines how each column in the table should be rendered and behaves
 * 
 * @property {string} id - Unique identifier for the column (used as key)
 * @property {string} label - Display label for the column header
 * @property {string} [field] - Property name in the data object (defaults to id)
 * @property {boolean} [sortable=true] - Whether the column can be sorted
 * @property {boolean} [filterable=true] - Whether this column is included in search
 * @property {boolean} [exportable=true] - Whether to include in CSV export
 * @property {'left' | 'center' | 'right'} [align='left'] - Text alignment
 * @property {number} [minWidth] - Minimum column width in pixels
 * @property {number} [width] - Fixed column width
 * @property {React.CSSProperties} [sx] - Custom MUI styles for the cell
 * @property {(value: any, row: T, index: number) => React.ReactNode} [render] - Custom render function
 * @property {'text' | 'number' | 'date' | 'boolean' | 'currency' | 'image' | 'chip'} [type='text'] - Data type for formatting
 * @property {string} [format] - Format string (e.g., 'currency' code, 'date' format)
 * @property {boolean} [hidden=false] - Whether to hide the column
 * @property {string} [color] - Color for chip type
 * 
 * @example
 * // Basic column
 * { id: 'name', label: 'Name' }
 * 
 * // Custom render
 * { 
 *   id: 'actions', 
 *   label: 'Actions', 
 *   render: (value, row) => <Button>Edit</Button> 
 * }
 * 
 * // Formatted currency
 * { 
 *   id: 'price', 
 *   label: 'Price', 
 *   type: 'currency', 
 *   format: 'USD' 
 * }
 */
export interface ColumnConfig<T = any> {
  id: string;
  label: string;
  field?: string;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  width?: number;
  sx?: React.CSSProperties;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'image' | 'chip';
  format?: string;
  hidden?: boolean;
  color?: string;
}

/**
 * Action button configuration for row actions
 * @interface ActionConfig
 * @description Defines action buttons that appear on each row
 * 
 * @property {string} id - Unique identifier for the action
 * @property {string} label - Tooltip label on hover
 * @property {'view' | 'edit' | 'delete' | 'custom'} type - Predefined action type
 * @property {React.ReactNode} [icon] - Custom icon (overrides type default)
 * @property {string} [color] - Icon color (primary, secondary, error, etc.)
 * @property {(row: T) => void} [onClick] - Click handler
 * @property {(row: T) => boolean} [disabled] - Disable condition
 * @property {string} [confirmMessage] - Confirmation dialog message
 * 
 * @example
 * { 
 *   id: 'edit', 
 *   type: 'edit', 
 *   onClick: (row) => navigateTo(`/edit/${row.id}`) 
 * }
 */
export interface ActionConfig<T = any> {
  id: string;
  label: string;
  type: 'view' | 'edit' | 'delete' | 'custom';
  icon?: React.ReactNode;
  color?: string;
  onClick?: (row: T) => void;
  disabled?: (row: T) => boolean;
  confirmMessage?: string;
}

/**
 * Tab configuration for tabbed views
 * @interface TabConfig
 * @description Allows switching between different data views using tabs
 * 
 * @property {string} id - Unique identifier for the tab
 * @property {string} label - Tab display label
 * @property {React.ReactNode} [icon] - Tab icon
 * @property {string | number} [badge] - Badge count to display
 * @property {() => Promise<T[]> | T[]} [dataLoader] - Async function to load tab data
 * @property {boolean} [lazy=true] - Whether to load data only when tab is first opened
 * 
 * @example
 * { 
 *   id: 'active', 
 *   label: 'Active Users', 
 *   badge: 42,
 *   dataLoader: () => fetchActiveUsers()
 * }
 */
export interface TabConfig<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  dataLoader?: () => Promise<T[]> | T[];
  lazy?: boolean;
}

/**
 * Pagination configuration
 * @interface PaginationConfig
 * @description Controls table pagination behavior
 * 
 * @property {number} [page=0] - Current page number (0-indexed)
 * @property {number} [rowsPerPage=10] - Number of rows per page
 * @property {number[]} [rowsPerPageOptions=[5, 10, 25, 50, 100]] - Available page size options
 * @property {boolean} [serverSide=false] - Whether pagination is handled server-side
 * @property {(page: number, limit: number) => Promise<{data: T[], total: number}>} [onPageChange] - Server-side pagination handler
 */
export interface PaginationConfig {
  page?: number;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  serverSide?: boolean;
  onPageChange?: (page: number, limit: number) => Promise<{ data: any[]; total: number }>;
}

/**
 * Filter configuration
 * @interface FilterConfig
 * @description Controls search and filtering
 * 
 * @property {boolean} [enabled=true] - Whether filters are shown
 * @property {boolean} [searchEnabled=true] - Whether search input is shown
 * @property {string} [searchPlaceholder='Search...'] - Search input placeholder text
 * @property {(filters: Record<string, any>) => void} [onFilter] - Filter change callback
 */
export interface FilterConfig {
  enabled?: boolean;
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  onFilter?: (filters: Record<string, any>) => void;
}

/**
 * Main DataTable component props
 * @interface DataTableProps
 * @description Complete configuration for the DataTable component
 * 
 * @property {T[]} [data=[]] - Initial data array
 * @property {ColumnConfig<T>[]} columns - Required column definitions
 * @property {ActionConfig<T>[]} [actions=[]] - Row action buttons
 * @property {TabConfig<T>[]} [tabs=[]] - Tab configurations for multi-view
 * @property {PaginationConfig} [pagination] - Pagination settings
 * @property {FilterConfig} [filter] - Filter settings
 * @property {boolean} [loading=false] - Loading state
 * @property {string} [title] - Table title
 * @property {string} [subtitle] - Table subtitle
 * @property {boolean} [showActions=true] - Show action column
 * @property {boolean} [showTabs=false] - Show tab navigation
 * @property {boolean} [showSearch=true] - Show search bar
 * @property {boolean} [showPagination=true] - Show pagination
 * @property {boolean} [showRowNumbers=false] - Show row numbers
 * @property {boolean} [dense=false] - Use dense padding
 * @property {boolean} [striped=false] - Use striped rows
 * @property {boolean} [hoverable=true] - Show hover effect
 * @property {boolean} [selectable=false] - Enable row selection
 * @property {boolean} [expandableRows=false] - Enable row expansion
 * @property {(selected: T[]) => void} [onSelectionChange] - Selection change callback
 * @property {(row: T) => React.ReactNode} [renderExpandedRow] - Expanded row content
 * @property {React.CSSProperties} [sx] - Custom styles
 * @property {(data: T[]) => void} [onExport] - Export callback
 * @property {() => void} [onAdd] - Add button callback
 * @property {() => void} [onRefresh] - Refresh button callback
 * @property {string | null} [error] - Error message to display
 * @property {() => void} [onErrorClose] - Error dismiss callback
 */
export interface DataTableProps<T = any> {
  data?: T[];
  columns: ColumnConfig<T>[];
  actions?: ActionConfig<T>[];
  tabs?: TabConfig<T>[];
  pagination?: PaginationConfig;
  filter?: FilterConfig;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  showActions?: boolean;
  showTabs?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  showRowNumbers?: boolean;
  dense?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  expandableRows?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  sx?: React.CSSProperties;
  onExport?: (data: T[]) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  error?: string | null;
  onErrorClose?: () => void;
}

// ==================== DEFAULT CONFIG ====================

const DEFAULT_PAGINATION: PaginationConfig = {
  page: 0,
  rowsPerPage: 10,
  rowsPerPageOptions: [5, 10, 25, 50, 100],
  serverSide: false,
};

const DEFAULT_FILTER: FilterConfig = {
  enabled: true,
  searchEnabled: true,
  searchPlaceholder: 'Search...',
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Formats a value based on column type
 * @param value - The value to format
 * @param type - The data type
 * @param format - Optional format string
 * @returns Formatted string
 */
function formatValue(value: any, type?: string, format?: string): string {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return new Date(value).toLocaleDateString();
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: format || 'USD',
      }).format(Number(value));
    case 'number':
      return Number(value).toLocaleString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
}

/**
 * Sort data array by field
 * @param data - Data to sort
 * @param field - Field to sort by
 * @param direction - Sort direction
 * @returns Sorted data
 */
function sortData<T>(data: T[], field: string, direction: 'asc' | 'desc'): T[] {
  return [...data].sort((a, b) => {
    const aVal = (a as any)[field];
    const bVal = (b as any)[field];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter data by search term
 * @param data - Data to filter
 * @param searchTerm - Search term
 * @param columns - Column definitions
 * @returns Filtered data
 */
function filterData<T>(data: T[], searchTerm: string, columns: ColumnConfig<T>[]): T[] {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter((row) => {
    return columns.some((col) => {
      if (col.filterable === false) return false;
      const field = col.field || col.id;
      const value = (row as any)[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(term);
    });
  });
}

// ==================== MAIN COMPONENT ====================

/**
 * DataTable - A fully configurable, reusable data table component
 * 
 * Features:
 * - Sorting and filtering
 * - Pagination (client and server-side)
 * - Tabbed views
 * - Row selection
 * - Row expansion
 * - Custom actions
 * - Export to CSV
 * - Loading states
 * - Error handling
 * 
 * @example
 * ```tsx
 * const columns = [
 *   { id: 'name', label: 'Name', sortable: true },
 *   { id: 'email', label: 'Email', type: 'text' },
 *   { id: 'status', label: 'Status', type: 'chip', color: 'success' },
 * ];
 * 
 * <DataTable 
 *   data={users} 
 *   columns={columns}
 *   title="Users"
 *   onAdd={() => {}}
 * />
 * ```
 */
export function DataTable<T extends Record<string, any>>({
  data: initialData = [],
  columns,
  actions = [],
  tabs = [],
  pagination: paginationConfig,
  filter: filterConfig,
  loading = false,
  title,
  subtitle,
  showActions = true,
  showTabs = false,
  showSearch = true,
  showPagination = true,
  showRowNumbers = false,
  dense = false,
  striped = false,
  hoverable = true,
  selectable = false,
  expandableRows = false,
  onSelectionChange,
  renderExpandedRow,
  sx,
  onExport,
  onAdd,
  onRefresh,
  error,
  onErrorClose,
}: DataTableProps<T>) {
  // State
  const [data, setData] = useState<T[]>(initialData);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(paginationConfig?.page || 0);
  const [rowsPerPage, setRowsPerPage] = useState(paginationConfig?.rowsPerPage || 10);
  const [selected, setSelected] = useState<T[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set());
  const [actionAnchor, setActionAnchor] = useState<{ row: T; element: HTMLElement | null } | null>(null);
  const [isLoading, setIsLoading] = useState(loading);
  const [localError, setLocalError] = useState<string | null>(error || null);

  const pagination = { ...DEFAULT_PAGINATION, ...paginationConfig };
  const filter = { ...DEFAULT_FILTER, ...filterConfig };

  // Load tab data when tab changes
  useEffect(() => {
    if (showTabs && tabs.length > 0 && tabs[activeTab]?.dataLoader) {
      const loader = tabs[activeTab].dataLoader;
      if (loader) {
        setIsLoading(true);
        Promise.resolve(loader())
          .then((tabData) => {
            setData(tabData);
            setIsLoading(false);
          })
          .catch((err) => {
            setLocalError(err.message);
            setIsLoading(false);
          });
      }
    }
  }, [activeTab, showTabs, tabs]);

  // Update data when initialData changes
  useEffect(() => {
    if (!showTabs) {
      setData(initialData);
    }
  }, [initialData, showTabs]);

  // Update error state
  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  // Clear error on close
  const handleErrorClose = useCallback(() => {
    setLocalError(null);
    onErrorClose?.();
  }, [onErrorClose]);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];
    
    // Apply search filter
    if (filter.searchEnabled && searchTerm) {
      result = filterData(result, searchTerm, columns);
    }
    
    // Apply sorting
    if (sortField) {
      result = sortData(result, sortField, sortDirection);
    }
    
    return result;
  }, [data, searchTerm, sortField, sortDirection, columns, filter.searchEnabled]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (pagination.serverSide) return processedData;
    const start = page * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, page, rowsPerPage, pagination.serverSide]);

  // Export data handler
  const handleExport = useCallback(() => {
    const exportableColumns = columns.filter((col) => col.exportable !== false);
    const csvContent = [
      exportableColumns.map((col) => col.label).join(','),
      ...processedData.map((row) =>
        exportableColumns
          .map((col) => {
            const field = col.field || col.id;
            const value = (row as any)[field];
            return typeof value === 'string' ? `"${value}"` : value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    onExport?.(processedData);
  }, [processedData, columns, onExport]);

  // Sort handler
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Page change handlers
  const handleChangePage = useCallback((newPage: number) => {
    if (pagination.serverSide && pagination.onPageChange) {
      setIsLoading(true);
      pagination.onPageChange(newPage, rowsPerPage).then((result) => {
        setData(result.data);
        setPage(newPage);
        setIsLoading(false);
      });
    } else {
      setPage(newPage);
    }
  }, [pagination.serverSide, pagination.onPageChange, rowsPerPage]);

  const handleChangeRowsPerPage = useCallback((newLimit: number) => {
    setRowsPerPage(newLimit);
    setPage(0);
  }, []);

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelected(paginatedData);
      onSelectionChange?.(paginatedData);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  }, [paginatedData, onSelectionChange]);

  const handleSelectRow = useCallback((row: T) => {
    setSelected((prev) => {
      const isSelected = prev.some((r) => r === row || JSON.stringify(r) === JSON.stringify(row));
      const newSelected = isSelected
        ? prev.filter((r) => r !== row && JSON.stringify(r) !== JSON.stringify(row))
        : [...prev, row];
      onSelectionChange?.(newSelected);
      return newSelected;
    });
  }, [onSelectionChange]);

  // Row expansion
  const handleExpandRow = useCallback((rowId: any) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  // Action handlers
  const handleActionClick = useCallback((row: T, event: React.MouseEvent<HTMLElement>) => {
    setActionAnchor({ row, element: event.currentTarget });
  }, []);

  const handleActionClose = useCallback(() => {
    setActionAnchor(null);
  }, []);

  const handleActionExecute = useCallback((action: ActionConfig<T>, row: T) => {
    handleActionClose();
    if (action.confirmMessage) {
      if (window.confirm(action.confirmMessage)) {
        action.onClick?.(row);
      }
    } else {
      action.onClick?.(row);
    }
  }, [handleActionClose]);

  // Tab change
  const handleTabChange = useCallback((newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    setSelected([]);
  }, []);

  // Render cell content
  const renderCell = useCallback((column: ColumnConfig<T>, row: T, index: number) => {
    if (column.render) {
      return column.render((row as any)[column.field || column.id], row, index);
    }

    const value = (row as any)[column.field || column.id];

    if (column.type === 'chip') {
      return (
        <Chip
          label={value}
          color={column.color || '#0078d4'}
        />
      );
    }

    if (column.type === 'image') {
      return value ? (
        <img
          src={value}
          alt=""
          style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
        />
      ) : null;
    }

    if (column.type === 'boolean') {
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          color={value ? '#107c10' : '#666'}
        />
      );
    }

    return formatValue(value, column.type, column.format);
  }, []);

  // Get icon for action type
  const getActionIcon = (type: ActionConfig<T>['type']) => {
    switch (type) {
      case 'view': return icons.Visibility;
      case 'edit': return icons.Edit;
      case 'delete': return icons.Delete;
      default: return null;
    }
  };

  // Render loading state
  if (isLoading && data.length === 0) {
    return (
      <Paper style={{ padding: 32, textAlign: 'center' }}>
        <CircularProgress />
        <Typography style={{ marginTop: 16 }}>Loading data...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      style={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 8,
        border: '1px solid #eee',
        ...sx,
      }}
    >
      {/* Header */}
      <Box style={{ padding: 16, borderBottom: '1px solid #eee' }}>
        {/* Title & Subtitle */}
        {title && (
          <Box style={{ marginBottom: 8 }}>
            <Typography variant="h6" weight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="#666">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Tabs */}
        {showTabs && tabs.length > 0 && (
          <Box style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(index)}
                style={{
                  padding: '8px 16px',
                  background: activeTab === index ? '#0078d4' : 'transparent',
                  color: activeTab === index ? 'white' : '#333',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: 'Segoe UI, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {tab.label}
                {tab.badge && <Chip label={String(tab.badge)} color="#0078d4" />}
              </button>
            ))}
          </Box>
        )}

        {/* Toolbar */}
        {filter.enabled && (
          <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            {filter.searchEnabled && (
              <Input
                placeholder={filter.searchPlaceholder}
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                style={{ minWidth: 250 }}
              />
            )}

            <Box style={{ flexGrow: 1 }} />

            {/* Action Buttons */}
            <Box style={{ display: 'flex', gap: 8 }}>
              {onRefresh && (
                <IconButton onClick={onRefresh} size={24}>
                  {icons.Refresh()}
                </IconButton>
              )}
              {onExport && (
                <IconButton onClick={handleExport} size={24}>
                  {icons.Download()}
                </IconButton>
              )}
              {onAdd && (
                <IconButton onClick={onAdd} size={24} color="#0078d4">
                  {icons.Add()}
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {localError && (
        <Alert 
          severity="error"
          style={{ margin: 16 }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {localError}
            <IconButton onClick={handleErrorClose} size={20}>
              {icons.Close()}
            </IconButton>
          </Box>
        </Alert>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <Box style={{ position: 'relative' }}>
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        </Box>
      )}

      {/* Table */}
      <Box style={{ maxHeight: 600, overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Row Numbers */}
              {showRowNumbers && (
                <TableCell style={{ width: 50, fontWeight: 600 }}>#</TableCell>
              )}
              
              {/* Selection Checkbox */}
              {selectable && (
                <TableCell style={{ width: 50 }}>
                  <Checkbox
                    checked={paginatedData.length > 0 && selected.length === paginatedData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}

              {/* Column Headers */}
              {columns
                .filter((col) => !col.hidden)
                .map((column) => (
                  <TableCell
                    key={column.id}
                    style={{
                      minWidth: column.minWidth,
                      width: column.width,
                      fontWeight: 600,
                      textAlign: column.align || 'left',
                    }}
                  >
                    {column.sortable !== false ? (
                      <button
                        onClick={() => handleSort(column.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          fontFamily: 'Segoe UI, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {column.label}
                        {sortField === column.id && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}

              {/* Actions Column */}
              {showActions && actions.length > 0 && (
                <TableCell style={{ width: 100, textAlign: 'right', fontWeight: 600 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (showActions ? 1 : 0) + (showRowNumbers ? 1 : 0) + (selectable ? 1 : 0)} 
                  style={{ textAlign: 'center', padding: 32 }}
                >
                  <Typography color="#666">No data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <React.Fragment key={row.id || rowIndex}>
                  <TableRow
                    onClick={selectable ? () => handleSelectRow(row) : undefined}
                    style={{
                      backgroundColor: striped && rowIndex % 2 === 1 ? '#f9f9f9' : 'transparent',
                      cursor: selectable ? 'pointer' : 'default',
                    }}
                  >
                    {/* Row Numbers */}
                    {showRowNumbers && (
                      <TableCell style={{ width: 50 }}>
                        {page * rowsPerPage + rowIndex + 1}
                      </TableCell>
                    )}

                    {/* Selection Checkbox */}
                    {selectable && (
                      <TableCell style={{ width: 50 }}>
                        <Checkbox
                          checked={selected.some((r) => r === row || JSON.stringify(r) === JSON.stringify(row))}
                          onChange={() => handleSelectRow(row)}
                        />
                      </TableCell>
                    )}

                    {/* Data Cells */}
                    {columns
                      .filter((col) => !col.hidden)
                      .map((column) => (
                        <TableCell
                          key={column.id}
                          style={{
                            textAlign: column.align || 'left',
                            ...column.sx,
                          }}
                        >
                          {renderCell(column, row, rowIndex)}
                        </TableCell>
                      ))}

                    {/* Actions */}
                    {showActions && actions.length > 0 && (
                      <TableCell style={{ textAlign: 'right' }}>
                        <IconButton
                          size={24}
                          onClick={() => handleActionClick(row, {} as React.MouseEvent<HTMLElement>)}
                        >
                          {icons.MoreVert()}
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Expanded Row */}
                  {expandableRows && expandedRows.has(row.id || rowIndex) && renderExpandedRow && (
                    <TableRow>
                      <TableCell 
                        colSpan={columns.length + (showActions ? 1 : 0) + (showRowNumbers ? 1 : 0) + (selectable ? 1 : 0)} 
                        style={{ padding: 0 }}
                      >
                        {renderExpandedRow(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      {showPagination && (
        <Box style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid #eee'
        }}>
          <Typography variant="body2" color="#666">
            Rows per page:
            <select
              value={rowsPerPage}
              onChange={(e) => handleChangeRowsPerPage(Number(e.target.value))}
              style={{
                marginLeft: 8,
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: '0.875rem',
              }}
            >
              {pagination.rowsPerPageOptions?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Typography>
          <Typography variant="body2" color="#666">
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, processedData.length)} of {processedData.length}
          </Typography>
          <Box style={{ display: 'flex', gap: 8 }}>
            <IconButton
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
              size={24}
            >
              {icons.ArrowBack()}
            </IconButton>
            <IconButton
              onClick={() => handleChangePage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= processedData.length}
              size={24}
            >
              {icons.ArrowForward()}
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        open={Boolean(actionAnchor)}
        onClose={handleActionClose}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => actionAnchor && handleActionExecute(action, actionAnchor.row)}
          >
            <span style={{ marginRight: 8 }}>{action.icon || getActionIcon(action.type)?.()}</span>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

export default DataTable;
