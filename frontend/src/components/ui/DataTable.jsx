import React from 'react';
import { Search } from 'lucide-react';

function DataTable({ columns, data, onRowClick, isLoading, emptyMessage = "No data available." }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-default)' }}>
              {columns.map((col, i) => (
                <th key={i} style={{ 
                  padding: '12px 16px', 
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '13px'
                }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                 <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                   {columns.map((_, colI) => (
                     <td key={colI} style={{ padding: '16px' }}>
                       <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
                     </td>
                   ))}
                 </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr 
                  key={row.id || i} 
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ 
                    borderBottom: '1px solid var(--border-light)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map((col, colI) => (
                    <td key={colI} style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
