import React from 'react';

export default function Compass2D({ heading = 0 }) {
    const normalizedHeading = (heading % 360 + 360) % 360;

    const ticks = [];
    for (let i = 0; i < 360; i += 2) {
        const isMajor = i % 10 === 0;
        const isCardinal = i % 90 === 0;
        const length = isCardinal ? 15 : isMajor ? 10 : 5;
        const width = isCardinal ? 2 : isMajor ? 1.5 : 1;
        const color = isCardinal ? 'white' : 'rgba(255,255,255,0.6)';

        ticks.push(
            <line
                key={i}
                x1="0" y1={-40}
                x2="0" y2={-40 + length}
                stroke={color}
                strokeWidth={width}
                transform={`rotate(${i})`}
            />
        );
    }

    const numbers = [];
    for (let i = 0; i < 360; i += 30) {
        if (i % 90 !== 0) {
            numbers.push(
                <text
                    key={`num-${i}`}
                    x="0" y="-60"
                    fill="white"
                    fontSize="8"
                    textAnchor="middle"
                    transform={`rotate(${i})`}
                    style={{ fontWeight: 'bold' }}
                >
                    {i}
                </text>
            );
        }
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', borderRadius: '50%', overflow: 'hidden' }}>
            <svg viewBox="-80 -80 160 160" width="100%" height="100%">
                <g transform={`rotate(${-normalizedHeading})`}>
                    {ticks}
                    {numbers}
                    <text x="0" y="-55" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(0)">N</text>
                    <text x="0" y="-55" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(90)">E</text>
                    <text x="0" y="-55" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(180)">S</text>
                    <text x="0" y="-55" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(270)">W</text>
                </g>

                <line x1="-20" y1="0" x2="20" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <line x1="0" y1="-20" x2="0" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <circle cx="0" cy="0" r="25" fill="rgba(255,255,255,0.1)" />

                <path d="M-4,-70 L4,-70 L0,-78 Z" fill="red" />
                <line x1="0" y1="45" x2="0" y2="75" stroke="white" strokeWidth="3" />

                <text x="0" y="50" fill="white" fontSize="10" textAnchor="middle" opacity="0.8">
                    {Math.round(normalizedHeading)}°
                </text>
            </svg>
        </div>
    );
}
