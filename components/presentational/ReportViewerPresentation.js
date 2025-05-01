import React from "react";
import styled from "styled-components";
import CustomSelect from "./CustomSelect";
import ResponsiveTable from "./ResponsiveTable";

// Styled components for the report viewer
const Container = styled.div`
  width: 100%;
  margin-bottom: 2rem;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #4a5568;
`;

const ViewerHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.25rem;
  
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const ReportTypesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const ReportTypeButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  background-color: ${props => props.$active ? '#4e7fff' : '#f7fafc'};
  color: ${props => props.$active ? 'white' : '#4a5568'};
  border: 1px solid ${props => props.$active ? '#4e7fff' : '#e2e8f0'};
  
  &:hover {
    background-color: ${props => props.$active ? '#3b69e6' : '#edf2f7'};
  }
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.375rem;
`;

const ClearFiltersButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #edf2f7;
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

// Table Styles - Using an optimized version
const TableDesktop = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: rgb(249 250 251);
  }

  tbody td:not(:first-of-type):not(:last-of-type) {
    padding: 0.75rem 0.75rem 0.75rem 0;
  }

  th, td {
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
    padding: 0.5rem 0.75rem;
  }

  tr:nth-child(even) {
    background-color: #f8f9fa;
  }

  tr.summary-row {
    background-color: #f8fafc;
    font-weight: 600;
    border-top: 2px solid #e2e8f0;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px dashed #e2e8f0;
`;

/**
 * Presentation component for the Report Viewer
 */
const ReportViewerPresentation = ({
  threadTitle,
  reports,
  isLoading,
  error,
  selectedReport,
  onReportChange,
  filters,
  onFilterChange,
  filterOptions,
  customReport,
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Create options array for select components
  const createOptions = (items) => {
    return ["", ...items];
  };

  // Clear all filters
  const clearFilters = () => {
    onFilterChange("teamMember", "");
    onFilterChange("teamRole", "");
    onFilterChange("platform", "");
    onFilterChange("sdlcStep", "");
    onFilterChange("sdlcTask", "");
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading reports...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  // Compute filtered reports based on selected filters
  const filteredReports = reports.filter(report => {
    // Filter by team member if specified
    if (filters.teamMember && report.teamMember !== filters.teamMember) {
      return false;
    }

    // Filter by role if specified
    if (filters.teamRole && report.teamRole !== filters.teamRole) {
      return false;
    }

    // If platform is specified, check entries
    if (filters.platform) {
      const hasMatchingEntry = report.entries.some(entry => 
        entry.platform === filters.platform
      );
      if (!hasMatchingEntry) return false;
    }

    // If SDLC step is specified, check entries
    if (filters.sdlcStep) {
      const hasMatchingEntry = report.entries.some(entry => 
        entry.sdlcStep === filters.sdlcStep
      );
      if (!hasMatchingEntry) return false;
    }

    // If SDLC task is specified, check entries
    if (filters.sdlcTask) {
      const hasMatchingEntry = report.entries.some(entry => 
        entry.sdlcTask === filters.sdlcTask
      );
      if (!hasMatchingEntry) return false;
    }

    return true;
  });

  return (
    <Container>
      <ViewerHeader>
        <Title>Team Reports for: {threadTitle}</Title>
        
        <ReportTypesContainer>
          <ReportTypeButton 
            $active={selectedReport === 'raw'} 
            onClick={() => onReportChange('raw')}
          >
            Raw Reports
          </ReportTypeButton>
          
          <ReportTypeButton 
            $active={selectedReport === 'aiImpactSummary'} 
            onClick={() => onReportChange('aiImpactSummary')}
          >
            AI Impact Summary
          </ReportTypeButton>
        </ReportTypesContainer>
      </ViewerHeader>
      
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Team Member</FilterLabel>
          <CustomSelect 
            value={filters.teamMember}
            onChange={(value) => onFilterChange("teamMember", value)}
            options={createOptions(filterOptions.teamMembers)}
            placeholder="All team members"
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Team Role</FilterLabel>
          <CustomSelect 
            value={filters.teamRole}
            onChange={(value) => onFilterChange("teamRole", value)}
            options={createOptions(filterOptions.teamRoles)}
            placeholder="All roles"
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Platform</FilterLabel>
          <CustomSelect 
            value={filters.platform}
            onChange={(value) => onFilterChange("platform", value)}
            options={createOptions(filterOptions.platforms)}
            placeholder="All platforms"
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>SDLC Step</FilterLabel>
          <CustomSelect 
            value={filters.sdlcStep}
            onChange={(value) => onFilterChange("sdlcStep", value)}
            options={createOptions(filterOptions.sdlcSteps)}
            placeholder="All SDLC steps"
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>SDLC Task</FilterLabel>
          <CustomSelect 
            value={filters.sdlcTask}
            onChange={(value) => onFilterChange("sdlcTask", value)}
            options={createOptions(filterOptions.sdlcTasks)}
            placeholder="All SDLC tasks"
          />
        </FilterGroup>
        
        {selectedReport === 'aiImpactSummary' && (
          <FilterGroup>
            <FilterLabel>Period Type</FilterLabel>
            <CustomSelect 
              value={filters.periodType}
              onChange={(value) => onFilterChange("periodType", value)}
              options={["week", "month", "quarter"]}
              placeholder="Select period type"
            />
          </FilterGroup>
        )}
        
        <ClearFiltersButton onClick={clearFilters}>
          Clear Filters
        </ClearFiltersButton>
      </FiltersContainer>
      
      {/* Render custom report if selected */}
      {customReport}
      
      {/* Render raw reports if selected */}
      {selectedReport === 'raw' && (
        <>
          {filteredReports.length === 0 ? (
            <EmptyState>No productivity reports match the selected filters.</EmptyState>
          ) : (
            <ReportList>
              {filteredReports.map((report, index) => (
                <ReportCard key={index}>
                  <ReportHeader>
                    <ReportTitle>
                      Report from {report.teamMember} ({report.teamRole})
                    </ReportTitle>
                    <ReportDate>{formatDate(report.timestamp)}</ReportDate>
                  </ReportHeader>

                  <ReportContent>
                    <div className="responsive-table">
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
                            <th>Saved</th>
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
                          {/* Summary row */}
                          <tr className="summary-row">
                            <td colSpan={2}>Total</td>
                            <td>
                              {report.entries
                                .reduce(
                                  (sum, entry) =>
                                    sum + (parseFloat(entry.hours) || 0),
                                  0
                                )
                                .toFixed(1)}
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                              {report.entries
                                .reduce(
                                  (sum, entry) =>
                                    sum + (parseFloat(entry.hoursSaved) || 0),
                                  0
                                )
                                .toFixed(1)}
                            </td>
                          </tr>
                        </tbody>
                      </TableDesktop>

                      {/* Mobile Card View */}
                      <TableMobile>
                        {report.entries.map((entry, i) => (
                          <MobileCard key={i}>
                            <MobileCardHeader>Record #{i + 1}</MobileCardHeader>
                            <MobileCardBody>
                              <MobileCardField>
                                <MobileFieldLabel>SDLC Step</MobileFieldLabel>
                                <MobileFieldValue>
                                  {entry.sdlcStep}
                                </MobileFieldValue>
                              </MobileCardField>

                              <MobileCardField>
                                <MobileFieldLabel>SDLC Task</MobileFieldLabel>
                                <MobileFieldValue>
                                  {entry.sdlcTask}
                                </MobileFieldValue>
                              </MobileCardField>

                              <MobileCardField>
                                <MobileFieldLabel>Hours</MobileFieldLabel>
                                <MobileFieldValue>{entry.hours}</MobileFieldValue>
                              </MobileCardField>

                              <MobileCardField>
                                <MobileFieldLabel>Task Details</MobileFieldLabel>
                                <MobileFieldValue>
                                  {entry.taskDetails}
                                </MobileFieldValue>
                              </MobileCardField>

                              <MobileCardField>
                                <MobileFieldLabel>AI Tool Used</MobileFieldLabel>
                                <MobileFieldValue>
                                  {entry.aiTool}
                                </MobileFieldValue>
                              </MobileCardField>

                              <MobileCardField>
                                <MobileFieldLabel>
                                  AI Productivity
                                </MobileFieldLabel>
                                <MobileFieldValue>
                                  {entry.aiProductivity}
                                </MobileFieldValue>
                              </MobileCardField>

                              <MobileCardField>
                                <MobileFieldLabel>Saved</MobileFieldLabel>
                                <MobileFieldValue>
                                  {entry.hoursSaved}
                                </MobileFieldValue>
                              </MobileCardField>
                            </MobileCardBody>
                          </MobileCard>
                        ))}

                        {/* Summary Card for Mobile */}
                        <MobileCard
                          style={{
                            backgroundColor: "#f8fafc",
                            borderColor: "#4e7fff",
                            borderWidth: "2px",
                          }}
                        >
                          <MobileCardHeader
                            style={{
                              backgroundColor: "#4e7fff",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            Summary
                          </MobileCardHeader>
                          <MobileCardBody>
                            <MobileCardField>
                              <MobileFieldLabel>Total Hours</MobileFieldLabel>
                              <MobileFieldValue style={{ fontWeight: "bold" }}>
                                {report.entries
                                  .reduce(
                                    (sum, entry) =>
                                      sum + (parseFloat(entry.hours) || 0),
                                    0
                                  )
                                  .toFixed(1)}
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Total Saved</MobileFieldLabel>
                              <MobileFieldValue style={{ fontWeight: "bold" }}>
                                {report.entries
                                  .reduce(
                                    (sum, entry) =>
                                      sum + (parseFloat(entry.hoursSaved) || 0),
                                    0
                                  )
                                  .toFixed(1)}
                              </MobileFieldValue>
                            </MobileCardField>
                          </MobileCardBody>
                        </MobileCard>
                      </TableMobile>
                    </div>
                  </ReportContent>
                </ReportCard>
              ))}
            </ReportList>
          )}
        </>
      )}
    </Container>
  );
};

export default ReportViewerPresentation;