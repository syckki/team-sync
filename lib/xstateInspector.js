import { inspect } from '@statelyai/inspect';

// Only enable in development and client-side
export const setupInspector = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Create the inspector
    inspect({
      // Options
      url: 'https://stately.ai/viz?inspect', // Use the Stately Visualizer
      iframe: false // Open in new tab
    });
    
    console.log('XState inspector enabled. Open https://stately.ai/viz?inspect to connect.');
  }
};

export default setupInspector;