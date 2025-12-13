import React, { useState, useEffect } from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function History({ onBack }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        try {
            const data = localStorage.getItem('port_history');
            if (data) {
                setHistory(JSON.parse(data).reverse()); // Newest first
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear the history?')) {
            localStorage.removeItem('port_history');
            setHistory([]);
        }
    };

    const formatDuration = (ms) => {
        if (!ms) return '-';
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="history-container" style={{ padding: '20px', color: 'white', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {onBack && (
                        <button onClick={onBack} className="btn-icon" title="Back to Dashboard">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2>Connection History</h2>
                </div>
                <button
                    onClick={clearHistory}
                    className="btn-danger"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px' }}
                >
                    <Trash2 size={16} /> Clear History
                </button>
            </div>

            <div className="table-container" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '12px' }}>Port</th>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Start Time</th>
                            <th style={{ padding: '12px' }}>End Time</th>
                            <th style={{ padding: '12px' }}>Duration</th>
                            <th style={{ padding: '12px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No history found.
                                </td>
                            </tr>
                        ) : (
                            history.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px' }}>{item.port}</td>
                                    <td style={{ padding: '12px' }}>{new Date(item.startTime).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>{new Date(item.startTime).toLocaleTimeString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        {item.endTime ? new Date(item.endTime).toLocaleTimeString() : '-'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {item.duration ? formatDuration(item.duration) : (item.endTime ? formatDuration(item.endTime - item.startTime) : 'Ongoing')}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            color: item.endTime ? 'var(--text-muted)' : 'var(--success-color)',
                                            fontWeight: item.endTime ? 'normal' : 'bold'
                                        }}>
                                            {item.endTime ? 'Completed' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
