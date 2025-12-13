import React, { useState, useRef, useEffect } from 'react';

export default function Joystick({ onMove, size = 150 }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const containerRef = useRef(null);

    const handleStart = (e) => {
        setDragging(true);
        updatePosition(e);
    };

    const handleEnd = () => {
        setDragging(false);
        setPosition({ x: 0, y: 0 });
        onMove(0, 0); // Reset to center
    };

    const handleMove = (e) => {
        if (!dragging) return;
        updatePosition(e);
    };

    const updatePosition = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let x = clientX - rect.left - rect.width / 2;
        let y = clientY - rect.top - rect.height / 2;

        // Limit to radius
        const radius = size / 2;
        const distance = Math.sqrt(x * x + y * y);
        const maxDist = radius - 20; // Padding for knob

        if (distance > maxDist) {
            const angle = Math.atan2(y, x);
            x = Math.cos(angle) * maxDist;
            y = Math.sin(angle) * maxDist;
        }

        setPosition({ x, y });

        // Normalize to -1 to 1
        const normX = x / maxDist;
        const normY = -y / maxDist; // Invert Y for standard joystick feel (up is positive)

        onMove(normX, normY);
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [dragging]);

    return (
        <div
            ref={containerRef}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #333 0%, #111 100%)',
                border: '2px solid #444',
                position: 'relative',
                cursor: 'pointer',
                touchAction: 'none',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}
        >
            {/* Crosshairs */}
            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '1px', background: '#444' }}></div>
            <div style={{ position: 'absolute', left: '50%', top: '10%', bottom: '10%', width: '1px', background: '#444' }}></div>

            {/* Knob */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #555, #222)',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
                border: '1px solid #666'
            }}></div>
        </div>
    );
}
