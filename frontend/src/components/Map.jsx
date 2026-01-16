import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

function Recenter({ lat, lon, laptopPos }) {
    const map = useMap();
    React.useEffect(() => {
        if (lat && lon && lat !== 0 && lon !== 0) {
            map.setView([lat, lon]);
        } else if (laptopPos) {
            map.setView(laptopPos);
        }
    }, [lat, lon, laptopPos, map]);
    return null;
}

export default function Map({ lat, lon }) {
    // Telemetry GPS
    const hasGPS = lat !== undefined && lon !== undefined && lat !== 0 && lon !== 0;
    const position = hasGPS ? [lat, lon] : [0, 0];

    // Laptop GPS
    const [laptopPos, setLaptopPos] = React.useState(null);

    React.useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setLaptopPos([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => console.error("Laptop GPS Error:", err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Center logic: Priority to Telemetry, then Laptop, then 0,0
    const center = hasGPS ? position : (laptopPos || [0, 0]);

    return (
        <div className="widget" style={{ flex: 1, height: '100%', minWidth: '300px', padding: 0, position: 'relative' }}>
            <div className="widget-header" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '4px', backdropFilter: 'blur(4px)' }}>
                GPS TRACKING
                {hasGPS && <span style={{ marginLeft: '10px', color: 'var(--success-color)', fontSize: '0.7rem' }}>● LOCKED</span>}
            </div>

            {!hasGPS && !laptopPos && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    <div style={{ color: 'var(--text-muted)', letterSpacing: '2px' }}>NO GPS SIGNAL</div>
                    <div style={{ width: '40px', height: '2px', background: 'var(--danger-color)' }}></div>
                </div>
            )}

            <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                />
                {hasGPS && (
                    <Marker position={position}>
                        <Popup>
                            <div style={{ color: 'black' }}>
                                <strong>Vehicle</strong><br />
                                {lat.toFixed(6)}, {lon.toFixed(6)}
                            </div>
                        </Popup>
                    </Marker>
                )}
                {laptopPos && (
                    <Marker position={laptopPos} opacity={0.7}>
                        <Popup>
                            <div style={{ color: 'black' }}>
                                <strong>Base Station</strong><br />
                                {laptopPos[0].toFixed(6)}, {laptopPos[1].toFixed(6)}
                            </div>
                        </Popup>
                    </Marker>
                )}
                <Recenter lat={lat} lon={lon} laptopPos={laptopPos} />
            </MapContainer>
        </div>
    );
}
