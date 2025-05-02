import React from "react";
import styled from "styled-components";

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
  th, td {
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

  tbody td:not(:first-of-type):not(:last-of-type) {
    padding: 0.75rem 0.75rem 0.75rem 0;
  }
  
  tbody tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  /* Fixed-width columns */
  th.fixed-width, td.fixed-width {
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
    background-color: #f8fafc;
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
  }
  
  tr.expanded .expand-icon {
    transform: rotate(90deg);
  }
  
  @media (max-width: 992px) {
    /* CSS-based responsive transformation for mobile */
    /* Hide table headers on mobile */
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
  customSummaryRow = null
}) => {
  // Return empty state if no data
  if (!data || data.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

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
              <tr className={expandableRowRender && expandedRows[row[keyField]] ? "expanded" : ""}>
                {/* Expansion toggle if expandable rows are enabled */}
                {expandableRowRender && (
                  <td 
                    onClick={() => onRowToggle && onRowToggle(row[keyField])}
                    style={{ cursor: "pointer", width: "40px" }}
                  >
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
                      style={column.width ? { "--column-width": column.width } : {}}
                      data-label={column.header} // Important for mobile view labels
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
              
              {/* Expandable detail row if provided and row is expanded */}
              {expandableRowRender && expandedRows[row[keyField]] && (
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