import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';
import { importKeyFromBase64, encryptData, decryptData } from '../../../lib/cryptoUtils';

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const HeaderBanner = styled.div`
  background-color: #4e7fff;
  color: white;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const PageSubtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
  color: white;
`;

const ContentContainer = styled.div`
  padding: 0 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
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
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
  
  &:read-only {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }
`;

const ComboBoxContainer = styled.div`
  position: relative;
  width: 100%;
`;

const ComboBoxInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

const ComboBoxDropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: white;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ComboBoxOption = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  
  &:hover {
    background-color: #f1f5f9;
  }
  
  ${props => props.$isSelected && `
    background-color: #f8fafc;
    font-weight: 600;
  `}
`;

const ComboBoxCreateOption = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  border-top: 1px dashed #e2e8f0;
  color: #4e7fff;
  font-weight: 600;
  
  &:hover {
    background-color: #f1f5f9;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #4e7fff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
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

// Styled components for the responsive table
const ResponsiveTable = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const TableDesktop = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  
  th, td {
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
    text-align: left;
  }
  
  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #333;
    font-size: 0.85rem;
    text-transform: uppercase;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
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

// Keep the original table styled for backward compatibility
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  
  th, td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.75rem;
    text-align: left;
  }
  
  th {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    font-weight: 600;
  }
  
  tr:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
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
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  background-color: ${props => props.primary ? '#4e7fff' : '#2196f3'};
  color: white;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#3d6bf3' : '#0b7dda'};
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const ReportList = styled.div`
  margin-top: 2rem;
`;

const ReportCard = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ReportTitle = styled.h3`
  margin: 0;
  color: #4e7fff;
  font-size: 1.2rem;
`;

const ReportDate = styled.span`
  color: #718096;
  font-size: 0.9rem;
`;

const ReportContent = styled.div`
  margin-top: 1rem;
  line-height: 1.5;
`;

const TeamInfo = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  
  p {
    margin: 0.5rem 0;
    color: #2d3748;
  }
`;

const TeamInfoLabel = styled.span`
  font-weight: 600;
  margin-right: 0.5rem;
  color: #4a5568;
`;

const sdlcSteps = [
  "Requirements",
  "Design",
  "Implementation",
  "Testing",
  "Deployment",
  "Maintenance"
];

const sdlcTasksMap = {
  "Requirements": [
    "Requirement Gathering",
    "User Story Creation",
    "Feasibility Analysis",
    "Requirement Documentation",
    "Stakeholder Interviews"
  ],
  "Design": [
    "Architecture Design",
    "Database Design",
    "UI/UX Design",
    "API Design",
    "System Modeling"
  ],
  "Implementation": [
    "Frontend Development",
    "Backend Development",
    "Database Implementation",
    "API Development",
    "Integration"
  ],
  "Testing": [
    "Unit Testing",
    "Integration Testing",
    "System Testing",
    "Performance Testing",
    "User Acceptance Testing"
  ],
  "Deployment": [
    "Deployment Planning",
    "Environment Setup",
    "Data Migration",
    "Release Management",
    "Deployment Execution"
  ],
  "Maintenance": [
    "Bug Fixing",
    "Feature Enhancement",
    "Performance Optimization",
    "Security Updates",
    "Documentation Updates"
  ]
};

// Creatable ComboBox Component
const CreatableComboBox = ({ value, onChange, options = [], placeholder }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  
  // Update filtered options when input changes
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => 
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);
  
  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };
  
  // Handle option select
  const handleOptionSelect = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };
  
  // Handle create option
  const handleCreateOption = () => {
    onChange(inputValue);
    setIsOpen(false);
    
    // Add to local storage if it's a new option
    if (!options.includes(inputValue) && inputValue.trim() !== '') {
      const updatedOptions = [...options, inputValue];
      localStorage.setItem('teamMemberOptions', JSON.stringify(updatedOptions));
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle key navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen) {
        handleCreateOption();
      }
    } else if (e.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };
  
  return (
    <ComboBoxContainer ref={inputRef}>
      <ComboBoxInput
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {isOpen && (
        <ComboBoxDropdown>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <ComboBoxOption
                key={index}
                onClick={() => handleOptionSelect(option)}
                $isSelected={option === inputValue}
              >
                {option}
              </ComboBoxOption>
            ))
          ) : (
            <ComboBoxCreateOption onClick={handleCreateOption}>
              Create "{inputValue}"
            </ComboBoxCreateOption>
          )}
          
          {filteredOptions.length > 0 && !filteredOptions.includes(inputValue) && inputValue.trim() !== '' && (
            <ComboBoxCreateOption onClick={handleCreateOption}>
              Create "{inputValue}"
            </ComboBoxCreateOption>
          )}
        </ComboBoxDropdown>
      )}
    </ComboBoxContainer>
  );
};

const ReportPage = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isViewMode = view === 'true';
  
  const [key, setKey] = useState(null);
  const [threadTitle, setThreadTitle] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMember, setTeamMember] = useState('');
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [teamRole, setTeamRole] = useState('');
  const [rows, setRows] = useState([{
    id: Date.now(),
    sdlcStep: '',
    sdlcTask: '',
    hours: '',
    taskDetails: '',
    aiTool: '',
    aiProductivity: '',
    hoursSaved: ''
  }]);
  
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Extract the key from URL fragment on mount
  useEffect(() => {
    if (!router.isReady) return;
    
    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);
      
      if (!fragment) {
        setError('No encryption key found. Please return to the thread and use the link provided there.');
        return;
      }
      
      setKey(fragment);
      
      // Load team member options from localStorage if available
      try {
        const savedOptions = localStorage.getItem('teamMemberOptions');
        if (savedOptions) {
          setTeamMemberOptions(JSON.parse(savedOptions));
        }
      } catch (localStorageErr) {
        console.error('Error loading team member options:', localStorageErr);
        // Non-critical error, continue without saved options
      }
      
      // If in view mode, fetch the reports
      if (isViewMode) {
        fetchReports(fragment);
      }
    } catch (err) {
      console.error('Error parsing key:', err);
      setError('Could not retrieve encryption key from URL.');
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, isViewMode, id]);
  
  // Fetch thread title when key is available
  useEffect(() => {
    if (key && id) {
      const authorId = localStorage.getItem('encrypted-app-author-id');
      if (authorId) {
        fetch(`/api/download?threadId=${id}&authorId=${authorId}`)
          .then(response => response.json())
          .then(data => {
            setThreadTitle(data.threadTitle || id);
            setTeamName(data.threadTitle || id);
          })
          .catch(err => {
            console.error('Error fetching thread data:', err);
          });
      }
    }
  }, [key, id]);
  
  const fetchReports = async (keyValue) => {
    try {
      setIsLoading(true);
      
      // Get author ID from localStorage
      const authorId = localStorage.getItem('encrypted-app-author-id');
      if (!authorId) {
        throw new Error('Author ID not found. Please go back to the thread view.');
      }
      
      // Fetch all messages from the thread
      const response = await fetch(`/api/download?threadId=${id}&authorId=${authorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch thread data');
      }
      
      const threadData = await response.json();
      
      // Import the key from fragment
      const cryptoKey = await importKeyFromBase64(keyValue);
      
      // Filter and decrypt reports
      const decryptedReports = [];
      
      for (const message of threadData.messages) {
        // Check if this message is marked as a report in metadata
        if (message.metadata && message.metadata.isReport) {
          try {
            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), c => c.charCodeAt(0));
            
            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);
            
            // Decrypt the data
            const decrypted = await decryptData(ciphertext, cryptoKey, iv);
            
            // Parse the decrypted JSON
            const content = JSON.parse(new TextDecoder().decode(decrypted));
            
            decryptedReports.push({
              id: message.index,
              timestamp: message.metadata.timestamp || new Date().toISOString(),
              authorId: message.metadata.authorId,
              isCurrentUser: message.metadata.authorId === authorId,
              ...content
            });
          } catch (err) {
            console.error('Error decrypting report:', err);
          }
        }
      }
      
      // Sort reports by timestamp, newest first
      decryptedReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setReports(decryptedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSDLCStepChange = (id, value) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === id 
          ? { ...row, sdlcStep: value, sdlcTask: '' } // Reset task when step changes
          : row
      )
    );
  };
  
  const handleRowChange = (id, field, value) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === id 
          ? { ...row, [field]: value }
          : row
      )
    );
  };
  
  const addRow = () => {
    setRows(prevRows => [
      ...prevRows, 
      {
        id: Date.now(),
        sdlcStep: '',
        sdlcTask: '',
        hours: '',
        taskDetails: '',
        aiTool: '',
        aiProductivity: '',
        hoursSaved: ''
      }
    ]);
  };
  
  const removeRow = (id) => {
    setRows(prevRows => prevRows.filter(row => row.id !== id));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!key) {
        throw new Error('Encryption key not found');
      }
      
      if (!teamName.trim() || !teamMember.trim() || !teamRole.trim()) {
        throw new Error('Please fill in all team information fields');
      }
      
      // Validate rows
      for (const row of rows) {
        if (!row.sdlcStep || !row.sdlcTask || !row.hours || !row.taskDetails || 
            !row.aiTool || !row.aiProductivity || !row.hoursSaved) {
          throw new Error('Please fill in all fields for each productivity entry');
        }
      }
      
      // Get author ID from localStorage
      const authorId = localStorage.getItem('encrypted-app-author-id') || 
        `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Ensure author ID is saved
      localStorage.setItem('encrypted-app-author-id', authorId);
      
      // Create report data object
      const reportData = {
        type: 'aiProductivityReport',
        teamName,
        teamMember,
        teamRole,
        entries: rows,
        timestamp: new Date().toISOString()
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(reportData);
      
      // Import the key
      const cryptoKey = await importKeyFromBase64(key);
      
      // Encrypt the report data
      const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);
      
      // Combine IV and ciphertext
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);
      
      // Submit the encrypted report
      const response = await fetch(`/api/reports?threadId=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Author-ID': authorId
        },
        body: combinedData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit AI productivity report');
      }
      
      setSuccess(true);
      
      // Reset form after successful submission
      setRows([{
        id: Date.now(),
        sdlcStep: '',
        sdlcTask: '',
        hours: '',
        taskDetails: '',
        aiTool: '',
        aiProductivity: '',
        hoursSaved: ''
      }]);
      
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(`Failed to submit report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (isLoading) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }
  
  return (
    <>
      <Head>
        <title>{isViewMode ? 'View AI Productivity Reports' : 'Submit AI Productivity Report'}</title>
        <meta name="description" content="AI Productivity Reporting for Secure Teams" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Container>
        <HeaderBanner>
          <PageTitle>AI Productivity Report</PageTitle>
          <PageSubtitle>Track and measure your productivity gains from using AI tools</PageSubtitle>
        </HeaderBanner>
        
        <ContentContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            Your AI productivity report has been submitted successfully!
          </SuccessMessage>
        )}
        
        {isViewMode ? (
          // Reports viewing mode
          <>
            <h3>Team Reports for: {threadTitle}</h3>
            
            {reports.length === 0 ? (
              <p>No productivity reports have been submitted yet.</p>
            ) : (
              <ReportList>
                {reports.map((report, index) => (
                  <ReportCard key={index}>
                    <ReportHeader>
                      <ReportTitle>Report from {report.teamMember} ({report.teamRole})</ReportTitle>
                      <ReportDate>{formatDate(report.timestamp)}</ReportDate>
                    </ReportHeader>
                    
                    <ReportContent>
                      <ResponsiveTable>
                        {/* Desktop Table View */}
                        <TableDesktop>
                          <thead>
                            <tr>
                              <th>SDLC Step</th>
                              <th>SDLC Task</th>
                              <th>Hours</th>
                              <th>Task Details</th>
                              <th>AI Tool</th>
                              <th>AI Productivity</th>
                              <th>Hours Saved</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.entries.map((entry, i) => (
                              <tr key={i}>
                                <td>{entry.sdlcStep}</td>
                                <td>{entry.sdlcTask}</td>
                                <td>{entry.hours}</td>
                                <td>{entry.taskDetails}</td>
                                <td>{entry.aiTool}</td>
                                <td>{entry.aiProductivity}</td>
                                <td>{entry.hoursSaved}</td>
                              </tr>
                            ))}
                          </tbody>
                        </TableDesktop>
                        
                        {/* Mobile Card View */}
                        <TableMobile>
                          {report.entries.map((entry, i) => (
                            <MobileCard key={i}>
                              <MobileCardHeader>
                                Record #{i + 1}
                              </MobileCardHeader>
                              <MobileCardBody>
                                <MobileCardField>
                                  <MobileFieldLabel>SDLC Step</MobileFieldLabel>
                                  <MobileFieldValue>{entry.sdlcStep}</MobileFieldValue>
                                </MobileCardField>
                                
                                <MobileCardField>
                                  <MobileFieldLabel>SDLC Task</MobileFieldLabel>
                                  <MobileFieldValue>{entry.sdlcTask}</MobileFieldValue>
                                </MobileCardField>
                                
                                <MobileCardField>
                                  <MobileFieldLabel>Hours</MobileFieldLabel>
                                  <MobileFieldValue>{entry.hours}</MobileFieldValue>
                                </MobileCardField>
                                
                                <MobileCardField>
                                  <MobileFieldLabel>Task Details</MobileFieldLabel>
                                  <MobileFieldValue>{entry.taskDetails}</MobileFieldValue>
                                </MobileCardField>
                                
                                <MobileCardField>
                                  <MobileFieldLabel>AI Tool Used</MobileFieldLabel>
                                  <MobileFieldValue>{entry.aiTool}</MobileFieldValue>
                                </MobileCardField>
                                
                                <MobileCardField>
                                  <MobileFieldLabel>AI Productivity</MobileFieldLabel>
                                  <MobileFieldValue>{entry.aiProductivity}</MobileFieldValue>
                                </MobileCardField>
                                
                                <MobileCardField>
                                  <MobileFieldLabel>Hours Saved</MobileFieldLabel>
                                  <MobileFieldValue>{entry.hoursSaved}</MobileFieldValue>
                                </MobileCardField>
                              </MobileCardBody>
                            </MobileCard>
                          ))}
                        </TableMobile>
                      </ResponsiveTable>
                    </ReportContent>
                  </ReportCard>
                ))}
              </ReportList>
            )}
          </>
        ) : (
          // Report submission form
          <>
            {!success && (
              <ReportForm onSubmit={handleSubmit}>
                <h3>Team Information</h3>
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
                      placeholder="Enter your name or select from previous entries"
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
                
                <h3>AI Productivity Details</h3>
                <ResponsiveTable>
                  {/* Desktop Table View */}
                  <TableDesktop>
                    <thead>
                      <tr>
                        <th>SDLC Step</th>
                        <th>SDLC Task</th>
                        <th>Hours</th>
                        <th>Task Details</th>
                        <th>AI Tool Used</th>
                        <th>AI Productivity</th>
                        <th>Hours Saved</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <Select 
                              value={row.sdlcStep}
                              onChange={(e) => handleSDLCStepChange(row.id, e.target.value)}
                              required
                            >
                              <option value="">Select Step</option>
                              {sdlcSteps.map(step => (
                                <option key={step} value={step}>{step}</option>
                              ))}
                            </Select>
                          </td>
                          <td>
                            <Select
                              value={row.sdlcTask}
                              onChange={(e) => handleRowChange(row.id, 'sdlcTask', e.target.value)}
                              required
                              disabled={!row.sdlcStep}
                            >
                              <option value="">Select Task</option>
                              {row.sdlcStep && sdlcTasksMap[row.sdlcStep].map(task => (
                                <option key={task} value={task}>{task}</option>
                              ))}
                            </Select>
                          </td>
                          <td>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={row.hours}
                              onChange={(e) => handleRowChange(row.id, 'hours', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              value={row.taskDetails}
                              onChange={(e) => handleRowChange(row.id, 'taskDetails', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              value={row.aiTool}
                              onChange={(e) => handleRowChange(row.id, 'aiTool', e.target.value)}
                              required
                              placeholder="e.g., ChatGPT, GitHub Copilot"
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              value={row.aiProductivity}
                              onChange={(e) => handleRowChange(row.id, 'aiProductivity', e.target.value)}
                              required
                              placeholder="Describe productivity gain"
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={row.hoursSaved}
                              onChange={(e) => handleRowChange(row.id, 'hoursSaved', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            {rows.length > 1 && (
                              <DeleteButton onClick={() => removeRow(row.id)}>
                                X
                              </DeleteButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </TableDesktop>

                  {/* Mobile Card View */}
                  <TableMobile>
                    {rows.map((row) => (
                      <MobileCard key={row.id}>
                        <MobileCardHeader>
                          Record #{rows.indexOf(row) + 1}
                        </MobileCardHeader>
                        <MobileCardBody>
                          <MobileCardField>
                            <MobileFieldLabel>SDLC Step</MobileFieldLabel>
                            <MobileFieldValue>
                              <Select 
                                value={row.sdlcStep}
                                onChange={(e) => handleSDLCStepChange(row.id, e.target.value)}
                                required
                              >
                                <option value="">Select Step</option>
                                {sdlcSteps.map(step => (
                                  <option key={step} value={step}>{step}</option>
                                ))}
                              </Select>
                            </MobileFieldValue>
                          </MobileCardField>
                          
                          <MobileCardField>
                            <MobileFieldLabel>SDLC Task</MobileFieldLabel>
                            <MobileFieldValue>
                              <Select
                                value={row.sdlcTask}
                                onChange={(e) => handleRowChange(row.id, 'sdlcTask', e.target.value)}
                                required
                                disabled={!row.sdlcStep}
                              >
                                <option value="">Select Task</option>
                                {row.sdlcStep && sdlcTasksMap[row.sdlcStep].map(task => (
                                  <option key={task} value={task}>{task}</option>
                                ))}
                              </Select>
                            </MobileFieldValue>
                          </MobileCardField>
                          
                          <MobileCardField>
                            <MobileFieldLabel>Hours</MobileFieldLabel>
                            <MobileFieldValue>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={row.hours}
                                onChange={(e) => handleRowChange(row.id, 'hours', e.target.value)}
                                required
                              />
                            </MobileFieldValue>
                          </MobileCardField>
                          
                          <MobileCardField>
                            <MobileFieldLabel>Task Details</MobileFieldLabel>
                            <MobileFieldValue>
                              <Input
                                type="text"
                                value={row.taskDetails}
                                onChange={(e) => handleRowChange(row.id, 'taskDetails', e.target.value)}
                                required
                              />
                            </MobileFieldValue>
                          </MobileCardField>
                          
                          <MobileCardField>
                            <MobileFieldLabel>AI Tool Used</MobileFieldLabel>
                            <MobileFieldValue>
                              <Input
                                type="text"
                                value={row.aiTool}
                                onChange={(e) => handleRowChange(row.id, 'aiTool', e.target.value)}
                                required
                                placeholder="e.g., ChatGPT, GitHub Copilot"
                              />
                            </MobileFieldValue>
                          </MobileCardField>
                          
                          <MobileCardField>
                            <MobileFieldLabel>AI Productivity</MobileFieldLabel>
                            <MobileFieldValue>
                              <Input
                                type="text"
                                value={row.aiProductivity}
                                onChange={(e) => handleRowChange(row.id, 'aiProductivity', e.target.value)}
                                required
                                placeholder="Describe productivity gain"
                              />
                            </MobileFieldValue>
                          </MobileCardField>
                          
                          <MobileCardField>
                            <MobileFieldLabel>Hours Saved</MobileFieldLabel>
                            <MobileFieldValue>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={row.hoursSaved}
                                onChange={(e) => handleRowChange(row.id, 'hoursSaved', e.target.value)}
                                required
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
                  </TableMobile>
                </ResponsiveTable>
                
                <ButtonRow>
                  <ActionButton type="button" onClick={addRow}>
                    + Add Row
                  </ActionButton>
                  
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit AI Productivity Report'}
                  </SubmitButton>
                </ButtonRow>
              </ReportForm>
            )}
          </>
        )}
        
        <Link href={`/view/${id}`} legacyBehavior passHref>
          <BackLinkText>← Back to encrypted thread</BackLinkText>
        </Link>
        </ContentContainer>
      </Container>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return {
    props: {}
  };
}

export default ReportPage;