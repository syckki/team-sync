import React, { useRef, useEffect } from "react";
import styled from "styled-components";

// Styled component for the textarea
const TextareaBase = styled.textarea`
  width: 100%;
  background-color: ${(props) => (props.$hasValue ? "#fff" : "#f8f9fa")};
  resize: vertical;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  min-height: 2.25rem;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

// Styled component for readonly display
const ReadonlyField = styled.span`
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  background-color: #f9fafb;
  min-height: 2.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #374151;
  white-space: pre-wrap;

  ${(props) =>
    props.$autoWrap &&
    `
    min-height: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  `}

  &.empty {
    font-style: italic;
    color: #9ca3af;
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

// Auto-resizing textarea component with readonly support
const AutoResizeTextArea = ({
  value,
  onChange,
  readonly = false,
  placeholder,
  autoWrap = false,
  ...props
}) => {
  if (readonly) {
    return (
      <ReadonlyField $autoWrap={autoWrap} className={!value ? "empty" : ""}>
        {value}
      </ReadonlyField>
    );
  }

  const textAreaRef = useAutoResizeTextArea(value);

  return (
    <TextareaBase
      ref={textAreaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      $hasValue={value.length > 0}
      {...props}
    />
  );
};

export default AutoResizeTextArea;
export { ReadonlyField };
