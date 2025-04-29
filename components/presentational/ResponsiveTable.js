import React from "react";
import styled from "styled-components";

// Container for the entire responsive table
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  
  /* Table will be responsive in mobile view */
  @media (max-width: 768px) {
    overflow-x: visible;
  }
`;

// Styled table element
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  /* Mobile view transformation */
  @media (max-width: 768px) {
    display: block;
    width: 100%;
    
    thead {
      display: none; /* Hide header in mobile view */
    }
    
    tbody {
      display: block;
      width: 100%;
    }
    
    tr {
      display: block;
      margin-bottom: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    td {
      display: flex;
      padding: 0.5rem 0.75rem;
      text-align: right;
      border-bottom: 1px solid #f3f4f6;
      
      &:last-child {
        border-bottom: none;
      }
      
      &::before {
        content: attr(data-label);
        font-weight: 600;
        margin-right: auto;
        text-align: left;
      }
    }
  }
`;

// Table header cell
const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  
  /* Fixed width for specific columns if needed */
  ${props => props.$fixedWidth && `
    width: ${props.$fixedWidth};
    min-width: ${props.$fixedWidth};
  `}
  
  /* Column alignment */
  ${props => props.$align === 'right' && `
    text-align: right;
  `}
  
  ${props => props.$align === 'center' && `
    text-align: center;
  `}
  
  /* Hide column in mobile view if specified */
  @media (max-width: 768px) {
    ${props => props.$hideOnMobile && `
      display: none;
    `}
  }
`;

// Table cell
const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  
  /* Column alignment */
  ${props => props.$align === 'right' && `
    text-align: right;
  `}
  
  ${props => props.$align === 'center' && `
    text-align: center;
  `}
  
  /* Hide column in mobile view if specified */
  @media (max-width: 768px) {
    ${props => props.$hideOnMobile && `
      display: none;
    `}
    
    /* If this cell is hidden on mobile, don't use it for labels */
    ${props => props.$hideOnMobile && `
      &::before {
        content: '';
        display: none;
      }
    `}
  }
  
  /* Allow cell styling to be passed in */
  ${props => props.$cellStyle}
`;

// Table row
const TableRow = styled.tr`
  &:nth-child(odd) {
    background-color: #f9fafb;
  }
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  /* Status-based styling */
  ${props => props.$status === 'draft' && `
    background-color: #fffbeb;
    &:hover {
      background-color: #fef3c7;
    }
  `}
  
  ${props => props.$status === 'completed' && `
    background-color: #f0fdf4;
    &:hover {
      background-color: #dcfce7;
    }
  `}
`;

// Empty state component for when there is no data
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 0.5rem;
  margin: 1rem 0;
  
  svg {
    color: #9ca3af;
    margin-bottom: 1rem;
    width: 3rem;
    height: 3rem;
  }
  
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

/**
 * Responsive table component that adjusts between desktop and mobile views
 * 
 * @param {Object} props Component props
 * @param {Array} props.columns Column definitions with the following properties:
 *   - id: Unique identifier for the column (required)
 *   - label: Display label for the column (required)
 *   - fixedWidth: Fixed width for the column (optional, e.g., "100px")
 *   - align: Text alignment - 'left' (default), 'right', 'center'
 *   - hideOnMobile: Whether to hide this column on mobile devices
 *   - cellStyle: Custom CSS styles for cells in this column
 *   - renderer: Function to render custom content (params: value, rowData)
 * @param {Array} props.data Array of data objects where keys match column IDs
 * @param {Function} props.onRowClick Optional callback when a row is clicked (disabled in readonly mode)
 * @param {Function} props.getRowStatus Function to determine row status for styling ('draft', 'completed', etc.)
 * @param {Object} props.emptyState Custom empty state properties { title, message, icon }
 * @param {boolean} props.readonly Whether the table is in readonly mode (disables row clicking, may affect styling)
 */
const ResponsiveTable = ({ 
  columns, 
  data = [], 
  onRowClick,
  getRowStatus = () => null,
  emptyState = {
    title: "No data available",
    message: "There are no items to display at this time.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    )
  },
  readonly = false
}) => {
  // If there's no data, show empty state
  if (!data || data.length === 0) {
    return (
      <EmptyState>
        {emptyState.icon}
        <h3>{emptyState.title}</h3>
        <p>{emptyState.message}</p>
      </EmptyState>
    );
  }

  // Handle readonly view differences (if any special handling is needed)
  const handleRowClick = readonly ? undefined : onRowClick;
  
  return (
    <TableContainer>
      <StyledTable>
        <thead>
          <tr>
            {columns.map(column => (
              <TableHeader 
                key={column.id} 
                $fixedWidth={column.fixedWidth}
                $align={column.align}
                $hideOnMobile={column.hideOnMobile}
              >
                {column.label}
              </TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={rowIndex} 
              onClick={() => handleRowClick && handleRowClick(row)}
              style={{ 
                cursor: handleRowClick ? 'pointer' : 'default',
                opacity: readonly && row.status === 'draft' ? 0.7 : 1 
              }}
              $status={getRowStatus(row)}
            >
              {columns.map(column => (
                <TableCell 
                  key={`${rowIndex}-${column.id}`}
                  data-label={column.label} // Used for mobile view
                  $align={column.align}
                  $hideOnMobile={column.hideOnMobile}
                  $cellStyle={column.cellStyle}
                >
                  {/* Provide a way to render custom cell content based on column renderer */}
                  {column.renderer ? column.renderer(row[column.id], row, readonly) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </tbody>
      </StyledTable>
    </TableContainer>
  );
};

export default ResponsiveTable;