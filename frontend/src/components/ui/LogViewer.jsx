import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Copy, Download, Search, AlertCircle, Info, TerminalSquare } from 'lucide-react';
import Button from './Button';

function LogViewer({ logs = [], isLoading }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deployment-logs.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level.toLowerCase() !== filter) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', background: '#0F172A', borderColor: '#1E293B' }}>
      {/* Toolbar */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#fff',
                padding: '6px 12px 6px 32px',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                width: '200px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#1E293B', padding: '4px', borderRadius: '6px' }}>
            {['all', 'info', 'error'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  textTransform: 'capitalize',
                  background: filter === f ? '#334155' : 'transparent',
                  color: filter === f ? '#fff' : '#64748B'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={() => setAutoScroll(!autoScroll)} style={{ color: '#94A3B8' }} icon={autoScroll ? Pause : Play}>
            {autoScroll ? 'Pause' : 'Resume'}
          </Button>
          <div style={{ width: '1px', height: '16px', background: '#334155', margin: '0 4px' }} />
          <Button variant="ghost" size="sm" onClick={handleCopy} style={{ color: '#94A3B8' }} icon={Copy} title="Copy" />
          <Button variant="ghost" size="sm" onClick={handleDownload} style={{ color: '#94A3B8' }} icon={Download} title="Download" />
        </div>
      </div>

      {/* Log Content */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px',
          fontFamily: 'var(--mono-family)',
          fontSize: '13px',
          color: '#E2E8F0',
          lineHeight: '1.6'
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', gap: '8px' }}>
             <TerminalSquare size={20} className="animate-pulse" />
             Connecting to terminal...
          </div>
        ) : filteredLogs.length === 0 ? (
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              gap: '12px', 
              padding: '2px 0',
              color: log.level === 'error' ? '#FCA5A5' : log.level === 'warning' ? '#FDE047' : '#E2E8F0',
              wordBreak: 'break-all'
            }}>
              <span style={{ color: '#64748B', flexShrink: 0 }}>{log.timestamp}</span>
              <span style={{ 
                flexShrink: 0, 
                width: '60px',
                color: log.level === 'error' ? '#EF4444' : log.level === 'warning' ? '#F59E0B' : '#3B82F6'
              }}>
                [{log.level.toUpperCase()}]
              </span>
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LogViewer;
