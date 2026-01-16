import React, { useState, useEffect } from 'react';

export default function Header({ isConnected }) {
    const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            height: '60px',
            backdropFilter: 'blur(10px)',
            zIndex: 20
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-color)',
                    boxShadow: '0 0 15px var(--accent-glow)'
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'white', letterSpacing: '2px', fontWeight: '800', lineHeight: '1' }}>
                        GROUND<span style={{ color: 'var(--accent-color)' }}>STATION</span>
                    </h1>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
                        v1.2.0 by Deeptanu (White-D-coder)
                    </span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <div style={{
                    color: isConnected ? 'var(--success-color)' : 'var(--danger-color)',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    background: isConnected ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: `1px solid ${isConnected ? 'var(--success-color)' : 'var(--danger-color)'}`
                }}>
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isConnected ? 'var(--success-color)' : 'var(--danger-color)',
                        boxShadow: `0 0 8px ${isConnected ? 'var(--success-color)' : 'var(--danger-color)'}`
                    }}></div>
                    {isConnected ? 'LINK ESTABLISHED' : 'NO CONNECTION'}
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                    textShadow: '0 0 10px rgba(255,255,255,0.3)'
                }}>
                    {time}
                </div>
            </div>
        </header>
    );
}
