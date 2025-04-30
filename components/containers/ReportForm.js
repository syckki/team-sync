import React from "react";
import styled from "styled-components";
import CustomSelect from "../presentational/CustomSelect";
import CreatableComboBox from "../presentational/CreatableComboBox";
import CreatableMultiSelect from "../presentational/CreatableMultiSelect";
import AutoResizeTextArea from "../presentational/AutoResizeTextArea";

// Styled components for form layout
const FormContainer = styled.div`
  margin-bottom: 1.5rem;
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

const InnerLabel = styled.div`
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  text-transform: uppercase;
  color: rgb(107 114 128);
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
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

// Static data for SDLC steps and tasks
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
 * Form for submitting AI productivity reports
 * 
 * @param {Object} props
 * @param {string} props.teamName - The team name (readonly)
 * @param {string} props.teamMember - The team member's name
 * @param {Array} props.teamMemberOptions - List of team member options for auto-complete
 * @param {string} props.teamRole - The role of the team member
 * @param {Array} props.rows - The form rows for tasks
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.setTeamMember - Handler to update team member
 * @param {Function} props.setTeamRole - Handler to update team role
 * @param {Function} props.handleRowChange - Handler for row changes
 * @param {Function} props.handleSDLCStepChange - Handler for SDLC step changes
 * @param {Function} props.addRow - Handler to add a new row
 * @param {Function} props.deleteRow - Handler to delete a row
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting
 * @param {string} props.error - Error message to display
 * @param {boolean} props.success - Whether submission was successful
 */
const ReportFormComponent = ({
  teamName,
  teamMember,
  teamMemberOptions,
  teamRole,
  rows,
  onSubmit,
  setTeamMember,
  setTeamRole,
  handleRowChange,
  handleSDLCStepChange,
  addRow,
  deleteRow,
  isSubmitting,
  error,
  success
}) => {
  return (
    <FormContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && (
        <SuccessMessage>
          Your productivity report has been successfully submitted!
        </SuccessMessage>
      )}

      {!success && (
        <ReportForm onSubmit={onSubmit}>
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
                placeholder="E.g., Developer, Designer, etc."
              />
            </FormGroup>
          </TeamFormSection>

          {rows.map((row, rowIndex) => (
            <div
              key={row.id}
              style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Entry #{rowIndex + 1}
                </h3>

                {rows.length > 1 && (
                  <DeleteButton
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    title="Delete entry"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </DeleteButton>
                )}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <FormGroup>
                  <Label htmlFor={`platform-${row.id}`}>Platform</Label>
                  <CustomSelect
                    value={row.platform}
                    onChange={(value) =>
                      handleRowChange(row.id, "platform", value)
                    }
                    options={[
                      "VS Code",
                      "GitHub Copilot",
                      "ChatGPT",
                      "Anthropic Claude",
                      "Replit",
                      "JetBrains",
                      "GitHub",
                      "Jupyter Notebook",
                      "Other",
                    ]}
                    placeholder="Select platform"
                  />
                </FormGroup>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(1, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <FormGroup>
                  <Label htmlFor={`projectInitiative-${row.id}`}>
                    Project / Initiative
                  </Label>
                  <CreatableComboBox
                    value={row.projectInitiative}
                    onChange={(value) =>
                      handleRowChange(row.id, "projectInitiative", value)
                    }
                    options={[
                      "Customer Portal",
                      "Admin Dashboard",
                      "Mobile App",
                      "API Integration",
                      "Database Migration",
                      "Security Updates",
                      "Performance Optimization",
                      "UI Redesign",
                    ]}
                    storageKey="projectOptions"
                    placeholder="Enter project name"
                  />
                </FormGroup>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <FormGroup>
                  <Label htmlFor={`sdlcStep-${row.id}`}>SDLC Step</Label>
                  <CustomSelect
                    value={row.sdlcStep}
                    onChange={(value) =>
                      handleSDLCStepChange(row.id, value)
                    }
                    options={sdlcSteps}
                    placeholder="Select SDLC step"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`sdlcTask-${row.id}`}>SDLC Task</Label>
                  <CustomSelect
                    value={row.sdlcTask}
                    onChange={(value) =>
                      handleRowChange(row.id, "sdlcTask", value)
                    }
                    options={
                      row.sdlcStep
                        ? sdlcTasksMap[row.sdlcStep] || []
                        : []
                    }
                    placeholder={
                      row.sdlcStep
                        ? "Select specific task"
                        : "Select SDLC step first"
                    }
                    disabled={!row.sdlcStep}
                  />
                </FormGroup>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <FormGroup>
                  <Label htmlFor={`taskDetails-${row.id}`}>
                    Task Details
                  </Label>
                  <AutoResizeTextArea
                    value={row.taskDetails}
                    onChange={(e) =>
                      handleRowChange(
                        row.id,
                        "taskDetails",
                        e.target.value
                      )
                    }
                    placeholder="Describe what you were working on"
                    rows={3}
                  />
                </FormGroup>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(1, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <FormGroup>
                  <Label htmlFor={`aiToolUsed-${row.id}`}>
                    AI Tools Used
                  </Label>
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
                      "Replit AI",
                      "Cody",
                      "Gemini",
                      "Llama",
                      "ML Model (Custom)",
                    ]}
                    storageKey="aiToolOptions"
                    placeholder="Add AI tools used"
                  />
                </FormGroup>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <FormGroup>
                  <Label htmlFor={`estimatedTimeWithoutAI-${row.id}`}>
                    Est. Time w/o AI (h)
                  </Label>
                  <Input
                    type="number"
                    step="0.25"
                    min="0.25"
                    id={`estimatedTimeWithoutAI-${row.id}`}
                    value={row.estimatedTimeWithoutAI}
                    onChange={(e) =>
                      handleRowChange(
                        row.id,
                        "estimatedTimeWithoutAI",
                        e.target.value
                      )
                    }
                    placeholder="E.g., 4.5"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`actualTimeWithAI-${row.id}`}>
                    Actual Time w/ AI (h)
                  </Label>
                  <Input
                    type="number"
                    step="0.25"
                    min="0.25"
                    id={`actualTimeWithAI-${row.id}`}
                    value={row.actualTimeWithAI}
                    onChange={(e) =>
                      handleRowChange(
                        row.id,
                        "actualTimeWithAI",
                        e.target.value
                      )
                    }
                    placeholder="E.g., 1.5"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`timeSaved-${row.id}`}>Time Saved (h)</Label>
                  <Input
                    type="number"
                    id={`timeSaved-${row.id}`}
                    value={row.timeSaved || ""}
                    readOnly
                    style={{
                      backgroundColor: "#f0fdf4",
                      borderColor: "#86efac",
                      fontWeight: "600",
                    }}
                  />
                </FormGroup>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <FormGroup>
                  <Label htmlFor={`complexity-${row.id}`}>
                    Task Complexity
                  </Label>
                  <CustomSelect
                    value={row.complexity}
                    onChange={(value) =>
                      handleRowChange(row.id, "complexity", value)
                    }
                    options={[
                      "Simple",
                      "Moderate",
                      "Complex",
                      "Very Complex",
                    ]}
                    placeholder="Select complexity level"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor={`qualityImpact-${row.id}`}>
                    Impact on Quality
                  </Label>
                  <CustomSelect
                    value={row.qualityImpact}
                    onChange={(value) =>
                      handleRowChange(row.id, "qualityImpact", value)
                    }
                    options={[
                      "Significantly Better",
                      "Somewhat Better",
                      "No Change",
                      "Somewhat Worse",
                      "Significantly Worse",
                    ]}
                    placeholder="Select quality impact"
                  />
                </FormGroup>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <FormGroup>
                  <Label htmlFor={`notesHowAIHelped-${row.id}`}>
                    Notes on How AI Helped
                  </Label>
                  <AutoResizeTextArea
                    value={row.notesHowAIHelped}
                    onChange={(e) =>
                      handleRowChange(
                        row.id,
                        "notesHowAIHelped",
                        e.target.value
                      )
                    }
                    placeholder="Describe how AI tools helped with this task"
                    rows={3}
                  />
                </FormGroup>
              </div>
            </div>
          ))}

          <ButtonRow>
            <ActionButton
              type="button"
              onClick={addRow}
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <AddIcon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </AddIcon>
              Add Another Task Entry
            </ActionButton>

            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Productivity Report"}
            </SubmitButton>
          </ButtonRow>
        </ReportForm>
      )}
    </FormContainer>
  );
};

export default ReportFormComponent;