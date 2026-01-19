import React from 'react';
import FeatureFlow from './FeatureFlow';
import './FeatureFlow.css';

const Features = () => {
    return (
        <section className="features-section" style={{ minHeight: '100vh', padding: '120px 2rem 5rem' }}>
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
                <div className="feature-card">
                    <h3>Hybrid Architecture</h3>
                    <p>Electron-based desktop environment with web-proxy capabilities for remote monitoring.</p>
                </div>
                <div className="feature-card">
                    <h3>Modular Design</h3>
                    <p>Scalable backend architecture allowing for easy integration of new sensor types and protocols.</p>
                </div>
                <div className="feature-card">
                    <h3>Secure & Reliable</h3>
                    <p>Built for mission-critical operations with robust error handling and fail-safe mechanisms.</p>
                </div>
            </div>

            <div style={{ marginTop: '5rem' }}>
                <FeatureFlow />
            </div>
        </section>
    );
};

export default Features;
