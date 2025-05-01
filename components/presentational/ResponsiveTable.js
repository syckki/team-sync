import React from "react";
import styled from "styled-components";

// Styled components for the responsive table
const TableContainer = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const TableDesktop = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;

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
    
    /* Fixed width columns */
    &.fixed-width {
      width: ${props => props.$width || "auto"};
    }
  }

  td {
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0.5rem 0.75rem;
    
    /* Fixed width columns */
    &.fixed-width {
      width: ${props => props.$width || "auto"};
    }
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
 * Generic Responsive Table Component
 * Renders as a traditional table on desktop and cards on mobile
 */
const ResponsiveTable = ({
  data = [],
  columns = [],
  keyField = "id",
  emptyMessage = "No data available",
  headerTitle = "Record",
  summaryRow = null,
  renderCustomCell = null,
}) => {
  // Return empty state if no data
  if (!data || data.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <TableContainer>
      {/* Desktop Table View */}
      <TableDesktop>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={column.width ? "fixed-width" : ""} 
                style={column.width ? { width: column.width } : {}}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row[keyField] || rowIndex}>
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex}
                  className={column.width ? "fixed-width" : ""} 
                  style={column.width ? { width: column.width } : {}}
                >
                  {renderCustomCell ? (
                    renderCustomCell(row, column.field, column)
                  ) : (
                    column.render ? column.render(row[column.field], row) : row[column.field]
                  )}
                </td>
              ))}
            </tr>
          ))}
          
          {/* Summary row if provided */}
          {summaryRow && (
            <tr className="summary-row">
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex}
                  className={column.width ? "fixed-width" : ""} 
                  style={column.width ? { width: column.width } : {}}
                >
                  {summaryRow[column.field] || ""}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </TableDesktop>

      {/* Mobile Card View */}
      <TableMobile>
        {data.map((row, rowIndex) => (
          <MobileCard key={row[keyField] || rowIndex}>
            <MobileCardHeader>
              {headerTitle} #{rowIndex + 1}
            </MobileCardHeader>
            <MobileCardBody>
              {columns.map((column, colIndex) => (
                <MobileCardField key={colIndex}>
                  <MobileFieldLabel>{column.header}</MobileFieldLabel>
                  <MobileFieldValue>
                    {renderCustomCell ? (
                      renderCustomCell(row, column.field, column)
                    ) : (
                      column.render ? column.render(row[column.field], row) : row[column.field]
                    )}
                  </MobileFieldValue>
                </MobileCardField>
              ))}
            </MobileCardBody>
          </MobileCard>
        ))}
        
        {/* Summary card for mobile if summary row is provided */}
        {summaryRow && (
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
              {columns.map((column, colIndex) => {
                // Skip empty summary cells
                if (!summaryRow[column.field]) return null;
                
                return (
                  <MobileCardField key={colIndex}>
                    <MobileFieldLabel>{column.header}</MobileFieldLabel>
                    <MobileFieldValue style={{ fontWeight: "bold" }}>
                      {summaryRow[column.field]}
                    </MobileFieldValue>
                  </MobileCardField>
                );
              })}
            </MobileCardBody>
          </MobileCard>
        )}
      </TableMobile>
    </TableContainer>
  );
};

export default ResponsiveTable;