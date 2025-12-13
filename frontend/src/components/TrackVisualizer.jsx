import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft } from 'lucide-react';

// Fix marker icon issue in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function Recenter({ lat, lon }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lon && lat !== 0 && lon !== 0) {
            map.setView([lat, lon], map.getZoom(), { animate: true });
        }
    }, [lat, lon, map]);
    return null;
}

const TrackVisualizer = React.memo(function TrackVisualizer({ path, currentPos, onBack, mini = false }) {
    // Default to 0,0 if no position
    const center = useMemo(() =>
        currentPos && currentPos.lat !== 0 ? [currentPos.lat, currentPos.lon] : [0, 0]
        , [currentPos]);
    const hasGPS = currentPos && currentPos.lat !== 0 && currentPos.lon !== 0;

    // Convert path to array of arrays for Polyline
    const polylinePositions = useMemo(() =>
        path.map(p => [p.lat, p.lon])
        , [path]);

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%', background: '#1a1a1a', borderRadius: mini ? '8px' : '0', overflow: 'hidden' }}>
            {/* Header / Overlay - Hide in mini mode */}
            {!mini && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={onBack}
                        className="btn-icon"
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            padding: '10px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={24} color="white" />
                    </button>
                    <div style={{
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        LIVE TRACK VISUALIZER
                        {hasGPS ? (
                            <span style={{ marginLeft: '10px', color: 'var(--success-color)', fontSize: '0.8rem' }}>● LIVE</span>
                        ) : (
                            <span style={{ marginLeft: '10px', color: 'var(--danger-color)', fontSize: '0.8rem' }}>● NO SIGNAL</span>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Overlay - Hide in mini mode */}
            {!mini && (
                <div style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '30px',
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    padding: '15px',
                    borderRadius: '8px',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minWidth: '200px'
                }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>POINTS RECORDED</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{path.length}</div>

                    {hasGPS && (
                        <>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '5px' }}>CURRENT LOCATION</div>
                            <div style={{ fontFamily: 'monospace' }}>
                                {currentPos.lat.toFixed(6)}, {currentPos.lon.toFixed(6)}
                            </div>
                        </>
                    )}
                </div>
            )}

            <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                />

                {/* The Track */}
                <Polyline
                    positions={polylinePositions}
                    pathOptions={{ color: '#00aaff', weight: 4, opacity: 0.8 }}
                />

                {/* Current Position Marker */}
                {hasGPS && (
                    <Marker position={[currentPos.lat, currentPos.lon]}>
                        <Popup>
                            <div style={{ color: 'black' }}>
                                <strong>Current Position</strong><br />
                                {currentPos.lat.toFixed(6)}, {currentPos.lon.toFixed(6)}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Start Marker */}
                {path.length > 0 && (
                    <Marker position={[path[0].lat, path[0].lon]} opacity={0.6}>
                        <Popup>
                            <div style={{ color: 'black' }}>
                                <strong>Start Point</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <Recenter lat={currentPos?.lat} lon={currentPos?.lon} />
            </MapContainer>
        </div>
    );
});

export default TrackVisualizer;
