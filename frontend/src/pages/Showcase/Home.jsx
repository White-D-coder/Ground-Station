import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const handleLaunch = () => navigate('/app');
    const handleGithub = () => window.open('https://github.com/White-D-coder/Ground-Station', '_blank');

    return (
        <section className="hero-section">
            <div className="hero-bg"></div>
            <div className="hero-content">
                <h1>
                    GROUND STATION
                    <span>by Deeptanu Bhunia</span>
                </h1>
                <p className="hero-subtitle">
                    Professional aerospace telemetry and mission control interface.
                </p>
                <div className="cta-group">
                    <button className="cta-button" onClick={handleGithub}>
                        View on GitHub
                    </button>
                    <button className="cta-button secondary" onClick={handleLaunch}>
                        Launch System
                    </button>
                </div>

                <div className="tech-stack-container">
                    <p className="tech-label">Powered By</p>
                    <div className="tech-grid">
                        {[
                            { name: 'ELECTRON', color: '#47848F' },
                            { name: 'REACT', color: '#61DAFB' },
                            { name: 'NODE.JS', color: '#339933' },
                            { name: 'MONGODB', color: '#47A248' },
                            { name: 'THREE.JS', color: '#FFFFFF' },
                            { name: 'WEBSOCKETS', color: '#FF9900' },
                            { name: 'SERIALPORT', color: '#FF4400' },
                            { name: 'VITE', color: '#646CFF' },
                            { name: 'CHART.JS', color: '#FF6384' },
                            { name: 'LEAFLET', color: '#199900' }
                        ].map(tech => (
                            <span
                                key={tech.name}
                                className="tech-pill"
                                style={{ '--hover-color': tech.color }}
                            >
                                {tech.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home;
