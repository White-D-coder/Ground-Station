import React, { useState, useEffect } from 'react';
import { RefreshCw, Link, Link2Off, Settings } from 'lucide-react';

export default function Sidebar(props) {
    const { setIsConnected, isConnected } = props;
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
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDisconnect = async () => {
        if (window.api) {
            await window.api.serial.disconnect();
            setIsConnected(false);
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
        <div style={{
            width: '280px',
            height: '100%',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            overflowY: 'auto',
            fontFamily: 'var(--font-ui)'
        }}>
            <div className="panel-section">
                <h3 style={{
                    marginTop: 0,
                    color: 'var(--accent-color)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{ width: '4px', height: '12px', background: 'var(--accent-color)' }}></div>
                    Serial Connection
                </h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <select
                        style={{ flex: 1 }}
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
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--accent-color)',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: isConnected ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                <select
                    style={{ width: '100%', marginBottom: '20px' }}
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
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(0, 243, 255, 0.1)',
                            color: 'var(--accent-color)',
                            fontWeight: '600',
                            borderRadius: '4px',
                            border: '1px solid var(--accent-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: 'var(--accent-glow)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        <Link size={16} /> CONNECT
                    </button>
                ) : (
                    <button
                        onClick={handleDisconnect}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(255, 42, 42, 0.1)',
                            color: 'var(--danger-color)',
                            fontWeight: '600',
                            borderRadius: '4px',
                            border: '1px solid var(--danger-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: 'var(--danger-glow)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        <Link2Off size={16} /> DISCONNECT
                    </button>
                )}
            </div>

            <div className="panel-section">
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '15px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{ width: '4px', height: '12px', background: '#666' }}></div>
                    Mission Control
                </h3>
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(0, 255, 157, 0.1)',
                            color: 'var(--success-color)',
                            border: '1px solid var(--success-color)',
                            borderRadius: '4px',
                            fontWeight: '600',
                            marginBottom: '15px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: 'var(--success-glow)'
                        }}
                    >
                        START RECORDING
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(255, 42, 42, 0.1)',
                            color: 'var(--danger-color)',
                            border: '1px solid var(--danger-color)',
                            borderRadius: '4px',
                            fontWeight: '600',
                            marginBottom: '15px',
                            animation: 'pulse 2s infinite',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: 'var(--danger-glow)'
                        }}
                    >
                        STOP RECORDING
                    </button>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={() => exportData('json')} style={exportBtnStyle}>JSON</button>
                    <button onClick={() => exportData('csv')} style={exportBtnStyle}>CSV</button>
                    <button onClick={() => exportData('xlsx')} style={exportBtnStyle}>XLSX</button>
                    <button onClick={() => exportData('kml')} style={exportBtnStyle}>KML</button>
                </div>
            </div>

            <div className="panel-section">
                <h3 style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '15px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{ width: '4px', height: '12px', background: '#666' }}></div>
                    Advanced
                </h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '0.7rem', color: '#666', marginBottom: '4px', display: 'block' }}>CAN INTERFACE</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={canIface}
                            onChange={(e) => setCanIface(e.target.value)}
                            style={{ flex: 1, width: '100%' }}
                        />
                        <button onClick={handleCanListen} style={secondaryBtnStyle}>GO</button>
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.7rem', color: '#666', marginBottom: '4px', display: 'block' }}>LORA PORT</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={loraPort}
                            onChange={(e) => setLoraPort(e.target.value)}
                            style={{ flex: 1, width: '100%' }}
                        >
                            <option value="">Select Port</option>
                            {ports.map(p => <option key={p.path} value={p.path}>{p.path}</option>)}
                        </select>
                        <button onClick={handleLoraListen} style={secondaryBtnStyle}>GO</button>
                    </div>
                </div>
            </div>

            <div className="panel-section" style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '0.7rem', color: '#444', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    v1.3.0 PRO<br />
                    <span style={{ color: '#333' }}>{debugMsg}</span>
                </div>
            </div>
        </div>
    );
}

const exportBtnStyle = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    transition: 'all 0.2s'
};

const secondaryBtnStyle = {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    padding: '0 12px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: '0.75rem',
    fontWeight: '600'
};
