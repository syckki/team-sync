import React, { useState } from "react";
import styled from "styled-components";

// Styled components for the report
const ReportContainer = styled.div`
  margin: 1.5rem 0;
`;

const ReportTitle = styled.h2`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1px;
  
  @media (max-width: 640px) {
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TabButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.$active ? '#4e7fff' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#4a5568'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#4e7fff' : 'transparent'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.$active ? '#4e7fff' : '#f7fafc'};
  }
`;

const Section = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const FlexGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(${props => props.$columns || 2}, 1fr);
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
`;

const WordCloudContainer = styled.div`
  width: 100%;
  height: 400px;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const KeywordCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 1.5rem;
`;

const Keyword = styled.div`
  padding: 0.375rem 0.75rem;
  margin: 0.25rem;
  font-size: ${props => `${Math.max(0.75, Math.min(2.5, 0.75 + props.$weight * 0.1))}rem`};
  color: ${props => `hsl(${props.$hue}, 70%, 45%)`};
  background-color: ${props => `hsla(${props.$hue}, 70%, 95%, 0.7)`};
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: default;
  
  &:hover {
    transform: scale(1.05);
    background-color: ${props => `hsla(${props.$hue}, 70%, 90%, 0.9)`};
  }
`;

const ThemesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ThemeItem = styled.div`
  background-color: #f7fafc;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  border-left: 4px solid ${props => props.$color || '#4e7fff'};
`;

const ThemeTitle = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: space-between;
`;

const ThemeCount = styled.span`
  font-size: 0.875rem;
  color: #718096;
  font-weight: normal;
`;

const SearchBox = styled.div`
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  outline: none;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    border-color: #4e7fff;
    box-shadow: 0 0 0 3px rgba(78, 127, 255, 0.2);
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const CommentHeader = styled.div`
  background-color: #f8fafc;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
`;

const CommentMeta = styled.div`
  font-size: 0.75rem;
  color: #718096;
  display: flex;
  gap: 0.75rem;
`;

const CommentBody = styled.div`
  padding: 1rem;
`;

const CommentSection = styled.div`
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentTitle = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
`;

const CommentText = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
  white-space: pre-line;
  line-height: 1.5;
`;

const Chip = styled.div`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: ${props => props.$color || '#e2e8f0'};
  color: ${props => props.$textColor || '#4a5568'};
  border-radius: 0.25rem;
  display: inline-block;
  margin-right: 0.5rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background-color: ${props => props.$active ? '#4e7fff' : 'white'};
  color: ${props => props.$active ? 'white' : '#4a5568'};
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? '#4e7fff' : '#f7fafc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Presentation component for the Qualitative Insights and Recurrent Themes report
 */
const QualitativeInsightsPresentation = ({ 
  insightsData, 
  filteredComments,
  searchTerm, 
  onSearchChange,
  filters 
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for comments pagination
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;
  
  const { 
    keywords, 
    themes, 
    comments, 
    wordCloudData, 
    aiTools, 
    aiToolFrequency 
  } = insightsData;
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get a color based on theme
  const getThemeColor = (theme) => {
    const themeColors = {
      "Code Generation": "#4299E1", // Blue
      "Test Creation": "#48BB78",   // Green
      "Bug Fixing": "#F56565",      // Red
      "Documentation": "#9F7AEA",   // Purple
      "Design Patterns": "#667EEA",  // Indigo
      "Refactoring": "#4FD1C5",     // Teal
      "Learning": "#F6AD55",        // Orange
      "Code Review": "#48BB78",     // Green
      "API Integration": "#F687B3",  // Pink
      "UI/UX Design": "#9F7AEA",     // Purple
      "Database": "#48BB78",         // Green
      "Performance": "#F6AD55",      // Orange
      "Security": "#F56565",         // Red
      "Deployment": "#4FD1C5",       // Teal
      "Prompt Engineering": "#4299E1", // Blue
      "AI Limitations": "#F56565"     // Red
    };
    
    return themeColors[theme] || "#4e7fff";
  };
  
  // Calculate the color for a keyword
  const getKeywordColor = (index, frequency) => {
    // Generate a color based on index and frequency
    const hue = (index * 31) % 360; // Distribute hues around the color wheel
    return hue;
  };
  
  // Get paginated comments
  const getPaginatedComments = () => {
    const startIndex = (currentPage - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    return filteredComments.slice(startIndex, endIndex);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Get color for AI tool chip
  const getToolColor = (tool) => {
    const toolColors = {
      "ChatGPT": { bg: "#D4F4EA", text: "#1D976C" },
      "Gemini": { bg: "#E5EDFF", text: "#4285F4" },
      "Claude": { bg: "#F0E5FF", text: "#9A34FF" },
      "GitHub Copilot": { bg: "#E5F1F9", text: "#0EA5E9" },
      "Midjourney": { bg: "#FFE5E5", text: "#F43F5E" },
      "DALL-E": { bg: "#E5FFFA", text: "#009688" },
      "Stable Diffusion": { bg: "#FFF3E5", text: "#F59E0B" },
      "Not Specified": { bg: "#F3F4F6", text: "#6B7280" }
    };
    
    return toolColors[tool] || { bg: "#F3F4F6", text: "#6B7280" };
  };
  
  // If there's no data
  if ((!keywords || keywords.length === 0) && (!themes || themes.length === 0) && (!comments || comments.length === 0)) {
    return (
      <ReportContainer>
        <ReportTitle>Qualitative Insights and Recurrent Themes</ReportTitle>
        <NoDataMessage>No qualitative data available for the selected filters.</NoDataMessage>
      </ReportContainer>
    );
  }

  return (
    <ReportContainer>
      <ReportTitle>Qualitative Insights and Recurrent Themes</ReportTitle>
      
      {/* Tab Navigation */}
      <TabsContainer>
        <TabButton 
          $active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton 
          $active={activeTab === 'keywords'} 
          onClick={() => setActiveTab('keywords')}
        >
          Keywords
        </TabButton>
        <TabButton 
          $active={activeTab === 'themes'} 
          onClick={() => setActiveTab('themes')}
        >
          Themes
        </TabButton>
        <TabButton 
          $active={activeTab === 'comments'} 
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </TabButton>
      </TabsContainer>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <Section>
            <SectionTitle>Keywords Cloud</SectionTitle>
            {keywords.length > 0 ? (
              <WordCloudContainer>
                <KeywordCloud>
                  {keywords.map(({ word, frequency }, index) => {
                    const weight = Math.max(1, Math.min(10, frequency)) / 2;
                    const hue = getKeywordColor(index, frequency);
                    
                    return (
                      <Keyword 
                        key={index} 
                        $weight={weight}
                        $hue={hue}
                        title={`Frequency: ${frequency}`}
                      >
                        {word}
                      </Keyword>
                    );
                  })}
                </KeywordCloud>
              </WordCloudContainer>
            ) : (
              <NoDataMessage>No keyword data available.</NoDataMessage>
            )}
          </Section>
          
          <FlexGrid>
            <Section>
              <SectionTitle>Top Themes</SectionTitle>
              {themes.length > 0 ? (
                <ThemesList>
                  {themes.slice(0, 6).map((theme, index) => (
                    <ThemeItem key={index} $color={getThemeColor(theme.theme)}>
                      <ThemeTitle>
                        {theme.theme}
                        <ThemeCount>{theme.count} mentions</ThemeCount>
                      </ThemeTitle>
                    </ThemeItem>
                  ))}
                </ThemesList>
              ) : (
                <NoDataMessage>No theme data available.</NoDataMessage>
              )}
            </Section>
            
            <Section>
              <SectionTitle>Notable Comments</SectionTitle>
              {comments.length > 0 ? (
                <CommentsList>
                  {comments.slice(0, 3).map((comment, index) => {
                    const toolColor = getToolColor(comment.aiTool);
                    
                    return (
                      <CommentCard key={index}>
                        <CommentHeader>
                          <CommentAuthor>{comment.teamMember}</CommentAuthor>
                          <CommentMeta>
                            <Chip $color={toolColor.bg} $textColor={toolColor.text}>
                              {comment.aiTool}
                            </Chip>
                            <span>{formatDate(comment.timestamp)}</span>
                          </CommentMeta>
                        </CommentHeader>
                        <CommentBody>
                          {comment.aiProductivity && (
                            <CommentSection>
                              <CommentTitle>AI Productivity</CommentTitle>
                              <CommentText>{comment.aiProductivity}</CommentText>
                            </CommentSection>
                          )}
                        </CommentBody>
                      </CommentCard>
                    );
                  })}
                </CommentsList>
              ) : (
                <NoDataMessage>No comment data available.</NoDataMessage>
              )}
            </Section>
          </FlexGrid>
        </>
      )}
      
      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <Section>
          <SectionTitle>Top Keywords</SectionTitle>
          {keywords.length > 0 ? (
            <>
              <WordCloudContainer>
                <KeywordCloud>
                  {keywords.map(({ word, frequency }, index) => {
                    const weight = Math.max(1, Math.min(10, frequency)) / 2;
                    const hue = getKeywordColor(index, frequency);
                    
                    return (
                      <Keyword 
                        key={index} 
                        $weight={weight}
                        $hue={hue}
                        title={`Frequency: ${frequency}`}
                      >
                        {word}
                      </Keyword>
                    );
                  })}
                </KeywordCloud>
              </WordCloudContainer>
              
              <FlexGrid $columns={3}>
                {keywords.slice(0, 15).map(({ word, frequency }, index) => (
                  <ThemeItem key={index} $color={`hsl(${getKeywordColor(index, frequency)}, 70%, 45%)`}>
                    <ThemeTitle>
                      {word}
                      <ThemeCount>{frequency} mentions</ThemeCount>
                    </ThemeTitle>
                  </ThemeItem>
                ))}
              </FlexGrid>
            </>
          ) : (
            <NoDataMessage>No keyword data available.</NoDataMessage>
          )}
        </Section>
      )}
      
      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <Section>
          <SectionTitle>Recurrent Themes</SectionTitle>
          {themes.length > 0 ? (
            <ThemesList>
              {themes.map((theme, index) => (
                <ThemeItem key={index} $color={getThemeColor(theme.theme)}>
                  <ThemeTitle>
                    {theme.theme}
                    <ThemeCount>{theme.count} mentions</ThemeCount>
                  </ThemeTitle>
                </ThemeItem>
              ))}
            </ThemesList>
          ) : (
            <NoDataMessage>No theme data available.</NoDataMessage>
          )}
        </Section>
      )}
      
      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <Section>
          <SectionTitle>Browse Comments</SectionTitle>
          <SearchBox>
            <SearchInput 
              type="text"
              placeholder="Search for keywords in comments..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </SearchBox>
          
          {filteredComments.length > 0 ? (
            <>
              <CommentsList>
                {getPaginatedComments().map((comment, index) => {
                  const toolColor = getToolColor(comment.aiTool);
                  
                  // Highlight the search term if present
                  const highlightSearchTerm = (text) => {
                    if (!searchTerm || searchTerm.trim() === '') {
                      return text;
                    }
                    
                    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
                    
                    return parts.map((part, i) => 
                      part.toLowerCase() === searchTerm.toLowerCase() 
                        ? <span key={i} style={{ backgroundColor: '#FEFCBF', padding: '0 2px' }}>{part}</span> 
                        : part
                    );
                  };
                  
                  return (
                    <CommentCard key={index}>
                      <CommentHeader>
                        <CommentAuthor>
                          {comment.teamMember} ({comment.teamRole})
                        </CommentAuthor>
                        <CommentMeta>
                          <Chip $color={toolColor.bg} $textColor={toolColor.text}>
                            {comment.aiTool}
                          </Chip>
                          <span>{formatDate(comment.timestamp)}</span>
                        </CommentMeta>
                      </CommentHeader>
                      <CommentBody>
                        {comment.taskDetails && (
                          <CommentSection>
                            <CommentTitle>Task Details</CommentTitle>
                            <CommentText>
                              {highlightSearchTerm(comment.taskDetails)}
                            </CommentText>
                          </CommentSection>
                        )}
                        
                        {comment.aiProductivity && (
                          <CommentSection>
                            <CommentTitle>AI Productivity</CommentTitle>
                            <CommentText>
                              {highlightSearchTerm(comment.aiProductivity)}
                            </CommentText>
                          </CommentSection>
                        )}
                        
                        <CommentSection>
                          <CommentTitle>Metadata</CommentTitle>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <Chip>SDLC: {comment.sdlcStep}</Chip>
                            <Chip>Task: {comment.sdlcTask}</Chip>
                            <Chip>Time Saved: {comment.hoursSaved.toFixed(1)} hrs</Chip>
                          </div>
                        </CommentSection>
                      </CommentBody>
                    </CommentCard>
                  );
                })}
              </CommentsList>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PageButton 
                    onClick={() => handlePageChange(1)} 
                    disabled={currentPage === 1}
                  >
                    First
                  </PageButton>
                  
                  <PageButton 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                  >
                    Prev
                  </PageButton>
                  
                  <span style={{ fontSize: '0.875rem', color: '#4a5568' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <PageButton 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </PageButton>
                  
                  <PageButton 
                    onClick={() => handlePageChange(totalPages)} 
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </PageButton>
                </Pagination>
              )}
            </>
          ) : (
            <NoDataMessage>
              {searchTerm 
                ? `No comments found for "${searchTerm}"`
                : 'No comment data available.'}
            </NoDataMessage>
          )}
        </Section>
      )}
    </ReportContainer>
  );
};

export default QualitativeInsightsPresentation;