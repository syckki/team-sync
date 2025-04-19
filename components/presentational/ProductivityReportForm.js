import { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
`;

const FormTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  text-align: center;
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

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.errorBg};
  color: ${({ theme }) => theme.colors.error};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const TableContainer = styled.div`
  margin-top: 1.5rem;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const TableCell = styled.td`
  padding: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const AddRowButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryDark};
  }
`;

const RemoveRowButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  
  &:hover {
    background-color: #c82333;
  }
`;

// SDLC steps and tasks
const sdlcSteps = [
  'Requirements Gathering',
  'System Design',
  'Implementation/Development',
  'Testing',
  'Deployment',
  'Maintenance'
];

const sdlcTasks = {
  'Requirements Gathering': [
    'Stakeholder Interviews',
    'Domain Analysis',
    'Requirement Documentation',
    'Use Case Development',
    'Requirement Validation'
  ],
  'System Design': [
    'Architecture Design',
    'UI/UX Design',
    'Database Design',
    'API Design',
    'Security Design'
  ],
  'Implementation/Development': [
    'Frontend Development',
    'Backend Development',
    'Database Implementation',
    'API Implementation',
    'Security Implementation',
    'Code Review'
  ],
  'Testing': [
    'Unit Testing',
    'Integration Testing',
    'System Testing',
    'Performance Testing',
    'Security Testing',
    'Usability Testing'
  ],
  'Deployment': [
    'Deployment Planning',
    'Environment Setup',
    'Deployment Automation',
    'Release Management',
    'Post-deployment Verification'
  ],
  'Maintenance': [
    'Bug Fixing',
    'Feature Enhancement',
    'Performance Optimization',
    'Security Patching',
    'Documentation Update'
  ]
};

const ProductivityReportForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    memberName: '',
    role: '',
    entries: [
      {
        sdlcStep: '',
        sdlcTask: '',
        hours: '',
        taskDetails: '',
        aiTool: '',
        productivity: '',
        hoursSaved: ''
      }
    ]
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...formData.entries];
    
    // Special handling for SDLC step change to reset the task
    if (field === 'sdlcStep') {
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value,
        sdlcTask: '' // Reset the SDLC task when step changes
      };
    } else {
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value
      };
    }
    
    setFormData(prevData => ({
      ...prevData,
      entries: updatedEntries
    }));
  };
  
  const addEntry = () => {
    setFormData(prevData => ({
      ...prevData,
      entries: [
        ...prevData.entries,
        {
          sdlcStep: '',
          sdlcTask: '',
          hours: '',
          taskDetails: '',
          aiTool: '',
          productivity: '',
          hoursSaved: ''
        }
      ]
    }));
  };
  
  const removeEntry = (index) => {
    if (formData.entries.length <= 1) return; // Keep at least one entry
    
    const updatedEntries = formData.entries.filter((_, i) => i !== index);
    setFormData(prevData => ({
      ...prevData,
      entries: updatedEntries
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <FormContainer>
      <FormTitle>AI Productivity Report</FormTitle>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            type="text"
            id="teamName"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            placeholder="e.g., Experience Delivery"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="memberName">Team Member Name</Label>
          <Input
            type="text"
            id="memberName"
            name="memberName"
            value={formData.memberName}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="role">Role on the Team</Label>
          <Input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Developer, Designer, Project Manager"
            required
          />
        </FormGroup>
        
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>SDLC Step</TableHeaderCell>
                <TableHeaderCell>SDLC Task</TableHeaderCell>
                <TableHeaderCell>Hours Spent</TableHeaderCell>
                <TableHeaderCell>Task Details</TableHeaderCell>
                <TableHeaderCell>AI Tool Used</TableHeaderCell>
                <TableHeaderCell>AI Productivity Observed</TableHeaderCell>
                <TableHeaderCell>Hours Saved</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {formData.entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={entry.sdlcStep}
                      onChange={(e) => handleEntryChange(index, 'sdlcStep', e.target.value)}
                      required
                    >
                      <option value="">Select SDLC Step</option>
                      {sdlcSteps.map(step => (
                        <option key={step} value={step}>{step}</option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={entry.sdlcTask}
                      onChange={(e) => handleEntryChange(index, 'sdlcTask', e.target.value)}
                      required
                      disabled={!entry.sdlcStep}
                    >
                      <option value="">Select SDLC Task</option>
                      {entry.sdlcStep && sdlcTasks[entry.sdlcStep].map(task => (
                        <option key={task} value={task}>{task}</option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={entry.hours}
                      onChange={(e) => handleEntryChange(index, 'hours', e.target.value)}
                      placeholder="Hours"
                      min="0"
                      step="0.5"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextArea
                      value={entry.taskDetails}
                      onChange={(e) => handleEntryChange(index, 'taskDetails', e.target.value)}
                      placeholder="Describe the task in detail"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={entry.aiTool}
                      onChange={(e) => handleEntryChange(index, 'aiTool', e.target.value)}
                      placeholder="e.g., ChatGPT, Claude"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <TextArea
                      value={entry.productivity}
                      onChange={(e) => handleEntryChange(index, 'productivity', e.target.value)}
                      placeholder="Describe how AI improved productivity"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={entry.hoursSaved}
                      onChange={(e) => handleEntryChange(index, 'hoursSaved', e.target.value)}
                      placeholder="Hours saved"
                      min="0"
                      step="0.5"
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <RemoveRowButton
                      type="button"
                      onClick={() => removeEntry(index)}
                      disabled={formData.entries.length <= 1}
                    >
                      Remove
                    </RemoveRowButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
        
        <AddRowButton type="button" onClick={addEntry}>
          Add Row
        </AddRowButton>
        
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Report'}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default ProductivityReportForm;