import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { 
  ComboBoxDropdown, 
  ComboBoxOption,
  ReadonlyField
} from "./CustomSelect";
import { ComboBoxCreateOption } from "./CreatableComboBox";

// Styled components for the CreatableMultiSelect
const MultiSelectContainer = styled.div`
  position: relative;
  width: 100%;
  z-index: 10; // Base z-index
  &:focus-within {
    z-index: 9999; // Much higher when focused to ensure active dropdowns appear on top
  }
`;

const SelectedItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  min-height: 2.5rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  background-color: #f8f9fa;
  align-items: center;

  &:focus-within {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

const RemoveItemButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  color: #64748b;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ef4444;
  }
`;

const MultiSelectInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  min-width: 120px;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

// Styled component for readonly display of multiple items
const ReadonlyMultiField = styled(ReadonlyField)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  
  span {
    display: inline-block;
    background-color: #e2e8f0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
`;

// CreatableMultiSelect component for multi-select fields
const CreatableMultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder,
  storageKey,
  readonly = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  // If in readonly mode, render a simple display
  if (readonly) {
    return (
      <ReadonlyMultiField className={value.length === 0 ? 'empty' : ''}>
        {value.length > 0 ? (
          value.map((item, index) => (
            <span key={index}>{item}</span>
          ))
        ) : (
          placeholder
        )}
      </ReadonlyMultiField>
    );
  }

  // Update filtered options when input changes
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(options.filter((option) => !value.includes(option)));
    } else {
      const filtered = options
        .filter((option) => !value.includes(option))
        .filter((option) =>
          option.toLowerCase().includes(inputValue.toLowerCase()),
        );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options, value]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle option select
  const handleOptionSelect = (option) => {
    const newValue = [...value, option];
    onChange(newValue);
    setInputValue("");

    // Add to local storage if it's a new option
    if (!options.includes(option) && option.trim() !== "") {
      const updatedOptions = [...options, option];
      const key = storageKey || "aiToolOptions";
      localStorage.setItem(key, JSON.stringify(updatedOptions));
    }

    // Keep focus on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle create option
  const handleCreateOption = () => {
    if (inputValue.trim() !== "" && !value.includes(inputValue)) {
      handleOptionSelect(inputValue);
    }
  };

  // Remove selected item
  const handleRemoveItem = (itemToRemove) => {
    const newValue = value.filter((item) => item !== itemToRemove);
    onChange(newValue);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // We don't need a separate blur handler, since we have the click outside handler
  // This ensures the dropdown stays open when clicking items within it

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      handleCreateOption();
    } else if (e.key === "ArrowDown") {
      if (!isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove the last item when backspace is pressed in empty input
      const newValue = [...value];
      newValue.pop();
      onChange(newValue);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <MultiSelectContainer ref={containerRef}>
      <SelectedItemsContainer
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        {value.map((item, index) => (
          <SelectedItem key={index}>
            {item}
            <RemoveItemButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveItem(item);
              }}
            >
              ×
            </RemoveItemButton>
          </SelectedItem>
        ))}
        <MultiSelectInput
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          autoComplete="new-password"
          data-lpignore="true"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          aria-autocomplete="none"
        />
      </SelectedItemsContainer>

      {isOpen && (
        <ComboBoxDropdown>
          {filteredOptions.length > 0
            ? filteredOptions.map((option, index) => (
                <ComboBoxOption
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </ComboBoxOption>
              ))
            : inputValue.trim() !== "" &&
              !value.includes(inputValue) && (
                <ComboBoxCreateOption onClick={handleCreateOption}>
                  Create "{inputValue}"
                </ComboBoxCreateOption>
              )}

          {filteredOptions.length > 0 &&
            inputValue.trim() !== "" &&
            !filteredOptions.includes(inputValue) &&
            !value.includes(inputValue) && (
              <ComboBoxCreateOption onClick={handleCreateOption}>
                Create "{inputValue}"
              </ComboBoxCreateOption>
            )}
        </ComboBoxDropdown>
      )}
    </MultiSelectContainer>
  );
};

export default CreatableMultiSelect;