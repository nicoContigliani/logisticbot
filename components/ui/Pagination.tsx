'use client';

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';

// ============================================
// TYPES
// ============================================

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationProps {
  config: PaginationConfig;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showTotal?: boolean;
  variant?: 'compact' | 'full';
  color?: 'primary' | 'secondary';
  className?: string;
  style?: React.CSSProperties;
}

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  skeletonCount?: number;
  skeletonHeight?: number;
  renderSkeleton?: (index: number) => React.ReactNode;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'multiselect';
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface UniversalFilterProps {
  config: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset?: () => void;
  showReset?: boolean;
  dense?: boolean;
  color?: 'primary' | 'secondary';
  className?: string;
  style?: React.CSSProperties;
}

export interface FilterBarProps<T> {
  filters: FilterConfig[];
  filterValues: Record<string, any>;
  onFilterChange: (values: Record<string, any>) => void;
  onReset: () => void;
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  totalLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================
// UTILITY HOOKS
// ============================================

// Debounce hook for filter input
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized filter function
export function useFilteredList<T>(
  items: T[],
  filters: Record<string, any>,
  searchKeys: string[]
): T[] {
  return useMemo(() => {
    if (!items || items.length === 0) return [];
    if (!filters || Object.keys(filters).length === 0) return items;

    return items.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') return true;

        const itemValue = (item as any)[key];
        
        // Search in multiple keys
        if (searchKeys.includes(key)) {
          const searchStr = String(value).toLowerCase();
          return searchKeys.some((k) => {
            const v = (item as any)[k];
            return v && String(v).toLowerCase().includes(searchStr);
          });
        }

        // Exact match for select
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }

        // Array check (for multiselect)
        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }

        return itemValue === value;
      });
    });
  }, [items, filters, searchKeys]);
}

// Pagination hook
export function usePagination<T>(
  items: T[],
  initialPage: number = 1,
  initialPageSize: number = 10
) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const totalPages = Math.ceil(items.length / pageSize);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    goToPage,
    changePageSize,
    setPage,
  };
}

// ============================================
// SVG ICONS (Inline for performance)
// ============================================

const FirstPageIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
  </svg>
));

const LastPageIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
  </svg>
));

const ChevronLeftIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
));

const ChevronRightIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
));

// ============================================
// PAGINATION COMPONENT
// ============================================

export const Pagination = memo(function Pagination({
  config,
  onChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  showTotal = true,
  variant = 'full',
  color = 'primary',
  className,
  style
}: PaginationProps) {
  const { page, pageSize, total } = config;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onChange(newPage, pageSize);
    }
  }, [totalPages, pageSize, onChange]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    onChange(1, newSize);
  }, [onChange]);

  // Generate page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [page, totalPages]);

  const colorClasses = useMemo(() => ({
    primary: 'pagination-primary',
    secondary: 'pagination-secondary'
  }), []);

  if (variant === 'compact') {
    return (
      <div 
        className={`pagination-compact ${className || ''}`}
        style={style}
      >
        <button
          className="pagination-btn pagination-btn-icon"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>
        <span className="pagination-info">
          {page} / {totalPages}
        </span>
        <button
          className="pagination-btn pagination-btn-icon"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`pagination-full ${colorClasses[color]} ${className || ''}`}
      style={style}
    >
      {/* Total items */}
      {showTotal && (
        <div className="pagination-total">
          Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} de {total}
        </div>
      )}

      <div className="pagination-controls">
        {/* Page size selector */}
        {showPageSize && (
          <div className="pagination-page-size">
            <label htmlFor="page-size-select" className="pagination-label">
              Por página
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="pagination-select"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {/* First/Prev */}
        <button
          className="pagination-btn pagination-btn-icon"
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          aria-label="First page"
        >
          <FirstPageIcon />
        </button>
        <button
          className="pagination-btn pagination-btn-icon"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>

        {/* Page numbers */}
        <div className="pagination-numbers">
          {pageNumbers.map((pageNum, idx) => (
            typeof pageNum === 'number' ? (
              <button
                key={idx}
                className={`pagination-btn pagination-btn-number ${pageNum === page ? 'pagination-btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === page ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ) : (
              <span key={idx} className="pagination-ellipsis">
                {pageNum}
              </span>
            )
          ))}
        </div>

        {/* Next/Last */}
        <button
          className="pagination-btn pagination-btn-icon"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>
        <button
          className="pagination-btn pagination-btn-icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
        >
          <LastPageIcon />
        </button>
      </div>
    </div>
  );
});

// ============================================
// VIRTUAL LIST COMPONENT
// ============================================

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 3,
  className,
  style,
  loading,
  skeletonCount = 5,
  skeletonHeight,
  renderSkeleton
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    
    const handleScroll = () => {
      setScrollTop(node.scrollTop);
    };
    
    node.addEventListener('scroll', handleScroll, { passive: true });
    return () => node.removeEventListener('scroll', handleScroll);
  }, []);

  const totalHeight = items.length * itemHeight;
  const scrollHeight = style?.maxHeight ? Number(style.maxHeight) : 400;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + scrollHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        result.push({ item: items[i], index: i });
      }
    }
    return result;
  }, [items, startIndex, endIndex]);

  if (loading) {
    return (
      <div className={`virtual-list-loading ${className || ''}`} style={style}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          renderSkeleton ? (
            <div key={i} style={{ height: skeletonHeight || itemHeight }}>
              {renderSkeleton(i)}
            </div>
          ) : (
            <div
              key={i}
              className="virtual-list-skeleton"
              style={{ height: skeletonHeight || itemHeight }}
            />
          )
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className || ''}`}
      style={{
        ...style,
        overflow: 'auto',
        position: 'relative',
        height: style?.maxHeight || 400
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            className="virtual-list-item"
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// UNIVERSAL FILTER COMPONENT
// ============================================

export const UniversalFilter = memo(function UniversalFilter({
  config,
  values,
  onChange,
  onReset,
  showReset = true,
  dense = false,
  color = 'primary',
  className,
  style
}: UniversalFilterProps) {
  const handleChange = useCallback((key: string, value: any) => {
    onChange({ ...values, [key]: value });
  }, [values, onChange]);

  const handleReset = useCallback(() => {
    const resetValues: Record<string, any> = {};
    config.forEach((f) => {
      resetValues[f.key] = f.defaultValue || '';
    });
    onChange(resetValues);
    onReset?.();
  }, [config, onChange, onReset]);

  const colorClasses = useMemo(() => ({
    primary: 'filter-primary',
    secondary: 'filter-secondary'
  }), []);

  return (
    <div 
      className={`universal-filter ${colorClasses[color]} ${dense ? 'universal-filter-dense' : ''} ${className || ''}`}
      style={style}
    >
      {config.map((filter) => {
        const value = values[filter.key] ?? filter.defaultValue ?? '';

        if (filter.type === 'select' && filter.options) {
          return (
            <div key={filter.key} className="filter-field">
              <label htmlFor={`filter-${filter.key}`} className="filter-label">
                {filter.label}
              </label>
              <select
                id={`filter-${filter.key}`}
                value={value}
                onChange={(e) => handleChange(filter.key, e.target.value)}
                className="filter-select"
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={filter.key} className="filter-field">
            <label htmlFor={`filter-${filter.key}`} className="filter-label">
              {filter.label}
            </label>
            <input
              id={`filter-${filter.key}`}
              type={filter.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
              className="filter-input"
            />
          </div>
        );
      })}

      {showReset && (
        <button
          className="filter-reset-btn"
          onClick={handleReset}
        >
          Reset
        </button>
      )}
    </div>
  );
});

// ============================================
// FILTER BAR COMPONENT
// ============================================

export function FilterBar<T>({
  filters,
  filterValues,
  onFilterChange,
  onReset,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
  totalLabel = 'items',
  className,
  style
}: FilterBarProps<T>) {
  return (
    <div 
      className={`filter-bar ${className || ''}`}
      style={style}
    >
      <UniversalFilter
        config={filters}
        values={filterValues}
        onChange={onFilterChange}
        onReset={onReset}
      />
      
      <Pagination
        config={pagination}
        onChange={(page, pageSize) => {
          onPageChange(page);
          if (pageSize !== pagination.pageSize) {
            onPageSizeChange(pageSize);
          }
        }}
        pageSizeOptions={pageSizeOptions}
        showPageSize={showPageSize}
        showTotal={true}
      />
    </div>
  );
}
