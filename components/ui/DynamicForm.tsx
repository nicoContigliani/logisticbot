'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Input from './Input';
import SelectField from './Select';
import Button from './Button';
import { scaleInVariants, staggerContainer } from '@/hooks/useAnimations';

export interface FormFieldConfig {
  name: string;
  label?: string;
  inputType: 'input' | 'select' | 'textarea';
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'file';
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  options?: Array<{ value: string; label: string }>; // For select fields
}

export interface FormConfig {
  fields: FormFieldConfig[];
  submitLabel?: string;
  showSubmitButton?: boolean;
  submitButtonProps?: {
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
  };
}

interface DynamicFormProps {
  formConfig: FormConfig;
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting?: boolean;
  onChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (field: string) => () => void;
  onSubmit: (event: React.FormEvent) => void;
  disabled?: boolean;
}

export function DynamicForm({
  formConfig,
  values,
  errors,
  touched,
  isSubmitting = false,
  onChange,
  onBlur,
  onSubmit,
  disabled = false,
}: DynamicFormProps) {
  const { fields, submitLabel = 'Submit', showSubmitButton = true, submitButtonProps = {} } = formConfig;

  return (
    <form onSubmit={onSubmit}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {fields.map((field, index) => {
            const inputType = field.inputType || 'input';
            
            return (
              <motion.div
                key={field.name}
                variants={scaleInVariants}
                custom={index}
              >
                {inputType === 'select' && field.options ? (
                  <SelectField
                    id={field.name}
                    name={field.name}
                    label={field.label}
                    value={values[field.name] || ''}
                    onChange={(value) => {
                      // Create a synthetic event for consistency
                      const event = {
                        target: { value }
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(field.name)(event);
                    }}
                    onBlur={onBlur(field.name)}
                    error={touched[field.name] ? errors[field.name] : undefined}
                    helperText={field.helperText}
                    options={field.options}
                    required={field.required}
                    fullWidth={field.fullWidth !== false}
                    disabled={field.disabled || disabled}
                  />
                ) : inputType === 'textarea' ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    label={field.label}
                    value={values[field.name] || ''}
                    onChange={onChange(field.name)}
                    onBlur={onBlur(field.name)}
                    error={touched[field.name] ? errors[field.name] : undefined}
                    placeholder={field.placeholder}
                    required={field.required}
                    fullWidth={field.fullWidth !== false}
                    disabled={field.disabled || disabled}
                    autoComplete={field.autoComplete}
                    autoFocus={field.autoFocus}
                    helperText={field.helperText}
                    multiline
                    rows={field.rows || 4}
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    label={field.label}
                    value={values[field.name] || ''}
                    onChange={onChange(field.name)}
                    onBlur={onBlur(field.name)}
                    error={touched[field.name] ? errors[field.name] : undefined}
                    placeholder={field.placeholder}
                    required={field.required}
                    fullWidth={field.fullWidth !== false}
                    disabled={field.disabled || disabled}
                    autoComplete={field.autoComplete}
                    autoFocus={field.autoFocus}
                    helperText={field.helperText}
                    startIcon={field.startIcon}
                    endIcon={field.endIcon}
                    multiline={field.multiline}
                    rows={field.rows}
                  />
                )}
              </motion.div>
            );
          })}

          {showSubmitButton && (
            <motion.div variants={scaleInVariants}>
              <Button
                type="submit"
                variant={submitButtonProps.variant || 'contained'}
                color={submitButtonProps.color || 'primary'}
                size={submitButtonProps.size || 'large'}
                fullWidth={submitButtonProps.fullWidth !== false}
                loading={isSubmitting}
                disabled={isSubmitting || disabled}
              >
                {submitLabel}
              </Button>
            </motion.div>
          )}
        </Box>
      </motion.div>
    </form>
  );
}

// Example usage with JSON config:
// const loginFormConfig: FormConfig = {
//   fields: [
//     { name: 'email', type: 'email', label: 'Email', placeholder: 'Enter your email', required: true, autoComplete: 'email' },
//     { name: 'password', type: 'password', label: 'Password', placeholder: 'Enter your password', required: true, isPassword: true }
//   ],
//   submitLabel: 'Sign In',
//   submitButtonProps: { fullWidth: true, size: 'large' }
// };

DynamicForm.displayName = 'DynamicForm';

export default memo(DynamicForm);
