import React from 'react';

const ChannelBar = ({ label, value, min = 1000, max = 2000 }) => {
    const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#aaa', marginBottom: '2px' }}>
                <span>{label}</span>
                <span>{value.toFixed(0)}</span>
            </div>
            <div style={{ height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                <div style={{ 
                    height: '100%', 
                    width: `${percent}%`, 
                    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                    boxShadow: '0 0 10px rgba(79, 172, 254, 0.5)',
                    transition: 'width 0.1s ease'
                }}></div>
            </div>
        </div>
    );
};

export default function ReceiverChannels({ data }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="widget" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                WAITING FOR RECEIVER DATA...
            </div>
        );
    }

    return (
        <div className="widget" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="widget-header">RECEIVER DATA (WIRED PORT)</div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                {Object.entries(data).map(([key, val]) => (
                    <ChannelBar key={key} label={key} value={typeof val === 'number' ? val : 0} />
                ))}
            </div>
        </div>
    );
}
