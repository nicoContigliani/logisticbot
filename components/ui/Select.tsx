'use client';

import React, { memo } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectProps } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

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
  ...props
}: CustomSelectProps) {
  const handleChange = (event: any) => {
    if (onChange) {
      onChange(event.target.value as string);
    }
  };

  return (
    <FormControl fullWidth={fullWidth} error={!!error}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={value || ''}
        label={label}
        onChange={handleChange}
        sx={{
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
            },
          },
        }}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

export default memo(SelectField);
