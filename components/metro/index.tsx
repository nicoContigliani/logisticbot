// ============================================
// Metro UI Components - All-in-One
// Custom components without MUI
// Windows 8 / Metro UI Style
// ============================================

import React, { CSSProperties, ReactNode, useState, useRef, useEffect } from 'react';

// ============================================
// BASE COMPONENTS
// ============================================

// Box - Generic container
interface BoxProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  [key: string]: any;
}

export function Box({ children, className = '', style, onClick, ...props }: BoxProps) {
  return (
    <div className={`box ${className}`} style={style} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

// Container - Centered max-width container
interface ContainerProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxWidth?: string;
}

export function Container({ children, className = '', style, maxWidth = '1024px' }: ContainerProps) {
  return (
    <div className={`container ${className}`} style={{ width: '100%', maxWidth, margin: '0 auto', padding: '0 16px', ...style }}>
      {children}
    </div>
  );
}

// Flex - Flexbox container
interface FlexProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  direction?: 'row' | 'column';
  align?: string;
  justify?: string;
  gap?: number;
  wrap?: boolean;
}

export function Flex({ children, className = '', style, direction = 'row', align = 'stretch', justify = 'flex-start', gap, wrap = false }: FlexProps) {
  return (
    <div className={`flex ${className}`} style={{ display: 'flex', flexDirection: direction, alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : 'nowrap', gap: gap ? `${gap}px` : undefined, ...style }}>
      {children}
    </div>
  );
}

// Grid - CSS Grid container
interface GridProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  columns?: number;
  gap?: number;
}

export function Grid({ children, className = '', style, columns = 12, gap = 16 }: GridProps) {
  return (
    <div className={`grid ${className}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px`, ...style }}>
      {children}
    </div>
  );
}

// ============================================
// TYPOGRAPHY
// ============================================

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'small';

interface TypographyProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: number;
  gutterBottom?: boolean;
}

const TYPOGRAPHY_STYLES: Record<Variant, CSSProperties> = {
  h1: { fontSize: '2.25rem', fontWeight: 300, letterSpacing: '-0.02em' },
  h2: { fontSize: '1.875rem', fontWeight: 300, letterSpacing: '-0.02em' },
  h3: { fontSize: '1.5rem', fontWeight: 400 },
  h4: { fontSize: '1.25rem', fontWeight: 400 },
  h5: { fontSize: '1.125rem', fontWeight: 500 },
  h6: { fontSize: '1rem', fontWeight: 600 },
  body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', color: '#666' },
  small: { fontSize: '0.75rem' },
};

export function Typography({ children, className = '', style, variant = 'body1', color, align = 'left', weight, gutterBottom = false }: TypographyProps) {
  const isHeading = variant.startsWith('h');
  const typographyStyle = { ...TYPOGRAPHY_STYLES[variant], color, textAlign: align, fontWeight: weight, marginBottom: gutterBottom ? '16px' : 0 };
  
  if (isHeading) {
    const HeadingTag = variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return <HeadingTag className={`typography ${className}`} style={typographyStyle}>{children}</HeadingTag>;
  }
  return <p className={`typography ${className}`} style={typographyStyle}>{children}</p>;
}

// ============================================
// BUTTONS
// ============================================

type ButtonVariant = 'contained' | 'outlined' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ children, className = '', style, variant = 'contained', size = 'medium', color = '#0078d4', disabled = false, fullWidth = false, onClick, type = 'button' }: ButtonProps) {
  const baseStyles: CSSProperties = {
    fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: variant === 'outlined' ? `2px solid ${color}` : 'none',
    borderRadius: 0,
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
  };

  const sizeStyles: Record<ButtonSize, CSSProperties> = {
    small: { padding: '8px 16px', fontSize: '0.8125rem', minHeight: '32px' },
    medium: { padding: '10px 24px', fontSize: '0.875rem', minHeight: '40px' },
    large: { padding: '12px 32px', fontSize: '0.9375rem', minHeight: '48px' },
  };

  const variantStyles: Record<ButtonVariant, CSSProperties> = {
    contained: { backgroundColor: color, color: '#fff' },
    outlined: { backgroundColor: 'transparent', color },
    text: { backgroundColor: 'transparent', color },
  };

  return (
    <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant], ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// IconButton
interface IconButtonProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  color?: string;
  size?: number;
  disabled?: boolean;
  onClick?: () => void;
}

export function IconButton({ children, className = '', style, color = '#333', size = 24, disabled = false, onClick }: IconButtonProps) {
  return (
    <button className={`icon-btn ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: `${size + 16}px`, height: `${size + 16}px`, cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: 'transparent', border: 'none', opacity: disabled ? 0.6 : 1, transition: 'all 0.15s ease', ...style }} onClick={(e) => onClick?.()} disabled={disabled}>
      <span style={{ fontSize: size, color }}>{children}</span>
    </button>
  );
}

// ============================================
// FORM COMPONENTS
// ============================================

// Input
interface InputProps {
  className?: string;
  style?: CSSProperties;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: boolean;
}

export function Input({ className = '', style, type = 'text', placeholder, value, onChange, disabled = false, fullWidth = false, error = false }: InputProps) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled} className={`input ${className}`} style={{ width: fullWidth ? '100%' : 'auto', padding: '10px 12px', fontSize: '0.9375rem', fontFamily: 'Segoe UI, sans-serif', border: error ? '2px solid #d32f2f' : '1px solid #ccc', borderRadius: 0, backgroundColor: '#fff', transition: 'all 0.15s ease', ...style }} />
  );
}

// TextField (alias for Input)
export const TextField = Input;

// Select
interface SelectProps {
  className?: string;
  style?: CSSProperties;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Select({ className = '', style, value, onChange, disabled = false, fullWidth = false, children }: SelectProps) {
  return (
    <select value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled} className={`select ${className}`} style={{ width: fullWidth ? '100%' : 'auto', padding: '10px 12px', fontSize: '0.9375rem', fontFamily: 'Segoe UI, sans-serif', border: '1px solid #ccc', borderRadius: 0, backgroundColor: '#fff', cursor: 'pointer', ...style }}>
      {children}
    </select>
  );
}

// Checkbox
interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Checkbox({ checked = false, onChange, disabled = false, label }: CheckboxProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)} disabled={disabled} style={{ width: '18px', height: '18px', accentColor: '#0078d4' }} />
      {label && <span style={{ fontSize: '0.875rem' }}>{label}</span>}
    </label>
  );
}

// ============================================
// LAYOUT COMPONENTS
// ============================================

// Card
interface CardProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  elevation?: number;
  onClick?: () => void;
}

export function Card({ children, className = '', style, elevation = 1, onClick }: CardProps) {
  const shadows = ['', '0 2px 8px rgba(0,0,0,0.12)', '0 4px 16px rgba(0,0,0,0.16)', '0 8px 32px rgba(0,0,0,0.2)'];
  return (
    <div className={`card ${className}`} style={{ backgroundColor: '#fff', boxShadow: shadows[elevation] || shadows[1], transition: 'all 0.2s ease', cursor: onClick ? 'pointer' : 'default', ...style }} onClick={onClick}>
      {children}
    </div>
  );
}

// Paper (same as Card)
export const Paper = Card;

// Divider
interface DividerProps {
  className?: string;
  light?: boolean;
}

export function Divider({ className = '', light = false }: DividerProps) {
  return <div className={`divider ${className}`} style={{ height: '1px', backgroundColor: light ? '#eee' : '#ccc', margin: '16px 0' }} />;
}

// Spacer
interface SpacerProps {
  height?: number;
  width?: number;
}

export function Spacer({ height = 16, width }: SpacerProps) {
  return <div style={{ height, width }} />;
}

// ============================================
// DIALOG / MODAL
// ============================================

interface DialogProps {
  open?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  title?: string;
}

export function Dialog({ open = false, onClose, children, title }: DialogProps) {
  if (!open) return null;
  
  return (
    <div className="dialog-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', minWidth: '300px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        {title && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{title}</Typography>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#666' }}>✕</button>
          </div>
        )}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ============================================
// NAVIGATION
// ============================================

// Tabs
interface TabsProps {
  value?: number;
  onChange?: (value: number) => void;
  children?: ReactNode;
  className?: string;
}

export function Tabs({ value = 0, onChange, children, className = '' }: TabsProps) {
  return (
    <div className={`tabs ${className}`} style={{ borderBottom: '1px solid #ccc' }}>
      {children}
    </div>
  );
}

interface TabProps {
  label: string;
  value?: number;
  disabled?: boolean;
}

export function Tab({ label, value = 0, disabled = false }: TabProps) {
  // This is simplified - in real app would connect to parent
  return (
    <button style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: '3px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.875rem', color: disabled ? '#999' : '#333', fontFamily: 'Segoe UI, sans-serif' }}>
      {label}
    </button>
  );
}

// Menu
interface MenuProps {
  open?: boolean;
  anchorEl?: any;
  onClose?: () => void;
  children?: ReactNode;
}

export function Menu({ open = false, children }: MenuProps) {
  if (!open) return null;
  return (
    <div className="menu" style={{ position: 'absolute', backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', borderRadius: 0, minWidth: '150px', zIndex: 1000 }}>
      {children}
    </div>
  );
}

interface MenuItemProps {
  children?: ReactNode;
  onClick?: () => void;
}

export function MenuItem({ children, onClick }: MenuItemProps) {
  return (
    <button onClick={onClick} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Segoe UI, sans-serif', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,120,212,0.08)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
      {children}
    </button>
  );
}

// ============================================
// FEEDBACK
// ============================================

// Alert
type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  severity?: AlertSeverity;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ALERT_COLORS: Record<AlertSeverity, string> = {
  success: '#107c10',
  error: '#d32f2f',
  warning: '#d83b01',
  info: '#0078d4',
};

export function Alert({ severity = 'info', children, className = '', style }: AlertProps) {
  return (
    <div className={`alert alert-${severity} ${className}`} style={{ padding: '12px 16px', backgroundColor: `${ALERT_COLORS[severity]}15`, borderLeft: `4px solid ${ALERT_COLORS[severity]}`, color: ALERT_COLORS[severity], ...style }}>
      {children}
    </div>
  );
}

// Chip
interface ChipProps {
  label: string;
  color?: string;
  onDelete?: () => void;
}

export function Chip({ label, color = '#0078d4', onDelete }: ChipProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: `${color}15`, color, fontSize: '0.75rem', fontWeight: 500 }}>
      {label}
      {onDelete && <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem' }}>×</button>}
    </span>
  );
}

// Badge
interface BadgeProps {
  count?: number;
  color?: string;
  children?: ReactNode;
}

export function Badge({ count, color = '#d32f2f', children }: BadgeProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {count !== undefined && count > 0 && (
        <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: color, color: '#fff', fontSize: '0.625rem', fontWeight: 600, minWidth: '18px', height: '18px', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
}

// CircularProgress
interface CircularProgressProps {
  value?: number;
  size?: number;
  color?: string;
}

export function CircularProgress({ value = 0, size = 40, color = '#0078d4' }: CircularProgressProps) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eee" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="butt" />
    </svg>
  );
}

// LinearProgress
interface LinearProgressProps {
  value?: number;
  color?: string;
}

export function LinearProgress({ value = 0, color = '#0078d4' }: LinearProgressProps) {
  return (
    <div style={{ width: '100%', height: '4px', backgroundColor: '#eee' }}>
      <div style={{ width: `${value}%`, height: '100%', backgroundColor: color, transition: 'width 0.3s ease' }} />
    </div>
  );
}

// Skeleton (loading placeholder)
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 20, className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={{ width, height, backgroundColor: '#eee', animation: 'shimmer 1.5s infinite', backgroundImage: 'linear-gradient(90deg, #eee 0%, #f5f5f5 50%, #eee 100%)' }} />;
}

// ============================================
// DATA DISPLAY
// ============================================

// Table
interface TableProps {
  children?: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <table className={`table ${className}`} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      {children}
    </table>
  );
}

export function TableHead({ children }: { children?: ReactNode }) {
  return <thead style={{ backgroundColor: '#f2f2f2' }}>{children}</thead>;
}

export function TableBody({ children }: { children?: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, onClick, style }: { children?: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return <tr onClick={onClick} style={{ borderBottom: '1px solid #eee', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s ease', ...style }}>{children}</tr>;
}

export function TableCell({ children, style, colSpan }: { children?: ReactNode; style?: CSSProperties; colSpan?: number }) {
  return <td colSpan={colSpan} style={{ padding: '12px', ...style }}>{children}</td>;
}

// List
interface ListProps {
  children?: ReactNode;
  className?: string;
}

export function List({ children, className = '' }: ListProps) {
  return <div className={`list ${className}`}>{children}</div>;
}

interface ListItemProps {
  children?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}

export function ListItem({ children, onClick, selected = false }: ListItemProps) {
  return (
    <div onClick={onClick} style={{ padding: '12px 16px', cursor: onClick ? 'pointer' : 'default', backgroundColor: selected ? 'rgba(0,120,212,0.12)' : 'transparent', borderLeft: selected ? '3px solid #0078d4' : '3px solid transparent', transition: 'all 0.15s ease' }}>
      {children}
    </div>
  );
}

// Avatar
interface AvatarProps {
  children?: ReactNode;
  src?: string;
  alt?: string;
  size?: number;
}

export function Avatar({ children, src, alt, size = 40 }: AvatarProps) {
  if (src) {
    return <img src={src} alt={alt || ''} style={{ width: size, height: size, borderRadius: 0, objectFit: 'cover' }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 0, backgroundColor: '#0078d4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: size * 0.4 }}>
      {children}
    </div>
  );
}

// ============================================
// UTILITY COMPONENTS
// ============================================

// Backdrop (loading overlay)
interface BackdropProps {
  open?: boolean;
}

export function Backdrop({ open = false }: BackdropProps) {
  if (!open) return null;
  return <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} />;
}

// Fade (simple fade animation)
interface FadeProps {
  in?: boolean;
  children?: ReactNode;
}

export function Fade({ in: inProp = true, children }: FadeProps) {
  return <div style={{ opacity: inProp ? 1 : 0, transition: 'opacity 0.2s ease' }}>{children}</div>;
}

// ============================================
// EXPORTS - Already done via inline export above
// ============================================

// Default export
const MetroComponents = {
  Box, Container, Flex, Grid,
  Typography,
  Button, IconButton,
  Input, TextField, Select, Checkbox,
  Card, Paper, Divider, Spacer,
  Dialog,
  Tabs, Tab, Menu, MenuItem,
  Alert, Chip, Badge, CircularProgress, LinearProgress, Skeleton,
  Table, TableHead, TableBody, TableRow, TableCell, List, ListItem, Avatar,
  Backdrop, Fade,
};

export default MetroComponents;