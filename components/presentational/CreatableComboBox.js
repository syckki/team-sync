import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  ComboBoxContainer,
  ComboBoxInputWrapper,
  ComboBoxInput,
  ClearButton,
  ComboBoxDropdown,
  ComboBoxOption,
  ReadonlyField,
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
  text-align: left; /* Ensure text is always left-aligned */
  width: 100%;
  display: block;

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
  autoWrap = false,
}) => {
  if (readonly) {
    return (
      <ReadonlyField $autoWrap={autoWrap} className={!value ? "empty" : ""}>
        {value}
      </ReadonlyField>
    );
  }

  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [originalValue, setOriginalValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
    setOriginalValue(value); // Store the original value for the Edit option
  }, [value]);

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
  
  // Handle edit option - replaces the original value with the new one in localStorage
  const handleEditOption = () => {
    // Update in localStorage - replace the original value with the new one
    if (originalValue && originalValue !== inputValue && originalValue.trim() !== "" && inputValue.trim() !== "") {
      const updatedOptions = options.map(opt => opt === originalValue ? inputValue : opt);
      if (!updatedOptions.includes(inputValue)) {
        updatedOptions.push(inputValue);
      }
      const key = storageKey || "teamMemberOptions";
      localStorage.setItem(key, JSON.stringify(updatedOptions));
    }
    
    onChange(inputValue);
    setIsOpen(false);
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
        // If original value exists and it's different from input, use edit function
        if (originalValue && 
            originalValue !== inputValue && 
            originalValue.trim() !== "" && 
            inputValue.trim() !== "" && 
            options.includes(originalValue)) {
          handleEditOption();
        } else {
          handleCreateOption();
        }
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

  // Handle blur events on the input
  const handleBlur = (e) => {
    // Don't close if the related target is within the same component
    if (inputRef.current && !inputRef.current.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
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
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="new-password"
          data-lpignore="true"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          aria-autocomplete="none"
          disabled={disabled}
          $hasValue={inputValue.length > 0}
        />
        {inputValue.length > 0 && !disabled && (
          <ClearButton
            onMouseDown={handleClearValue}
            onTouchStart={handleClearValue}
            type="button"
            title="Clear"
          >
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
                onMouseDown={() => handleOptionSelect(option)}
                onTouchStart={() => handleOptionSelect(option)}
                $isSelected={option === inputValue}
              >
                {option}
              </ComboBoxOption>
            ))
          ) : (
            <ComboBoxCreateOption
              onMouseDown={handleCreateOption}
              onTouchStart={handleCreateOption}
            >
              Create "{inputValue}"
            </ComboBoxCreateOption>
          )}

          {filteredOptions.length > 0 &&
            !filteredOptions.includes(inputValue) &&
            inputValue.trim() !== "" && (
              <ComboBoxCreateOption
                onMouseDown={handleCreateOption}
                onTouchStart={handleCreateOption}
              >
                Create "{inputValue}"
              </ComboBoxCreateOption>
            )}
            
          {/* Show Edit option when user has modified an existing value */}
          {originalValue && 
           originalValue !== inputValue && 
           originalValue.trim() !== "" && 
           inputValue.trim() !== "" && 
           options.includes(originalValue) && (
            <ComboBoxCreateOption
              onMouseDown={handleEditOption}
              onTouchStart={handleEditOption}
            >
              Edit "{originalValue}"
            </ComboBoxCreateOption>
          )}
        </ComboBoxDropdown>
      )}
    </ComboBoxContainer>
  );
};

export default CreatableComboBox;
export { ComboBoxCreateOption };
