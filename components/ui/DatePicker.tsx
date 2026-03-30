'use client';

import { useState, useEffect, memo, forwardRef, useCallback, useMemo, useRef } from 'react';

// Types
export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface DateTimePickerProps extends Omit<DatePickerProps, 'format'> {
  showTime?: boolean;
}

// Utility functions
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

const formatDate = (date: Date, format: string = 'MM/dd/yyyy'): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return format
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('dd', day.toString().padStart(2, '0'))
    .replace('yyyy', year.toString());
};

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const isDateInRange = (date: Date, minDate?: Date, maxDate?: Date): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};

// SVG Icons
const CalendarIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
));

const TimeIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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

// Calendar Day Button Component
const CalendarDay = memo(function CalendarDay({
  day,
  isSelected,
  isToday,
  isDisabled,
  onClick
}: {
  day: number;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`date-picker-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      type="button"
    >
      {day}
    </button>
  );
});

// Time Picker Component
const TimePicker = memo(function TimePicker({
  value,
  onChange
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [hours, setHours] = useState(value.getHours());
  const [minutes, setMinutes] = useState(value.getMinutes());
  const [ampm, setAmpm] = useState(value.getHours() >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    let newHours = hours;
    if (ampm === 'PM' && hours !== 12) newHours = hours + 12;
    if (ampm === 'AM' && hours === 12) newHours = 0;
    
    const newDate = new Date(value);
    newDate.setHours(newHours, minutes);
    onChange(newDate);
  }, [hours, minutes, ampm, value, onChange]);

  const handleHoursChange = useCallback((delta: number) => {
    setHours(prev => {
      let newHours = prev + delta;
      if (newHours > 12) newHours = 1;
      if (newHours < 1) newHours = 12;
      return newHours;
    });
  }, []);

  const handleMinutesChange = useCallback((delta: number) => {
    setMinutes(prev => {
      let newMinutes = prev + delta;
      if (newMinutes > 59) newMinutes = 0;
      if (newMinutes < 0) newMinutes = 59;
      return newMinutes;
    });
  }, []);

  return (
    <div className="time-picker">
      {/* Hours */}
      <div className="time-picker-column">
        <button
          type="button"
          className="time-picker-btn"
          onClick={() => handleHoursChange(1)}
        >
          <ChevronLeftIcon />
        </button>
        <span className="time-picker-value">
          {hours.toString().padStart(2, '0')}
        </span>
        <button
          type="button"
          className="time-picker-btn"
          onClick={() => handleHoursChange(-1)}
        >
          <ChevronRightIcon />
        </button>
      </div>

      <span className="time-picker-separator">:</span>

      {/* Minutes */}
      <div className="time-picker-column">
        <button
          type="button"
          className="time-picker-btn"
          onClick={() => handleMinutesChange(5)}
        >
          <ChevronLeftIcon />
        </button>
        <span className="time-picker-value">
          {minutes.toString().padStart(2, '0')}
        </span>
        <button
          type="button"
          className="time-picker-btn"
          onClick={() => handleMinutesChange(-5)}
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* AM/PM */}
      <div className="time-picker-column">
        <button
          type="button"
          className={`time-picker-ampm-btn ${ampm === 'AM' ? 'active' : ''}`}
          onClick={() => setAmpm('AM')}
        >
          AM
        </button>
        <button
          type="button"
          className={`time-picker-ampm-btn ${ampm === 'PM' ? 'active' : ''}`}
          onClick={() => setAmpm('PM')}
        >
          PM
        </button>
      </div>
    </div>
  );
});

// Date Picker Component
export const DatePicker = memo(forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker({
  value,
  onChange,
  label = 'Select date',
  placeholder = 'MM/dd/yyyy',
  disabled = false,
  error = false,
  helperText,
  minDate,
  maxDate,
  format = 'MM/dd/yyyy',
  fullWidth = false,
  className,
  style
}, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      if (value) {
        setViewDate(value);
      }
    }
  }, [disabled, value]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDateSelect = useCallback((day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (onChange) {
      onChange(newDate);
    }
    handleClose();
  }, [viewDate, onChange, handleClose]);

  const handlePrevMonth = useCallback(() => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }, [viewDate]);

  const handleNextMonth = useCallback(() => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }, [viewDate]);

  const handleClear = useCallback(() => {
    if (onChange) {
      onChange(null);
    }
    handleClose();
  }, [onChange, handleClose]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setViewDate(today);
    if (onChange) {
      onChange(today);
    }
    handleClose();
  }, [onChange, handleClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Generate calendar days
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  
  const days = useMemo(() => {
    const result: (number | null)[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(i);
    }
    
    return result;
  }, [firstDay, daysInMonth]);

  return (
    <div 
      ref={ref}
      className={`date-picker ${fullWidth ? 'date-picker-full' : ''} ${className || ''}`}
      style={style}
    >
      <div 
        ref={containerRef}
        className={`date-picker-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
      >
        <input
          type="text"
          value={value ? formatDate(value, format) : ''}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className="date-picker-input-field"
        />
        <span className="date-picker-icon">
          <CalendarIcon />
        </span>
      </div>
      
      {helperText && (
        <span className={`date-picker-helper ${error ? 'error' : ''}`}>
          {helperText}
        </span>
      )}

      {isOpen && (
        <div 
          ref={popoverRef}
          className="date-picker-popover"
        >
          {/* Header */}
          <div className="date-picker-header">
            <button
              type="button"
              className="date-picker-nav-btn"
              onClick={handlePrevMonth}
            >
              <ChevronLeftIcon />
            </button>
            <span className="date-picker-title">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              className="date-picker-nav-btn"
              onClick={handleNextMonth}
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* Day names */}
          <div className="date-picker-weekdays">
            {DAYS.map(day => (
              <span key={day} className="date-picker-weekday">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar days */}
          <div className="date-picker-days">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="date-picker-day-empty" />;
              }

              const currentDate = new Date(year, month, day);
              const isSelected = value ? isSameDay(value, currentDate) : false;
              const isTodayDate = isSameDay(today, currentDate);
              const isDisabled = !isDateInRange(currentDate, minDate, maxDate);

              return (
                <CalendarDay
                  key={day}
                  day={day}
                  isSelected={isSelected}
                  isToday={isTodayDate}
                  isDisabled={isDisabled}
                  onClick={() => handleDateSelect(day)}
                />
              );
            })}
          </div>

          {/* Actions */}
          <div className="date-picker-actions">
            <button
              type="button"
              className="date-picker-action-btn"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="date-picker-action-btn date-picker-action-btn-primary"
              onClick={handleToday}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}));

// DateTime Picker Component
export const DateTimePicker = memo(forwardRef<HTMLDivElement, DateTimePickerProps>(function DateTimePicker({
  value,
  onChange,
  label = 'Select date and time',
  placeholder = 'MM/dd/yyyy HH:mm',
  disabled = false,
  error = false,
  helperText,
  minDate,
  maxDate,
  showTime = true,
  fullWidth = false,
  className,
  style
}, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      if (value) {
        setViewDate(value);
      }
    }
  }, [disabled, value]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setShowTimePicker(false);
  }, []);

  const handleDateSelect = useCallback((day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (value) {
      newDate.setHours(value.getHours(), value.getMinutes());
    }
    setViewDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
    if (showTime) {
      setShowTimePicker(true);
    } else {
      handleClose();
    }
  }, [viewDate, value, onChange, showTime, handleClose]);

  const handleTimeChange = useCallback((newDate: Date) => {
    setViewDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  }, [onChange]);

  const handlePrevMonth = useCallback(() => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }, [viewDate]);

  const handleNextMonth = useCallback(() => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }, [viewDate]);

  const handleBackToCalendar = useCallback(() => {
    setShowTimePicker(false);
  }, []);

  const handleClear = useCallback(() => {
    if (onChange) {
      onChange(null);
    }
    handleClose();
  }, [onChange, handleClose]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setViewDate(today);
    if (onChange) {
      onChange(today);
    }
    handleClose();
  }, [onChange, handleClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Generate calendar days
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  
  const days = useMemo(() => {
    const result: (number | null)[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(i);
    }
    
    return result;
  }, [firstDay, daysInMonth]);

  return (
    <div 
      ref={ref}
      className={`date-picker ${fullWidth ? 'date-picker-full' : ''} ${className || ''}`}
      style={style}
    >
      <div 
        ref={containerRef}
        className={`date-picker-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
      >
        <input
          type="text"
          value={value ? `${formatDate(value)} ${formatTime(value)}` : ''}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className="date-picker-input-field"
        />
        <span className="date-picker-icon">
          <TimeIcon />
        </span>
      </div>
      
      {helperText && (
        <span className={`date-picker-helper ${error ? 'error' : ''}`}>
          {helperText}
        </span>
      )}

      {isOpen && (
        <div 
          ref={popoverRef}
          className="date-picker-popover"
        >
          {showTimePicker ? (
            // Time Picker View
            <div className="date-picker-time-view">
              <div className="date-picker-header">
                <button
                  type="button"
                  className="date-picker-nav-btn"
                  onClick={handleBackToCalendar}
                >
                  <ChevronLeftIcon />
                </button>
                <span className="date-picker-title">
                  Select Time
                </span>
                <div style={{ width: 60 }} />
              </div>
              <TimePicker value={viewDate} onChange={handleTimeChange} />
            </div>
          ) : (
            // Calendar View
            <>
              {/* Header */}
              <div className="date-picker-header">
                <button
                  type="button"
                  className="date-picker-nav-btn"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeftIcon />
                </button>
                <span className="date-picker-title">
                  {MONTHS[month]} {year}
                </span>
                <button
                  type="button"
                  className="date-picker-nav-btn"
                  onClick={handleNextMonth}
                >
                  <ChevronRightIcon />
                </button>
              </div>

              {/* Day names */}
              <div className="date-picker-weekdays">
                {DAYS.map(day => (
                  <span key={day} className="date-picker-weekday">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar days */}
              <div className="date-picker-days">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="date-picker-day-empty" />;
                  }

                  const currentDate = new Date(year, month, day);
                  const isSelected = value ? isSameDay(value, currentDate) : false;
                  const isTodayDate = isSameDay(today, currentDate);
                  const isDisabled = !isDateInRange(currentDate, minDate, maxDate);

                  return (
                    <CalendarDay
                      key={day}
                      day={day}
                      isSelected={isSelected}
                      isToday={isTodayDate}
                      isDisabled={isDisabled}
                      onClick={() => handleDateSelect(day)}
                    />
                  );
                })}
              </div>

              {/* Actions */}
              <div className="date-picker-actions">
                <button
                  type="button"
                  className="date-picker-action-btn"
                  onClick={handleClear}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="date-picker-action-btn date-picker-action-btn-primary"
                  onClick={handleToday}
                >
                  Today
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}));
