import React, { useRef, useEffect } from "react";
import styled from "styled-components";

// Styled component for the textarea
const TextareaBase = styled.textarea`
  width: 100%;
  background-color: #f8f9fa;
  resize: vertical;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

// Custom hook for auto-resizing text areas
const useAutoResizeTextArea = (value) => {
  const textAreaRef = useRef(null);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      // Reset height to auto to get the correct scrollHeight
      textArea.style.height = "auto";
      // Set the height to scrollHeight to fit the content
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  }, [value]);

  return textAreaRef;
};

// Auto-resizing textarea component
const AutoResizeTextArea = ({ value, onChange, ...props }) => {
  const textAreaRef = useAutoResizeTextArea(value);

  return (
    <TextareaBase
      ref={textAreaRef}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default AutoResizeTextArea;