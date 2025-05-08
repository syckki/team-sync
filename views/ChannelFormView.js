import { useState } from "react";
import styled from "styled-components";
import { Button, Input, ErrorMessage } from "../ui";

const Form = styled.form`
  margin: 0 auto;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ChannelFormView = ({ onSubmit, isLoading, error, isReply = false }) => {
  const [formValues, setFormValues] = useState({
    title: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const isFormValid = formValues.title.trim() && formValues.message.trim();

  return (
    <Form onSubmit={handleSubmit}>
      {isReply && <Title>Send Encrypted Reply</Title>}

      {error && <ErrorMessage type="error">{error}</ErrorMessage>}

      <FormGroup>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          placeholder={
            isReply
              ? "Reply: Enter a title"
              : "Enter a name for this channel (e.g: Experience Delivery)"
          }
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="message">Message</Label>
        <TextArea
          id="message"
          name="message"
          value={formValues.message}
          onChange={handleChange}
          placeholder={
            isReply
              ? "Type your secure reply here..."
              : "Write a welcome message, context, or first update for this channel (e.g: Let’s use this space to share our weekly updates.)"
          }
          required
        />
      </FormGroup>

      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        variant="primary"
        size="large"
      >
        {isLoading
          ? "Encrypting..."
          : isReply
            ? "Encrypt & Send Reply"
            : "Create Channel"}
      </Button>
    </Form>
  );
};

export default ChannelFormView;
