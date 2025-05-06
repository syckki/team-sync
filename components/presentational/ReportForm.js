import React from "react";
import styled from "styled-components";
import { Breakpoint } from "../../lib/styles";

import CustomSelect, { ReadonlyField } from "./CustomSelect";
import CustomInput from "./CustomInput";
import CreatableComboBox from "./CreatableComboBox";
import CreatableMultiSelect from "./CreatableMultiSelect";
import AutoResizeTextArea from "./AutoResizeTextArea";
import ResponsiveTable from "./ResponsiveTable";
import InfoTooltip from "./InfoTooltip";

const Form = styled.form`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 0rem;
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
  display: flex;
  align-items: center;
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

const InnerLabel = styled.div`
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  text-transform: uppercase;
  color: rgb(107 114 128);
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;

  @media (max-width: ${Breakpoint.LAPTOP}px) {
    text-transform: none;
    font-weight: 600;
    color: #444;
    font-size: 0.85rem;
    text-align: left;
  }
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

const RowDetail = styled.div`
  padding: 1rem;

  @media (max-width: ${Breakpoint.LAPTOP}px) {
    padding: 1.25rem 0.75rem;
  }
`;

const TextAreaWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 1rem;

  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    flex-flow: column nowrap;
  }

  > div {
    flex: 1;
  }
`;

const sdlcSteps = [
  "Requirements",
  "Design",
  "Implementation",
  "Testing",
  "Deployment",
  "Maintenance",
];

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

/**
 * Presentation component for the Report Form
 * Pure presentation component that receives all props from the container
 */
const ReportForm = ({
  teamName,
  teamMember,
  setTeamMember,
  teamRole,
  setTeamRole,
  rows,
  expandedRows,
  toggleRowExpansion,
  handleRowChange,
  handleSDLCStepChange,
  addRow,
  removeRow,
  handleSubmit,
  handleSaveAsDraft,
  isSubmitting,
  error,
  success,
  successMessage,
  teamMemberOptions = [],
  readOnly = false, // Add readOnly prop with default false
}) => {
  // Function to handle row expansion for display purposes
  const toggleRowExpand = (rowId) => {
    toggleRowExpansion(rowId);
  };

  // Define column structure for the new ResponsiveTable
  // Create delete buttons for each row first
  const rowsWithDeleteButtons = rows.map((row) => {
    // Only add delete button if there's more than one row
    const deleteButton =
      rows.length > 1 ? (
        <DeleteButton
          className="delete-action-button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row expansion
            removeRow(row.id);
          }}
          style={{ width: "1.5rem", height: "1.5rem", padding: "0.125rem" }}
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
            <line x1="10" x2="10" y1="11" y2="17"></line>
            <line x1="14" x2="14" y1="11" y2="17"></line>
          </svg>
        </DeleteButton>
      ) : null;

    return {
      ...row,
      _deleteButton: deleteButton,
    };
  });

  // Define base columns without Action column
  let tableColumns = [
    {
      header: "Platform",
      field: "platform",
      tooltip:
        "Identifies the system, product, or main platform where the task was performed. Helps understand AI impact.",
      actionHint: "Select or create a platform name.",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleRowChange(row.id, "platform", newValue)}
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
          placeholder="Platform"
          storageKey="platformOptions"
          autoComplete="off"
          readonly={readOnly}
        />
      ),
    },
    {
      header: "Initiative",
      field: "projectInitiative",
      tooltip:
        "Identifies the specific project or initiative. Standardized data helps with grouping and filtering in reports.",
      actionHint: "Select an existing initiative or create a new one.",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) =>
            handleRowChange(row.id, "projectInitiative", newValue)
          }
          options={[]}
          placeholder="Initiative"
          storageKey="projectOptions"
          autoComplete="off"
          readonly={readOnly}
        />
      ),
    },
    {
      header: "SDLC Step",
      field: "sdlcStep",
      tooltip:
        "Maps the task to a standard Software Development Life Cycle phase. Enables analysis of AI impact across different phases.",
      actionHint: "Select one of the standard SDLC steps.",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleSDLCStepChange(row.id, newValue)}
          options={sdlcSteps}
          placeholder="SDLC Step"
          storageKey="sdlcStepOptions"
          autoComplete="off"
          readonly={readOnly}
        />
      ),
    },
    {
      header: "SDLC Task",
      field: "sdlcTask",
      tooltip:
        "Specifies the detailed task within the SDLC step. Adds granularity to see what specific tasks are accelerated by AI.",
      actionHint: "Select a task related to the chosen SDLC step.",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleRowChange(row.id, "sdlcTask", newValue)}
          options={row.sdlcStep ? sdlcTasksMap[row.sdlcStep] || [] : []}
          placeholder="SDLC Task"
          storageKey="sdlcTaskOptions"
          readonly={readOnly}
          disabled={!row.sdlcStep && !readOnly}
          autoComplete="off"
        />
      ),
    },
    {
      header: "Task Category",
      field: "taskCategory",
      tooltip:
        "High-level categorization of task type, independent of SDLC. Useful for cross-analysis (e.g., which tools work best for 'Code Generation').",
      actionHint:
        "Select or create a task category that best describes the work.",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) =>
            handleRowChange(row.id, "taskCategory", newValue)
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
          placeholder="Task Category"
          storageKey="taskCategoryOptions"
          autoComplete="off"
          readonly={readOnly}
        />
      ),
    },
    {
      header: "Est (hrs)",
      field: "estimatedTimeWithoutAI",
      width: "115px",
      tooltip:
        "Time the task would have taken without AI tools. Establishes the baseline for measuring time savings.",
      actionHint:
        "Enter your honest estimate of how long this would have taken without AI.",
      render: (value, row) => (
        <CustomInput
          type="number"
          min="0"
          step="0.25"
          value={value}
          onChange={(e) =>
            handleRowChange(row.id, "estimatedTimeWithoutAI", e.target.value)
          }
          required
          placeholder="Est (Hrs)"
          style={{ width: "115px" }}
          autoComplete="new-password"
          data-lpignore="true"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          aria-autocomplete="none"
          readonly={readOnly}
        />
      ),
    },
    {
      header: "Act (hrs)",
      field: "actualTimeWithAI",
      width: "115px",
      tooltip:
        "Actual time the task took using AI tools. Shows real-time savings through color-coding (green when faster, red when slower).",
      actionHint: "Record the actual time spent including AI assistance.",
      render: (value, row) => (
        <CustomInput
          type="number"
          min="0"
          step="0.25"
          value={value}
          onChange={(e) =>
            handleRowChange(row.id, "actualTimeWithAI", e.target.value)
          }
          required
          placeholder="Act (Hrs)"
          autoComplete="new-password"
          data-lpignore="true"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          aria-autocomplete="none"
          readonly={readOnly}
          style={{
            width: "115px",
            color:
              row.estimatedTimeWithoutAI && row.actualTimeWithAI
                ? parseFloat(row.actualTimeWithAI) <
                  parseFloat(row.estimatedTimeWithoutAI)
                  ? "#16a34a"
                  : parseFloat(row.actualTimeWithAI) >
                      parseFloat(row.estimatedTimeWithoutAI)
                    ? "#dc2626"
                    : "inherit"
                : "inherit",
            fontWeight:
              row.estimatedTimeWithoutAI && row.actualTimeWithAI
                ? "500"
                : "normal",
          }}
        />
      ),
    },
    {
      header: "Complexity",
      field: "complexity",
      tooltip:
        "Adds context to time savings. Saving 1 hour on a complex task may be more impactful than on a simple one. Helps weigh results.",
      actionHint: "Select the appropriate complexity level for this task.",
      render: (value, row) => (
        <CustomSelect
          value={value}
          onChange={(newValue) =>
            handleRowChange(row.id, "complexity", newValue)
          }
          options={["Low", "Medium", "High"]}
          placeholder="Complexity"
          readonly={readOnly}
        />
      ),
    },
    {
      header: "Quality Impact",
      field: "qualityImpact",
      tooltip:
        "Evaluates if AI use affected output quality. Ensures productivity gains don't compromise quality.",
      actionHint:
        "Select how AI affected the quality of the output compared to traditional methods.",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) =>
            handleRowChange(row.id, "qualityImpact", newValue)
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
          placeholder="Quality Impact"
          storageKey="qualityImpactOptions"
          autoComplete="new-password"
          data-lpignore="true"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          aria-autocomplete="none"
          readonly={readOnly}
        />
      ),
    },
  ];

  // Add Action column only when not in read-only mode
  if (!readOnly) {
    tableColumns.push({
      header: "Action",
      field: "action",
      render: (value, row) =>
        rows.length > 1 ? (
          <DeleteButton
            className="delete-action-button"
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
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
          </DeleteButton>
        ) : null,
    });
  }

  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && (
        <SuccessMessage>
          {successMessage ||
            "Your AI productivity report has been submitted successfully!"}
        </SuccessMessage>
      )}
      <>
        {!success && (
          <Form onSubmit={handleSubmit} autoComplete="off">
            <TeamFormSection>
              <FormGroup>
                <Label htmlFor="teamName">
                  Team Name
                  <InfoTooltip
                    title="Team Name"
                    content="Identifies the team to which the collaborator belongs for team-level analysis and reporting."
                    actionHint="This field is pre-filled and cannot be edited."
                  />
                </Label>
                <ReadonlyField>{teamName}</ReadonlyField>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="teamMember">
                  Team Member Name
                  <InfoTooltip
                    title="Team Member Name"
                    content="Identifies the individual reporting productivity. Essential for individual tracking if necessary."
                    actionHint="You can select from existing members or create a new entry."
                  />
                </Label>
                <CreatableComboBox
                  value={teamMember}
                  onChange={setTeamMember}
                  options={teamMemberOptions}
                  placeholder="Enter your name"
                  autoComplete="new-password"
                  data-lpignore="true"
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
                  aria-autocomplete="none"
                  readonly={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="teamRole">
                  Role on the Team
                  <InfoTooltip
                    title="Role on the Team"
                    content="Identifies the collaborator's role. Helps analyze which roles benefit most from which tools or task types."
                    actionHint="Enter your specific role within the team."
                  />
                </Label>
                <CustomInput
                  type="text"
                  id="teamRole"
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                  required
                  placeholder="Your role (e.g., Developer, Designer, Project Manager)"
                  autoComplete="new-password"
                  data-lpignore="true"
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
                  aria-autocomplete="none"
                  readonly={readOnly}
                />
              </FormGroup>
            </TeamFormSection>

            {/* New ResponsiveTable implementation */}
            <div style={{ marginBottom: "1.5rem" }}>
              <ResponsiveTable
                data={rowsWithDeleteButtons}
                columns={tableColumns}
                keyField="id"
                expandableRowRender={(row) => (
                  <RowDetail>
                    <div style={{ marginBottom: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <InnerLabel style={{ margin: 0 }}>
                          AI Tools used
                        </InnerLabel>
                        <InfoTooltip
                          title="AI Tools Used"
                          content="Identifies specific AI tools used for the task. Crucial for comparing tool effectiveness across different tasks."
                          actionHint="Select multiple tools if you used more than one for this task."
                        />
                      </div>
                      <CreatableMultiSelect
                        value={row.aiToolsUsed}
                        onChange={(value) =>
                          handleRowChange(row.id, "aiToolsUsed", value)
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
                        readonly={readOnly}
                      />
                    </div>

                    <TextAreaWrapper>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <InnerLabel style={{ margin: 0 }}>
                            Task Details
                          </InnerLabel>
                          <InfoTooltip
                            title="Task Details"
                            content="Specific and concise task description. Context is essential for interpreting the entry and understanding where AI was applied."
                            actionHint="Provide enough detail to understand the task's scope and requirements."
                          />
                        </div>
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
                          autoComplete="new-password"
                          data-lpignore="true"
                          spellCheck="false"
                          autoCorrect="off"
                          autoCapitalize="off"
                          aria-autocomplete="none"
                          readonly={readOnly}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <InnerLabel style={{ margin: 0 }}>Notes</InnerLabel>
                          <InfoTooltip
                            title="Notes"
                            content="Space for qualitative notes on how AI specifically helped, challenges encountered, or other relevant context not captured in numbers."
                            actionHint="Describe specifically how the AI tools assisted with this task and any notable observations."
                          />
                        </div>
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
                          autoComplete="new-password"
                          data-lpignore="true"
                          spellCheck="false"
                          autoCorrect="off"
                          autoCapitalize="off"
                          aria-autocomplete="none"
                          readonly={readOnly}
                        />
                      </div>
                    </TextAreaWrapper>
                  </RowDetail>
                )}
                expandedRows={expandedRows}
                onRowToggle={toggleRowExpand}
                emptyMessage="No entries. Click 'Add Entry' to start your report."
                customSummaryRow={() => (
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
                )}
              />
            </div>

            {/* Only show action buttons if not in read-only mode */}
            {!readOnly && (
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

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <ActionButton
                    type="button"
                    onClick={handleSaveAsDraft}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: "#f3f4f6",
                      color: "#4b5563",
                      border: "1px solid #d1d5db",
                    }}
                  >
                    {isSubmitting ? "Saving..." : "Save as Draft"}
                  </ActionButton>

                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </SubmitButton>
                </div>
              </ButtonRow>
            )}
          </Form>
        )}
      </>
    </>
  );
};

export default ReportForm;
