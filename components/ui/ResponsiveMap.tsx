'use client';

import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import dynamic from 'next/dynamic';
import { create } from 'zustand';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);
import { LayersControl } from 'react-leaflet';
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);
const ScaleControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ScaleControl),
  { ssr: false }
);

// ==================== TYPES ====================

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  data?: Record<string, any>;
}

export interface MapCircle {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}

export interface MapPolyline {
  id: string;
  positions: [number, number][];
  color?: string;
  weight?: number;
  opacity?: number;
}

export interface MapPolygon {
  id: string;
  positions: [number, number][];
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}

export interface TileLayerConfig {
  name: string;
  url: string;
  attribution: string;
  checked?: boolean;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  tileLayers?: TileLayerConfig[];
}

export interface ResponsiveMapProps {
  markers?: MapMarker[];
  circles?: MapCircle[];
  polylines?: MapPolyline[];
  polygons?: MapPolygon[];
  config?: MapConfig;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showLayers?: boolean;
  showZoom?: boolean;
  showScale?: boolean;
  showCircles?: boolean;
  showPolylines?: boolean;
  showPolygons?: boolean;
  pageSize?: number;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  title?: string;
  loading?: boolean;
  error?: string | null;
}

// ==================== DEFAULT TILE LAYERS ====================

const DEFAULT_TILE_LAYERS: TileLayerConfig[] = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    checked: true,
  },
  {
    name: 'OpenStreetMap HOT',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
    checked: false,
  },
  {
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, © OpenTopoMap',
    checked: false,
  },
  {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CARTO',
    checked: false,
  },
  {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CARTO',
    checked: false,
  },
];

// ==================== ZUSTAND STORE ====================

interface MapState {
  selectedMarker: MapMarker | null;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  filters: Record<string, any>;
  isMapReady: boolean;
  activeTileLayer: string;
  setSelectedMarker: (marker: MapMarker | null) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  setMapReady: (ready: boolean) => void;
  setActiveTileLayer: (layer: string) => void;
  reset: () => void;
}

const useMapStore = create<MapState>((set) => ({
  selectedMarker: null,
  searchTerm: '',
  currentPage: 1,
  pageSize: 10,
  filters: {},
  isMapReady: false,
  activeTileLayer: 'OpenStreetMap',
  setSelectedMarker: (marker) => set({ selectedMarker: marker }),
  setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  setFilters: (filters) => set({ filters, currentPage: 1 }),
  setMapReady: (ready) => set({ isMapReady: ready }),
  setActiveTileLayer: (layer) => set({ activeTileLayer: layer }),
  reset: () => set({
    selectedMarker: null,
    searchTerm: '',
    currentPage: 1,
    filters: {},
  }),
}));

// ==================== CUSTOM HOOKS ====================

function useFilteredMarkers(markers: MapMarker[], searchTerm: string, filters: Record<string, any>) {
  return useMemo(() => {
    let result = [...markers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((marker) => {
        return (
          marker.title.toLowerCase().includes(term) ||
          marker.description?.toLowerCase().includes(term) ||
          Object.values(marker.data || {}).some((value) =>
            String(value).toLowerCase().includes(term)
          )
        );
      });
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter((marker) => {
          const markerValue = marker.data?.[key];
          if (typeof value === 'string') {
            return String(markerValue).toLowerCase().includes(value.toLowerCase());
          }
          return markerValue === value;
        });
      }
    });

    return result;
  }, [markers, searchTerm, filters]);
}

function usePaginatedData<T>(data: T[], page: number, pageSize: number) {
  return useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);
}

// ==================== SUBCOMPONENTS ====================

const MapErrorBoundary = memo(function MapErrorBoundary({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  if (!error) return null;

  return (
    <div
      style={{
        padding: '24px',
        textAlign: 'center',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error loading map</h3>
      <p style={{ color: '#666', marginBottom: '16px' }}>{error}</p>
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          background: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  );
});

const SearchBar = memo(function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search markers...'}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      />
    </div>
  );
});

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '16px',
      }}
    >
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          background: currentPage === 1 ? '#f2f2f2' : '#0078d4',
          color: currentPage === 1 ? '#999' : 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        First
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          background: currentPage === 1 ? '#f2f2f2' : '#0078d4',
          color: currentPage === 1 ? '#999' : 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        Prev
      </button>
      <span style={{ padding: '8px 12px', color: '#333' }}>
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          background: currentPage === totalPages ? '#f2f2f2' : '#0078d4',
          color: currentPage === totalPages ? '#999' : 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          background: currentPage === totalPages ? '#f2f2f2' : '#0078d4',
          color: currentPage === totalPages ? '#999' : 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Last
      </button>
    </div>
  );
});

const MarkerList = memo(function MarkerList({
  markers,
  selectedMarker,
  onMarkerSelect,
}: {
  markers: MapMarker[];
  selectedMarker: MapMarker | null;
  onMarkerSelect: (marker: MapMarker) => void;
}) {
  return (
    <div
      style={{
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {markers.map((marker) => (
        <div
          key={marker.id}
          onClick={() => onMarkerSelect(marker)}
          style={{
            padding: '12px',
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            background: selectedMarker?.id === marker.id ? '#f0f9ff' : 'white',
            transition: 'background 0.2s',
          }}
        >
          <div style={{ fontWeight: 500, color: '#333' }}>{marker.title}</div>
          {marker.description && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {marker.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

// ==================== MAIN COMPONENT ====================

export const ResponsiveMap = memo(function ResponsiveMap({
  markers = [],
  circles = [],
  polylines = [],
  polygons = [],
  config = {
    center: [0, 0],
    zoom: 2,
    tileLayers: DEFAULT_TILE_LAYERS,
  },
  onMarkerClick,
  onMapClick,
  showSearch = true,
  showFilters = false,
  showPagination = true,
  showLayers = true,
  showZoom = true,
  showScale = true,
  showCircles = true,
  showPolylines = true,
  showPolygons = true,
  pageSize = 10,
  className = '',
  isOpen = true,
  onToggle,
  title = 'Map',
  loading = false,
  error = null,
}: ResponsiveMapProps) {
  const queryClient = useQueryClient();
  const {
    selectedMarker,
    searchTerm,
    currentPage,
    filters,
    isMapReady,
    activeTileLayer,
    setSelectedMarker,
    setSearchTerm,
    setCurrentPage,
    setPageSize,
    setFilters,
    setMapReady,
    setActiveTileLayer,
    reset,
  } = useMapStore();

  // Update page size from props
  useEffect(() => {
    setPageSize(pageSize);
  }, [pageSize, setPageSize]);

  // Filter and paginate markers
  const filteredMarkers = useFilteredMarkers(markers, searchTerm, filters);
  const totalPages = Math.ceil(filteredMarkers.length / pageSize);
  const paginatedMarkers = usePaginatedData(filteredMarkers, currentPage, pageSize);

  // Handle marker selection
  const handleMarkerSelect = useCallback(
    (marker: MapMarker) => {
      setSelectedMarker(marker);
      onMarkerClick?.(marker);
    },
    [setSelectedMarker, onMarkerClick]
  );

  // Handle search
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
    },
    [setSearchTerm]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    reset();
    queryClient.invalidateQueries({ queryKey: ['map-data'] });
  }, [reset, queryClient]);

  // Get tile layers from config or use defaults
  const tileLayers = useMemo(() => {
    return config.tileLayers || DEFAULT_TILE_LAYERS;
  }, [config.tileLayers]);

  // Memoized map content
  const mapContent = useMemo(() => {
    if (loading) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            background: '#f5f5f5',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #0078d4',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: '#666' }}>Loading map...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return <MapErrorBoundary error={error} onRetry={handleRetry} />;
    }

    return (
      <MapContainer
        center={config.center}
        zoom={config.zoom}
        minZoom={config.minZoom}
        maxZoom={config.maxZoom}
        style={{ height: '400px', width: '100%' }}
        whenReady={() => setMapReady(true)}
      >
        {/* Tile Layers */}
        {showLayers ? (
          <LayersControl position="topright">
            {tileLayers.map((layer) => (
              <LayersControl.BaseLayer
                key={layer.name}
                checked={layer.checked}
                name={layer.name}
              >
                <TileLayer
                  url={layer.url}
                  attribution={layer.attribution}
                />
              </LayersControl.BaseLayer>
            ))}
          </LayersControl>
        ) : (
          <TileLayer
            url={tileLayers[0]?.url || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            attribution={tileLayers[0]?.attribution || '© OpenStreetMap contributors'}
          />
        )}

        {/* Zoom Control */}
        {showZoom && <ZoomControl position="topleft" />}

        {/* Scale Control */}
        {showScale && <ScaleControl position="bottomleft" />}

        {/* Markers */}
        {paginatedMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            eventHandlers={{
              click: () => handleMarkerSelect(marker),
            }}
          >
            <Popup>
              <div>
                <h4 style={{ margin: '0 0 8px 0' }}>{marker.title}</h4>
                {marker.description && (
                  <p style={{ margin: 0, color: '#666' }}>{marker.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Circles */}
        {showCircles &&
          circles.map((circle) => (
            <Circle
              key={circle.id}
              center={[circle.lat, circle.lng]}
              radius={circle.radius}
              pathOptions={{
                color: circle.color || '#3388ff',
                fillColor: circle.fillColor || '#3388ff',
                fillOpacity: circle.fillOpacity || 0.2,
              }}
            />
          ))}

        {/* Polylines */}
        {showPolylines &&
          polylines.map((polyline) => (
            <Polyline
              key={polyline.id}
              positions={polyline.positions}
              pathOptions={{
                color: polyline.color || '#3388ff',
                weight: polyline.weight || 3,
                opacity: polyline.opacity || 1.0,
              }}
            />
          ))}

        {/* Polygons */}
        {showPolygons &&
          polygons.map((polygon) => (
            <Polygon
              key={polygon.id}
              positions={polygon.positions}
              pathOptions={{
                color: polygon.color || '#3388ff',
                fillColor: polygon.fillColor || '#3388ff',
                fillOpacity: polygon.fillOpacity || 0.2,
              }}
            />
          ))}
      </MapContainer>
    );
  }, [
    loading,
    error,
    config,
    paginatedMarkers,
    circles,
    polylines,
    polygons,
    handleMarkerSelect,
    handleRetry,
    setMapReady,
    showLayers,
    showZoom,
    showScale,
    showCircles,
    showPolylines,
    showPolygons,
    tileLayers,
  ]);

  return (
    <div
      className={`responsive-map ${className}`}
      style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #eee',
          cursor: onToggle ? 'pointer' : 'default',
        }}
        onClick={onToggle}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>{title}</h3>
        {onToggle && (
          <span
            style={{
              fontSize: '20px',
              transition: 'transform 0.3s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </span>
        )}
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: '16px' }}>
          {/* Search */}
          {showSearch && (
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search markers..."
            />
          )}

          {/* Map */}
          <div style={{ marginBottom: '16px' }}>{mapContent}</div>

          {/* Marker List */}
          {paginatedMarkers.length > 0 && (
            <MarkerList
              markers={paginatedMarkers}
              selectedMarker={selectedMarker}
              onMarkerSelect={handleMarkerSelect}
            />
          )}

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Stats */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#666',
            }}
          >
            Showing {paginatedMarkers.length} of {filteredMarkers.length} markers
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

export default ResponsiveMap;
