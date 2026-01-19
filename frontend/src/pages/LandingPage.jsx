import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLaunch = () => {
        navigate('/app');
    };

    const handleGithub = () => {
        window.open('https://github.com/White-D-coder/Ground-Station', '_blank');
    };

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="nav-logo">GS / PRO</div>
                <div className="nav-links">
                    <button onClick={handleGithub}>GitHub</button>
                </div>
            </nav>

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
                </div>
            </section>

            <section className="features-section">
                <h2 className="section-title">System Modules</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Telemetry Core</h3>
                        <p>High-frequency data ingestion supporting Serial, CAN Bus, and Long-Range encoded packets.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Spatial Analysis</h3>
                        <p>Real-time 3D geospatial tracking and path visualization with predictive analytics.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Mission Archive</h3>
                        <p>Comprehensive flight data recording, playback, and post-mission telemetry export.</p>
                    </div>
                </div>
            </section>

            <section className="gallery-section">
                <h2 className="section-title">Interface Visuals</h2>
                <img src="/_ (27).jpeg" alt="Ground Station Interface" className="showcase-image" />
            </section>

            <footer className="creator-section">
                <p>Architected & Engineered by <span>Deeptanu Bhunia</span></p>
                <p style={{ marginTop: '10px', fontSize: '0.7rem', color: '#222' }}> &copy; 2026 Antigravity Systems.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
