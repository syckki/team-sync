import React from "react";
import styled from "styled-components";

import CustomSelect from "./CustomSelect";
import CreatableComboBox from "./CreatableComboBox";
import CreatableMultiSelect from "./CreatableMultiSelect";
import AutoResizeTextArea from "./AutoResizeTextArea";
import ResponsiveTable from "./ResponsiveTable";

const Form = styled.form`
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
  isSubmitting,
  error,
  success,
  teamMemberOptions = [],
}) => {
  // Function to handle row expansion for display purposes
  const toggleRowExpand = (rowId) => {
    toggleRowExpansion(rowId);
  };

  // Define column structure for the new ResponsiveTable
  const tableColumns = [
    {
      header: "Platform",
      field: "platform",
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
        />
      ),
    },
    {
      header: "Initiative",
      field: "projectInitiative",
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
        />
      ),
    },
    {
      header: "SDLC Step",
      field: "sdlcStep",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleSDLCStepChange(row.id, newValue)}
          options={sdlcSteps}
          placeholder="SDLC Step"
          storageKey="sdlcStepOptions"
          autoComplete="off"
        />
      ),
    },
    {
      header: "SDLC Task",
      field: "sdlcTask",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleRowChange(row.id, "sdlcTask", newValue)}
          options={row.sdlcStep ? sdlcTasksMap[row.sdlcStep] || [] : []}
          placeholder="SDLC Task"
          storageKey="sdlcTaskOptions"
          disabled={!row.sdlcStep}
          autoComplete="off"
        />
      ),
    },
    {
      header: "Task Category",
      field: "taskCategory",
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
        />
      ),
    },
    {
      header: "Est (h)",
      field: "estimatedTimeWithoutAI",
      width: "100px",
      render: (value, row) => (
        <Input
          type="number"
          min="0"
          step="0.25"
          value={value}
          onChange={(e) =>
            handleRowChange(row.id, "estimatedTimeWithoutAI", e.target.value)
          }
          required
          placeholder="Est (Hrs)"
          style={{ width: "100px" }}
          autoComplete="off"
        />
      ),
    },
    {
      header: "Act (h)",
      field: "actualTimeWithAI",
      width: "100px",
      render: (value, row) => (
        <Input
          type="number"
          min="0"
          step="0.25"
          value={value}
          onChange={(e) =>
            handleRowChange(row.id, "actualTimeWithAI", e.target.value)
          }
          required
          placeholder="Act (Hrs)"
          style={{
            width: "100px",
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
      render: (value, row) => (
        <CustomSelect
          value={value}
          onChange={(newValue) =>
            handleRowChange(row.id, "complexity", newValue)
          }
          options={["Low", "Medium", "High"]}
          placeholder="Complexity"
        />
      ),
    },
    {
      header: "Quality Impact",
      field: "qualityImpact",
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
          autoComplete="off"
        />
      ),
    },
    {
      header: "Action",
      field: "action",
      render: (value, row) =>
        rows.length > 1 ? (
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
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
          </DeleteButton>
        ) : null,
    },
  ];

  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && (
        <SuccessMessage>
          Your AI productivity report has been submitted successfully!
        </SuccessMessage>
      )}
      <>
        {!success && (
          <Form onSubmit={handleSubmit} autoComplete="off">
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
                  autoComplete="off"
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
                  autoComplete="off"
                />
              </FormGroup>
            </TeamFormSection>

            {/* New ResponsiveTable implementation */}
            <div style={{ marginBottom: "1.5rem" }}>
              <ResponsiveTable
                data={rows}
                columns={tableColumns}
                keyField="id"
                expandableRowRender={(row) => (
                  <div style={{ padding: "1rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                      <InnerLabel>AI TOOLS USED</InnerLabel>
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
          </Form>
        )}
      </>
    </>
  );
};

export default ReportForm;
