import React from 'react';

const Segment = ({ label, value }) => {
    const isObj = typeof value === 'object' && value !== null;

    return (
        <div style={{
            background: 'rgba(20, 20, 20, 0.6)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: '4px',
            padding: '12px',
            minWidth: '140px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
        }}
            className="data-segment"
        >
            <div style={{
                color: 'var(--accent-color)',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '1px solid rgba(0, 243, 255, 0.1)',
                paddingBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {label}
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: 'var(--accent-glow)' }}></div>
            </div>

            {isObj ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                    {Object.entries(value).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#666', fontSize: '0.65rem', textTransform: 'uppercase' }}>{k}</span>
                            <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                                {typeof v === 'number' ? v.toFixed(2) : String(v)}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    fontSize: '1.8rem',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                    textShadow: '0 0 10px rgba(255,255,255,0.2)'
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
            <div style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#444',
                border: '1px dashed #333',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{ fontSize: '2rem', opacity: 0.5 }}>📡</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>WAITING FOR DATA STREAM...</div>
            </div>
        );
    }

    return (
        <div style={{
            flex: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignContent: 'flex-start',
            overflowY: 'auto',
            paddingRight: '5px'
        }}>
            {Object.entries(data).map(([key, value]) => (
                <Segment key={key} label={key} value={value} />
            ))}
        </div>
    );
}
