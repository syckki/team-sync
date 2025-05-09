import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

// Styled components for the CustomSelect
export const ComboBoxContainer = styled.div`
  position: relative;
  width: 100%;
  z-index: 10; // Base z-index
  &:focus-within {
    z-index: 9999; // Much higher when focused to ensure active dropdowns appear on top of everything
  }
`;

export const ComboBoxInputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

export const ComboBoxInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  padding-right: 2rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: ${(props) => (props.$hasValue ? "#fff" : "#f8f9fa")};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.disabled ? "hsl(20 5.9% 90%)" : "#4e7fff"};
    background-color: ${(props) => (props.disabled ? "#f8f9fa" : "#fff")};
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #ef4444;
  }
`;

export const ComboBoxDropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 4px 4px;
  background-color: white;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10000; // Extremely high z-index to appear above everything
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: max-content;
  min-width: 100%;
  white-space: nowrap;
  padding-top: 4px; // Add some padding to separate from the input
  margin-top: -1px; // Slightly overlap with input to avoid gap
  overflow-x: visible;
  text-align: left; // Ensure items are left-aligned

  @media (max-width: 1200px) {
    right: 0; // Align with the right edge of the container on mobile
    left: auto; // Override left:0 on mobile
  }
`;

export const ComboBoxOption = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: visible;
  display: block;
  width: 100%;
  text-overflow: ellipsis;
  text-align: left; /* Ensure text is always left-aligned */

  &:hover {
    background-color: #f1f5f9;
  }

  ${(props) =>
    props.$isSelected &&
    `
    background-color: #f8fafc;
    font-weight: 600;
  `}
`;

// Styled component for readonly display
export const ReadonlyField = styled.span`
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

// Custom Select Component for dropdowns
const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  readonly = false,
  autoWrap = false,
}) => {
  if (readonly) {
    return (
      <ReadonlyField $autoWrap={autoWrap} className={!value ? "empty" : ""}>
        {value}
      </ReadonlyField>
    );
  }

  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle option select
  const handleOptionSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  // Handle key presses
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  // Handle clear value
  const handleClearValue = (e) => {
    e.stopPropagation();
    onChange("");
  };

  // Handle blur events on the input
  const handleBlur = (e) => {
    // Don't close if the related target is within the same component
    if (selectRef.current && !selectRef.current.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <ComboBoxContainer ref={selectRef}>
      <ComboBoxInputWrapper onClick={() => !disabled && setIsOpen(!isOpen)}>
        <ComboBoxInput
          type="text"
          value={value}
          readOnly
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          $hasValue={value.length > 0}
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          autoComplete="new-password"
          data-lpignore="true"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          aria-autocomplete="none"
        />
        <div
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            transition: "transform 0.2s",
            transform: isOpen
              ? "translateY(-50%) rotate(180deg)"
              : "translateY(-50%)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </ComboBoxInputWrapper>

      {isOpen && !disabled && (
        <ComboBoxDropdown>
          {options.map((option, index) => (
            <ComboBoxOption
              key={index}
              onMouseDown={() => handleOptionSelect(option)}
              onTouchStart={() => handleOptionSelect(option)}
              $isSelected={option === value}
            >
              {option}
            </ComboBoxOption>
          ))}
        </ComboBoxDropdown>
      )}
    </ComboBoxContainer>
  );
};

export default CustomSelect;
