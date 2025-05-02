import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { 
  ComboBoxContainer, 
  ComboBoxInputWrapper, 
  ComboBoxInput, 
  ClearButton, 
  ComboBoxDropdown, 
  ComboBoxOption,
  ReadonlyField
} from "./CustomSelect";

// Styled component specific to CreatableComboBox
const ComboBoxCreateOption = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  border-top: 1px dashed #e2e8f0;
  color: #4e7fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: visible;

  &:hover {
    background-color: #f1f5f9;
  }
`;

// CreatableComboBox component for single-select fields with option to create new items
const CreatableComboBox = ({
  value,
  onChange,
  options = [],
  placeholder,
  storageKey,
  disabled = false,
  readonly = false,
  ...otherProps
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  
  // If in readonly mode, render a simple display
  if (readonly) {
    return (
      <ReadonlyField className={!value ? 'empty' : ''}>
        {value || placeholder}
      </ReadonlyField>
    );
  }

  // Update filtered options when input changes
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle option select
  const handleOptionSelect = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  // Handle create option
  const handleCreateOption = () => {
    onChange(inputValue);
    setIsOpen(false);

    // Add to local storage if it's a new option
    if (!options.includes(inputValue) && inputValue.trim() !== "") {
      const updatedOptions = [...options, inputValue];
      const key = storageKey || "teamMemberOptions";
      localStorage.setItem(key, JSON.stringify(updatedOptions));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen) {
        handleCreateOption();
      }
    } else if (e.key === "ArrowDown") {
      if (!isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  // Handle clear value
  const handleClearValue = (e) => {
    e.stopPropagation();
    setInputValue("");
    onChange("");
  };

  return (
    <ComboBoxContainer ref={inputRef}>
      <ComboBoxInputWrapper>
        <ComboBoxInput
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          $hasValue={inputValue.length > 0}
          {...otherProps}
        />
        {inputValue.length > 0 && !disabled && (
          <ClearButton onClick={handleClearValue} type="button" title="Clear">
            ×
          </ClearButton>
        )}
      </ComboBoxInputWrapper>

      {isOpen && !disabled && (
        <ComboBoxDropdown>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <ComboBoxOption
                key={index}
                onClick={() => handleOptionSelect(option)}
                $isSelected={option === inputValue}
              >
                {option}
              </ComboBoxOption>
            ))
          ) : (
            <ComboBoxCreateOption onClick={handleCreateOption}>
              Create "{inputValue}"
            </ComboBoxCreateOption>
          )}

          {filteredOptions.length > 0 &&
            !filteredOptions.includes(inputValue) &&
            inputValue.trim() !== "" && (
              <ComboBoxCreateOption onClick={handleCreateOption}>
                Create "{inputValue}"
              </ComboBoxCreateOption>
            )}
        </ComboBoxDropdown>
      )}
    </ComboBoxContainer>
  );
};

export default CreatableComboBox;
export { ComboBoxCreateOption };