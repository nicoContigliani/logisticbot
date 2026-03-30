// ============================================
// Animation Hooks - CSS-based alternatives to framer-motion
// Optimized for performance and accessibility
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// useAnimation - Basic animation state management
// ============================================

interface UseAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  trigger?: boolean;
}

interface UseAnimationReturn {
  isVisible: boolean;
  isAnimating: boolean;
  styles: React.CSSProperties;
  ref: React.RefObject<HTMLDivElement | null>;
  play: () => void;
  reset: () => void;
}

export function useAnimation(options: UseAnimationOptions = {}): UseAnimationReturn {
  const { duration = 300, delay = 0, easing = 'ease', trigger = true } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [trigger, delay]);

  const handleAnimationEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const play = useCallback(() => {
    setIsVisible(false);
    setIsAnimating(true);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 10);
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setIsAnimating(false);
  }, []);

  const styles: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : 'translateY(10px)',
    transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
  };

  return {
    isVisible,
    isAnimating,
    styles,
    ref,
    play,
    reset,
  };
}

// ============================================
// useAnimatePresence - For conditional animations
// ============================================

interface UseAnimatePresenceOptions {
  duration?: number;
}

interface UseAnimatePresenceReturn {
  isMounted: boolean;
  styles: React.CSSProperties;
  handleExit: () => void;
}

export function useAnimatePresence(options: UseAnimatePresenceOptions = {}): UseAnimatePresenceReturn {
  const { duration = 200 } = options;
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleExit = useCallback(() => {
    setIsExiting(true);
    timeoutRef.current = setTimeout(() => {
      setIsMounted(false);
      setIsExiting(false);
    }, duration);
  }, [duration]);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMounted]);

  const styles: React.CSSProperties = isExiting
    ? {
        opacity: 0,
        transform: 'translateY(-10px)',
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
      }
    : {
        opacity: 1,
        transform: 'none',
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
      };

  return {
    isMounted,
    styles,
    handleExit,
  };
}

// ============================================
// useMediaQuery - Responsive breakpoints
// ============================================

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS: Record<Breakpoint, string> = {
  xs: '(min-width: 0px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(BREAKPOINTS[breakpoint]);
}

// ============================================
// useReducedMotion - Accessibility
// ============================================

export function useReducedMotion(): boolean {
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

// ============================================
// useParallax - Simple parallax effect
// ============================================

interface UseParallaxOptions {
  speed?: number;
  direction?: 'x' | 'y';
}

export function useParallax(options: UseParallaxOptions = {}): { x: number; y: number } {
  const { speed = 1, direction = 'y' } = options;
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      if (direction === 'y') {
        setOffset({ x: 0, y: scrollY * speed * 0.1 });
      } else {
        setOffset({ x: scrollX * speed * 0.1, y: 0 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return offset;
}

// ============================================
// useHover - Detect hover state
// ============================================

export function useHover(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}

// ============================================
// useFocusVisible - Focus state detection
// ============================================

export function useFocusVisible(): boolean {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isFocused;
}

// ============================================
// useIntersectionObserver - For lazy loading / animations on scroll
// ============================================

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const refElement = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = refElement.current;
    if (!element || (triggerOnce && hasTriggeredRef.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            hasTriggeredRef.current = true;
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [refElement, isVisible];
}

// ============================================
// useKeyPress - Keyboard shortcuts
// ============================================

interface UseKeyPressOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function useKeyPress(
  key: string,
  callback: () => void,
  options: UseKeyPressOptions = {}
): void {
  const { ctrl = false, shift = false, alt = false, meta = false } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrl ? event.ctrlKey || event.metaKey : true;
      const matchesShift = shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = alt ? event.altKey : !event.altKey;
      const matchesMeta = meta ? event.metaKey : true;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrl, shift, alt, meta]);
}

// ============================================
// useLocalStorage - Persist state
// ============================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ============================================
// useClickOutside - Detect clicks outside element
// ============================================

export function useClickOutside(
  callback: () => void
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

// ============================================
// useWindowSize - Responsive hook
// ============================================

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}