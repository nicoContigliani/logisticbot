'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  startIcon,
  endIcon,
  fullWidth = true,
  multiline = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const inputIcon = icon || startIcon;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {inputIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {inputIcon}
          </div>
        )}
        {multiline ? (
          <textarea
            className={`
              w-full px-4 py-2
              border rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${inputIcon ? 'pl-10' : ''}
              ${endIcon ? 'pr-10' : ''}
              ${error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${className}
            `}
            rows={rows}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            className={`
              w-full px-4 py-2
              border rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${inputIcon ? 'pl-10' : ''}
              ${endIcon ? 'pr-10' : ''}
              ${error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${className}
            `}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {endIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
