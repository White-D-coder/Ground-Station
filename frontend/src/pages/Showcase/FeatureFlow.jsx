import React from 'react';

const FlowNode = ({ title, children, isRoot = false }) => {
    return (
        <div className={`flow-node ${isRoot ? 'root-node' : ''}`}>
            <div className="node-content">
                {title}
            </div>
            {children && <div className="node-children">{children}</div>}
        </div>
    );
};

const FeatureFlow = () => {
    return (
        <div className="flow-container">
            <h3 className="flow-title">System Architecture</h3>
            <p className="flow-subtitle">Data flow and component hierarchy</p>

            <div className="mindmap">
                {/* Root */}
                <div className="mm-node root">
                    <div className="mm-content">Ground Station</div>
                    <div className="mm-branches">

                        {/* Branch 1: Input */}
                        <div className="mm-branch">
                            <div className="mm-line"></div>
                            <div className="mm-node">
                                <div className="mm-content">Inputs</div>
                                <div className="mm-leaves">
                                    <div className="mm-leaf">Serial / USB</div>
                                    <div className="mm-leaf">LoRa Telemetry</div>
                                    <div className="mm-leaf">CAN Bus Data</div>
                                </div>
                            </div>
                        </div>

                        {/* Branch 2: Core */}
                        <div className="mm-branch">
                            <div className="mm-line"></div>
                            <div className="mm-node">
                                <div className="mm-content">Processing</div>
                                <div className="mm-leaves">
                                    <div className="mm-leaf">Parsers</div>
                                    <div className="mm-leaf">Database (Mongo)</div>
                                    <div className="mm-leaf">Real-time Enc.</div>
                                </div>
                            </div>
                        </div>

                        {/* Branch 3: UI */}
                        <div className="mm-branch">
                            <div className="mm-line"></div>
                            <div className="mm-node">
                                <div className="mm-content">Visualization</div>
                                <div className="mm-leaves">
                                    <div className="mm-leaf">3D Map</div>
                                    <div className="mm-leaf">Charts</div>
                                    <div className="mm-leaf">Console</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureFlow;
