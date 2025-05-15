import React from 'react';
import FloatingActionButton from './FloatingActionButton';

/**
 * XState Inspector Button component
 * Provides a floating action button that opens the XState inspector in an iframe
 * 
 * @returns {React.ReactElement}
 */
const XStateInspectorButton = () => {
  return (
    <FloatingActionButton
      iframeSrc="https://stately.ai/viz?inspect"
      buttonIcon="⚙️"
      openInNewIcon="↗️"
      closeIcon="✖"
      ariaLabel="Toggle XState inspector"
    />
  );
};

export default XStateInspectorButton;