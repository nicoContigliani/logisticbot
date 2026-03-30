'use client';

import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

export interface MetroTileProps {
  // Content
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  
  // Size variants (Windows 8 tile sizes)
  size?: 'small' | 'medium' | 'large' | 'wide' | 'large-wide';
  
  // Color
  color?: string;
  accentColor?: string;
  
  // State
  selected?: boolean;
  notification?: number | string;
  badge?: string;
  
  // Interactions
  onClick?: () => void;
  onDoubleClick?: () => void;
  
  // Style
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

// Size configurations for Metro tiles
const TILE_SIZES = {
  small: { width: 140, height: 140 },
  medium: { width: 300, height: 150 },
  large: { width: 300, height: 310 },
  wide: { width: 460, height: 150 },
  'large-wide': { width: 460, height: 310 },
};

export const MetroTile: React.FC<MetroTileProps> = ({
  title,
  subtitle,
  description,
  icon,
  image,
  size = 'medium',
  color,
  accentColor,
  selected,
  notification,
  badge,
  onClick,
  onDoubleClick,
  sx,
  children,
}) => {
  const tileSize = TILE_SIZES[size];
  
  return (
    <Box
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: tileSize.width,
        height: tileSize.height,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: color || '#0078d4',
        color: '#ffffff',
        transition: 'all 0.2s ease',
        border: selected ? '3px solid #1a90e8' : 'none',
        '&:hover': onClick ? {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        } : {},
        ...sx,
      }}
    >
      {/* Background Image */}
      {image && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.8,
          }}
        />
      )}
      
      {/* Accent stripe at top */}
      {accentColor && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: accentColor,
          }}
        />
      )}
      
      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 2,
        }}
      >
        {/* Icon */}
        {icon && (
          <Box sx={{ fontSize: 40, mb: 1 }}>
            {icon}
          </Box>
        )}
        
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: size === 'small' ? '1rem' : '1.25rem',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </Typography>
        
        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontSize: '0.85rem',
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
        
        {/* Description */}
        {description && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
              mt: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>
        )}
        
        {/* Children (custom content) */}
        {children}
        
        {/* Badge */}
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        )}
      </Box>
      
      {/* Notification Badge */}
      {notification !== undefined && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#d32f2f',
            color: 'white',
            minWidth: 22,
            height: 22,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            px: 0.5,
          }}
        >
          {notification}
        </Box>
      )}
    </Box>
  );
};

// ============================================
// Metro Tile Grid - Container for multiple tiles
// ============================================

export interface MetroTileGridProps {
  children: React.ReactNode;
  spacing?: number;
  columns?: number;
  sx?: SxProps<Theme>;
}

export const MetroTileGrid: React.FC<MetroTileGridProps> = ({
  children,
  spacing = 2,
  columns,
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default MetroTile;