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
  onStorage,
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
  const [internalOptions, setInternalOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [originalValue, setOriginalValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
    setOriginalValue(value); // Store the original value for the Edit option
  }, [value]);

  useEffect(() => {
    setInternalOptions(options);
  }, [options]);

  // Update filtered options when input changes
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(internalOptions);
    } else {
      const filtered = internalOptions.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, internalOptions]);

  // Load options from localStorage on mount to ensure we have the latest options
  useEffect(() => {
    try {
      const key = storageKey;
      const storedOptions = JSON.parse(localStorage.getItem(key) || "[]");
      if (storedOptions.length > 0) {
        // Update filtered options with stored options
        setFilteredOptions((prev) => {
          const combined = [...new Set([...prev, ...storedOptions])];
          return combined;
        });
      }
    } catch (error) {
      console.error("Error loading options from localStorage:", error);
    }
  }, [storageKey]);

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
    // Add to local storage if it's a new option
    if (!internalOptions.includes(inputValue) && inputValue.trim() !== "") {
      const updatedOptions = [...internalOptions, inputValue];

      if (onStorage) onStorage(updatedOptions, "new", updatedOptions.length);
      else {
        const key = storageKey;
        const alteredKey = `${key}-altered`;
        const items = JSON.parse(localStorage.getItem(alteredKey) || "{}");
        items[updatedOptions.length] = "new";

        localStorage.setItem(key, JSON.stringify(updatedOptions));
        localStorage.setItem(alteredKey, JSON.stringify(items));
      }

      // Force update the filtered options to include the new option
      setFilteredOptions([inputValue]);
      setInternalOptions(updatedOptions);
      onChange(inputValue);
    }

    // Close the dropdown after a small delay to allow the state to update
    setTimeout(() => {
      setIsOpen(false);
    }, 50);
  };

  // Handle edit option - replaces the original value with the new one in localStorage
  const handleEditOption = () => {
    // Update in localStorage - replace the original value with the new one
    if (
      originalValue &&
      originalValue !== inputValue &&
      originalValue.trim() !== "" &&
      inputValue.trim() !== ""
    ) {
      const updatedOptions = internalOptions.map((opt) =>
        opt === originalValue ? inputValue : opt,
      );

      let index = updatedOptions.indexOf(inputValue);

      if (!updatedOptions.includes(inputValue)) {
        index = updatedOptions.push(inputValue) - 1;
      }

      if (onStorage) onStorage(updatedOptions, "edited", index);
      else {
        const key = storageKey;
        const alteredKey = `${key}-altered`;
        const items = JSON.parse(localStorage.getItem(alteredKey) || "{}");

        if (!items[index]) {
          items[index] = "edited";
        }

        localStorage.setItem(key, JSON.stringify(updatedOptions));
        localStorage.setItem(alteredKey, JSON.stringify(items));
      }

      setFilteredOptions([inputValue]);
      setInternalOptions(updatedOptions);
      onChange(inputValue);
    }

    // Close the dropdown after a small delay to allow the state to update
    setTimeout(() => {
      setIsOpen(false);
    }, 50);
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
        if (
          originalValue &&
          originalValue !== inputValue &&
          originalValue.trim() !== "" &&
          inputValue.trim() !== "" &&
          internalOptions.includes(originalValue)
        ) {
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
            internalOptions.includes(originalValue) && (
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
