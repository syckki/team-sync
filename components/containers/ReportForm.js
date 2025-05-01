import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import CustomSelect from "../../components/presentational/CustomSelect";
import CreatableComboBox from "../../components/presentational/CreatableComboBox";
import CreatableMultiSelect from "../../components/presentational/CreatableMultiSelect";
import AutoResizeTextArea from "../../components/presentational/AutoResizeTextArea";

// Import styled components
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

// Table components for form entries
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

// Constants for dropdown options
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

// Helper function to round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
const roundToQuarterHour = (time) => {
  const value = parseFloat(time) || 0;
  return (Math.round(value * 4) / 4).toFixed(2);
};

const ReportForm = ({ 
  teamName,
  teamMember,
  teamMemberOptions,
  setTeamMember,
  setTeamMemberOptions,
  teamRole,
  setTeamRole,
  rows,
  setRows,
  expandedRows,
  setExpandedRows,
  onSubmit,
  error,
  success,
  isSubmitting
}) => {
  const router = useRouter();
  
  const handleSDLCStepChange = (id, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? { ...row, sdlcStep: value, sdlcTask: "" } // Reset task when step changes
          : row,
      ),
    );
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
            const estimatedTime = parseFloat(updatedRow.estimatedTimeWithoutAI);
            const actualTime = parseFloat(updatedRow.actualTimeWithAI);

            if (!isNaN(estimatedTime) && !isNaN(actualTime)) {
              updatedRow.timeSaved = (
                Math.round((estimatedTime - actualTime) * 100) / 100
              ).toFixed(2);
            }
          }

          return updatedRow;
        }
        return row;
      }),
    );
  };
  
  const addRow = () => {
    setRows([
      ...rows,
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
  
  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };
  
  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  const validateForm = () => {
    // Check if team info is filled
    if (!teamName || !teamMember || !teamRole) {
      return false;
    }

    // Check if at least one row has required fields
    return rows.some(
      (row) =>
        row.platform &&
        row.sdlcStep &&
        row.estimatedTimeWithoutAI &&
        row.actualTimeWithAI &&
        row.aiToolUsed.length > 0
    );
  };
  
  return (
    <form onSubmit={onSubmit}>
      {success && (
        <SuccessMessage>
          Report submitted successfully! You can submit another report or return to
          the thread.
        </SuccessMessage>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <TeamFormSection>
        <FormGroup>
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            type="text"
            id="teamName"
            value={teamName}
            readOnly
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="teamMember">Team Member</Label>
          <CreatableComboBox
            value={teamMember}
            onChange={setTeamMember}
            options={teamMemberOptions}
            placeholder="Enter or select your name"
            storageKey="teamMemberOptions"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="teamRole">Team Role</Label>
          <CustomSelect
            value={teamRole}
            onChange={setTeamRole}
            options={[
              "Product Manager",
              "Project Manager",
              "Software Engineer",
              "Frontend Developer",
              "Backend Developer",
              "DevOps Engineer",
              "Data Scientist",
              "UX Designer",
              "QA Engineer",
              "Technical Writer",
              "Technical Lead",
              "Engineering Manager",
            ]}
            placeholder="Select your role"
          />
        </FormGroup>
      </TeamFormSection>

      <ResponsiveTable>
        <TableDesktop>
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              <th>Platform</th>
              <th>Project</th>
              <th>SDLC Phase</th>
              <th style={{ width: "80px" }}>Est (h)</th>
              <th style={{ width: "80px" }}>Act (h)</th>
              <th style={{ width: "80px" }}>Saved (h)</th>
              <th style={{ width: "40px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <React.Fragment key={row.id}>
                <tr className={expandedRows[row.id] ? "expanded" : ""}>
                  <td>
                    <div
                      className="expand-icon"
                      onClick={() => toggleRowExpansion(row.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="20"
                        height="20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </td>
                  <td>
                    <CustomSelect
                      value={row.platform}
                      onChange={(value) =>
                        handleRowChange(row.id, "platform", value)
                      }
                      options={[
                        "GitHub",
                        "GitLab",
                        "Bitbucket",
                        "Azure DevOps",
                        "AWS",
                        "GCP",
                        "Azure",
                        "Local/IDE",
                        "JupyterLab",
                        "VSCode",
                        "IntelliJ",
                        "Other",
                      ]}
                      placeholder="Select platform"
                    />
                  </td>
                  <td>
                    <CreatableComboBox
                      value={row.projectInitiative}
                      onChange={(value) =>
                        handleRowChange(row.id, "projectInitiative", value)
                      }
                      options={[
                        "Project Alpha",
                        "Project Beta",
                        "Customer Portal",
                        "Admin Dashboard",
                        "Mobile App",
                        "API Gateway",
                        "Data Migration",
                        "Legacy System",
                        "Marketing Website",
                        "Internal Tools",
                      ]}
                      placeholder="Enter project name"
                      storageKey="projectOptions"
                    />
                  </td>
                  <td>
                    <CustomSelect
                      value={row.sdlcStep}
                      onChange={(value) =>
                        handleSDLCStepChange(row.id, value)
                      }
                      options={sdlcSteps}
                      placeholder="Select SDLC phase"
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
                      placeholder="0.00"
                      style={{ width: "100%" }}
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
                      placeholder="0.00"
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={row.timeSaved}
                      readOnly
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <DeleteButton
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      title="Delete row"
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
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </DeleteButton>
                  </td>
                </tr>
                {expandedRows[row.id] && (
                  <tr className="detail-row">
                    <td colSpan="8">
                      <div style={{ padding: "1rem" }}>
                        <div
                          style={{
                            display: "grid",
                            gap: "1rem",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(250px, 1fr))",
                          }}
                        >
                          <FormGroup>
                            <InnerLabel>SDLC Task</InnerLabel>
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
                              placeholder="Select task"
                              disabled={!row.sdlcStep}
                            />
                          </FormGroup>

                          <FormGroup>
                            <InnerLabel>Task Category</InnerLabel>
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
                                "Code Generation",
                                "Code Review",
                                "Testing",
                                "Documentation",
                                "Research",
                                "Planning",
                                "Debugging",
                                "Analysis",
                                "Design",
                                "Communication",
                              ]}
                              placeholder="Enter category"
                              storageKey="taskCategoryOptions"
                            />
                          </FormGroup>

                          <FormGroup>
                            <InnerLabel>Complexity</InnerLabel>
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
                              placeholder="Select complexity"
                            />
                          </FormGroup>

                          <FormGroup>
                            <InnerLabel>Quality Impact</InnerLabel>
                            <CustomSelect
                              value={row.qualityImpact}
                              onChange={(value) =>
                                handleRowChange(
                                  row.id,
                                  "qualityImpact",
                                  value,
                                )
                              }
                              options={[
                                "Significant Improvement",
                                "Moderate Improvement",
                                "No Change",
                                "Slightly Worse",
                                "Significantly Worse",
                              ]}
                              placeholder="Select impact"
                            />
                          </FormGroup>
                        </div>

                        <FormGroup style={{ marginTop: "1rem" }}>
                          <InnerLabel>AI Tools Used</InnerLabel>
                          <CreatableMultiSelect
                            value={row.aiToolUsed}
                            onChange={(value) =>
                              handleRowChange(row.id, "aiToolUsed", value)
                            }
                            options={[
                              "Copilot",
                              "GPT-4",
                              "Claude",
                              "Llama",
                              "Bard",
                              "Perplexity AI",
                              "Code Interpreter",
                              "Bing",
                              "CodeWhisperer",
                              "ChatGPT",
                              "Custom AI",
                            ]}
                            placeholder="Select or enter AI tools used"
                            storageKey="aiToolOptions"
                          />
                        </FormGroup>

                        <FormGroup style={{ marginTop: "1rem" }}>
                          <InnerLabel>Task Details</InnerLabel>
                          <AutoResizeTextArea
                            value={row.taskDetails}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "taskDetails",
                                e.target.value,
                              )
                            }
                            placeholder="Describe what you were working on"
                            rows={3}
                          />
                        </FormGroup>

                        <FormGroup style={{ marginTop: "1rem" }}>
                          <InnerLabel>How AI Helped</InnerLabel>
                          <AutoResizeTextArea
                            value={row.notesHowAIHelped}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "notesHowAIHelped",
                                e.target.value,
                              )
                            }
                            placeholder="Describe how AI helped with this task"
                            rows={3}
                          />
                        </FormGroup>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </TableDesktop>
        
        <TableMobile>
          {rows.map((row, index) => (
            <MobileCard key={row.id}>
              <MobileCardHeader>
                {row.projectInitiative || `Task ${index + 1}`}
              </MobileCardHeader>
              <MobileCardBody>
                <MobileCardField>
                  <MobileFieldLabel>Platform</MobileFieldLabel>
                  <CustomSelect
                    value={row.platform}
                    onChange={(value) =>
                      handleRowChange(row.id, "platform", value)
                    }
                    options={[
                      "GitHub",
                      "GitLab",
                      "Bitbucket",
                      "Azure DevOps",
                      "AWS",
                      "GCP",
                      "Azure",
                      "Local/IDE",
                      "JupyterLab",
                      "VSCode",
                      "IntelliJ",
                      "Other",
                    ]}
                    placeholder="Select platform"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Project/Initiative</MobileFieldLabel>
                  <CreatableComboBox
                    value={row.projectInitiative}
                    onChange={(value) =>
                      handleRowChange(row.id, "projectInitiative", value)
                    }
                    options={[
                      "Project Alpha",
                      "Project Beta",
                      "Customer Portal",
                      "Admin Dashboard",
                      "Mobile App",
                      "API Gateway",
                      "Data Migration",
                      "Legacy System",
                      "Marketing Website",
                      "Internal Tools",
                    ]}
                    placeholder="Enter project name"
                    storageKey="projectOptions"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>SDLC Phase</MobileFieldLabel>
                  <CustomSelect
                    value={row.sdlcStep}
                    onChange={(value) =>
                      handleSDLCStepChange(row.id, value)
                    }
                    options={sdlcSteps}
                    placeholder="Select SDLC phase"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>SDLC Task</MobileFieldLabel>
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
                    placeholder="Select task"
                    disabled={!row.sdlcStep}
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Task Category</MobileFieldLabel>
                  <CreatableComboBox
                    value={row.taskCategory}
                    onChange={(value) =>
                      handleRowChange(row.id, "taskCategory", value)
                    }
                    options={[
                      "Code Generation",
                      "Code Review",
                      "Testing",
                      "Documentation",
                      "Research",
                      "Planning",
                      "Debugging",
                      "Analysis",
                      "Design",
                      "Communication",
                    ]}
                    placeholder="Enter category"
                    storageKey="taskCategoryOptions"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Estimated Time without AI (h)</MobileFieldLabel>
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
                    placeholder="0.00"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Actual Time with AI (h)</MobileFieldLabel>
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
                    placeholder="0.00"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Time Saved (h)</MobileFieldLabel>
                  <Input
                    type="number"
                    value={row.timeSaved}
                    readOnly
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Complexity</MobileFieldLabel>
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
                    placeholder="Select complexity"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Quality Impact</MobileFieldLabel>
                  <CustomSelect
                    value={row.qualityImpact}
                    onChange={(value) =>
                      handleRowChange(row.id, "qualityImpact", value)
                    }
                    options={[
                      "Significant Improvement",
                      "Moderate Improvement",
                      "No Change",
                      "Slightly Worse",
                      "Significantly Worse",
                    ]}
                    placeholder="Select impact"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>AI Tools Used</MobileFieldLabel>
                  <CreatableMultiSelect
                    value={row.aiToolUsed}
                    onChange={(value) =>
                      handleRowChange(row.id, "aiToolUsed", value)
                    }
                    options={[
                      "Copilot",
                      "GPT-4",
                      "Claude",
                      "Llama",
                      "Bard",
                      "Perplexity AI",
                      "Code Interpreter",
                      "Bing",
                      "CodeWhisperer",
                      "ChatGPT",
                      "Custom AI",
                    ]}
                    placeholder="Select or enter AI tools used"
                    storageKey="aiToolOptions"
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>Task Details</MobileFieldLabel>
                  <AutoResizeTextArea
                    value={row.taskDetails}
                    onChange={(e) =>
                      handleRowChange(row.id, "taskDetails", e.target.value)
                    }
                    placeholder="Describe what you were working on"
                    rows={3}
                  />
                </MobileCardField>
                
                <MobileCardField>
                  <MobileFieldLabel>How AI Helped</MobileFieldLabel>
                  <AutoResizeTextArea
                    value={row.notesHowAIHelped}
                    onChange={(e) =>
                      handleRowChange(
                        row.id,
                        "notesHowAIHelped",
                        e.target.value,
                      )
                    }
                    placeholder="Describe how AI helped with this task"
                    rows={3}
                  />
                </MobileCardField>
                
                <MobileActions>
                  <DeleteButton
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    title="Delete row"
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
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </DeleteButton>
                </MobileActions>
              </MobileCardBody>
            </MobileCard>
          ))}
        </TableMobile>
      </ResponsiveTable>

      <ButtonRow>
        <ActionButton
          type="button"
          onClick={addRow}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </AddIcon>
          Add Task
        </ActionButton>

        <SubmitButton
          type="submit"
          disabled={isSubmitting || !validateForm()}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </SubmitButton>
      </ButtonRow>
      
      <Link href={`/view/${router.query.id}`} legacyBehavior={false}>
        <BackLinkText>← Back to Thread</BackLinkText>
      </Link>
    </form>
  );
};

export default ReportForm;