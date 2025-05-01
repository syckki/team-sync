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

// Additional styled components for the form
const DetailRowContent = styled.div`
  padding: 1rem;
  background-color: #f8fafc;
`;

const ExpandIcon = styled.div`
  color: #4e7fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.2s ease;
  
  &.expanded {
    transform: rotate(90deg);
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
  color: hsl(24 9.8% 10%);
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
          <Form onSubmit={handleSubmit}>
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

            {/* Use the generic ResponsiveTable component */}
            <ResponsiveTable
              data={rows}
              columns={[
                {
                  key: "expand",
                  header: "",
                  render: (row) => (
                    <div 
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpand(row.id);
                      }}
                    >
                      <ExpandIcon className={expandedRows[row.id] ? "expanded" : ""}>
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
                      </ExpandIcon>
                    </div>
                  )
                },
                {
                  key: "platform",
                  header: "Platform",
                  render: (row) => (
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
                      placeholder="Platform"
                      storageKey="platformOptions"
                    />
                  )
                },
                {
                  key: "initiative",
                  header: "Initiative",
                  render: (row) => (
                    <CreatableComboBox
                      value={row.projectInitiative}
                      onChange={(value) =>
                        handleRowChange(
                          row.id,
                          "projectInitiative",
                          value,
                        )
                      }
                      options={[]}
                      placeholder="Initiative"
                      storageKey="projectOptions"
                    />
                  )
                },
                {
                  key: "sdlcStep",
                  header: "SDLC Step",
                  render: (row) => (
                    <CreatableComboBox
                      value={row.sdlcStep}
                      onChange={(value) =>
                        handleSDLCStepChange(row.id, value)
                      }
                      options={sdlcSteps}
                      placeholder="SDLC Step"
                      storageKey="sdlcStepOptions"
                    />
                  )
                },
                {
                  key: "sdlcTask",
                  header: "SDLC Task",
                  render: (row) => (
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
                      placeholder="SDLC Task"
                      storageKey="sdlcTaskOptions"
                      disabled={!row.sdlcStep}
                    />
                  )
                },
                {
                  key: "taskCategory",
                  header: "Task Category",
                  render: (row) => (
                    <CreatableComboBox
                      value={row.taskCategory}
                      onChange={(value) =>
                        handleRowChange(row.id, "taskCategory", value)
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
                    />
                  )
                },
                {
                  key: "estHours",
                  header: "Est (h)",
                  width: "100px",
                  render: (row) => (
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
                      placeholder="Est (Hrs)"
                      style={{ width: "100px" }}
                    />
                  )
                },
                {
                  key: "actHours",
                  header: "Act (h)",
                  width: "100px",
                  render: (row) => (
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
                      placeholder="Act (Hrs)"
                      style={{
                        width: "100px",
                        color:
                          row.estimatedTimeWithoutAI &&
                          row.actualTimeWithAI
                            ? parseFloat(row.actualTimeWithAI) <
                              parseFloat(row.estimatedTimeWithoutAI)
                              ? "#16a34a"
                              : parseFloat(row.actualTimeWithAI) >
                                  parseFloat(row.estimatedTimeWithoutAI)
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
                  )
                },
                {
                  key: "complexity",
                  header: "Complexity",
                  render: (row) => (
                    <CustomSelect
                      value={row.complexity}
                      onChange={(value) =>
                        handleRowChange(row.id, "complexity", value)
                      }
                      options={["Low", "Medium", "High"]}
                      placeholder="Complexity"
                    />
                  )
                },
                {
                  key: "qualityImpact",
                  header: "Quality Impact",
                  render: (row) => (
                    <CreatableComboBox
                      value={row.qualityImpact}
                      onChange={(value) =>
                        handleRowChange(row.id, "qualityImpact", value)
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
                    />
                  )
                },
                {
                  key: "action",
                  header: "Action",
                  render: (row) => (
                    rows.length > 1 && (
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
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </DeleteButton>
                    )
                  )
                }
              ]}
              keyField="id"
              emptyMessage="No productivity entries yet. Click 'Add Entry' to get started."
              headerTitle="Productivity Entry"
              renderCustomCell={(row) => {
                // Render expanded detail row
                if (expandedRows[row.id]) {
                  return (
                    <DetailRowContent>
                      <div style={{ marginBottom: "1rem" }}>
                        <InnerLabel>Task Details</InnerLabel>
                        <Input
                          type="text"
                          value={row.taskDetails}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "taskDetails",
                              e.target.value,
                            )
                          }
                          placeholder="Short description of the task"
                          required
                        />
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <InnerLabel>AI Tools Used</InnerLabel>
                        <CreatableMultiSelect
                          value={row.aiToolUsed}
                          onChange={(value) =>
                            handleRowChange(row.id, "aiToolUsed", value)
                          }
                          options={[
                            "GitHub Copilot",
                            "ChatGPT",
                            "Claude",
                            "Midjourney",
                            "DALL-E",
                            "Jasper",
                            "Bard",
                            "Bing Chat",
                            "Replit",
                            "Tabnine",
                            "Sourcegraph Cody",
                            "CodeWhisperer",
                          ]}
                          placeholder="Select AI tools used"
                          required
                          storageKey="aiToolsOptions"
                        />
                      </div>

                      <div>
                        <InnerLabel>
                          How AI Helped (Detailed Notes)
                        </InnerLabel>
                        <AutoResizeTextArea
                          value={row.notesHowAIHelped}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "notesHowAIHelped",
                              e.target.value,
                            )
                          }
                          placeholder="Describe how AI tools contributed to your work..."
                          required
                        />
                      </div>
                    </DetailRowContent>
                  );
                }
                return null;
              }}
              summaryRow={{
                content: `${rows.length} ${rows.length === 1 ? "entry" : "entries"} | 
                Total Est (h): ${rows.reduce((sum, row) => sum + (parseFloat(row.estimatedTimeWithoutAI) || 0), 0).toFixed(1)} | 
                Total Act (h): ${rows.reduce((sum, row) => sum + (parseFloat(row.actualTimeWithAI) || 0), 0).toFixed(1)}`
              }}
            />

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