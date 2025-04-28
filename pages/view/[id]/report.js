import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import {
  importKeyFromBase64,
  encryptData,
  decryptData,
} from "../../../lib/cryptoUtils";

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const HeaderBanner = styled.div`
  background-color: hsl(217 91% 60%);
  color: white;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  color: white;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.5rem;
  letter-spacing: -0.025em;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const LockIcon = styled.div`
  width: 1.25rem;
  height: auto;
  margin-right: 0.5rem;
  display: inline-flex;
`;

const PageSubtitle = styled.p`
  margin: 0;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(255 255 255 / 0.9);
`;

const ContentContainer = styled.div`
  padding: 0 2rem 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

const ReportForm = styled.form`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const TeamFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 992px) {
    flex-direction: row;

    & > div {
      flex: 1;
    }
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: hsl(20 14.3% 4.1%);
  font-size: 0.875rem;
  line-height: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }

  &:read-only {
    background-color: rgb(243 244 246);
    cursor: not-allowed;
  }
`;

const ComboBoxContainer = styled.div`
  position: relative;
  width: 100%;
  z-index: 1000; // Higher z-index to ensure it stacks above all other elements
  &:focus-within {
    z-index: 1001; // Even higher when focused to ensure active dropdowns appear on top
  }
`;

const ComboBoxInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

const ComboBoxDropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: white;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1001; // Match the higher z-index from container
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: max-content;
  min-width: 100%;
  white-space: nowrap;
`;

const ComboBoxOption = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: visible;

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

const Textarea = styled.textarea`
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

const InnerLabel = styled.div`
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  text-transform: uppercase;
  color: rgb(107 114 128);
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: hsl(217 91% 60%);
  color: hsl(217 100% 99%);
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3d6bf3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const BackLinkText = styled.span`
  display: inline-block;
  margin-top: 1rem;
  color: #4e7fff;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  padding: 0.75rem;
  background-color: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

// Styled components for the responsive table
const ResponsiveTable = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  border-radius: calc(0.5rem - 2px);
  position: relative;
  border: 1px solid rgb(229 231 235);
`;

const TableDesktop = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: rgb(249 250 251);
  }

  tbody td:not(:first-of-type):not(:last-of-type) {
    padding: 0.75rem 0.75rem 0.75rem 0;
  }

  th,
  td {
    border: 0px;
    padding: 0.75rem;
    text-align: left;
  }

  th {
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1rem;
    text-transform: uppercase;
    color: rgb(107 114 128);
    letter-spacing: 0.05em;
    padding: 0.75rem;
  }

  td {
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-top: 0.5rem 0.75rem;
  }

  tr:nth-child(even) {
    background-color: #f8f9fa;
  }

  /* Row hover styling removed - only expand icon is clickable now */

  tr.expanded {
    background-color: rgba(78, 127, 255, 0.08);
  }

  tr.detail-row {
    background-color: #f8fafc;
    border-top: 1px dashed #e2e8f0;
    border-bottom: 1px dashed #e2e8f0;
  }

  tr.detail-row td {
    padding: 0;
  }

  .expand-icon {
    color: #4e7fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    transition: transform 0.2s ease;
  }

  .expanded .expand-icon {
    transform: rotate(90deg);
  }

  @media (max-width: 992px) {
    display: none;
  }
`;

const DetailContainer = styled.div`
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  font-size: 0.75rem;
  color: rgb(107 114 128);
  text-transform: uppercase;
`;

const DetailContent = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  padding: 0.75rem;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
`;

const TableMobile = styled.div`
  display: none;

  @media (max-width: 992px) {
    display: block;
  }
`;

const MobileCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const MobileCardHeader = styled.div`
  background-color: #f8fafc;
  padding: 0.75rem;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
`;

const MobileCardBody = styled.div`
  padding: 0;
`;

const MobileCardField = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const MobileFieldLabel = styled.span`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #444;
  font-size: 0.85rem;
`;

const MobileFieldValue = styled.span`
  color: #333;
`;

const MobileActions = styled.div`
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
`;

// Keep the original table styled for backward compatibility
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    font-weight: 600;
  }

  tr:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }

  @media (max-width: 992px) {
    display: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: calc(0.5rem - 2px);
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.primary ? "#4e7fff" : "hsl(60 4.8% 95.9%)"};
  color: hsl(24 9.8% 10%;);
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.primary ? "#3d6bf3" : "hsl(60 4.8% 95.9%)"};
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const AddIcon = styled.div`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
`;

const DeleteButton = styled.button`
  background: none;
  color: rgb(239 68 68);
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  justify-self: center;

  &:hover {
    background-color: rgb(239 68 68 / 0.15);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ReportList = styled.div`
  margin-top: 2rem;
`;

const ReportCard = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ReportTitle = styled.h3`
  margin: 0;
  color: #4e7fff;
  font-size: 1.2rem;
`;

const ReportDate = styled.span`
  color: #718096;
  font-size: 0.9rem;
`;

const ReportContent = styled.div`
  margin-top: 1rem;
  line-height: 1.5;
`;

const TeamInfo = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;

  p {
    margin: 0.5rem 0;
    color: #2d3748;
  }
`;

const TeamInfoLabel = styled.span`
  font-weight: 600;
  margin-right: 0.5rem;
  color: #4a5568;
`;

const sdlcSteps = [
  "Requirements",
  "Design",
  "Implementation",
  "Testing",
  "Deployment",
  "Maintenance",
];

// Custom hook for auto-resizing text areas
const useAutoResizeTextArea = (value) => {
  const textAreaRef = useRef(null);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      // Set height to auto to get the correct scrollHeight
      textArea.style.height = "auto";
      // Set the height to the scrollHeight to fit the content
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  }, [value]);

  return textAreaRef;
};

// Custom TextArea component with auto-resize functionality
const AutoResizeTextArea = ({ value, onChange, ...props }) => {
  const textAreaRef = useAutoResizeTextArea(value);

  const handleChange = (e) => {
    onChange(e);
  };

  return (
    <Textarea
      ref={textAreaRef}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
};

const sdlcTasksMap = {
  Requirements: [
    "Requirement Gathering",
    "User Story Creation",
    "Feasibility Analysis",
    "Requirement Documentation",
    "Stakeholder Interviews",
  ],
  Design: [
    "Architecture Design",
    "Database Design",
    "UI/UX Design",
    "API Design",
    "System Modeling",
  ],
  Implementation: [
    "Frontend Development",
    "Backend Development",
    "Database Implementation",
    "API Development",
    "Integration",
  ],
  Testing: [
    "Unit Testing",
    "Integration Testing",
    "System Testing",
    "Performance Testing",
    "User Acceptance Testing",
  ],
  Deployment: [
    "Deployment Planning",
    "Environment Setup",
    "Data Migration",
    "Release Management",
    "Deployment Execution",
  ],
  Maintenance: [
    "Bug Fixing",
    "Feature Enhancement",
    "Performance Optimization",
    "Security Updates",
    "Documentation Updates",
  ],
};

// Creatable ComboBox Component
// CreatableComboBox component for single-select fields
const CreatableComboBox = ({
  value,
  onChange,
  options = [],
  placeholder,
  storageKey,
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);

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
    }
  };

  return (
    <ComboBoxContainer ref={inputRef}>
      <ComboBoxInput
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen && (
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

// Styled components for the CreatableMultiSelect
const MultiSelectContainer = styled.div`
  position: relative;
  width: 100%;
  z-index: 1000; // Higher z-index to match ComboBoxContainer
  &:focus-within {
    z-index: 1001; // Even higher when focused
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

// CreatableMultiSelect component for multi-select fields
const CreatableMultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder,
  storageKey,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

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
          autoComplete="off"
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

const ReportPage = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isViewMode = view === "true";

  const [key, setKey] = useState(null);
  const [threadTitle, setThreadTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamMember, setTeamMember] = useState("");
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [teamRole, setTeamRole] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      platform: "",
      projectInitiative: "",
      sdlcStep: "",
      sdlcTask: "",
      taskCategory: "",
      taskDetails: "",
      estimatedTimeWithoutAI: "",
      actualTimeWithAI: "",
      // timeSaved is calculated
      aiToolUsed: [],
      complexity: "",
      qualityImpact: "",
      notesHowAIHelped: "",
    },
  ]);

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Extract the key from URL fragment on mount
  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);

      if (!fragment) {
        setError(
          "No encryption key found. Please return to the thread and use the link provided there.",
        );
        return;
      }

      setKey(fragment);

      // Load team member options from localStorage if available
      try {
        const savedOptions = localStorage.getItem("teamMemberOptions");
        if (savedOptions) {
          setTeamMemberOptions(JSON.parse(savedOptions));
        }
      } catch (localStorageErr) {
        console.error("Error loading team member options:", localStorageErr);
        // Non-critical error, continue without saved options
      }

      // If in view mode, fetch the reports
      if (isViewMode) {
        fetchReports(fragment);
      }
    } catch (err) {
      console.error("Error parsing key:", err);
      setError("Could not retrieve encryption key from URL.");
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, isViewMode, id]);

  // Fetch thread title when key is available
  useEffect(() => {
    if (key && id) {
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (authorId) {
        fetch(`/api/download?threadId=${id}&authorId=${authorId}`)
          .then((response) => response.json())
          .then((data) => {
            setThreadTitle(data.threadTitle || id);
            setTeamName(data.threadTitle || id);
          })
          .catch((err) => {
            console.error("Error fetching thread data:", err);
          });
      }
    }
  }, [key, id]);

  const fetchReports = async (keyValue) => {
    try {
      setIsLoading(true);

      // Get author ID from localStorage
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        throw new Error(
          "Author ID not found. Please go back to the thread view.",
        );
      }

      // Fetch all messages from the thread
      const response = await fetch(
        `/api/download?threadId=${id}&authorId=${authorId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch thread data");
      }

      const threadData = await response.json();

      // Import the key from fragment
      const cryptoKey = await importKeyFromBase64(keyValue);

      // Filter and decrypt reports
      const decryptedReports = [];

      for (const message of threadData.messages) {
        // Check if this message is marked as a report in metadata
        if (message.metadata && message.metadata.isReport) {
          try {
            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), (c) =>
              c.charCodeAt(0),
            );

            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);

            // Decrypt the data
            const decrypted = await decryptData(ciphertext, cryptoKey, iv);

            // Parse the decrypted JSON
            const content = JSON.parse(new TextDecoder().decode(decrypted));

            decryptedReports.push({
              id: message.index,
              timestamp: message.metadata.timestamp || new Date().toISOString(),
              authorId: message.metadata.authorId,
              isCurrentUser: message.metadata.authorId === authorId,
              ...content,
            });
          } catch (err) {
            console.error("Error decrypting report:", err);
          }
        }
      }

      // Sort reports by timestamp, newest first
      decryptedReports.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );

      setReports(decryptedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSDLCStepChange = (id, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? { ...row, sdlcStep: value, sdlcTask: "" } // Reset task when step changes
          : row,
      ),
    );
  };

  // Function to round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
  const roundToQuarterHour = (time) => {
    const value = parseFloat(time) || 0;
    return (Math.round(value * 4) / 4).toFixed(2);
  };

  // Format time to 2-digit integer, 2-digit decimal (e.g., 01.50, 12.25)
  const formatTimeDisplay = (time) => {
    const value = parseFloat(time) || 0;
    const intPart = Math.floor(value).toString().padStart(2, "0");
    const decPart = Math.round((value % 1) * 100)
      .toString()
      .padStart(2, "0");
    return `${intPart}.${decPart}`;
  };

  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // If changing time fields, apply quarter-hour rounding
          if (
            field === "estimatedTimeWithoutAI" ||
            field === "actualTimeWithAI"
          ) {
            // Round to nearest quarter hour
            if (field === "estimatedTimeWithoutAI") {
              updatedRow.estimatedTimeWithoutAI = roundToQuarterHour(value);
            }
            if (field === "actualTimeWithAI") {
              updatedRow.actualTimeWithAI = roundToQuarterHour(value);
            }
          }

          // Auto-calculate timeSaved if both time fields have values
          if (
            (field === "estimatedTimeWithoutAI" ||
              field === "actualTimeWithAI") &&
            updatedRow.estimatedTimeWithoutAI &&
            updatedRow.actualTimeWithAI
          ) {
            const estimatedTime =
              parseFloat(updatedRow.estimatedTimeWithoutAI) || 0;
            const actualTime = parseFloat(updatedRow.actualTimeWithAI) || 0;
            // We don't use Math.max here as we want to show negative savings too
            const timeSaved = (estimatedTime - actualTime).toFixed(2);
            updatedRow.timeSaved = timeSaved;
          }

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        platform: "",
        projectInitiative: "",
        sdlcStep: "",
        sdlcTask: "",
        taskCategory: "",
        taskDetails: "",
        estimatedTimeWithoutAI: "",
        actualTimeWithAI: "",
        // timeSaved is calculated
        aiToolUsed: [],
        complexity: "",
        qualityImpact: "",
        notesHowAIHelped: "",
      },
    ]);
  };

  const removeRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const toggleRowExpand = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!key) {
        throw new Error("Encryption key not found");
      }

      if (!teamName.trim() || !teamMember.trim() || !teamRole.trim()) {
        throw new Error("Please fill in all team information fields");
      }

      // Validate rows
      for (const row of rows) {
        if (
          !row.platform ||
          !row.projectInitiative ||
          !row.sdlcStep ||
          !row.sdlcTask ||
          !row.taskCategory ||
          !row.taskDetails ||
          !row.estimatedTimeWithoutAI ||
          !row.actualTimeWithAI ||
          !row.timeSaved ||
          !row.aiToolUsed ||
          row.aiToolUsed.length === 0 ||
          !row.complexity ||
          !row.qualityImpact ||
          !row.notesHowAIHelped
        ) {
          throw new Error(
            "Please fill in all fields for each productivity entry",
          );
        }
      }

      // Get author ID from localStorage
      const authorId =
        localStorage.getItem("encrypted-app-author-id") ||
        `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

      // Ensure author ID is saved
      localStorage.setItem("encrypted-app-author-id", authorId);

      // Create report data object
      const reportData = {
        type: "aiProductivityReport",
        teamName,
        teamMember,
        teamRole,
        entries: rows,
        timestamp: new Date().toISOString(),
      };

      // Convert to JSON
      const jsonData = JSON.stringify(reportData);

      // Import the key
      const cryptoKey = await importKeyFromBase64(key);

      // Encrypt the report data
      const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);

      // Combine IV and ciphertext
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);

      // Submit the encrypted report
      const response = await fetch(`/api/reports?threadId=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Author-ID": authorId,
        },
        body: combinedData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit AI productivity report");
      }

      setSuccess(true);

      // Reset form after successful submission
      setRows([
        {
          id: Date.now(),
          platform: "",
          projectInitiative: "",
          sdlcStep: "",
          sdlcTask: "",
          taskCategory: "",
          taskDetails: "",
          estimatedTimeWithoutAI: "",
          actualTimeWithAI: "",
          // timeSaved is calculated
          aiToolUsed: [],
          complexity: "",
          qualityImpact: "",
          notesHowAIHelped: "",
        },
      ]);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(`Failed to submit report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>
          {isViewMode
            ? "View AI Productivity Reports"
            : "Submit AI Productivity Report"}
        </title>
        <meta
          name="description"
          content="AI Productivity Reporting for Secure Teams"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Container>
        <HeaderBanner>
          <PageTitle>
            <LockIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </LockIcon>
            AI Productivity Report
          </PageTitle>
          <PageSubtitle>
            Track and measure your productivity gains from using AI tools
          </PageSubtitle>
        </HeaderBanner>

        <ContentContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <SuccessMessage>
              Your AI productivity report has been submitted successfully!
            </SuccessMessage>
          )}

          {isViewMode ? (
            // Reports viewing mode
            <>
              <h3>Team Reports for: {threadTitle}</h3>

              {reports.length === 0 ? (
                <p>No productivity reports have been submitted yet.</p>
              ) : (
                <ReportList>
                  {reports.map((report, index) => (
                    <ReportCard key={index}>
                      <ReportHeader>
                        <ReportTitle>
                          Report from {report.teamMember} ({report.teamRole})
                        </ReportTitle>
                        <ReportDate>{formatDate(report.timestamp)}</ReportDate>
                      </ReportHeader>

                      <ReportContent>
                        <ResponsiveTable>
                          {/* Desktop Table View */}
                          <TableDesktop>
                            <thead>
                              <tr>
                                <th>SDLC Step</th>
                                <th>SDLC Task</th>
                                <th>Hours</th>
                                <th>Task Details</th>
                                <th>AI Tool</th>
                                <th>AI Productivity</th>
                                <th>Saved</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.entries.map((entry, i) => (
                                <tr key={i}>
                                  <td>{entry.sdlcStep}</td>
                                  <td>{entry.sdlcTask}</td>
                                  <td>{entry.hours}</td>
                                  <td>{entry.taskDetails}</td>
                                  <td>{entry.aiTool}</td>
                                  <td>{entry.aiProductivity}</td>
                                  <td>{entry.hoursSaved}</td>
                                </tr>
                              ))}
                              {/* Summary row */}
                              <tr
                                className="summary-row"
                                style={{
                                  backgroundColor: "#f8fafc",
                                  fontWeight: 600,
                                  borderTop: "2px solid #e2e8f0",
                                }}
                              >
                                <td colSpan={2}>Total</td>
                                <td>
                                  {report.entries
                                    .reduce(
                                      (sum, entry) =>
                                        sum + (parseFloat(entry.hours) || 0),
                                      0,
                                    )
                                    .toFixed(1)}
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>
                                  {report.entries
                                    .reduce(
                                      (sum, entry) =>
                                        sum +
                                        (parseFloat(entry.hoursSaved) || 0),
                                      0,
                                    )
                                    .toFixed(1)}
                                </td>
                              </tr>
                            </tbody>
                          </TableDesktop>

                          {/* Mobile Card View */}
                          <TableMobile>
                            {report.entries.map((entry, i) => (
                              <MobileCard key={i}>
                                <MobileCardHeader>
                                  Record #{i + 1}
                                </MobileCardHeader>
                                <MobileCardBody>
                                  <MobileCardField>
                                    <MobileFieldLabel>
                                      SDLC Step
                                    </MobileFieldLabel>
                                    <MobileFieldValue>
                                      {entry.sdlcStep}
                                    </MobileFieldValue>
                                  </MobileCardField>

                                  <MobileCardField>
                                    <MobileFieldLabel>
                                      SDLC Task
                                    </MobileFieldLabel>
                                    <MobileFieldValue>
                                      {entry.sdlcTask}
                                    </MobileFieldValue>
                                  </MobileCardField>

                                  <MobileCardField>
                                    <MobileFieldLabel>Hours</MobileFieldLabel>
                                    <MobileFieldValue>
                                      {entry.hours}
                                    </MobileFieldValue>
                                  </MobileCardField>

                                  <MobileCardField>
                                    <MobileFieldLabel>
                                      Task Details
                                    </MobileFieldLabel>
                                    <MobileFieldValue>
                                      {entry.taskDetails}
                                    </MobileFieldValue>
                                  </MobileCardField>

                                  <MobileCardField>
                                    <MobileFieldLabel>
                                      AI Tool Used
                                    </MobileFieldLabel>
                                    <MobileFieldValue>
                                      {entry.aiTool}
                                    </MobileFieldValue>
                                  </MobileCardField>

                                  <MobileCardField>
                                    <MobileFieldLabel>
                                      AI Productivity
                                    </MobileFieldLabel>
                                    <MobileFieldValue>
                                      {entry.aiProductivity}
                                    </MobileFieldValue>
                                  </MobileCardField>

                                  <MobileCardField>
                                    <MobileFieldLabel>Saved</MobileFieldLabel>
                                    <MobileFieldValue>
                                      {entry.hoursSaved}
                                    </MobileFieldValue>
                                  </MobileCardField>
                                </MobileCardBody>
                              </MobileCard>
                            ))}

                            {/* Summary Card for Mobile */}
                            <MobileCard
                              style={{
                                backgroundColor: "#f8fafc",
                                borderColor: "#4e7fff",
                                borderWidth: "2px",
                              }}
                            >
                              <MobileCardHeader
                                style={{
                                  backgroundColor: "#4e7fff",
                                  color: "white",
                                  fontWeight: "bold",
                                }}
                              >
                                Summary
                              </MobileCardHeader>
                              <MobileCardBody>
                                <MobileCardField>
                                  <MobileFieldLabel>
                                    Total Hours
                                  </MobileFieldLabel>
                                  <MobileFieldValue
                                    style={{ fontWeight: "bold" }}
                                  >
                                    {report.entries
                                      .reduce(
                                        (sum, entry) =>
                                          sum + (parseFloat(entry.hours) || 0),
                                        0,
                                      )
                                      .toFixed(1)}
                                  </MobileFieldValue>
                                </MobileCardField>

                                <MobileCardField>
                                  <MobileFieldLabel>
                                    Total Saved
                                  </MobileFieldLabel>
                                  <MobileFieldValue
                                    style={{ fontWeight: "bold" }}
                                  >
                                    {report.entries
                                      .reduce(
                                        (sum, entry) =>
                                          sum +
                                          (parseFloat(entry.hoursSaved) || 0),
                                        0,
                                      )
                                      .toFixed(1)}
                                  </MobileFieldValue>
                                </MobileCardField>
                              </MobileCardBody>
                            </MobileCard>
                          </TableMobile>
                        </ResponsiveTable>
                      </ReportContent>
                    </ReportCard>
                  ))}
                </ReportList>
              )}
            </>
          ) : (
            // Report submission form
            <>
              {!success && (
                <ReportForm onSubmit={handleSubmit}>
                  <TeamFormSection>
                    <FormGroup>
                      <Label htmlFor="teamName">Team Name</Label>
                      <Input
                        type="text"
                        id="teamName"
                        value={teamName}
                        readOnly
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="teamMember">Team Member Name</Label>
                      <CreatableComboBox
                        value={teamMember}
                        onChange={setTeamMember}
                        options={teamMemberOptions}
                        placeholder="Enter your name"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="teamRole">Role on the Team</Label>
                      <Input
                        type="text"
                        id="teamRole"
                        value={teamRole}
                        onChange={(e) => setTeamRole(e.target.value)}
                        required
                        placeholder="Your role (e.g., Developer, Designer, Project Manager)"
                      />
                    </FormGroup>
                  </TeamFormSection>

                  <ResponsiveTable>
                    {/* Desktop Table View */}
                    <TableDesktop>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Platform</th>
                          <th>Initiative</th>
                          <th>SDLC Step</th>
                          <th>SDLC Task</th>
                          <th>Task Category</th>
                          <th style={{ width: "100px" }}>Est (h)</th>
                          <th style={{ width: "100px" }}>Act (h)</th>
                          <th>Complexity</th>
                          <th>Quality Impact</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <React.Fragment key={row.id}>
                            <tr
                              className={`${expandedRows[row.id] ? "expanded" : ""}`}
                            >
                              <td
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpand(row.id);
                                }}
                              >
                                <div className="expand-icon">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                  </svg>
                                </div>
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.platform}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "platform", value)
                                  }
                                  options={[
                                    "Unete",
                                    "Revamp Somos Belcorp",
                                    "Digital Catalog",
                                    "Ecommerce Platform",
                                    "Foundation Tool",
                                    "Powder Tool",
                                    "Skin Advisor",
                                    "Newapp Somos Belcorp",
                                    "FFVV",
                                  ]}
                                  placeholder="Select Platform"
                                  storageKey="platformOptions"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.projectInitiative}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "projectInitiative",
                                      value,
                                    )
                                  }
                                  options={[
                                    "Product Development",
                                    "Internal Tools",
                                    "Research",
                                    "Integration",
                                    "Maintenance",
                                    "Migration",
                                    "Upgrade",
                                  ]}
                                  placeholder="Select Initiative"
                                  storageKey="projectOptions"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.sdlcStep}
                                  onChange={(value) =>
                                    handleSDLCStepChange(row.id, value)
                                  }
                                  options={sdlcSteps}
                                  placeholder="Select Step"
                                  storageKey="sdlcStepOptions"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.sdlcTask}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "sdlcTask", value)
                                  }
                                  options={
                                    row.sdlcStep
                                      ? sdlcTasksMap[row.sdlcStep] || []
                                      : []
                                  }
                                  placeholder="Select Task"
                                  storageKey="sdlcTaskOptions"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.taskCategory}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "taskCategory",
                                      value,
                                    )
                                  }
                                  options={[
                                    "UI Development",
                                    "API Integration",
                                    "Code Refactoring",
                                    "Documentation",
                                    "Testing",
                                    "Code Review",
                                    "Bug Fixing",
                                    "Performance Optimization",
                                  ]}
                                  placeholder="Select Category"
                                  storageKey="taskCategoryOptions"
                                />
                              </td>

                              <td>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.estimatedTimeWithoutAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "estimatedTimeWithoutAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Hours"
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.actualTimeWithAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "actualTimeWithAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Hours"
                                  style={{
                                    width: "100px",
                                    color:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? parseFloat(row.actualTimeWithAI) <
                                          parseFloat(row.estimatedTimeWithoutAI)
                                          ? "#16a34a"
                                          : parseFloat(row.actualTimeWithAI) >
                                              parseFloat(
                                                row.estimatedTimeWithoutAI,
                                              )
                                            ? "#dc2626"
                                            : "inherit"
                                        : "inherit",
                                    fontWeight:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? "500"
                                        : "normal",
                                  }}
                                />
                              </td>

                              <td>
                                <Select
                                  value={row.complexity}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "complexity",
                                      e.target.value,
                                    )
                                  }
                                  required
                                >
                                  <option value="">Select Complexity</option>
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </Select>
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.qualityImpact}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "qualityImpact",
                                      value,
                                    )
                                  }
                                  options={[
                                    "Improved Readability",
                                    "Better Performance",
                                    "More Comprehensive",
                                    "More Accurate",
                                    "Higher Consistency",
                                    "More Secure",
                                    "Better UX",
                                    "More Scalable",
                                  ]}
                                  placeholder="Select Impact"
                                  storageKey="qualityImpactOptions"
                                />
                              </td>

                              <td>
                                {rows.length > 1 && (
                                  <DeleteButton
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row expansion
                                      removeRow(row.id);
                                    }}
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      <line
                                        x1="10"
                                        x2="10"
                                        y1="11"
                                        y2="17"
                                      ></line>
                                      <line
                                        x1="14"
                                        x2="14"
                                        y1="11"
                                        y2="17"
                                      ></line>
                                    </svg>
                                  </DeleteButton>
                                )}
                              </td>
                            </tr>

                            {expandedRows[row.id] && (
                              <tr className="detail-row">
                                <td colSpan="12">
                                  <div style={{ padding: "1rem" }}>
                                    <div style={{ marginBottom: "1rem" }}>
                                      <InnerLabel>AI TOOLS USED</InnerLabel>
                                      <CreatableMultiSelect
                                        value={row.aiToolUsed}
                                        onChange={(value) =>
                                          handleRowChange(
                                            row.id,
                                            "aiToolUsed",
                                            value,
                                          )
                                        }
                                        options={[
                                          "ChatGPT",
                                          "GitHub Copilot",
                                          "Claude",
                                          "DALL-E",
                                          "Midjourney",
                                          "Jasper",
                                          "Hugging Face",
                                          "Leonardo AI",
                                          "Bard",
                                          "GPT-4",
                                        ]}
                                        placeholder="Select AI Tools"
                                        storageKey="aiToolOptions"
                                      />
                                    </div>

                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "1.5rem",
                                      }}
                                    >
                                      <div>
                                        <InnerLabel>TASK DETAILS</InnerLabel>
                                        <AutoResizeTextArea
                                          value={row.taskDetails}
                                          onChange={(e) =>
                                            handleRowChange(
                                              row.id,
                                              "taskDetails",
                                              e.target.value,
                                            )
                                          }
                                          required
                                          placeholder="Enter task details..."
                                          rows={3}
                                          style={{
                                            width: "100%",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "4px",
                                            padding: "0.75rem",
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <InnerLabel>NOTES</InnerLabel>
                                        <AutoResizeTextArea
                                          value={row.notesHowAIHelped}
                                          onChange={(e) =>
                                            handleRowChange(
                                              row.id,
                                              "notesHowAIHelped",
                                              e.target.value,
                                            )
                                          }
                                          required
                                          placeholder="Describe how AI helped with this task"
                                          rows={3}
                                          style={{
                                            width: "100%",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "4px",
                                            padding: "0.75rem",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </TableDesktop>

                    {/* Summary text below the table to match the screenshot */}
                    <div
                      style={{
                        textAlign: "right",
                        padding: "12px 8px",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      {rows.length} {rows.length === 1 ? "entry" : "entries"} |
                      Total Est (h):{" "}
                      {rows
                        .reduce(
                          (sum, row) =>
                            sum + (parseFloat(row.estimatedTimeWithoutAI) || 0),
                          0,
                        )
                        .toFixed(1)}{" "}
                      | Total Act (h):{" "}
                      {rows
                        .reduce(
                          (sum, row) =>
                            sum + (parseFloat(row.actualTimeWithAI) || 0),
                          0,
                        )
                        .toFixed(1)}
                    </div>

                    {/* Mobile Card View */}
                    <TableMobile>
                      {rows.map((row) => (
                        <MobileCard key={row.id}>
                          <MobileCardHeader>
                            Record #{rows.indexOf(row) + 1}
                          </MobileCardHeader>
                          <MobileCardBody>
                            <MobileCardField>
                              <MobileFieldLabel>Platform</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.platform}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "platform", value)
                                  }
                                  options={[
                                    "Web",
                                    "Mobile",
                                    "Desktop",
                                    "Backend",
                                    "Cloud",
                                    "Data",
                                    "Machine Learning",
                                    "DevOps",
                                    "Security",
                                    "Other",
                                  ]}
                                  placeholder="Select Platform"
                                  storageKey="platformOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Initiative</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.projectInitiative}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "projectInitiative",
                                      value,
                                    )
                                  }
                                  options={[
                                    "Product Development",
                                    "Internal Tools",
                                    "Research",
                                    "Integration",
                                    "Maintenance",
                                    "Migration",
                                    "Upgrade",
                                  ]}
                                  placeholder="Select Initiative"
                                  storageKey="projectOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>SDLC Step</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.sdlcStep}
                                  onChange={(value) =>
                                    handleSDLCStepChange(row.id, value)
                                  }
                                  options={sdlcSteps}
                                  placeholder="Select Step"
                                  storageKey="sdlcStepOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>SDLC Task</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.sdlcTask}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "sdlcTask", value)
                                  }
                                  options={
                                    row.sdlcStep
                                      ? sdlcTasksMap[row.sdlcStep] || []
                                      : []
                                  }
                                  placeholder="Select Task"
                                  storageKey="sdlcTaskOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Task Category</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.taskCategory}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "taskCategory",
                                      value,
                                    )
                                  }
                                  options={[
                                    "UI Development",
                                    "API Integration",
                                    "Code Refactoring",
                                    "Documentation",
                                    "Testing",
                                    "Code Review",
                                    "Bug Fixing",
                                    "Performance Optimization",
                                  ]}
                                  placeholder="Select Category"
                                  storageKey="taskCategoryOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Task Details</MobileFieldLabel>
                              <MobileFieldValue>
                                <AutoResizeTextArea
                                  value={row.taskDetails}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "taskDetails",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Describe the task in detail"
                                  rows={2}
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>AI Tool Used</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableMultiSelect
                                  value={row.aiToolUsed}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "aiToolUsed", value)
                                  }
                                  options={[
                                    "ChatGPT",
                                    "GitHub Copilot",
                                    "Claude",
                                    "DALL-E",
                                    "Midjourney",
                                    "Jasper",
                                    "Hugging Face",
                                    "Leonardo AI",
                                    "Bard",
                                    "GPT-4",
                                  ]}
                                  placeholder="Select AI Tools"
                                  storageKey="aiToolOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Est (h)</MobileFieldLabel>
                              <MobileFieldValue>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.estimatedTimeWithoutAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "estimatedTimeWithoutAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Hours"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Act (h)</MobileFieldLabel>
                              <MobileFieldValue>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.actualTimeWithAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "actualTimeWithAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Hours"
                                  style={{
                                    color:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? parseFloat(row.actualTimeWithAI) <
                                          parseFloat(row.estimatedTimeWithoutAI)
                                          ? "#16a34a"
                                          : parseFloat(row.actualTimeWithAI) >
                                              parseFloat(
                                                row.estimatedTimeWithoutAI,
                                              )
                                            ? "#dc2626"
                                            : "inherit"
                                        : "inherit",
                                    fontWeight:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? "500"
                                        : "normal",
                                  }}
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Complexity</MobileFieldLabel>
                              <MobileFieldValue>
                                <Select
                                  value={row.complexity}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "complexity",
                                      e.target.value,
                                    )
                                  }
                                  required
                                >
                                  <option value="">Select Complexity</option>
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </Select>
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>
                                Quality Impact
                              </MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.qualityImpact}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "qualityImpact",
                                      value,
                                    )
                                  }
                                  options={[
                                    "Improved Readability",
                                    "Better Performance",
                                    "More Comprehensive",
                                    "More Accurate",
                                    "Higher Consistency",
                                    "More Secure",
                                    "Better UX",
                                    "More Scalable",
                                  ]}
                                  placeholder="Select Impact"
                                  storageKey="qualityImpactOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Notes</MobileFieldLabel>
                              <MobileFieldValue>
                                <AutoResizeTextArea
                                  value={row.notesHowAIHelped}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "notesHowAIHelped",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Describe how AI helped with this task"
                                  rows={2}
                                />
                              </MobileFieldValue>
                            </MobileCardField>
                          </MobileCardBody>

                          {rows.length > 1 && (
                            <MobileActions>
                              <DeleteButton onClick={() => removeRow(row.id)}>
                                Remove
                              </DeleteButton>
                            </MobileActions>
                          )}
                        </MobileCard>
                      ))}

                      {/* Summary text for mobile to match the screenshot */}
                      <div
                        style={{
                          textAlign: "right",
                          padding: "12px 8px",
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          fontWeight: 500,
                          marginTop: "8px",
                        }}
                      >
                        {rows.length} {rows.length === 1 ? "entry" : "entries"}{" "}
                        | Total Est (h):{" "}
                        {rows
                          .reduce(
                            (sum, row) =>
                              sum +
                              (parseFloat(row.estimatedTimeWithoutAI) || 0),
                            0,
                          )
                          .toFixed(1)}{" "}
                        | Total Act (h):{" "}
                        {rows
                          .reduce(
                            (sum, row) =>
                              sum + (parseFloat(row.actualTimeWithAI) || 0),
                            0,
                          )
                          .toFixed(1)}
                      </div>
                    </TableMobile>
                  </ResponsiveTable>

                  <ButtonRow>
                    <ActionButton type="button" onClick={addRow}>
                      <AddIcon>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 12h8"></path>
                          <path d="M12 8v8"></path>
                        </svg>
                      </AddIcon>
                      Add Entry
                    </ActionButton>

                    <SubmitButton type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </SubmitButton>
                  </ButtonRow>
                </ReportForm>
              )}
            </>
          )}

          <Link href={`/view/${id}`} legacyBehavior passHref>
            <BackLinkText>← Back to inbox</BackLinkText>
          </Link>
        </ContentContainer>
      </Container>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default ReportPage;
