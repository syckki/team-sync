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

// Styled components for the old responsive table (will be replaced)
const OldResponsiveTableContainer = styled.div`
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

  /* We're only making the arrow clickable for expansion */

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
        />
      )
    },
    { 
      header: "Initiative", 
      field: "projectInitiative",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleRowChange(row.id, "projectInitiative", newValue)}
          options={[]}
          placeholder="Initiative"
          storageKey="projectOptions"
        />
      )
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
        />
      )
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
        />
      )
    },
    { 
      header: "Task Category", 
      field: "taskCategory",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleRowChange(row.id, "taskCategory", newValue)}
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
      header: "Est (h)", 
      field: "estimatedTimeWithoutAI",
      width: "100px",
      render: (value, row) => (
        <Input
          type="number"
          min="0"
          step="0.25"
          value={value}
          onChange={(e) => handleRowChange(row.id, "estimatedTimeWithoutAI", e.target.value)}
          required
          placeholder="Est (Hrs)"
          style={{ width: "100px" }}
        />
      )
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
          onChange={(e) => handleRowChange(row.id, "actualTimeWithAI", e.target.value)}
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
      header: "Complexity", 
      field: "complexity",
      render: (value, row) => (
        <CustomSelect
          value={value}
          onChange={(newValue) => handleRowChange(row.id, "complexity", newValue)}
          options={["Low", "Medium", "High"]}
          placeholder="Complexity"
        />
      )
    },
    { 
      header: "Quality Impact", 
      field: "qualityImpact",
      render: (value, row) => (
        <CreatableComboBox
          value={value}
          onChange={(newValue) => handleRowChange(row.id, "qualityImpact", newValue)}
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
      header: "Action", 
      field: "action",
      render: (value, row) => (
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
        ) : null
      )
    }
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

            <OldResponsiveTableContainer>
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
                            placeholder="Platform"
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
                            options={[]}
                            placeholder="Initiative"
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
                            placeholder="SDLC Step"
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
                            placeholder="SDLC Task"
                            storageKey="sdlcTaskOptions"
                            disabled={!row.sdlcStep}
                          />
                        </td>
                        <td>
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
                            placeholder="Est (Hrs)"
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
                        </td>

                        <td>
                          <CustomSelect
                            value={row.complexity}
                            onChange={(value) =>
                              handleRowChange(row.id, "complexity", value)
                            }
                            options={["Low", "Medium", "High"]}
                            placeholder="Complexity"
                          />
                        </td>
                        <td>
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
                                <line x1="10" x2="10" y1="11" y2="17"></line>
                                <line x1="14" x2="14" y1="11" y2="17"></line>
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
                {rows.length} {rows.length === 1 ? "entry" : "entries"} | Total
                Est (h):{" "}
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
                    (sum, row) => sum + (parseFloat(row.actualTimeWithAI) || 0),
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
                            placeholder={
                              row.sdlcStep
                                ? "Select Task"
                                : "Select SDLC Step first"
                            }
                            storageKey="sdlcTaskOptions"
                            disabled={!row.sdlcStep}
                          />
                        </MobileFieldValue>
                      </MobileCardField>

                      <MobileCardField>
                        <MobileFieldLabel>Task Category</MobileFieldLabel>
                        <MobileFieldValue>
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
                        </MobileFieldValue>
                      </MobileCardField>

                      <MobileCardField>
                        <MobileFieldLabel>Complexity</MobileFieldLabel>
                        <MobileFieldValue>
                          <CustomSelect
                            value={row.complexity}
                            onChange={(value) =>
                              handleRowChange(row.id, "complexity", value)
                            }
                            options={["Low", "Medium", "High"]}
                            placeholder="Select Complexity"
                          />
                        </MobileFieldValue>
                      </MobileCardField>

                      <MobileCardField>
                        <MobileFieldLabel>Quality Impact</MobileFieldLabel>
                        <MobileFieldValue>
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
              </TableMobile>
            </OldResponsiveTableContainer>
            
            {/* New ResponsiveTable implementation */}
            <div style={{ marginBottom: '1.5rem' }}>
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
                        placeholder="Select AI tools used"
                        storageKey="aiToolOptions"
                      />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
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
                        placeholder="Describe the task in detail"
                        rows={3}
                      />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <InnerLabel>AI PRODUCTIVITY</InnerLabel>
                      <CreatableComboBox
                        value={row.aiProductivity}
                        onChange={(value) =>
                          handleRowChange(row.id, "aiProductivity", value)
                        }
                        options={[
                          "Reduced Development Time",
                          "Automated Testing",
                          "Simplified Debugging",
                          "Enhanced Design Process",
                          "Improved Code Quality",
                          "Accelerated Research",
                          "Streamlined Documentation",
                          "Optimized Performance",
                        ]}
                        placeholder="How did AI improve productivity?"
                        storageKey="aiProductivityOptions"
                      />
                    </div>

                    <div>
                      <InnerLabel>HOURS SAVED</InnerLabel>
                      <Input
                        type="number"
                        min="0"
                        step="0.25"
                        value={row.hoursSaved}
                        onChange={(e) =>
                          handleRowChange(
                            row.id,
                            "hoursSaved",
                            e.target.value,
                          )
                        }
                        placeholder="Hours saved by AI"
                        required
                        style={{ width: "150px" }}
                      />
                    </div>
                  </div>
                )}
                expandedRows={expandedRows}
                onRowToggle={toggleRowExpand}
                emptyMessage="No entries. Click 'Add Entry' to start your report."
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
