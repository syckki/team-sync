import React from "react";
import styled from "styled-components";
import CustomSelect from "../presentational/CustomSelect";
import CreatableComboBox from "../presentational/CreatableComboBox";
import CreatableMultiSelect from "../presentational/CreatableMultiSelect";
import AutoResizeTextArea from "../presentational/AutoResizeTextArea";
import useReportForm from "../../hooks/useReportForm";

// Styled components for the form
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
  color: ${(props) => (props.primary ? "white" : "hsl(24 9.8% 10%)")};
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

// SDLC step and task options
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
 * ReportForm Component - Handles form state and submission for AI productivity reports
 *
 * @param {Object} props Component props
 * @param {string} props.threadId The thread ID for the report
 * @param {string} props.threadTitle The title of the thread
 * @param {Object} props.cryptoKey The CryptoKey object for encryption
 * @param {Function} props.onSubmitSuccess Callback for successful submission
 * @param {Function} props.onError Callback for errors
 */
const ReportForm = ({
  threadId,
  threadTitle,
  cryptoKey,
  onSubmitSuccess,
  onError,
}) => {
  // Use the custom hook for form state and submission
  const {
    teamName,
    setTeamName,
    teamMember,
    setTeamMember,
    teamMemberOptions,
    teamRole,
    setTeamRole,
    rows,
    isSubmitting,
    handleSDLCStepChange,
    handleRowChange,
    addRow,
    deleteRow,
    handleSubmit
  } = useReportForm({
    threadId,
    threadTitle,
    cryptoKey,
    onSuccess: onSubmitSuccess,
    onError
  });

  return (
    <Form onSubmit={handleSubmit}>
      <h3>Team Information</h3>
      <TeamFormSection>
        <FormGroup>
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            readOnly={!!threadTitle} // Make read-only if thread title exists
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="teamMember">Team Member</Label>
          <CreatableComboBox
            value={teamMember}
            onChange={setTeamMember}
            options={teamMemberOptions}
            placeholder="Select or enter your name"
            storageKey="teamMemberOptions"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="teamRole">Role</Label>
          <Input
            type="text"
            id="teamRole"
            value={teamRole}
            onChange={(e) => setTeamRole(e.target.value)}
            placeholder="Developer, Designer, PM, etc."
          />
        </FormGroup>
      </TeamFormSection>

      <h3>Productivity Tasks</h3>
      {rows.map((row, index) => (
        <div key={row.id} style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h4 style={{ margin: 0 }}>Task {index + 1}</h4>

            {rows.length > 1 && (
              <DeleteButton
                type="button"
                onClick={() => deleteRow(row.id)}
                title="Delete this task"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </DeleteButton>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            <FormGroup>
              <Label htmlFor={`platform-${row.id}`}>Platform</Label>
              <CreatableComboBox
                value={row.platform}
                onChange={(value) => handleRowChange(row.id, "platform", value)}
                options={[
                  "Web Application",
                  "Mobile App",
                  "Backend Service",
                  "Data Processing",
                  "DevOps",
                  "Machine Learning",
                  "Internal Tools",
                ]}
                placeholder="Select or enter platform"
                storageKey="platformOptions"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`projectInitiative-${row.id}`}>
                Project/Initiative
              </Label>
              <CreatableComboBox
                value={row.projectInitiative}
                onChange={(value) =>
                  handleRowChange(row.id, "projectInitiative", value)
                }
                options={[
                  "Customer Portal",
                  "Admin Dashboard",
                  "API Service",
                  "Mobile App",
                  "Internal Tool",
                  "Integration",
                  "Performance Optimization",
                  "Security Update",
                ]}
                placeholder="Select or enter project"
                storageKey="projectOptions"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`sdlcStep-${row.id}`}>SDLC Step</Label>
              <CustomSelect
                value={row.sdlcStep}
                onChange={(value) => handleSDLCStepChange(row.id, value)}
                options={sdlcSteps}
                placeholder="Select SDLC step"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`sdlcTask-${row.id}`}>SDLC Task</Label>
              <CustomSelect
                value={row.sdlcTask}
                onChange={(value) => handleRowChange(row.id, "sdlcTask", value)}
                options={
                  row.sdlcStep ? sdlcTasksMap[row.sdlcStep] || [] : []
                }
                placeholder={
                  row.sdlcStep
                    ? "Select SDLC task"
                    : "Select SDLC step first"
                }
                disabled={!row.sdlcStep}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`taskCategory-${row.id}`}>Task Category</Label>
              <CreatableComboBox
                value={row.taskCategory}
                onChange={(value) =>
                  handleRowChange(row.id, "taskCategory", value)
                }
                options={[
                  "Code Generation",
                  "Debugging",
                  "Refactoring",
                  "Testing",
                  "Documentation",
                  "Research",
                  "Analysis",
                  "Design",
                  "Review",
                ]}
                placeholder="Select or enter category"
                storageKey="taskCategoryOptions"
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor={`taskDetails-${row.id}`}>Task Details</Label>
            <AutoResizeTextArea
              value={row.taskDetails}
              onChange={(e) =>
                handleRowChange(row.id, "taskDetails", e.target.value)
              }
              placeholder="Describe the specific task you performed..."
              id={`taskDetails-${row.id}`}
              rows={2}
            />
          </FormGroup>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <FormGroup>
              <Label htmlFor={`estimatedTimeWithoutAI-${row.id}`}>
                Est. Time w/o AI (h)
              </Label>
              <Input
                type="number"
                id={`estimatedTimeWithoutAI-${row.id}`}
                value={row.estimatedTimeWithoutAI}
                onChange={(e) =>
                  handleRowChange(
                    row.id,
                    "estimatedTimeWithoutAI",
                    e.target.value
                  )
                }
                step="0.25"
                min="0"
                placeholder="Hours"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`actualTimeWithAI-${row.id}`}>
                Actual Time w/ AI (h)
              </Label>
              <Input
                type="number"
                id={`actualTimeWithAI-${row.id}`}
                value={row.actualTimeWithAI}
                onChange={(e) =>
                  handleRowChange(row.id, "actualTimeWithAI", e.target.value)
                }
                step="0.25"
                min="0"
                placeholder="Hours"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`timeSaved-${row.id}`}>Time Saved (h)</Label>
              <Input
                type="number"
                id={`timeSaved-${row.id}`}
                value={row.timeSaved}
                readOnly
                placeholder="Auto-calculated"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`complexity-${row.id}`}>Task Complexity</Label>
              <CustomSelect
                value={row.complexity}
                onChange={(value) =>
                  handleRowChange(row.id, "complexity", value)
                }
                options={["Low", "Medium", "High", "Very High"]}
                placeholder="Select complexity"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor={`qualityImpact-${row.id}`}>Quality Impact</Label>
              <CustomSelect
                value={row.qualityImpact}
                onChange={(value) =>
                  handleRowChange(row.id, "qualityImpact", value)
                }
                options={[
                  "No Change",
                  "Slight Improvement",
                  "Significant Improvement",
                  "Transformative",
                ]}
                placeholder="Select impact"
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor={`aiToolUsed-${row.id}`}>AI Tools Used</Label>
            <CreatableMultiSelect
              value={row.aiToolUsed}
              onChange={(value) =>
                handleRowChange(row.id, "aiToolUsed", value)
              }
              options={[
                "ChatGPT",
                "GitHub Copilot",
                "Replit AI",
                "Claude",
                "DALL-E",
                "Midjourney",
                "Bard",
                "Bing AI",
                "Jasper",
                "Stable Diffusion",
              ]}
              placeholder="Select or enter AI tools used"
              storageKey="aiToolOptions"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor={`notesHowAIHelped-${row.id}`}>
              How AI Helped (Notes)
            </Label>
            <AutoResizeTextArea
              value={row.notesHowAIHelped}
              onChange={(e) =>
                handleRowChange(row.id, "notesHowAIHelped", e.target.value)
              }
              placeholder="Provide details on how AI tools helped with this task..."
              id={`notesHowAIHelped-${row.id}`}
              rows={3}
            />
          </FormGroup>
        </div>
      ))}

      <ButtonRow>
        <ActionButton type="button" onClick={addRow}>
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
          Add Another Task
        </ActionButton>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </SubmitButton>
      </ButtonRow>
    </Form>
  );
};

export default ReportForm;