import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Crosshair } from 'lucide-react';
import Joystick from './Joystick';
import CubeSat from './CubeSat';
import TrackVisualizer from './TrackVisualizer';
import Compass2D from './Compass2D';

export default function ControlPanel({ onBack, data = {}, gpsPath = [], isConnected = false }) {
    const videoRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [error, setError] = useState('');

    const [isArmed, setIsArmed] = useState(false);

    const [videoDevices, setVideoDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

    const [localOrientation, setLocalOrientation] = useState({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            setVideoDevices(videoInputs);
            if (videoInputs.length > 0) {
                setSelectedDeviceId(videoInputs[0].deviceId);
            }
        });

        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        if (cameraActive) return;
        try {
            const constraints = {
                video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
                setError('');
            }
        } catch (err) {
            console.error("Camera Error:", err);
            setError("Camera access denied or not found.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    };

    const toggleCamera = () => {
        if (cameraActive) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const sendCommand = (cmd) => {
        if (window.api) {
            window.api.serial.write(cmd + '\n');
            console.log("Sent:", cmd);
        } else {
            console.warn("Serial API missing (Web Mode)");
        }
    };

    const handleArm = () => {
        if (!isArmed) {
            if (confirm("WARNING: You are about to ARM the vehicle. Propellers may spin!")) {
                setIsArmed(true);
                sendCommand("CMD:ARM");
            }
        } else {
            setIsArmed(false);
            sendCommand("CMD:DISARM");
        }
    };

    const handleJoystickMove = (x, y) => {
        const pan = Math.round(((x + 1) / 2) * 180);
        const tilt = Math.round(((y + 1) / 2) * 180);

        setLocalOrientation({
            x: y * 90,
            y: 0,
            z: x * -90
        });

        sendCommand(`CMD:SERVO:1:${pan}`);
        sendCommand(`CMD:SERVO:2:${tilt}`);
    };

    const cubeSatData = {
        ...data,
        gyro: localOrientation
    };

    const [flightTime, setFlightTime] = useState(0);
    useEffect(() => {
        let interval;
        if (isConnected) {
            interval = setInterval(() => {
                setFlightTime(prev => prev + 1);
            }, 1000);
        } else {
            setFlightTime(0);
        }
        return () => clearInterval(interval);
    }, [isConnected]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const [calculatedSpeed, setCalculatedSpeed] = useState(0);
    const [gpsBearing, setGpsBearing] = useState(0);
    const prevGpsRef = useRef(null);

    useEffect(() => {
        if (data.gps && data.gps.lat && data.gps.lon) {
            const currentGps = { lat: data.gps.lat, lon: data.gps.lon, time: Date.now() };

            if (prevGpsRef.current) {
                const prev = prevGpsRef.current;
                const timeDiff = (currentGps.time - prev.time) / 1000;

                if (timeDiff > 0) {
                    const R = 6371e3;
                    const φ1 = prev.lat * Math.PI / 180;
                    const φ2 = currentGps.lat * Math.PI / 180;
                    const Δφ = (currentGps.lat - prev.lat) * Math.PI / 180;
                    const Δλ = (currentGps.lon - prev.lon) * Math.PI / 180;

                    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const d = R * c;

                    const speedMps = d / timeDiff;
                    const speedKmph = speedMps * 3.6;

                    if (speedKmph > 0.5) {
                        setCalculatedSpeed(speedKmph.toFixed(1));

                        const y = Math.sin(Δλ) * Math.cos(φ2);
                        const x = Math.cos(φ1) * Math.sin(φ2) -
                            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
                        const θ = Math.atan2(y, x);
                        const bearing = (θ * 180 / Math.PI + 360) % 360;
                        setGpsBearing(bearing);
                    } else {
                        setCalculatedSpeed("0.0");
                    }
                }
            }
            prevGpsRef.current = currentGps;
        }
    }, [data.gps]);

    const batteryVoltage = data.battery || 0;
    const batteryPercent = Math.min(100, Math.max(0, Math.round(((batteryVoltage - 3.0) / (4.2 - 3.0)) * 100)));

    const rssi = data.rssi || -75;
    const signalPercent = Math.min(100, Math.max(0, Math.round(((rssi + 100) / 50) * 100)));
    const signalBars = Math.ceil(signalPercent / 25);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#050505', color: 'white', padding: '10px', gap: '10px' }}>
            <div style={{
                height: '50px', display: 'flex', alignItems: 'center', padding: '0 10px',
                justifyContent: 'space-between', background: '#111', borderRadius: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={onBack} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={selectedDeviceId}
                            onChange={(e) => {
                                setSelectedDeviceId(e.target.value);
                                if (cameraActive) {
                                    stopCamera();
                                    setTimeout(() => startCamera(), 100);
                                }
                            }}
                            style={{ background: '#222', color: '#aaa', border: 'none', padding: '5px', borderRadius: '4px', maxWidth: '150px', fontSize: '0.8rem' }}
                        >
                            {videoDevices.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>
                                    {d.label || `Camera ${d.deviceId.slice(0, 5)}...`}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={toggleCamera}
                            style={{
                                background: cameraActive ? 'var(--danger-color)' : '#222',
                                color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                            }}
                        >
                            {cameraActive ? 'DISCONNECT' : 'CONNECT'}
                        </button>
                    </div>
                    <button
                        onClick={handleArm}
                        className={isArmed ? 'btn-danger pulse-animation' : 'btn-primary'}
                        style={{ padding: '5px 15px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px' }}
                    >
                        {isArmed ? 'ARMED' : 'DISARMED'}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1.5fr 1fr', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>

                <div style={{ gridColumn: 'span 3', background: 'black', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #222', minWidth: 0, minHeight: 0 }}>
                    {error && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--danger-color)' }}>
                            {error}
                        </div>
                    )}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                        <div>ISO <span style={{ fontWeight: 'bold' }}>{data.iso || 600}</span></div>
                        <div>SHUTTER <span style={{ fontWeight: 'bold' }}>1/50</span></div>
                        <div>EV <span style={{ fontWeight: 'bold' }}>0.0</span></div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '200px', height: '50px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,30 L10,25 L20,28 L30,15 L40,20 L50,10 L60,22 L70,5 L80,18 L90,12 L100,30 Z" fill="rgba(255,255,255,0.3)" />
                        </svg>
                    </div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.6 }}>
                        <Crosshair size={48} color="white" strokeWidth={1} />
                    </div>
                </div>

                <div style={{ background: '#111', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid #222', minWidth: 0, minHeight: 0 }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Battery Status</div>
                        <div style={{ fontSize: '1.5rem', color: batteryPercent > 20 ? '#4caf50' : 'var(--danger-color)', fontWeight: 'bold' }}>
                            {batteryPercent}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>{batteryVoltage.toFixed(2)}V</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Signal Strength</div>
                        <div style={{ display: 'flex', gap: '2px', height: '20px', alignItems: 'flex-end' }}>
                            {[1, 2, 3, 4].map(bar => (
                                <div key={bar} style={{
                                    width: '4px',
                                    height: `${bar * 25}%`,
                                    background: bar <= signalBars ? 'white' : '#333'
                                }}></div>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '100px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>Compass</div>
                        <Compass2D heading={gpsBearing || data.orientation || 0} />
                    </div>
                </div>

                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222', position: 'relative' }}>
                    <TrackVisualizer
                        path={gpsPath}
                        currentPos={gpsPath.length > 0 ? gpsPath[gpsPath.length - 1] : null}
                        mini={true}
                    />
                </div>

                <div style={{ background: '#111', borderRadius: '12px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', border: '1px solid #222' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>SPEED</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{calculatedSpeed} km/h</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>HEIGHT</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{data.altitude || 0} m</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>FLIGHT TIME</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatTime(flightTime)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>ISO</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{data.iso || 600}</div>
                    </div>
                </div>

                <div style={{ background: '#111', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222', flexDirection: 'column' }}>
                    <Joystick onMove={handleJoystickMove} size={120} />
                    <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#666' }}>GIMBAL CONTROL</div>
                </div>

                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222', position: 'relative' }}>
                    <CubeSat data={cubeSatData} style={{ background: 'transparent' }} />
                    <div style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center', fontSize: '0.7rem', color: '#666' }}>
                        ORIENTATION
                    </div>
                </div>

            </div>
        </div>
    );
}
