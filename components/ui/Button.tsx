'use client';

import { ButtonHTMLAttributes, forwardRef, memo } from 'react';
import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import MuiButton from '@mui/material/Button';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  as?: 'button' | 'a';
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'contained',
      color = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      disabled,
      startIcon,
      endIcon,
      children,
      as,
      href,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
        style={{ display: 'inline-block', width: fullWidth ? '100%' : 'auto' }}
      >
        <MuiButton
          ref={ref}
          variant={variant}
          color={color}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled || loading}
          startIcon={loading ? undefined : startIcon}
          endIcon={loading ? undefined : endIcon}
          component={as === 'a' ? 'a' : 'button'}
          href={href}
          {...props}
        >
          {loading && (
            <CircularProgress
              size={size === 'small' ? 18 : size === 'large' ? 28 : 24}
              sx={{
                position: 'absolute',
                color: 'inherit',
              }}
            />
          )}
          <span style={{ visibility: loading ? 'hidden' : 'visible' }}>{children}</span>
        </MuiButton>
      </motion.div>
    );
  }
);

Button.displayName = 'Button';

export default memo(Button);
