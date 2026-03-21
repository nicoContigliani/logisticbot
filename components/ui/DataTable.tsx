'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

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
  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
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

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
  }, []);

  // Selection handlers
  const handleSelectAll = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
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
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
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
          size="small"
          sx={{
            backgroundColor: column.color || 'primary.main',
            color: 'white',
          }}
        />
      );
    }

    if (column.type === 'image') {
      return value ? (
        <Box
          component="img"
          src={value}
          alt=""
          sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
        />
      ) : null;
    }

    if (column.type === 'boolean') {
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          size="small"
          color={value ? 'success' : 'default'}
        />
      );
    }

    return formatValue(value, column.type, column.format);
  }, []);

  // Get icon for action type
  const getActionIcon = (type: ActionConfig<T>['type']) => {
    switch (type) {
      case 'view': return <VisibilityIcon fontSize="small" />;
      case 'edit': return <EditIcon fontSize="small" />;
      case 'delete': return <DeleteIcon fontSize="small" />;
      default: return null;
    }
  };

  // Render loading state
  if (isLoading && data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading data...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {/* Title & Subtitle */}
        {title && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="h6" component="h2" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Tabs */}
        {showTabs && tabs.length > 0 && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 2, minHeight: 40 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    {tab.badge && <Chip label={tab.badge} size="small" color="primary" />}
                  </Box>
                }
                sx={{ minHeight: 40 }}
              />
            ))}
          </Tabs>
        )}

        {/* Toolbar */}
        {filter.enabled && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            {filter.searchEnabled && (
              <TextField
                size="small"
                placeholder={filter.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton onClick={onRefresh} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onExport && (
                <Tooltip title="Export CSV">
                  <IconButton onClick={handleExport} size="small">
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onAdd && (
                <Tooltip title="Add New">
                  <IconButton onClick={onAdd} size="small" color="primary">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {localError && (
        <Alert 
          severity="error" 
          action={
            <IconButton size="small" onClick={handleErrorClose}>
              <CloseIcon />
            </IconButton>
          }
        >
          {localError}
        </Alert>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255,255,255,0.7)',
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
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {/* Row Numbers */}
              {showRowNumbers && (
                <TableCell sx={{ width: 50, bgcolor: 'background.paper' }}>#</TableCell>
              )}
              
              {/* Selection Checkbox */}
              {selectable && (
                <TableCell padding="checkbox" sx={{ bgcolor: 'background.paper' }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < paginatedData.length}
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
                    align={column.align || 'left'}
                    sx={{
                      minWidth: column.minWidth,
                      width: column.width,
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                    }}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={sortField === column.id}
                        direction={sortField === column.id ? sortDirection : 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}

              {/* Actions Column */}
              {showActions && actions.length > 0 && (
                <TableCell align="right" sx={{ width: 100, bgcolor: 'background.paper' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0) + (showRowNumbers ? 1 : 0)} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <React.Fragment key={row.id || rowIndex}>
                  <TableRow
                    hover={hoverable}
                    selected={selected.some((r) => r === row || JSON.stringify(r) === JSON.stringify(row))}
                    sx={{
                      '&:nth-of-type(odd)': striped ? { bgcolor: 'action.hover' } : {},
                      cursor: selectable ? 'pointer' : 'default',
                    }}
                    onClick={selectable ? () => handleSelectRow(row) : undefined}
                  >
                    {/* Row Numbers */}
                    {showRowNumbers && (
                      <TableCell sx={{ width: 50 }}>
                        {page * rowsPerPage + rowIndex + 1}
                      </TableCell>
                    )}

                    {/* Selection Checkbox */}
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.some((r) => r === row || JSON.stringify(r) === JSON.stringify(row))}
                          onChange={() => handleSelectRow(row)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}

                    {/* Data Cells */}
                    {columns
                      .filter((col) => !col.hidden)
                      .map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                          sx={column.sx}
                        >
                          {renderCell(column, row, rowIndex)}
                        </TableCell>
                      ))}

                    {/* Actions */}
                    {showActions && actions.length > 0 && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(row, e);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Expanded Row */}
                  {expandableRows && expandedRows.has(row.id || rowIndex) && renderExpandedRow && (
                    <TableRow>
                      <TableCell colSpan={columns.length + (showActions ? 1 : 0) + (showRowNumbers ? 1 : 0)} sx={{ py: 0 }}>
                        {renderExpandedRow(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={pagination.rowsPerPageOptions}
          component="div"
          count={pagination.serverSide ? -1 : processedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={actionAnchor?.element}
        open={Boolean(actionAnchor)}
        onClose={handleActionClose}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.id}
            onClick={() => actionAnchor && handleActionExecute(action, actionAnchor.row)}
            disabled={action.disabled?.(actionAnchor?.row as T)}
          >
            <ListItemIcon>
              {action.icon || getActionIcon(action.type)}
            </ListItemIcon>
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

// Need to import Checkbox
import Checkbox from '@mui/material/Checkbox';

export default DataTable;
