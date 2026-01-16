import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#333',
            borderWidth: 1
        },
        zoom: {
            pan: {
                enabled: true,
                mode: 'xy', // Allow panning in both directions
            },
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true
                },
                mode: 'xy', // Allow zooming in both directions
            }
        }
    },
    scales: {
        x: { display: false },
        y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#5c6b7f', font: { size: 10, family: 'monospace' } },
            border: { display: false }
        }
    },
    elements: {
        point: { radius: 0, hitRadius: 10, hoverRadius: 4 },
        line: { borderWidth: 2, tension: 0.3 } // Smoother lines
    }
};

const createData = (color, data) => ({
    labels: data.map((_, i) => i),
    datasets: [
        {
            data,
            borderColor: color,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, color.replace('1)', '0.5)'));
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                return gradient;
            },
            fill: true,
            borderWidth: 2
        },
    ],
});

export default function Charts({ data }) {
    const [datasets, setDatasets] = useState({});
    const [selectedKeys, setSelectedKeys] = useState([]);
    const maxPoints = 100;

    useEffect(() => {
        if (!data) return;

        setDatasets(prev => {
            const next = { ...prev };
            let hasNewKeys = false;

            // Helper to flatten object
            const flatten = (obj, prefix = '', res = {}) => {
                for (const key in obj) {
                    const val = obj[key];
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                        flatten(val, newKey, res);
                    } else {
                        res[newKey] = val;
                    }
                }
                return res;
            };

            const flatData = flatten(data);

            // Identify numeric keys
            Object.keys(flatData).forEach(key => {
                const val = flatData[key];
                if (typeof val === 'number') {
                    if (!next[key]) {
                        next[key] = [];
                        hasNewKeys = true;
                    }
                    next[key] = [...next[key], val].slice(-maxPoints);
                }
            });

            return next;
        });
    }, [data]);

    // Initialize selected keys if empty
    useEffect(() => {
        if (selectedKeys.length === 0 && Object.keys(datasets).length > 0) {
            setSelectedKeys(Object.keys(datasets).slice(0, 4));
        }
    }, [datasets]);

    const toggleKey = (key) => {
        setSelectedKeys(prev => {
            if (prev.includes(key)) {
                return prev.filter(k => k !== key);
            } else {
                if (prev.length >= 4) {
                    // Remove the first one and add the new one to keep max 4
                    return [...prev.slice(1), key];
                }
                return [...prev, key];
            }
        });
    };

    // Premium colors: Cyan, Purple, Green, Orange
    const colors = ['rgba(0, 242, 255, 1)', 'rgba(189, 0, 255, 1)', 'rgba(0, 255, 157, 1)', 'rgba(255, 184, 0, 1)'];

    const availableKeys = Object.keys(datasets);

    return (
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '5px' }}>
                {availableKeys.map(key => (
                    <button
                        key={key}
                        onClick={() => toggleKey(key)}
                        style={{
                            background: selectedKeys.includes(key) ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        {key}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '15px' }}>
                {selectedKeys.map((key, i) => (
                    <div key={key} className="widget" style={{ padding: '10px' }}>
                        <div className="widget-header" style={{ marginBottom: '5px' }}>
                            {key}
                            <div style={{ fontSize: '0.7rem', color: colors[i % colors.length] }}>
                                {datasets[key][datasets[key].length - 1]?.toFixed(2)}
                            </div>
                        </div>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Line options={options} data={createData(colors[i % colors.length], datasets[key])} />
                        </div>
                    </div>
                ))}
                {selectedKeys.length === 0 && (
                    <div className="widget" style={{ gridColumn: '1 / -1', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', letterSpacing: '2px' }}>
                            SELECT DATA TO VIEW
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
