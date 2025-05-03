/**
 * Global style constants and utilities for consistent styling across the application
 */

/**
 * Breakpoint values for responsive design
 * Represented as strings with pixel units for direct use in CSS
 */
const $breakpoint = {
  xs: '480px',    // Small mobile
  sm: '576px',    // Large mobile
  md: '768px',    // Tablet portrait
  lg: '992px',    // Tablet landscape
  xl: '1200px',   // Laptop/Desktop
  xxl: '1440px',  // Large desktop
};

/**
 * Color palette for the application
 */
const $colors = {
  primary: '#4e7fff',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  black: '#111827',
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

/**
 * Font families for the application
 */
const $fonts = {
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

/**
 * Object mapping from breakpoint names to their pixel values.
 * @typedef {Object} Breakpoint
 * @property {number} XS - Small mobile screens, around 480px.
 * @property {number} SM - Large mobile screens, from 576px.
 * @property {number} MD - Tablet portrait screens, from 768px.
 * @property {number} LG - Tablet landscape screens, from 992px.
 * @property {number} XL - Desktop screens, from 1200px.
 * @property {number} XXL - Large desktop screens, from 1440px.
 */

/** @type {Breakpoint} */
const Breakpoint = Object.fromEntries(
  Object.entries($breakpoint).map(([key, value]) => [key.toUpperCase(), parseInt(value, 10)])
);

/**
 * Media query helpers for styled-components
 * Usage: ${media.md`max-width: 100%;`}
 */
const media = {
  xs: () => `@media (min-width: ${$breakpoint.xs})`,
  sm: () => `@media (min-width: ${$breakpoint.sm})`,
  md: () => `@media (min-width: ${$breakpoint.md})`,
  lg: () => `@media (min-width: ${$breakpoint.lg})`,
  xl: () => `@media (min-width: ${$breakpoint.xl})`,
  xxl: () => `@media (min-width: ${$breakpoint.xxl})`,
};

/**
 * Generates media query for max-width (everything below the breakpoint)
 * Usage: ${belowBreakpoint(Breakpoint.MD)}
 */
const belowBreakpoint = (breakpoint) => `@media (max-width: ${breakpoint - 1}px)`;

/**
 * Generates media query for min-width (everything above the breakpoint)
 * Usage: ${aboveBreakpoint(Breakpoint.MD)}
 */
const aboveBreakpoint = (breakpoint) => `@media (min-width: ${breakpoint}px)`;

export { 
  $breakpoint, 
  $colors, 
  $fonts, 
  Breakpoint, 
  media,
  belowBreakpoint,
  aboveBreakpoint
};