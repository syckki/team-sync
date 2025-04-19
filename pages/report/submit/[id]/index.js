import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Head from 'next/head';
import { encryptData, importKeyFromBase64 } from '../../../../lib/cryptoUtils';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const FormHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 1rem;
  border-radius: 8px 8px 0 0;
  margin-bottom: 1rem;
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
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

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.errorBg};
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.successBg};
  border-radius: 4px;
  font-weight: 600;
`;

// Define SDLC steps and tasks
const sdlcSteps = [
  'Planning',
  'Analysis',
  'Design',
  'Implementation',
  'Testing & QA',
  'Deployment',
  'Maintenance'
];

const sdlcTasks = {
  'Planning': [
    'Requirements Gathering',
    'Project Scheduling',
    'Resource Allocation',
    'Risk Assessment',
    'Feasibility Study'
  ],
  'Analysis': [
    'Requirement Analysis',
    'Process Modeling',
    'Data Modeling',
    'Use Case Development',
    'Stakeholder Interviews'
  ],
  'Design': [
    'System Architecture',
    'UI/UX Design',
    'Database Design',
    'API Design',
    'Security Design'
  ],
  'Implementation': [
    'Coding/Programming',
    'Unit Testing',
    'Integration',
    'Code Review',
    'Documentation'
  ],
  'Testing & QA': [
    'Test Planning',
    'Test Case Development',
    'Functional Testing',
    'Performance Testing',
    'Security Testing',
    'User Acceptance Testing'
  ],
  'Deployment': [
    'Deployment Planning',
    'Environment Setup',
    'Data Migration',
    'Release Management',
    'Training'
  ],
  'Maintenance': [
    'Bug Fixing',
    'Performance Monitoring',
    'Feature Enhancements',
    'Security Patching',
    'Documentation Updates'
  ]
};

const SubmitPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [key, setKey] = useState('');
  const [teamName, setTeamName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState('');
  const [sdlcStep, setSdlcStep] = useState('');
  const [sdlcTask, setSdlcTask] = useState('');
  const [hours, setHours] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [aiToolUsed, setAiToolUsed] = useState('');
  const [aiProductivity, setAiProductivity] = useState('');
  const [hoursSaved, setHoursSaved] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Extract key from URL fragment on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hashKey = window.location.hash.slice(1);
      if (hashKey) {
        setKey(hashKey);
      }
    }
  }, []);
  
  // Handle submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate required fields
    if (!teamName.trim() || !memberName.trim() || !role.trim() || !sdlcStep || !sdlcTask || !hours || !taskDetails) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare report data
      const reportData = {
        type: 'productivity-report',
        teamName,
        memberName,
        role,
        timestamp: new Date().toISOString(),
        sdlcStep,
        sdlcTask,
        hours,
        taskDetails,
        aiToolUsed,
        aiProductivity,
        hoursSaved
      };
      
      // Get author ID from localStorage or create new one
      let authorId = localStorage.getItem('encrypted-app-author-id');
      if (!authorId) {
        authorId = `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem('encrypted-app-author-id', authorId);
      }
      
      // Add author ID to data
      reportData.authorId = authorId;
      
      // Convert to JSON string
      const jsonData = JSON.stringify(reportData);
      
      // Import the key if it's in the URL fragment
      let encryptionKey;
      if (key) {
        encryptionKey = await importKeyFromBase64(key);
      } else {
        throw new Error('Encryption key is required to submit a report');
      }
      
      // Encrypt the report data
      const { ciphertext, iv } = await encryptData(jsonData, encryptionKey);
      
      // Combine IV and ciphertext
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);
      
      // Upload the encrypted report
      const response = await fetch(`/api/upload?threadId=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Author-ID': authorId,
          'X-Report-Type': 'productivity'
        },
        body: combinedData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit productivity report');
      }
      
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        router.push(`/view/${id}#${key}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(`Failed to submit report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container>
      <Head>
        <title>Submit AI Productivity Report</title>
      </Head>
      
      <Title>AI Productivity Report Submission</Title>
      
      <form onSubmit={handleSubmit}>
        <FormHeader>
          <FormField>
            <Label htmlFor="teamName">Team Name</Label>
            <Input 
              type="text" 
              id="teamName" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)} 
              placeholder="e.g. Experience Delivery"
              required
            />
          </FormField>
          
          <FormField>
            <Label htmlFor="memberName">Team Member Name</Label>
            <Input 
              type="text" 
              id="memberName" 
              value={memberName} 
              onChange={(e) => setMemberName(e.target.value)} 
              placeholder="Your full name"
              required
            />
          </FormField>
          
          <FormField>
            <Label htmlFor="role">Role on the Team</Label>
            <Input 
              type="text" 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              placeholder="e.g. Software Developer, Project Manager"
              required
            />
          </FormField>
        </FormHeader>
        
        <FormField>
          <Label htmlFor="sdlcStep">SDLC Step</Label>
          <Select 
            id="sdlcStep" 
            value={sdlcStep} 
            onChange={(e) => {
              setSdlcStep(e.target.value);
              setSdlcTask(''); // Reset task when step changes
            }}
            required
          >
            <option value="">Select SDLC Step</option>
            {sdlcSteps.map(step => (
              <option key={step} value={step}>{step}</option>
            ))}
          </Select>
        </FormField>
        
        <FormField>
          <Label htmlFor="sdlcTask">SDLC Task</Label>
          <Select 
            id="sdlcTask" 
            value={sdlcTask} 
            onChange={(e) => setSdlcTask(e.target.value)}
            required
            disabled={!sdlcStep}
          >
            <option value="">Select Task</option>
            {sdlcStep && sdlcTasks[sdlcStep]?.map(task => (
              <option key={task} value={task}>{task}</option>
            ))}
          </Select>
        </FormField>
        
        <FormField>
          <Label htmlFor="hours">Hours Spent</Label>
          <Input 
            type="number" 
            id="hours" 
            min="0.5" 
            step="0.5"
            value={hours} 
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. 4.5"
            required
          />
        </FormField>
        
        <FormField>
          <Label htmlFor="taskDetails">Task Details</Label>
          <Input 
            type="text" 
            id="taskDetails" 
            value={taskDetails} 
            onChange={(e) => setTaskDetails(e.target.value)}
            placeholder="Brief description of the task"
            required
          />
        </FormField>
        
        <FormField>
          <Label htmlFor="aiToolUsed">AI Tool Used</Label>
          <Input 
            type="text" 
            id="aiToolUsed" 
            value={aiToolUsed} 
            onChange={(e) => setAiToolUsed(e.target.value)}
            placeholder="e.g. GitHub Copilot, ChatGPT"
          />
        </FormField>
        
        <FormField>
          <Label htmlFor="aiProductivity">Productivity Improvement</Label>
          <Input 
            type="text" 
            id="aiProductivity" 
            value={aiProductivity} 
            onChange={(e) => setAiProductivity(e.target.value)}
            placeholder="How did AI improve your productivity?"
          />
        </FormField>
        
        <FormField>
          <Label htmlFor="hoursSaved">Hours Saved</Label>
          <Input 
            type="number" 
            id="hoursSaved" 
            min="0" 
            step="0.5"
            value={hoursSaved} 
            onChange={(e) => setHoursSaved(e.target.value)}
            placeholder="Estimated hours saved by using AI"
          />
        </FormField>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>Report submitted successfully! Redirecting...</SuccessMessage>}
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Productivity Report'}
        </Button>
      </form>
    </Container>
  );
};

export default SubmitPage;
