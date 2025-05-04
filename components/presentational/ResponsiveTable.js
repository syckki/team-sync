import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Breakpoint } from "../../lib/styles";

// CSS-only responsive table with a single source of truth
const TableContainer = styled.div`
  width: 100%;
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
    width: var(--column-width, auto);
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
      margin-bottom: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: visible; /* Allow dropdowns to be visible outside the card */
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      position: relative; /* For proper stacking context */
    }

    /* Style each cell as a row in the card */
    tbody td {
      display: flex;
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: right;
      flex-direction: column;
      align-items: flex-start;
      overflow: visible;
      position: relative;
    }

    /* Show the column header using data-label attribute */
    tbody td:before {
      content: attr(data-label);
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: #444;
      font-size: 0.85rem;
    }

    /* Alternating row background for better readability */
    tbody td:nth-child(even) {
      background-color: #f8f9fa;
    }

    /* Remove bottom border from last cell in each row */
    tbody td:last-child {
      border-bottom: none;
    }

    /* Summary row styling for mobile */
    tr.summary-row {
      border: 2px solid #4e7fff;
    }

    tr.summary-row td:before {
      color: #4e7fff;
    }

    /* Add extra margin between rows */
    tbody tr + tr {
      margin-top: 1.5rem;
    }
    
    /* Detail row styling for mobile */
    tr.detail-row {
      margin-top: 0 !important;
      border-top: none !important;
      border-radius: 0 0 8px 8px !important;
    }
    
    tr.detail-row td {
      padding: 0.75rem !important;
      background-color: #f8fafc;
    }
    
    /* Remove margin after expanded rows since detail row follows */
    tr.expanded {
      margin-bottom: 0 !important;
      border-bottom: none !important;
      border-radius: 8px 8px 0 0 !important;
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
  // State to track if we're in mobile view (below LAPTOP breakpoint)
  const [isMobileView, setIsMobileView] = useState(false);
  // Track our own expanded state for mobile views
  const [mobileExpandedRows, setMobileExpandedRows] = useState({});

  // Initialize all rows as expanded on mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= Breakpoint.LAPTOP;
      setIsMobileView(mobile);
      
      // If switching to mobile view, auto-expand all rows
      if (mobile && !isMobileView) {
        const newExpandedState = {};
        data.forEach(row => {
          newExpandedState[row[keyField]] = true;
        });
        setMobileExpandedRows(newExpandedState);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [data, keyField, isMobileView]);
  
  // When new data comes in, auto-expand new rows in mobile view
  useEffect(() => {
    if (isMobileView) {
      const newExpandedState = {...mobileExpandedRows};
      data.forEach(row => {
        if (newExpandedState[row[keyField]] === undefined) {
          newExpandedState[row[keyField]] = true;
        }
      });
      setMobileExpandedRows(newExpandedState);
    }
  }, [data, isMobileView, keyField, mobileExpandedRows]);

  // Return empty state if no data
  if (!data || data.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }
  
  // Determine which expanded state to use
  const effectiveExpandedRows = isMobileView ? mobileExpandedRows : expandedRows;

  // Handle row toggling, respecting the mobile view state
  const handleRowToggle = (rowId) => {
    if (isMobileView) {
      setMobileExpandedRows(prev => ({
        ...prev,
        [rowId]: !prev[rowId]
      }));
    } else if (onRowToggle) {
      onRowToggle(rowId);
    }
  };

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
                {/* Expansion toggle or sequence number based on viewport */}
                {expandableRowRender && (
                  <td
                    onClick={() => handleRowToggle(row[keyField])}
                    style={{ 
                      cursor: isMobileView ? "default" : "pointer", 
                      width: "40px",
                      userSelect: "none", /* Prevent text selection on click */
                      WebkitUserSelect: "none", /* For Safari */
                      MozUserSelect: "none", /* For Firefox */
                      msUserSelect: "none" /* For IE/Edge */
                    }}
                    data-label="No."
                  >
                    {isMobileView ? (
                      <div style={{ 
                        fontWeight: 600, 
                        color: "#4e7fff",
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap"
                      }}>
                        AI Productivity #{rowIndex + 1}
                      </div>
                    ) : (
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
