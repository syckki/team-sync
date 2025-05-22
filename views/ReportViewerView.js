import { useSelector } from "@xstate/react";
import styled from "styled-components";
import CustomSelect from "../ui/CustomSelect";
import ResponsiveTable from "../ui/ResponsiveTable";
import { Button } from "../ui";

import AiImpactSummaryView from "./reports/AiImpactSummaryView";
import ToolEffectivenessViewModel from "../viewModels/reports/ToolEffectivenessViewModel";
import RoleTeamAnalysisViewModel from "../viewModels/reports/RoleTeamAnalysisViewModel";
import SdlcAnalysisViewModel from "../viewModels/reports/SdlcAnalysisViewModel";
import ComplexityQualityViewModel from "../viewModels/reports/ComplexityQualityViewModel";
import QualitativeInsightsViewModel from "../viewModels/reports/QualitativeInsightsViewModel";

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

// Removed duplicate table styles as we're using ResponsiveTable component

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
const ReportViewer = ({ actor }) => {
  const state = useSelector(actor, (s) => s);
  const send = actor.send;
  const sendEvent = (type, data) => send({ type, data });

  const threadTitle = state.context.teamName;
  const reports = state.context.reportList;
  const error = state.context.error;
  const filters = state.context.filters;
  const filterOptions = state.context.filterOptions;

  // Handle filter changes
  const onFilterChange = (filterName, value) => {
    sendEvent("UPDATE_FILTER", { filterName, value });
  };

  // Handle report type selection
  const onReportChange = (reportType) => {
    sendEvent("UPDATE_REPORT_TYPE", { reportType });
  };

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

  if (state.matches("loading")) {
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
  const filteredReports = reports.filter((report) => {
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
      const hasMatchingEntry = report.entries.some((entry) => entry.platform === filters.platform);
      if (!hasMatchingEntry) return false;
    }

    // If SDLC step is specified, check entries
    if (filters.sdlcStep) {
      const hasMatchingEntry = report.entries.some((entry) => entry.sdlcStep === filters.sdlcStep);
      if (!hasMatchingEntry) return false;
    }

    // If SDLC task is specified, check entries
    if (filters.sdlcTask) {
      const hasMatchingEntry = report.entries.some((entry) => entry.sdlcTask === filters.sdlcTask);
      if (!hasMatchingEntry) return false;
    }

    return true;
  });

  return (
    <Container>
      <ViewerHeader>
        <Title>Team Reports for: {threadTitle}</Title>

        <ReportTypesContainer>
          <Button
            variant={state.matches("ready.raw") ? "primary" : "secondary"}
            size="small"
            onClick={() => onReportChange("raw")}
          >
            Raw Reports
          </Button>

          <Button
            variant={state.matches("ready.aiImpactSummary") ? "primary" : "secondary"}
            size="small"
            onClick={() => onReportChange("aiImpactSummary")}
          >
            AI Impact Summary
          </Button>

          <Button
            variant={state.matches("ready.toolEffectiveness") ? "primary" : "secondary"}
            size="small"
            onClick={() => onReportChange("toolEffectiveness")}
          >
            Tool Effectiveness
          </Button>

          <Button
            variant={state.matches("ready.roleTeamAnalysis") ? "primary" : "secondary"}
            size="small"
            onClick={() => onReportChange("roleTeamAnalysis")}
          >
            Role & Team Analysis
          </Button>

          <Button
            variant={state.matches("ready.sdlcAnalysis") ? "primary" : "secondary"}
            size="small"
            onClick={() => onReportChange("sdlcAnalysis")}
          >
            SDLC Analysis
          </Button>

          <Button
            variant={state.matches("ready.complexityQuality") ? "primary" : "secondary"}
            size="small"
            onClick={() => onReportChange("complexityQuality")}
          >
            Complexity & Quality
          </Button>

          <Button
            variant={state.matches("ready.qualitativeInsights") ? "primary" : "secondary"}
            size="small"
            onClick={() => onReportChange("qualitativeInsights")}
          >
            Qualitative Insights
          </Button>
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

        {state.matches("ready.aiImpactSummary") && (
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

        <Button variant="secondary" size="small" onClick={clearFilters}>
          Clear Filters
        </Button>
      </FiltersContainer>

      {/* Render custom report if selected */}

      {state.matches("ready.raw") && (
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
                    <ResponsiveTable
                      data={report.entries}
                      keyField="id"
                      emptyMessage="No entries available"
                      columns={[
                        { field: "sdlcStep", header: "SDLC Step" },
                        { field: "sdlcTask", header: "SDLC Task" },
                        { field: "hours", header: "Hours", width: "80px" },
                        { field: "taskDetails", header: "Task Details" },
                        { field: "aiTool", header: "AI Tool" },
                        {
                          field: "aiProductivity",
                          header: "AI Productivity",
                        },
                        {
                          field: "hoursSaved",
                          header: "Saved",
                          width: "80px",
                        },
                      ]}
                      summaryRow={{
                        sdlcStep: "Total",
                        sdlcTask: "",
                        hours: report.entries
                          .reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0)
                          .toFixed(1),
                        taskDetails: "",
                        aiTool: "",
                        aiProductivity: "",
                        hoursSaved: report.entries
                          .reduce((sum, entry) => sum + (parseFloat(entry.hoursSaved) || 0), 0)
                          .toFixed(1),
                      }}
                    />
                  </ReportContent>
                </ReportCard>
              ))}
            </ReportList>
          )}
        </>
      )}

      {state.matches("ready.aiImpactSummary") && (
        <AiImpactSummaryView actor={state.children.aiImpactSummary} />
      )}

      {state.matches("ready.toolEffectiveness") && (
        <ToolEffectivenessViewModel reports={reports} filters={filters} />
      )}

      {state.matches("ready.roleTeamAnalysis") && (
        <RoleTeamAnalysisViewModel reports={reports} filters={filters} />
      )}

      {state.matches("ready.sdlcAnalysis") && (
        <SdlcAnalysisViewModel reports={reports} filters={filters} />
      )}

      {state.matches("ready.complexityQuality") && (
        <ComplexityQualityViewModel reports={reports} filters={filters} />
      )}

      {state.matches("ready.qualitativeInsights") && (
        <QualitativeInsightsViewModel reports={reports} filters={filters} />
      )}
    </Container>
  );
};

export default ReportViewer;
