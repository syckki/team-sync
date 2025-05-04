import React from "react";
import styled from "styled-components";
import { Breakpoint } from "../../lib/styles";

// CSS-only responsive table with a single source of truth
const TableContainer = styled.div`
  margin-bottom: 1rem;
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: visible; /* Allow content to overflow beyond table boundaries */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  /* Basic styles for the table */
  th,
  td {
    text-align: left;
    padding: 0.75rem;
    overflow: visible;
    position: relative;
  }

  th {
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1rem;
    text-transform: uppercase;
    color: rgb(107 114 128);
    letter-spacing: 0.05em;
    background-color: rgb(249 250 251);
    position: relative;
  }

  @media (min-width: ${Breakpoint.LAPTOP}px) {
    tbody td:not(:first-of-type):not(:last-of-type) {
      padding: 0.75rem 0.75rem 0.75rem 0;
    }
  }

  /* Fixed-width columns */
  th.fixed-width,
  td.fixed-width {
    @media (min-width: ${Breakpoint.LAPTOP}px) {
      width: var(--column-width, auto);
    }
  }

  /* Summary row styling */
  tr.summary-row {
    background-color: #f8fafc;
    font-weight: 600;
    border-top: 2px solid #e2e8f0;
  }

  /* Expandable row styling */
  tr.expandable-row td {
    cursor: pointer;
  }

  tr.expanded {
    background-color: rgba(78, 127, 255, 0.08);
  }

  tr.detail-row {
    background-color: #fcfcfc;
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
    user-select: none; /* Prevent text selection on click */
    -webkit-user-select: none; /* For Safari */
    -moz-user-select: none; /* For Firefox */
    -ms-user-select: none; /* For IE/Edge */
  }

  tr.expanded .expand-icon {
    transform: rotate(90deg);
  }

  @media (max-width: ${Breakpoint.LAPTOP}px) {
    /* CSS-based responsive transformation for mobile and tablets */
    /* Hide table headers on mobile and tablet */
    thead {
      display: none;
    }

    /* Display each row as a card */
    tbody tr {
      display: block;
      overflow: visible; /* Allow dropdowns to be visible outside the card */
      position: relative; /* For proper stacking context */
    }

    /* Style each cell as a row in the card */
    tbody tr td {
      display: flex;

      > * {
        width: 100%;
      }
    }

    tbody tr.expanded td {
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: right;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      overflow: visible;
      position: relative;

      > * {
        width: auto;
      }
    }

    /* Show the column header using data-label attribute */
    tbody tr.expanded td:before {
      content: attr(data-label);
      font-weight: 600;
      color: #444;
      font-size: 0.85rem;
      text-align: left;
    }

    tbody tr.expanded td:not(:first-child):before {
      margin-right: 1rem; /* Space between label and content */
      flex-shrink: 0; /* Prevent the label from shrinking */
    }

    /* Alternating row background for better readability */
    tbody tr:nth-child(4n-1),
    tbody tr:nth-child(4n) {
      background-color: #f8f9fa;
    }

    /* Remove bottom border from last cell in each row */
    tbody td:last-child {
      border-bottom: none;
    }

    tr.expanded {
      background: none;
    }

    tr.detail-row {
      background: none;
    }

    /* Position the delete button at the top right in mobile view */
    .delete-action-button {
      position: absolute !important;
      top: 0.5rem !important;
      right: 0.5rem !important;
      z-index: 10 !important;
    }
    
    /* Hide the original Action column in mobile view */
    td[data-label="Action"] {
      display: none !important;
    }
    
    /* Summary row styling for mobile */
    tr.summary-row {
      border: 2px solid #4e7fff;
    }

    tr.summary-row td:before {
      color: #4e7fff;
    }

    /* Add extra margin between rows */
    tbody tr.detail-row + tr {
      margin-top: 1.5rem;
    }
  }
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
 * ResponsiveTable Component
 * A single source of truth for table rendering that adapts with CSS
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
      <Table>
        <thead>
          <tr>
            {/* Add expansion column if expandable rows are enabled */}
            {expandableRowRender && <th style={{ width: "40px" }}></th>}

            {columns.map((column, index) => (
              <th
                key={index}
                className={column.width ? "fixed-width" : ""}
                style={column.width ? { "--column-width": column.width } : {}}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <React.Fragment key={row[keyField] || rowIndex}>
              <tr
                className={
                  expandableRowRender && effectiveExpandedRows[row[keyField]]
                    ? "expanded"
                    : ""
                }
              >
                {/* Expansion toggle for desktop or sequence # for mobile */}
                {expandableRowRender && (
                  <td
                    onClick={() =>
                      !isMobile && onRowToggle && onRowToggle(row[keyField])
                    }
                    style={{
                      cursor: isMobile ? "default" : "pointer",
                      width: "40px",
                      userSelect: "none" /* Prevent text selection on click */,
                      WebkitUserSelect: "none" /* For Safari */,
                      MozUserSelect: "none" /* For Firefox */,
                      msUserSelect: "none" /* For IE/Edge */,
                    }}
                  >
                    {isMobile ? (
                      // Show AI Productivity number with delete button next to it on mobile
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#4e7fff",
                          whiteSpace: "nowrap",
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span>AI Productivity #{rowIndex + 1}</span>
                        {row._deleteButton}
                      </div>
                    ) : (
                      // Show expand/collapse icon on desktop
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
                    )}
                  </td>
                )}

                {columns.map((column, colIndex) => {
                  // Prepare the cell content
                  const cellContent = renderCustomCell
                    ? renderCustomCell(row, column.field, column)
                    : column.render
                      ? column.render(row[column.field], row)
                      : row[column.field];

                  return (
                    <td
                      key={colIndex}
                      className={column.width ? "fixed-width" : ""}
                      style={
                        column.width ? { "--column-width": column.width } : {}
                      }
                      data-label={column.header} // Important for mobile view labels
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>

              {/* Expandable detail row if provided and row is expanded */}
              {expandableRowRender && effectiveExpandedRows[row[keyField]] && (
                <tr className="detail-row">
                  <td colSpan={columns.length + 1}>
                    {expandableRowRender(row)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}

          {/* Summary row if provided */}
          {summaryRow && (
            <tr className="summary-row">
              {/* Add empty cell for expansion column if expandable rows are enabled */}
              {expandableRowRender && <td></td>}

              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={column.width ? "fixed-width" : ""}
                  style={column.width ? { "--column-width": column.width } : {}}
                  data-label={`Summary: ${column.header}`}
                >
                  {summaryRow[column.field] || ""}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </Table>
      {/* Custom summary row if provided */}
      {customSummaryRow && customSummaryRow()}
    </TableContainer>
  );
};

export default ResponsiveTable;
