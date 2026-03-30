# Plan de Migración: De MUI a Componentes Personalizados Estilo Metro UI

## Objetivo
Migrar toda la interfaz de Material UI a componentes personalizados construidos con CSS moderno (sin librerías adicionales como framer-motion para animaciones), manteniendo el estilo Windows 8/Metro UI y optimizando para máxima performance y responsividad.

---

## 📊 Análisis de Componentes MUI Actuales

### Componentes Más Usados en el Proyecto
| Componente | Frecuencia | Prioridad |
|------------|-----------|-----------|
| Box | ~50+ | 🔴 Alta |
| Typography | ~40+ | 🔴 Alta |
| Button | ~30+ | 🔴 Alta |
| Card | ~25+ | 🔴 Alta |
| Grid/Flex | ~20+ | 🔴 Alta |
| TextField | ~15+ | 🔴 Alta |
| Paper | ~12+ | 🟠 Media |
| Dialog | ~8+ | 🟠 Media |
| Tabs | ~6+ | 🟠 Media |
| Chip | ~10+ | 🟡 Baja |
| LinearProgress | ~5+ | 🟡 Baja |
| Drawer/AppBar | ~4+ | 🟡 Baja |
| Select | ~8+ | 🟡 Baja |
| List | ~6+ | 🟡 Baja |
| Alert | ~4+ | 🟡 Baja |
| Avatar | ~5+ | 🟡 Baja |

---

## 🏗️ Arquitectura Propuesta

### Estructura de Componentes
```
components/
├── ui/
│   ├── base/           // Componentes base atómicos
│   │   ├── Button.tsx
│   │   ├── Typography.tsx
│   │   ├── Box.tsx
│   │   ├── Container.tsx
│   │   └── Card.tsx
│   ├── forms/          // Componentes de formularios
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Radio.tsx
│   │   ├── Switch.tsx
│   │   └── Slider.tsx
│   ├── layout/         // Componentes de layout
│   │   ├── Grid.tsx
│   │   ├── Flex.tsx
│   │   ├── Drawer.tsx
│   │   ├── AppBar.tsx
│   │   └── Dialog.tsx
│   ├── navigation/     // Navegación
│   │   ├── Tabs.tsx
│   │   ├── Menu.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── Pagination.tsx
│   ├── feedback/       // Feedback al usuario
│   │   ├── Alert.tsx
│   │   ├── Loading.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── data/           // Datos
│   │   ├── Table.tsx
│   │   ├── List.tsx
│   │   └── Accordion.tsx
│   └── metro/          // Específicos Metro UI
│       ├── MetroTile.tsx
│       ├── MetroTileGrid.tsx
│       ├── MetroButton.tsx
│       └── MetroNav.tsx
├── hooks/
│   ├── useAnimation.ts      // Animaciones CSS
│   ├── useMediaQuery.ts     // Responsive
│   ├── useReducedMotion.ts  // Accesibilidad
│   └── useAnimationFrame.ts // Performance
└── styles/
    ├── tokens.css          // Variables CSS
    ├── reset.css           // Reset básico
    ├── animations.css       // Animaciones
    └── utilities.css       // Utilidades
```

---

## ⚡ Estrategia de Performance

### 1. CSS Variables ( tokens.css )
```css
:root {
  /* Colores Metro */
  --color-primary: #0078d4;
  --color-secondary: #e3008c;
  --color-success: #107c10;
  --color-warning: #d83b01;
  --color-error: #d32f2f;
  
  /* Espaciado */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;
  
  /* Tipografía */
  --font-family: 'Segoe UI', system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
  --transition-slow: 0.4s ease;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.12);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.16);
}
```

### 2. Animaciones CSS (animations.css)
```css
/* Transiciones equivalentes a framer-motion */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Clases utilitarias */
.animate-fadeIn { animation: fadeIn 0.25s ease forwards; }
.animate-slideUp { animation: slideUp 0.3s ease forwards; }
.animate-scaleIn { animation: scaleIn 0.2s ease forwards; }
.animate-pulse { animation: pulse 2s infinite; }
```

### 3. Componentes con SSR Friendly
- No usar `window` en componentes
- Usar CSS modules o classes condicionales
- Lazy loading de iconos

---

## 📋 Fases de Implementación

### Fase 1: Base System (Semana 1)
- [ ] Crear estructura de carpetas
- [ ] Implementar CSS tokens y reset
- [ ] Crear Box, Container, Flex (reemplazan Box/Grid MUI)
- [ ] Crear Typography (reemplaza Text MUI)

### Fase 2: Components Core (Semana 2)
- [ ] Button (todos los variants)
- [ ] Card y Paper
- [ ] Input y TextField
- [ ] Animaciones CSS

### Fase 3: Forms (Semana 3)
- [ ] Select
- [ ] Checkbox y Radio
- [ ] Switch
- [ ] Form controls

### Fase 4: Layout (Semana 4)
- [ ] Drawer
- [ ] Dialog/Modal
- [ ] AppBar
- [ ] Grid responsivo

### Fase 5: Navigation (Semana 5)
- [ ] Tabs
- [ ] Menu
- [ ] Pagination
- [ ] Breadcrumbs

### Fase 6: Feedback & Data (Semana 6)
- [ ] Alert
- [ ] Loading/Skeleton
- [ ] Table
- [ ] List

### Fase 7: Metro UI (Semana 7)
- [ ] MetroTile
- [ ] MetroTileGrid
- [ ] MetroNav

### Fase 8: Testing & Optimization (Semana 8)
- [ ] Testing de componentes
- [ ] Optimización de bundle
- [ ] Verificar que nada se rompa
- [ ] Performance测试

---

## 🎯 Componentes Reutilizables a Crear

### Base Components
1. **Box** - Contenedor flexible
2. **Container** - Contenedor con max-width
3. **Flex** - Flexbox utilitario
4. **Grid** - CSS Grid utilitario
5. **Typography** - Textos (h1-h6, body, caption)
6. **Divider** - Línea separadora

### Interactive Components
7. **Button** - Primary, Secondary, Outlined, Text, Icon
8. **Link** - Links estilizados
9. **IconButton** - Botones de icono

### Form Components
10. **Input** - Input de texto
11. **Textarea** - Textarea
12. **Select** - Select personalizado
13. **Checkbox** - Checkbox
14. **Radio** - Radio button
15. **Switch** - Toggle
16. **Slider** - Slider

### Layout Components
17. **Card** - Tarjeta
18. **Paper** - Fondo con sombra
19. **Dialog** - Modal
20. **Drawer** - Sidebar
21. **AppBar** - Header
22. **Overlay** - Backdrop

### Navigation
23. **Tabs** - Tabs horizontales
24. **Menu** - Menú dropdown
25. **NavLink** - Link activo
26. **Pagination** - Paginación
27. **Breadcrumbs** - Migas de pan

### Feedback
28. **Alert** - Alertas
29. **Badge** - Notificaciones
30. **Loading** - Spinner/Skeleton
31. **Progress** - Barra de progreso

### Data Display
32. **Table** - Tabla
33. **List** - Lista
34. **Accordion** - Acordeón
35. **Avatar** - Avatar

### Metro UI
36. **MetroTile** - Tile Windows 8
37. **MetroTileGrid** - Grid de tiles
38. **MetroButton** - Botón Metro

---

## 🔧 Hooks Personalizados

```typescript
// useAnimation - Alternativa a framer-motion
import { useState, useEffect, useCallback } from 'react';

interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: string;
}

export function useAnimation(props: AnimationProps = {}) {
  const { duration = 300, delay = 0, easing = 'ease' } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const styles = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : 'translateY(20px)',
    transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
  };

  const onAnimationEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  return { styles, isVisible, isAnimating, onAnimationEnd };
}

// useMediaQuery - Responsive
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}

// useReducedMotion - Accesibilidad
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, []);
  
  return prefersReduced;
}
```

---

## ✅ Checklist de Migración

### Antes de Empezar
- [ ] Backup del proyecto
- [ ] Identificar todos los usos de MUI
- [ ] Crear mapeo de componentes

### Durante la Migración
- [ ] Mantener nombres de clases coherentes
- [ ] Props compatibles con MUI donde sea posible
- [ ] Testing de cada componente
- [ ] Documentar cambios

### Después de Migrar
- [ ] Verificar que todas las páginas funcionen
- [ ] Medir performance (Lighthouse)
- [ ] Testing responsive
- [ ] Verificar que animaciones funcionen
- [ ] Eliminar dependencias MUI no usadas

---

## 🎨 Tokens de Diseño Metro

```css
/* Colores Primarios */
--metro-blue: #0078d4;
--metro-blue-light: #1a90e8;
--metro-blue-dark: #005a9e;

/* Colores de Acento */
--metro-magenta: #e3008c;
--metro-purple: #5c2d91;
--metro-green: #107c10;
--metro-orange: #d83b01;
--metro-teal: #00827a;
--metro-red: #d32f2f;
--metro-yellow: #ffb900;

/* Escala de Grises */
--metro-dark: #000000;
--metro-dark-gray: #333333;
--metro-gray: #666666;
--metro-light-gray: #999999;
--metro-lighter-gray: #cccccc;
--metro-lightest-gray: #f2f2f2;
--metro-white: #ffffff;

/*Fondos*/
--metro-background: #f5f5f5;
--metro-background-dark: #1f1f1f;

/* Estados */
--metro-state-hover: rgba(0, 120, 212, 0.08);
--metro-state-active: rgba(0, 120, 212, 0.12);
--metro-state-focus: rgba(0, 120, 212, 0.2);
```

---

## 📈 Métricas de Éxito

- [ ] Bundle size reducido > 50%
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Performance > 90
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Todos los tests pasando

---

## ⚠️ Consideraciones Importantes

1. **Compatibilidad**: Mantener API de componentes similar a MUI para facilitar migración
2. **Accesibilidad**: Implementar ARIA labels, focus states, keyboard navigation
3. **Responsive**: Mobile-first, breakpoints coherentes
4. **Theme**: Soporte para light/dark mode con CSS variables
5. **Performance**: Evitar re-renders不必要的, usar CSS en lugar de JS para animaciones
6. **Testing**: Cada componente debe tener tests básicos