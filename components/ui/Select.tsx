'use client';

import React, { memo } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  fullWidth?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
}

export function SelectField({
  id,
  name,
  label,
  error,
  helperText,
  options,
  fullWidth = true,
  value,
  onChange,
  onBlur,
  disabled,
  required,
}: CustomSelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2
          border rounded-lg
          bg-white
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export default memo(SelectField);
