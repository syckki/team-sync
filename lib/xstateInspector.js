import { createBrowserInspector } from 'xstate/browser';

// Only enable in development and client-side
export const setupInspector = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Create the inspector
    createBrowserInspector();
    
    console.log('XState inspector enabled. Open https://stately.ai/viz to connect.');
  }
};

export default setupInspector;