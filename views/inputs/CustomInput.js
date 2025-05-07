import React from "react";
import styled from "styled-components";
import { ReadonlyField } from "./CustomSelect";

// Styled components
export const StyledInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: #fff;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

// CustomInput component that supports readonly mode
const CustomInput = ({
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  style = {},
  readonly = false,
  min,
  max,
  step,
  id,
  className,
  autoWrap = false,
  ...rest
}) => {
  if (readonly) {
    return (
      <ReadonlyField
        $autoWrap={autoWrap}
        className={!value ? "empty" : ""}
        style={style}
      >
        {value}
      </ReadonlyField>
    );
  }

  return (
    <StyledInput
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      style={style}
      min={min}
      max={max}
      step={step}
      id={id}
      className={className}
      {...rest}
    />
  );
};

export default CustomInput;
