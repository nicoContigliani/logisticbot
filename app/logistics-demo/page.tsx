'use client';

import React from 'react';

export default function LogisticsDemoPage() {
  return (
    <div className="floorplan-container">
      {/* Page Title */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          fontFamily: 'var(--font-sketch-primary)',
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--sketch-ink-black)',
          marginBottom: '0.5rem'
        }}>
          Distribución de Plano de Sitio
        </h1>
        <p style={{
          fontFamily: 'var(--font-sketch-secondary)',
          fontSize: '0.8rem',
          color: 'var(--sketch-ink-medium)',
          letterSpacing: '0.05em'
        }}>
          Planta Logística - Vista Isométrica
        </p>
      </header>

      {/* Isometric View Container */}
      <div className="isometric-view">
        {/* Warehouse Building */}
        <div className="warehouse sketch-element sketch-animate-fade">
          {/* Wood Cladding Sections */}
          <div className="wood-cladding" style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '80px',
            height: '60px'
          }} />
          <div className="wood-cladding" style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '80px',
            height: '60px'
          }} />
          
          {/* Circular Windows */}
          <div className="circular-window" style={{
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)'
          }} />
          <div className="circular-window" style={{
            top: '100px',
            left: '30px'
          }} />
          <div className="circular-window" style={{
            top: '100px',
            right: '30px'
          }} />
          
          {/* Warehouse Label */}
          <div className="callout" style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            ALMACÉN PRINCIPAL
          </div>
        </div>

        {/* Loading Dock with Cantilever Roof */}
        <div className="loading-dock sketch-element sketch-animate-fade" style={{ animationDelay: '0.2s' }}>
          {/* Diagonal Supports */}
          <div className="diagonal-support" />
          <div className="diagonal-support" />
          <div className="diagonal-support" />
          <div className="diagonal-support" />
          
          {/* Cantilever Roof */}
          <div className="cantilever-roof" />
          
          {/* Dock Label */}
          <div className="callout" style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            MUELLE DE CARGA Y DESCARGA
          </div>
        </div>

        {/* Trailer Parking Zone */}
        <div className="trailer-parking sketch-element sketch-animate-fade" style={{ animationDelay: '0.4s' }}>
          {/* Parking Spaces */}
          <div className="parking-space" style={{ top: '30px', left: '30px' }} />
          <div className="parking-space" style={{ top: '30px', left: '130px' }} />
          <div className="parking-space" style={{ top: '30px', left: '230px' }} />
          <div className="parking-space" style={{ top: '90px', left: '30px' }} />
          <div className="parking-space" style={{ top: '90px', left: '130px' }} />
          <div className="parking-space" style={{ top: '90px', left: '230px' }} />
          <div className="parking-space" style={{ top: '150px', left: '30px' }} />
          <div className="parking-space" style={{ top: '150px', left: '130px' }} />
          <div className="parking-space" style={{ top: '150px', left: '230px' }} />
          
          {/* Parking Label */}
          <div className="callout" style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            ESTACIONAMIENTO DE REMOLQUES
          </div>
        </div>

        {/* Roads */}
        <div style={{ marginTop: '40px' }}>
          <div className="road sketch-element sketch-animate-fade" style={{ 
            animationDelay: '0.6s',
            width: '400px'
          }} />
          
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <div className="road sketch-element sketch-animate-fade" style={{ 
              animationDelay: '0.7s',
              width: '180px'
            }} />
            <div className="road-intersection sketch-element sketch-animate-fade" style={{ animationDelay: '0.8s' }} />
            <div className="road sketch-element sketch-animate-fade" style={{ 
              animationDelay: '0.9s',
              width: '180px'
            }} />
          </div>
          
          {/* Road Labels */}
          <div className="callout" style={{
            position: 'absolute',
            top: '50%',
            left: '-120px',
            transform: 'translateY(-50%)'
          }}>
            VÍA PRINCIPAL
          </div>
        </div>

        {/* Classification Areas */}
        <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
          <div className="classification-area sketch-element sketch-animate-fade" style={{ 
            animationDelay: '1s',
            flex: 1
          }}>
            <h4 style={{
              fontFamily: 'var(--font-sketch-primary)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              color: 'var(--sketch-ink-black)'
            }}>
              ZONA DE CLASIFICACIÓN A
            </h4>
            <p style={{
              fontFamily: 'var(--font-sketch-secondary)',
              fontSize: '0.65rem',
              color: 'var(--sketch-ink-medium)'
            }}>
              Entrada de mercancías
            </p>
          </div>
          
          <div className="classification-area sketch-element sketch-animate-fade" style={{ 
            animationDelay: '1.1s',
            flex: 1
          }}>
            <h4 style={{
              fontFamily: 'var(--font-sketch-primary)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              color: 'var(--sketch-ink-black)'
            }}>
              ZONA DE CLASIFICACIÓN B
            </h4>
            <p style={{
              fontFamily: 'var(--font-sketch-secondary)',
              fontSize: '0.65rem',
              color: 'var(--sketch-ink-medium)'
            }}>
              Salida de mercancías
            </p>
          </div>
        </div>
      </div>

      {/* Dimension Lines Example */}
      <div style={{ 
        marginTop: '3rem',
        padding: '1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="dimension-line" style={{ width: '300px', margin: '0 auto' }}>
          <span className="dimension-label">45.00 m</span>
        </div>
      </div>

      {/* Legend */}
      <div className="floorplan-legend">
        <h3>Distribución de Plano de Sitio</h3>
        
        <div className="legend-item">
          <div className="legend-swatch" style={{ background: 'var(--sketch-gray-300)' }} />
          <span>Estructura Principal</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-swatch" style={{ background: 'var(--sketch-wood-300)' }} />
          <span>Revestimiento de Madera</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-swatch" style={{ background: 'var(--sketch-gray-400)' }} />
          <span>Áreas de Circulación</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-swatch" style={{ 
            background: 'var(--sketch-linen-texture)',
            border: '1px dashed var(--sketch-ink-medium)'
          }} />
          <span>Zonas de Clasificación</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-swatch" style={{ 
            background: 'var(--sketch-wood-200)',
            border: '1px solid var(--sketch-ink-black)'
          }} />
          <span>Estacionamiento</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-swatch" style={{ 
            background: 'var(--sketch-gray-200)',
            borderRadius: '50%'
          }} />
          <span>Ventanas Circulares</span>
        </div>
      </div>

      {/* Interactive Elements Demo */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{
          fontFamily: 'var(--font-sketch-primary)',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--sketch-ink-black)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Elementos Interactivos
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="sketch-element sketch-interactive" style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--sketch-linen-base)',
            border: '2px solid var(--sketch-ink-black)',
            fontFamily: 'var(--font-sketch-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}>
            Ver Detalles
          </button>
          
          <button className="sketch-element sketch-interactive" style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--sketch-wood-300)',
            border: '2px solid var(--sketch-ink-black)',
            fontFamily: 'var(--font-sketch-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}>
            Exportar Plano
          </button>
          
          <button className="sketch-element sketch-interactive" style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--sketch-gray-300)',
            border: '2px solid var(--sketch-ink-black)',
            fontFamily: 'var(--font-sketch-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}>
            Imprimir
          </button>
        </div>
      </div>

      {/* Animation Examples */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{
          fontFamily: 'var(--font-sketch-primary)',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--sketch-ink-black)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Efectos de Transición CSS
        </h2>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className="sketch-element sketch-animate-pulse" style={{
            width: '100px',
            height: '100px',
            background: 'var(--sketch-wood-300)',
            border: '2px solid var(--sketch-ink-black)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-sketch-secondary)',
            fontSize: '0.65rem',
            textAlign: 'center',
            padding: '0.5rem'
          }}>
            Pulse Animation
          </div>
          
          <div className="sketch-element sketch-animate-highlight" style={{
            width: '100px',
            height: '100px',
            background: 'var(--sketch-gray-300)',
            border: '2px solid var(--sketch-ink-black)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-sketch-secondary)',
            fontSize: '0.65rem',
            textAlign: 'center',
            padding: '0.5rem'
          }}>
            Highlight Effect
          </div>
          
          <div className="sketch-element" style={{
            width: '100px',
            height: '100px',
            background: 'var(--sketch-linen-texture)',
            border: '2px solid var(--sketch-ink-black)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-sketch-secondary)',
            fontSize: '0.65rem',
            textAlign: 'center',
            padding: '0.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            Hover Effect
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--sketch-gray-300)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{
          fontFamily: 'var(--font-sketch-secondary)',
          fontSize: '0.7rem',
          color: 'var(--sketch-ink-medium)',
          letterSpacing: '0.05em'
        }}>
          Diseño Minimalista - Estilo Boceto Arquitectónico
        </p>
        <p style={{
          fontFamily: 'var(--font-sketch-primary)',
          fontSize: '0.65rem',
          color: 'var(--sketch-ink-light)',
          marginTop: '0.5rem'
        }}>
          LogisticBot © 2024
        </p>
      </footer>
    </div>
  );
}
