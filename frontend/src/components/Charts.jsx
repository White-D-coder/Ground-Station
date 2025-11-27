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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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
            bodyColor: '#ccc',
            borderColor: '#333',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            display: false,
            grid: { color: '#222' }
        },
        y: {
            grid: { color: '#222' },
            ticks: { color: '#666', font: { size: 9, family: 'JetBrains Mono' } },
            border: { display: false }
        }
    },
    elements: {
        point: { radius: 0, hitRadius: 10 },
        line: { borderWidth: 1.5, tension: 0.2 }
    }
};

const createData = (color, data) => ({
    labels: data.map((_, i) => i),
    datasets: [
        {
            data,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 1.5
        },
    ],
});

export default function Charts({ data }) {
    const [datasets, setDatasets] = useState({});
    const maxPoints = 100;

    useEffect(() => {
        if (!data) return;

        setDatasets(prev => {
            const next = { ...prev };

            // Identify numeric keys
            Object.keys(data).forEach(key => {
                const val = data[key];
                if (typeof val === 'number') {
                    if (!next[key]) next[key] = [];
                    next[key] = [...next[key], val].slice(-maxPoints);
                }
            });

            return next;
        });
    }, [data]);

    // Pick top 4 numeric keys to display
    const keys = Object.keys(datasets).slice(0, 4);
    const colors = ['#00f3ff', '#00ff9d', '#ff2a2a', '#ffff00'];

    return (
        <div style={{ flex: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '12px' }}>
            {keys.map((key, i) => (
                <div key={key} style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        color: '#888',
                        fontSize: '0.65rem',
                        marginBottom: '5px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        {key}
                        <span style={{ color: colors[i % colors.length] }}>
                            {datasets[key][datasets[key].length - 1]?.toFixed(2)}
                        </span>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line options={options} data={createData(colors[i % colors.length], datasets[key])} />
                    </div>
                </div>
            ))}
            {keys.length === 0 && (
                <div style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#444',
                    border: '1px dashed #333',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem'
                }}>
                    WAITING FOR NUMERIC DATA...
                </div>
            )}
        </div>
    );
}
