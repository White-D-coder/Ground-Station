
import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react';

export default function Header({ isConnected }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            height: '50px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: 'var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            backdropFilter: 'blur(10px)',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="var(--accent-color)" style={{ filter: 'drop-shadow(0 0 5px var(--accent-color))' }} />
                <h1 style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    letterSpacing: '2px',
                    background: 'linear-gradient(90deg, #fff, #aaa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase'
                }}>
                    Ground Station <span style={{ color: 'var(--accent-color)', WebkitTextFillColor: 'var(--accent-color)' }}>PRO</span>
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: isConnected ? 'var(--success-color)' : '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Clock size={14} color="var(--text-secondary)" />
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)'
                    }}>
                        {time.toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                </div>
            </div>
        </div>
    );
}
