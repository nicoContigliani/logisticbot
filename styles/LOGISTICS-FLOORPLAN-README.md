# Logistics Floorplan CSS - Minimalist Architectural Sketch Style

## Overview

This CSS system provides a complete set of styles for creating minimalist logistics floor plans with an architectural sketch aesthetic. The design follows Gemini's specifications for a sketch-style rendering with precise black ink lines, cold gray markers for shadows, and warm wood/tan tones for accents.

## Design Philosophy

- **Visual Style**: Sketch-style rendering with precise but fluid black ink lines
- **Color Palette**: Cold gray markers for shadows, warm wood/tan tones for accents
- **Typography**: Technical monospace fonts for annotations and labels
- **Texture**: Linen paper background for professional finish
- **Transitions**: Smooth CSS animations for interactive elements

## File Structure

```
styles/
├── logistics-floorplan.css    # Main stylesheet
├── LOGISTICS-FLOORPLAN-README.md  # This file
└── ...

app/
└── logistics-demo/
    └── page.tsx               # Demo page showcasing all components
```

## CSS Variables

### Color Palette

```css
/* Ink & Lines */
--sketch-ink-black: #1a1a1a;
--sketch-ink-dark: #2d2d2d;
--sketch-ink-medium: #4a4a4a;
--sketch-ink-light: #6b6b6b;

/* Cold Gray Markers (Shadows) */
--sketch-gray-100: #f5f5f5;
--sketch-gray-200: #e8e8e8;
--sketch-gray-300: #d4d4d4;
--sketch-gray-400: #a3a3a3;
--sketch-gray-500: #737373;
--sketch-gray-600: #525252;
--sketch-gray-700: #404040;

/* Warm Tones (Wood/Tan Accents) */
--sketch-wood-100: #f5f0e8;
--sketch-wood-200: #e8dcc8;
--sketch-wood-300: #d4c4a8;
--sketch-wood-400: #c4a882;
--sketch-wood-500: #a88b5c;
--sketch-wood-600: #8b7355;
--sketch-wood-700: #6b5a42;

/* Linen Paper Texture */
--sketch-linen-base: #faf8f5;
--sketch-linen-texture: #f5f2ed;
--sketch-linen-shadow: #e8e4dc;
```

### Typography

```css
--font-sketch-primary: 'Courier New', 'Consolas', monospace;
--font-sketch-secondary: 'Lucida Console', 'Monaco', monospace;
--font-sketch-technical: 'AutoCAD', 'ISO 3098', monospace;
```

### Transitions

```css
--transition-sketch-fast: 200ms ease-out;
--transition-sketch-normal: 350ms ease-in-out;
--transition-sketch-slow: 500ms ease-in-out;
--transition-sketch-draw: 800ms cubic-bezier(0.4, 0, 0.2, 1);
```

## Components

### 1. Floorplan Container

The main container with linen paper texture background.

```tsx
<div className="floorplan-container">
  {/* Your floorplan content */}
</div>
```

**Features:**
- Linen paper texture with subtle grid
- Soft shadows and vignette effect
- Responsive padding

### 2. Isometric View

Container for isometric 3D-like view of the floorplan.

```tsx
<div className="isometric-view">
  {/* Isometric elements */}
</div>
```

**Features:**
- CSS 3D transforms for isometric perspective
- Smooth transitions on hover

### 3. Warehouse Building

Main warehouse structure with wood cladding and circular windows.

```tsx
<div className="warehouse sketch-element">
  <div className="wood-cladding" style={{ /* position */ }} />
  <div className="circular-window" style={{ /* position */ }} />
</div>
```

**Features:**
- Wood cladding sections with texture
- Circular windows with reflection effects
- Hover animations

### 4. Loading Dock with Cantilever Roof

Loading dock structure with iconic diagonal supports.

```tsx
<div className="loading-dock sketch-element">
  <div className="diagonal-support" />
  <div className="diagonal-support" />
  <div className="diagonal-support" />
  <div className="diagonal-support" />
  <div className="cantilever-roof" />
</div>
```

**Features:**
- Cantilever roof with perspective transform
- Four diagonal supports with circular joints
- Hover effects on roof and supports

### 5. Trailer Parking Zone

Parking area with wood fence texture.

```tsx
<div className="trailer-parking sketch-element">
  <div className="parking-space" style={{ /* position */ }} />
  <div className="parking-space" style={{ /* position */ }} />
</div>
```

**Features:**
- Wood fence texture background
- Individual parking spaces with dashed borders
- Hover effects on parking spaces

### 6. Roads & Circulation

Road elements for truck circulation.

```tsx
<div className="road sketch-element" />
<div className="road-intersection sketch-element" />
```

**Features:**
- Center line markings
- Edge shadows for depth
- Hover darkening effect

### 7. Classification Areas

Designated zones for sorting operations.

```tsx
<div className="classification-area sketch-element">
  <h4>Zone Title</h4>
  <p>Description</p>
</div>
```

**Features:**
- Dashed inner border
- Hover lift effect

### 8. Legend

Technical legend with color swatches.

```tsx
<div className="floorplan-legend">
  <h3>Distribución de Plano de Sitio</h3>
  <div className="legend-item">
    <div className="legend-swatch" style={{ background: 'var(--sketch-gray-300)' }} />
    <span>Item Label</span>
  </div>
</div>
```

**Features:**
- Technical typography
- Color swatches
- Hover animations

### 9. Dimension Lines

Measurement annotations.

```tsx
<div className="dimension-line" style={{ width: '300px' }}>
  <span className="dimension-label">45.00 m</span>
</div>
```

**Features:**
- End point circles
- Centered labels

### 10. Annotation Callouts

Labels and callouts for elements.

```tsx
<div className="callout">
  ALMACÉN PRINCIPAL
</div>
```

**Features:**
- Triangle pointer
- Hover lift effect

## Animation Classes

### Draw Animation
```tsx
<div className="sketch-animate-draw">
  {/* Element draws in */}
</div>
```

### Fade In Animation
```tsx
<div className="sketch-animate-fade">
  {/* Element fades in */}
</div>
```

### Pulse Animation
```tsx
<div className="sketch-animate-pulse">
  {/* Element pulses continuously */}
</div>
```

### Highlight Animation
```tsx
<div className="sketch-animate-highlight">
  {/* Element highlights once */}
</div>
```

## Interactive States

### Basic Interactive Element
```tsx
<div className="sketch-element">
  {/* Hover and focus states included */}
</div>
```

### Interactive Button
```tsx
<button className="sketch-element sketch-interactive">
  Click Me
</button>
```

## Utility Classes

### Visibility
- `.sketch-hidden` - Hidden with no pointer events
- `.sketch-visible` - Visible with pointer events
- `.sketch-disabled` - Disabled with grayscale filter

### Sizes
- `.sketch-small` - Scaled down (0.8)
- `.sketch-large` - Scaled up (1.2)
- `.sketch-compact` - Reduced padding
- `.sketch-spacious` - Increased padding

## Responsive Design

The system includes breakpoints for:
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

Isometric view scales down on smaller screens.

## Dark Mode Support

Enable dark mode by adding `data-theme="dark"` to the HTML element.

```tsx
<html data-theme="dark">
  {/* Dark mode colors apply automatically */}
</html>
```

## Print Styles

Optimized for printing with:
- White background
- No shadows
- No animations
- Simplified borders

## Usage Example

```tsx
import '@/styles/logistics-floorplan.css';

export default function MyFloorplan() {
  return (
    <div className="floorplan-container">
      <div className="isometric-view">
        {/* Warehouse */}
        <div className="warehouse sketch-element sketch-animate-fade">
          <div className="wood-cladding" style={{ top: '20px', left: '20px', width: '80px', height: '60px' }} />
          <div className="circular-window" style={{ top: '40px', left: '50%', transform: 'translateX(-50%)' }} />
        </div>

        {/* Loading Dock */}
        <div className="loading-dock sketch-element sketch-animate-fade" style={{ animationDelay: '0.2s' }}>
          <div className="diagonal-support" />
          <div className="diagonal-support" />
          <div className="diagonal-support" />
          <div className="diagonal-support" />
          <div className="cantilever-roof" />
        </div>

        {/* Trailer Parking */}
        <div className="trailer-parking sketch-element sketch-animate-fade" style={{ animationDelay: '0.4s' }}>
          <div className="parking-space" style={{ top: '30px', left: '30px' }} />
          <div className="parking-space" style={{ top: '30px', left: '130px' }} />
        </div>

        {/* Roads */}
        <div className="road sketch-element sketch-animate-fade" style={{ animationDelay: '0.6s' }} />

        {/* Legend */}
        <div className="floorplan-legend">
          <h3>Distribución de Plano de Sitio</h3>
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: 'var(--sketch-gray-300)' }} />
            <span>Estructura Principal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Demo Page

Visit `/logistics-demo` to see all components in action with interactive examples.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Part of the LogisticBot project.
