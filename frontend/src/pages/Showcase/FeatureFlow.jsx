import React from 'react';

const FeatureFlow = () => {
    return (
        <div className="flow-container">
            <h3 className="flow-title">System Architecture</h3>
            <p className="flow-subtitle">End-to-End Data Pipeline</p>

            <div className="pipeline-wrapper">

                {/* Stage 1: Ingestion */}
                <div className="pipeline-stage">
                    <div className="stage-header" style={{ borderColor: '#FF4400' }}>
                        <span className="stage-icon">📡</span>
                        <h4>Ingestion</h4>
                    </div>
                    <div className="stage-content">
                        <div className="flow-card">Serial/USB Port</div>
                        <div className="flow-card">LoRa Telemetry</div>
                        <div className="flow-card">CAN Bus Stream</div>
                    </div>
                    <div className="stage-arrow">→</div>
                </div>

                {/* Stage 2: Processing */}
                <div className="pipeline-stage">
                    <div className="stage-header" style={{ borderColor: '#339933' }}>
                        <span className="stage-icon">⚙️</span>
                        <h4>Core Processing</h4>
                    </div>
                    <div className="stage-content">
                        <div className="flow-card primary">Packet Parser</div>
                        <div className="flow-card">MongoDB Storage</div>
                        <div className="flow-card">Real-time Encoding</div>
                    </div>
                    <div className="stage-arrow">→</div>
                </div>

                {/* Stage 3: Visualization */}
                <div className="pipeline-stage">
                    <div className="stage-header" style={{ borderColor: '#61DAFB' }}>
                        <span className="stage-icon">🖥️</span>
                        <h4>Interface</h4>
                    </div>
                    <div className="stage-content">
                        <div className="flow-card">3D Trajectory</div>
                        <div className="flow-card">Live Charts</div>
                        <div className="flow-card">Command Console</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FeatureFlow;
