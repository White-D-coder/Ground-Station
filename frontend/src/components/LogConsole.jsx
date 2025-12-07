import React, { useEffect, useRef } from 'react';

export default function LogConsole({ logs }) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="widget" style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div className="widget-header" style={{ padding: '10px 15px', borderBottom: '1px solid var(--border-color)', margin: 0, background: 'rgba(0,0,0,0.2)' }}>
                SYSTEM LOGS
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{logs.length} EVENTS</span>
            </div>
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                {logs.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
                        NO LOGS AVAILABLE
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        paddingBottom: '2px',
                        color: log.includes('ERROR') ? 'var(--danger-color)' : 'var(--text-primary)'
                    }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '10px' }}>
                            {new Date().toLocaleTimeString()}
                        </span>
                        {log}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
