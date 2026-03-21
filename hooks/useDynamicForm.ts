'use client';

import { useState, useCallback, useMemo } from 'react';
import { FormFieldConfig, FormConfig } from '@/components/ui/DynamicForm';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: string) => string | undefined;
  email?: boolean;
  match?: string; // Field name to match against (e.g., password confirmation)
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

export interface UseDynamicFormOptions {
  initialValues: Record<string, string>;
  validationSchema: FieldValidation;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
}

export function useDynamicForm({ initialValues, validationSchema, onSubmit }: UseDynamicFormOptions) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: string): string | undefined => {
    const rules = validationSchema[name];
    if (!rules) return undefined;

    if (rules.required && !value.trim()) {
      return 'This field is required';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    }

    if (rules.match) {
      if (value !== values[rules.match]) {
        return 'Fields do not match';
      }
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return undefined;
  }, [validationSchema, values]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema, validateField]);

  const handleChange = useCallback((field: string) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }, [errors]);

  const handleBlur = useCallback((field: string) => 
    () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, values[field] || '');
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }, [values, validateField]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(validationSchema).forEach((fieldName) => {
      allTouched[fieldName] = true;
    });
    setTouched(allTouched);

    if (validateAll()) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validationSchema, validateAll, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateField,
    validateAll,
  };
}

// Example usage:
/*
const loginFormConfig: FormConfig = {
  fields: [
    { 
      name: 'email', 
      type: 'email', 
      label: 'Email', 
      placeholder: 'Enter your email', 
      required: true, 
      autoComplete: 'email' 
    },
    { 
      name: 'password', 
      type: 'password', 
      label: 'Password', 
      placeholder: 'Enter your password', 
      required: true 
    }
  ],
  submitLabel: 'Sign In',
  submitButtonProps: { fullWidth: true, size: 'large' }
};

const loginValidationSchema: FieldValidation = {
  email: { required: true, email: true },
  password: { required: true, minLength: 8 }
};

function LoginPage() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useDynamicForm({
    initialValues: { email: '', password: '' },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      console.log('Login:', values);
    }
  });

  return (
    <DynamicForm
      formConfig={loginFormConfig}
      values={values}
      errors={errors}
      touched={touched}
      isSubmitting={isSubmitting}
      onChange={handleChange}
      onBlur={handleBlur}
      onSubmit={handleSubmit}
    />
  );
}
*/

export default useDynamicForm;
