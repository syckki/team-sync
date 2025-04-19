import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Head from 'next/head';
import { decryptData, importKeyFromBase64 } from '../../../../lib/cryptoUtils';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const ReportCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const ReportHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ReportBody = styled.div`
  padding: 1rem;
`;

const ReportMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  font-size: 0.875rem;
  
  strong {
    color: ${({ theme }) => theme.colors.primary};
    margin-right: 0.5rem;
  }
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  th {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  tr:nth-child(even) td {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const SummarySection = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
`;

const SummaryTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  th {
    background-color: white;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.disabled};
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.errorBg};
  color: ${({ theme }) => theme.colors.error};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const NoReportsMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.disabled};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
`;

const ViewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [key, setKey] = useState('');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Extract key from URL fragment on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hashKey = window.location.hash.slice(1);
      if (hashKey) {
        setKey(hashKey);
      }
    }
  }, []);
  
  // Compile summary statistics
  const compileSummary = (reports) => {
    const summary = {
      totalReports: reports.length,
      totalHours: 0,
      totalHoursSaved: 0,
      sdlcBreakdown: {},
      aiTools: {}
    };
    
    reports.forEach(report => {
      // Add hours
      const hours = parseFloat(report.hours) || 0;
      summary.totalHours += hours;
      
      // Add hours saved
      const hoursSaved = parseFloat(report.hoursSaved) || 0;
      summary.totalHoursSaved += hoursSaved;
      
      // Count SDLC steps
      if (report.sdlcStep) {
        summary.sdlcBreakdown[report.sdlcStep] = (summary.sdlcBreakdown[report.sdlcStep] || 0) + hours;
      }
      
      // Count AI tools
      if (report.aiToolUsed) {
        summary.aiTools[report.aiToolUsed] = (summary.aiTools[report.aiToolUsed] || 0) + 1;
      }
    });
    
    return summary;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Load reports when key and id are available
  useEffect(() => {
    const fetchReports = async () => {
      if (!id || !key) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Import encryption key
        const encryptionKey = await importKeyFromBase64(key);
        
        // Fetch thread messages
        const response = await fetch(`/api/download?threadId=${id}&getAll=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch thread data');
        }
        
        const threadData = await response.json();
        
        if (!threadData || !threadData.messages || !Array.isArray(threadData.messages)) {
          throw new Error('Invalid thread data format');
        }
        
        // Filter and decrypt productivity reports
        const productivityReports = [];
        
        for (const message of threadData.messages) {
          if (message.metadata && message.metadata.reportType === 'productivity') {
            try {
              // Get encrypted data
              const encryptedDataResponse = await fetch(`/api/download?id=${message.id}`);
              
              if (!encryptedDataResponse.ok) {
                console.error(`Failed to fetch report data for message ${message.id}`);
                continue;
              }
              
              // Get the ArrayBuffer
              const encryptedBuffer = await encryptedDataResponse.arrayBuffer();
              
              // Extract IV (first 12 bytes) and ciphertext
              const iv = new Uint8Array(encryptedBuffer.slice(0, 12));
              const ciphertext = encryptedBuffer.slice(12);
              
              // Decrypt data
              const decryptedData = await decryptData(ciphertext, encryptionKey, iv);
              
              // Parse JSON
              const reportData = JSON.parse(decryptedData);
              
              if (reportData && reportData.type === 'productivity-report') {
                productivityReports.push({
                  ...reportData,
                  timestamp: reportData.timestamp || message.metadata.timestamp,
                  messageId: message.id
                });
              }
            } catch (decryptError) {
              console.error('Failed to decrypt report:', decryptError);
            }
          }
        }
        
        // Sort by timestamp (newest first)
        productivityReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setReports(productivityReports);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError(`Failed to load reports: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [id, key]);
  
  // Calculate summary if reports are available
  const summary = reports.length > 0 ? compileSummary(reports) : null;
  
  return (
    <Container>
      <Head>
        <title>View AI Productivity Reports</title>
      </Head>
      
      <Title>AI Productivity Reports</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {loading ? (
        <LoadingText>Loading reports...</LoadingText>
      ) : reports.length === 0 ? (
        <NoReportsMessage>
          No productivity reports have been submitted yet.
        </NoReportsMessage>
      ) : (
        <>
          {summary && (
            <SummarySection>
              <SummaryTitle>Summary Statistics</SummaryTitle>
              
              <ReportMeta>
                <MetaItem>
                  <strong>Total Reports:</strong> {summary.totalReports}
                </MetaItem>
                <MetaItem>
                  <strong>Total Hours Logged:</strong> {summary.totalHours.toFixed(1)}
                </MetaItem>
                <MetaItem>
                  <strong>Total Hours Saved:</strong> {summary.totalHoursSaved.toFixed(1)}
                </MetaItem>
                <MetaItem>
                  <strong>Productivity Improvement:</strong> {(summary.totalHoursSaved / summary.totalHours * 100).toFixed(0)}%
                </MetaItem>
              </ReportMeta>
              
              <SummaryTable>
                <thead>
                  <tr>
                    <th>SDLC Phase</th>
                    <th>Hours</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.sdlcBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([phase, hours]) => (
                      <tr key={phase}>
                        <td>{phase}</td>
                        <td>{hours.toFixed(1)}</td>
                        <td>{((hours / summary.totalHours) * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                </tbody>
              </SummaryTable>
            </SummarySection>
          )}
          
          {reports.map((report, index) => (
            <ReportCard key={index}>
              <ReportHeader>
                <ReportMeta>
                  <MetaItem>
                    <strong>Team:</strong> {report.teamName}
                  </MetaItem>
                  <MetaItem>
                    <strong>Member:</strong> {report.memberName}
                  </MetaItem>
                  <MetaItem>
                    <strong>Role:</strong> {report.role}
                  </MetaItem>
                  <MetaItem>
                    <strong>Submitted:</strong> {formatDate(report.timestamp)}
                  </MetaItem>
                </ReportMeta>
              </ReportHeader>
              
              <ReportBody>
                <ReportTable>
                  <thead>
                    <tr>
                      <th>SDLC Step</th>
                      <th>Task</th>
                      <th>Hours</th>
                      <th>Details</th>
                      <th>AI Tool</th>
                      <th>Productivity</th>
                      <th>Hours Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{report.sdlcStep}</td>
                      <td>{report.sdlcTask}</td>
                      <td>{report.hours}</td>
                      <td>{report.taskDetails}</td>
                      <td>{report.aiToolUsed || '-'}</td>
                      <td>{report.aiProductivity || '-'}</td>
                      <td>{report.hoursSaved || '-'}</td>
                    </tr>
                  </tbody>
                </ReportTable>
              </ReportBody>
            </ReportCard>
          ))}
        </>
      )}
    </Container>
  );
};

export default ViewPage;
