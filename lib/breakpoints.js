/**
 * Breakpoints utility for consistent responsive design
 * Based on standard device sizes
 */

export const BREAKPOINTS = {
  SMALL_MOBILE: 0,    // Phones in portrait mode
  LARGE_MOBILE: 480,  // Larger smartphones
  TABLET_PORTRAIT: 768, // iPad in portrait orientation
  TABLET_LANDSCAPE: 992, // iPad in landscape or large tablets
  LAPTOP: 1200,       // Desktops and laptops
  LARGE_DESKTOP: 1440 // Large monitors
};

/**
 * Media query helpers for styled-components
 * Usage: ${media.tablet`max-width: 100%;`}
 */
export const media = {
  smallMobile: (...args) => `@media (min-width: ${BREAKPOINTS.SMALL_MOBILE}px)`,
  largeMobile: (...args) => `@media (min-width: ${BREAKPOINTS.LARGE_MOBILE}px)`,
  tabletPortrait: (...args) => `@media (min-width: ${BREAKPOINTS.TABLET_PORTRAIT}px)`,
  tabletLandscape: (...args) => `@media (min-width: ${BREAKPOINTS.TABLET_LANDSCAPE}px)`,
  laptop: (...args) => `@media (min-width: ${BREAKPOINTS.LAPTOP}px)`,
  largeDesktop: (...args) => `@media (min-width: ${BREAKPOINTS.LARGE_DESKTOP}px)`
};

/**
 * Generates media query for max-width (everything below the breakpoint)
 * Usage: ${belowBreakpoint(BREAKPOINTS.TABLET_PORTRAIT)}
 */
export const belowBreakpoint = (breakpoint) => `@media (max-width: ${breakpoint - 1}px)`;

/**
 * Generates media query for min-width (everything above the breakpoint)
 * Usage: ${aboveBreakpoint(BREAKPOINTS.TABLET_PORTRAIT)}
 */
export const aboveBreakpoint = (breakpoint) => `@media (min-width: ${breakpoint}px)`;

/**
 * Generates media query for a range between two breakpoints
 * Usage: ${betweenBreakpoints(BREAKPOINTS.TABLET_PORTRAIT, BREAKPOINTS.LAPTOP)}
 */
export const betweenBreakpoints = (min, max) => 
  `@media (min-width: ${min}px) and (max-width: ${max - 1}px)`;

export default BREAKPOINTS;