import React from 'react';

const Segment = ({ label, value }) => {
    const isObj = typeof value === 'object' && value !== null;

    return (
        <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'var(--accent-color)',
                opacity: 0.5
            }} />

            <div style={{
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {label}
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-color)', boxShadow: '0 0 5px var(--success-color)' }} />
            </div>

            {isObj ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '5px' }}>
                    {Object.entries(value).map(([k, v]) => (
                        <div key={k} style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                {typeof v === 'number' ? v.toFixed(2) : String(v)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    fontSize: '1.8rem',
                    color: 'var(--accent-color)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    textShadow: '0 0 10px var(--accent-glow)',
                    marginTop: 'auto'
                }}>
                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </div>
            )}
        </div>
    );
};

export default function DataSegments({ data }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="widget" style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    color: 'var(--text-muted)',
                    fontSize: '1.2rem',
                    letterSpacing: '2px',
                    animation: 'pulse 2s infinite'
                }}>
                    WAITING FOR TELEMETRY...
                </div>
            </div>
        );
    }

    return (
        <div className="widget" style={{ flex: 2, overflowY: 'auto', background: 'transparent', border: 'none', padding: 0 }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '12px',
                paddingBottom: '10px'
            }}>
                {Object.entries(data).map(([key, value]) => (
                    <Segment key={key} label={key} value={value} />
                ))}
            </div>
        </div>
    );
}
