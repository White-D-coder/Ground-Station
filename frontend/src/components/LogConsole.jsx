import React, { useEffect, useRef } from 'react';

export default function LogConsole({ logs }) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            minWidth: '300px'
        }}>
            <div style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                System Logs
            </div>
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: '#000'
            }}>
                {logs.length === 0 && <div style={{ color: '#444', fontStyle: 'italic' }}>Waiting for data...</div>}
                {logs.map((log, i) => {
                    let color = 'var(--text-secondary)';
                    if (typeof log === 'string') {
                        if (log.includes('ERROR')) color = 'var(--danger-color)';
                        if (log.includes('SUCCESS') || log.includes('Connected')) color = 'var(--success-color)';
                    }
                    return (
                        <div key={i} style={{ color, wordBreak: 'break-all' }}>
                            <span style={{ color: '#555', marginRight: '8px' }}>[{new Date().toLocaleTimeString()}]</span>
                            {typeof log === 'object' ? JSON.stringify(log) : log}
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>
        </div>
    );
}
