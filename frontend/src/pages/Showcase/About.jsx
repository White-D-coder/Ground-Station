import React from 'react';

const About = () => {
    return (
        <section className="about-section" style={{ minHeight: '100vh', padding: '120px 2rem 5rem', background: '#000', color: '#fff', textAlign: 'center' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="section-title">About The Project</h2>
                <div style={{ border: '1px solid #222', padding: '3rem', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ground Station Professional</h3>
                    <p style={{ lineHeight: '1.8', color: '#aaa', marginBottom: '2rem' }}>
                        This project represents a sophisticated approach to aerospace ground control systems.
                        Designed and engineered by <strong>Deeptanu Bhunia</strong>, the platform bridges high-frequency hardware communication with modern, reactive data visualization.
                    </p>
                    <p style={{ lineHeight: '1.8', color: '#aaa', marginBottom: '2rem' }}>
                        The system was built to address the need for a unified, cross-platform interface capable of handling complex telemetry streams from CubeSats, Rovers, and UAVs without the bloat of legacy industrial software.
                    </p>
                    <hr style={{ borderColor: '#222', margin: '2rem 0' }} />
                    <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Technologies</h4>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['Electron', 'React', 'Node.js', 'WebSockets', 'D3.js', 'Leaflet'].map(tech => (
                            <span key={tech} style={{ border: '1px solid #444', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.8rem', color: '#888' }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
