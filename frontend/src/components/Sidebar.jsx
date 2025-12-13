import React, { useState, useEffect } from 'react';
import { RefreshCw, Link, Link2Off, Settings, History, Map, Gamepad } from 'lucide-react';

export default function Sidebar(props) {
    const { setIsConnected, isConnected, setView, currentView } = props;
    const [ports, setPorts] = useState([]);
    const [selectedPort, setSelectedPort] = useState('');
    const selectedPortRef = React.useRef(selectedPort);
    const [baudRate, setBaudRate] = useState(115200);

    useEffect(() => {
        selectedPortRef.current = selectedPort;
    }, [selectedPort]);

    const [canIface, setCanIface] = useState('can0');
    const [loraPort, setLoraPort] = useState('');

    const { isRecording, startRecording, stopRecording, exportData } = props;
    const [debugMsg, setDebugMsg] = useState('');

    const refreshPorts = async () => {
        if (window.api) {
            try {
                const list = await window.api.serial.list();
                // console.log("Ports found:", list);
                setPorts(list);
                setDebugMsg(`Found ${list.length} ports`);

                // Use ref to get current value inside interval closure
                const currentSelection = selectedPortRef.current;

                // Only auto-select if NO port is selected and we found ports
                if ((!currentSelection || currentSelection === '') && list.length > 0) {
                    // console.log("Auto-selecting first port:", list[0].path);
                    setSelectedPort(list[0].path);
                }
            } catch (e) {
                console.error("Failed to list ports", e);
                setDebugMsg(`Error: ${e.message}`);
            }
        } else {
            console.warn("window.api is missing");
            setDebugMsg("API Missing (Not in Electron?)");
        }
    };

    useEffect(() => {
        refreshPorts();
        const interval = setInterval(refreshPorts, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleConnect = async () => {
        if (window.api && selectedPort) {
            try {
                await window.api.serial.connect(selectedPort, parseInt(baudRate));
                setIsConnected(true);

                // Add to history
                const historyItem = {
                    port: selectedPort,
                    startTime: Date.now(),
                    endTime: null,
                    duration: null
                };
                const existingHistory = JSON.parse(localStorage.getItem('port_history') || '[]');
                localStorage.setItem('port_history', JSON.stringify([...existingHistory, historyItem]));

            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDisconnect = async () => {
        if (window.api) {
            await window.api.serial.disconnect();
            setIsConnected(false);

            // Update history
            const existingHistory = JSON.parse(localStorage.getItem('port_history') || '[]');
            if (existingHistory.length > 0) {
                const lastItem = existingHistory[existingHistory.length - 1];
                if (!lastItem.endTime) {
                    lastItem.endTime = Date.now();
                    lastItem.duration = lastItem.endTime - lastItem.startTime;
                    localStorage.setItem('port_history', JSON.stringify(existingHistory));
                }
            }
        }
    };

    const handleCanListen = () => {
        if (window.api) {
            window.api.can.listen(canIface);
        }
    };

    const handleLoraListen = () => {
        if (window.api && loraPort) {
            window.api.lora.listen(loraPort);
        }
    };

    return (
        <div className="sidebar">
            <div className="panel-section">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><Settings size={14} style={{ marginRight: '8px' }} /> CONNECTION</span>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isConnected ? 'var(--success-color)' : 'var(--danger-color)',
                        boxShadow: `0 0 8px ${isConnected ? 'var(--success-color)' : 'var(--danger-color)'}`
                    }} />
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PORT</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <select
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '6px',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                            value={selectedPort}
                            onChange={(e) => setSelectedPort(e.target.value)}
                            disabled={isConnected}
                        >
                            {ports.length === 0 && <option>No Ports Found</option>}
                            {ports.map(p => <option key={p.path} value={p.path}>{p.path}</option>)}
                        </select>
                        <button
                            onClick={refreshPorts}
                            disabled={isConnected}
                            className="btn-icon"
                            title="Refresh Ports"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>BAUD RATE</label>
                    <select
                        style={{
                            width: '100%',
                            marginBottom: '15px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '6px',
                            borderRadius: '4px',
                            outline: 'none'
                        }}
                        value={baudRate}
                        onChange={(e) => setBaudRate(e.target.value)}
                        disabled={isConnected}
                    >
                        <option value="9600">9600</option>
                        <option value="57600">57600</option>
                        <option value="115200">115200</option>
                    </select>

                    {!isConnected ? (
                        <button
                            onClick={handleConnect}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: 'linear-gradient(90deg, var(--primary-color), #00aaff)',
                                border: 'none',
                                padding: '10px',
                                fontWeight: 'bold',
                                letterSpacing: '1px'
                            }}
                        >
                            <Link size={16} /> CONNECT
                        </button>
                    ) : (
                        <button
                            onClick={handleDisconnect}
                            className="btn-danger"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: 'rgba(255, 50, 50, 0.2)',
                                border: '1px solid var(--danger-color)',
                                color: 'var(--danger-color)'
                            }}
                        >
                            <Link2Off size={16} /> DISCONNECT
                        </button>
                    )}
                </div>
            </div>

            <div className="panel-section">
                <div className="panel-header">
                    Mission Control
                </div>
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            marginBottom: '10px',
                            background: 'transparent',
                            border: '1px solid var(--success-color)',
                            color: 'var(--success-color)',
                            boxShadow: 'none'
                        }}
                    >
                        START RECORDING
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="btn-danger pulse-animation"
                        style={{ width: '100%', marginBottom: '10px' }}
                    >
                        STOP RECORDING
                    </button>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={() => exportData('json')} className="btn-icon">JSON</button>
                    <button onClick={() => exportData('csv')} className="btn-icon">CSV</button>
                    <button onClick={() => exportData('xlsx')} className="btn-icon">XLSX</button>
                    <button onClick={() => exportData('kml')} className="btn-icon">KML</button>
                </div>

                <button
                    onClick={() => setView('history')}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        marginTop: '15px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <History size={16} /> VIEW HISTORY
                </button>

                <button
                    onClick={() => setView('track')}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        marginTop: '10px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Map size={16} /> TRACK VISUALIZER
                </button>

                <button
                    onClick={() => setView('control')}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        marginTop: '10px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Gamepad size={16} /> CONTROL SYSTEM
                </button>
            </div>

            <div className="panel-section">
                <div className="panel-header">
                    Advanced
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CAN Interface</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                            value={canIface}
                            onChange={(e) => setCanIface(e.target.value)}
                            style={{ flex: 1, width: '100%' }}
                        />
                        <button onClick={handleCanListen} className="btn-icon">GO</button>
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LoRa Port</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <select
                            value={loraPort}
                            onChange={(e) => setLoraPort(e.target.value)}
                            style={{ flex: 1, width: '100%' }}
                        >
                            <option value="">Select Port</option>
                            {ports.map(p => <option key={p.path} value={p.path}>{p.path}</option>)}
                        </select>
                        <button onClick={handleLoraListen} className="btn-icon">GO</button>
                    </div>
                </div>
            </div>

            <div className="panel-section" style={{ marginTop: 'auto', border: 'none', background: 'transparent', padding: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>GROUND STATION PRO</div>
                    v1.2.0<br />
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{debugMsg}</span>
                </div>
            </div>
        </div>
    );
}

