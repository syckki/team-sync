import React from "react";
import styled from "styled-components";
import { Breakpoint } from "../../lib/styles";
import InfoTooltip from "./InfoTooltip";

// Flexbox-based responsive table container
const TableContainer = styled.div`
  margin-bottom: 1rem;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-size: 0.875rem;
`;

// Flex Table (Replaces <table>)
const FlexTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// Table Header (Replaces <thead>)
const TableHeader = styled.div`
  background-color: rgb(249 250 251);
  position: sticky;
  top: 0;
  z-index: 10;
`;

// Header Row (Replaces <tr> in header)
const HeaderRow = styled.div`
  display: flex;
  width: 100%;
`;

// Header Cell (Replaces <th>)
const HeaderCell = styled.div`
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  text-transform: uppercase;
  color: rgb(107 114 128);
  letter-spacing: 0.05em;
  padding: 0.75rem;
  text-align: left;
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  min-width: 0; /* Allow cells to shrink below content size */

  ${props => props.$width && `
    flex: 0 0 ${props.$width};
    min-width: ${props.$width};
  `}

  /* If it's the expansion column header cell */
  ${props => props.$isExpansion && `
    flex: 0 0 40px;
    min-width: 40px;
  `}

  @media (max-width: ${Breakpoint.LAPTOP}px) {
    /* Hide headers on mobile */
    display: none;
  }
`;

// Table Body (Replaces <tbody>)
const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// Row (Replaces <tr>)
const Row = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s ease;

  ${props => props.$isExpanded && `
    background-color: rgba(78, 127, 255, 0.08);
  `}

  ${props => props.$isSummary && `
    background-color: #f8fafc;
    font-weight: 600;
    border-top: 2px solid #e2e8f0;
  `}

  @media (max-width: ${Breakpoint.LAPTOP}px) {
    flex-direction: column;
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    /* Alternating row background for better readability */
    &:nth-child(4n-1),
    &:nth-child(4n) {
      background-color: #f8f9fa;
    }

    ${props => props.$isExpanded && `
      background: none;
    `}

    ${props => props.$isSummary && `
      border: 2px solid #4e7fff;
    `}
  }
`;

// Cell (Replaces <td>)
const Cell = styled.div`
  padding: 0.75rem;
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  overflow: visible; /* Allow dropdowns to extend outside cells */
  min-width: 0; /* Allow cells to shrink below content size */

  ${props => props.$width && `
    flex: 0 0 ${props.$width};
    min-width: ${props.$width};
  `}

  /* If it's the expansion column cell */
  ${props => props.$isExpansion && `
    flex: 0 0 40px;
    min-width: 40px;
    cursor: ${props.$isMobile ? 'default' : 'pointer'};
  `}

  /* For action column */
  ${props => props.$isAction && props.$isMobile && `
    display: none !important;
  `}

  @media (max-width: ${Breakpoint.LAPTOP}px) {
    border-bottom: 1px solid #e2e8f0;
    text-align: right;
    flex-direction: row;
    padding: 0.75rem;

    &:last-child {
      border-bottom: none;
    }

    /* Show the column header using data-label attribute */
    &:before {
      content: attr(data-label);
      font-weight: 600;
      color: #444;
      font-size: 0.85rem;
      text-align: left;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }

    ${props => props.$isSummary && `
      &:before {
        color: #4e7fff;
      }
    `}
  }
`;

// Detail Row (Replaces <tr class="detail-row">)
const DetailRow = styled.div`
  width: 100%;
  background-color: #fcfcfc;
  border-bottom: 1px dashed #e2e8f0;

  @media (max-width: ${Breakpoint.LAPTOP}px) {
    background: none;
    border-top: none;
    padding: 0;
  }
`;

// Detail Cell (Replaces <td colSpan={...}>)
const DetailCell = styled.div`
  padding: 0;
  width: 100%;
`;

// Expand Icon Container
const ExpandIcon = styled.div`
  color: #4e7fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  ${props => props.$isExpanded && `
    transform: rotate(90deg);
  `}
`;

// Mobile Title with Delete Button
const MobileTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #4e7fff;
  white-space: nowrap;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  border: 1px dashed #e2e8f0;
`;

/**
 * FlexTable Component
 * A responsive table using flexbox instead of table elements for better layout control
 * Uses data-attributes to label columns in mobile view for accessibility
 */
const ResponsiveTable = ({
  data = [],
  columns = [],
  keyField = "id",
  emptyMessage = "No data available",
  summaryRow = null,
  renderCustomCell = null,
  expandableRowRender = null,
  expandedRows = {},
  onRowToggle = null,
  customSummaryRow = null,
}) => {
  // Return empty state if no data
  if (!data || data.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  // Track if we're on mobile viewport (using window.matchMedia if available)
  const [isMobile, setIsMobile] = React.useState(false);

  // Media query effect to detect screen size
  React.useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(
        `(max-width: ${Breakpoint.LAPTOP}px)`,
      );

      // Set initial value
      setIsMobile(mediaQuery.matches);

      // Add listener for changes
      const handleResize = (e) => {
        setIsMobile(e.matches);
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleResize);
        return () => mediaQuery.removeEventListener("change", handleResize);
      }
      // Older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleResize);
        return () => mediaQuery.removeListener(handleResize);
      }
    }
  }, []);

  // For mobile, we'll always expand all rows
  const effectiveExpandedRows = React.useMemo(() => {
    if (isMobile) {
      // Create an object with all rows expanded
      return data.reduce((acc, row) => {
        acc[row[keyField]] = true;
        return acc;
      }, {});
    }

    // On desktop, use the provided expandedRows state
    return expandedRows;
  }, [data, expandedRows, keyField, isMobile]);

  return (
    <TableContainer>
      <FlexTable role="table" aria-label="Data Table">
        {/* Table Header */}
        <TableHeader role="rowgroup">
          <HeaderRow role="row">
            {/* Add expansion column if expandable rows are enabled */}
            {expandableRowRender && (
              <HeaderCell $isExpansion role="columnheader"></HeaderCell>
            )}

            {columns.map((column, index) => (
              <HeaderCell
                key={index}
                $width={column.width}
                role="columnheader"
                aria-label={column.header}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {column.header}
                  {column.tooltip && (
                    <InfoTooltip
                      title={column.header}
                      content={column.tooltip}
                      actionHint={column.actionHint}
                    />
                  )}
                </div>
              </HeaderCell>
            ))}
          </HeaderRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody role="rowgroup">
          {data.map((row, rowIndex) => {
            const isExpanded = expandableRowRender && effectiveExpandedRows[row[keyField]];
            
            return (
              <React.Fragment key={row[keyField] || rowIndex}>
                {/* Main Row */}
                <Row 
                  role="row" 
                  $isExpanded={isExpanded}
                >
                  {/* Expansion toggle for desktop or sequence # for mobile */}
                  {expandableRowRender && (
                    <Cell
                      $isExpansion
                      $isMobile={isMobile}
                      role="cell"
                      onClick={() =>
                        !isMobile && onRowToggle && onRowToggle(row[keyField])
                      }
                      style={{
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                      }}
                    >
                      {isMobile ? (
                        // Show AI Productivity number with delete button next to it on mobile
                        <MobileTitle>
                          <span>AI Productivity #{rowIndex + 1}</span>
                          {row._deleteButton}
                        </MobileTitle>
                      ) : (
                        // Show expand/collapse icon on desktop
                        <ExpandIcon $isExpanded={isExpanded}>
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
                        </ExpandIcon>
                      )}
                    </Cell>
                  )}

                  {columns.map((column, colIndex) => {
                    // Prepare the cell content
                    const cellContent = renderCustomCell
                      ? renderCustomCell(row, column.field, column)
                      : column.render
                        ? column.render(row[column.field], row)
                        : row[column.field];

                    return (
                      <Cell
                        key={colIndex}
                        width={column.width}
                        data-label={column.header} // Important for mobile view labels
                        role="cell"
                        isAction={column.header === "Action"}
                        isMobile={isMobile}
                      >
                        {isMobile && column.tooltip && (
                          <InfoTooltip
                            title={column.header}
                            content={column.tooltip}
                            actionHint={column.actionHint}
                          />
                        )}
                        {cellContent}
                      </Cell>
                    );
                  })}
                </Row>

                {/* Expandable detail row if provided and row is expanded */}
                {expandableRowRender && isExpanded && (
                  <DetailRow role="row">
                    <DetailCell role="cell">
                      {expandableRowRender(row)}
                    </DetailCell>
                  </DetailRow>
                )}
              </React.Fragment>
            );
          })}

          {/* Summary row if provided */}
          {summaryRow && (
            <Row role="row" $isSummary>
              {/* Add empty cell for expansion column if expandable rows are enabled */}
              {expandableRowRender && (
                <Cell isExpansion role="cell"></Cell>
              )}

              {columns.map((column, colIndex) => (
                <Cell
                  key={colIndex}
                  width={column.width}
                  role="cell"
                  data-label={`Summary: ${column.header}`}
                  isSummary
                >
                  {summaryRow[column.field] || ""}
                </Cell>
              ))}
            </Row>
          )}
        </TableBody>
      </FlexTable>
      
      {/* Custom summary row if provided */}
      {customSummaryRow && customSummaryRow()}
    </TableContainer>
  );
};

export default ResponsiveTable;
