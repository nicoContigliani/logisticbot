'use client';

import React from 'react';

export interface MetroTileProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  size?: 'small' | 'medium' | 'large' | 'wide' | 'large-wide';
  color?: string;
  accentColor?: string;
  selected?: boolean;
  notification?: number | string;
  badge?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const TILE_SIZES: Record<string, { width: number; height: number }> = {
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
  className = '',
  children,
}) => {
  const tileSize = TILE_SIZES[size];

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`metro-tile ${selected ? 'metro-tile-selected' : ''} ${onClick ? 'metro-tile-clickable' : ''} ${className}`}
      style={{
        width: tileSize.width,
        height: tileSize.height,
        backgroundColor: color || '#0078d4',
      }}
    >
      {image && (
        <div
          className="metro-tile-bg"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}

      {accentColor && (
        <div className="metro-tile-accent" style={{ backgroundColor: accentColor }} />
      )}

      <div className="metro-tile-content">
        {icon && <div className="metro-tile-icon">{icon}</div>}

        <h6 className={`metro-tile-title ${size === 'small' ? 'text-sm' : 'text-base'}`}>
          {title}
        </h6>

        {subtitle && (
          <p className="metro-tile-subtitle">{subtitle}</p>
        )}

        {description && (
          <p className="metro-tile-description">{description}</p>
        )}

        {children}

        {badge && (
          <span className="metro-tile-badge">{badge}</span>
        )}
      </div>

      {notification !== undefined && (
        <span className="metro-tile-notification">{notification}</span>
      )}
    </div>
  );
};

export interface MetroTileGridProps {
  children: React.ReactNode;
  spacing?: number;
  className?: string;
}

export const MetroTileGrid: React.FC<MetroTileGridProps> = ({
  children,
  spacing = 2,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap ${className}`}
      style={{ gap: spacing * 4 }}
    >
      {children}
    </div>
  );
};

export default MetroTile;
