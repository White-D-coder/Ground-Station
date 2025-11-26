// Globe Initialization
const world = Globe()
    (document.getElementById('globe-viz'))
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .atmosphereColor('#00f3ff')
    .atmosphereAltitude(0.2)
    .pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

// Data Management
let vehicleData = [];
let userData = [];

// Configuration
world
    .pointColor('color')
    .pointAltitude('altitude')
    .pointRadius('radius')
    .pointLabel('label')
    .ringColor('color')
    .ringMaxRadius('maxRadius')
    .ringPropagationSpeed('speed')
    .ringRepeatPeriod('repeat')
    .labelColor(() => '#00f3ff')
    .labelAltitude(0.01)
    .labelSize(1.5)
    .labelDotRadius(0.5)
    .labelText('text');

function refreshGlobe() {
    // Combine data for points
    const allPoints = [
        ...vehicleData.map(v => ({ ...v, color: '#ff0055', altitude: 0.1, radius: 0.5 })),
        ...userData.map(u => ({ ...u, color: '#00f3ff', altitude: 0.1, radius: 0.5 }))
    ];

    // Combine data for rings
    const allRings = [
        ...vehicleData.map(v => ({ ...v, color: '#00f3ff', maxRadius: 5, speed: 2, repeat: 1000 })),
        ...userData.map(u => ({ ...u, color: '#00f3ff', maxRadius: 8, speed: 1, repeat: 2000 }))
    ];

    // Labels (User only for now)
    const allLabels = [
        ...userData.map(u => ({ ...u, text: 'HOME BASE' }))
    ];

    world.pointsData(allPoints);
    world.ringsData(allRings);
    world.labelsData(allLabels);
}

function updateMap(vehicleId, lat, lon) {
    if (!lat || !lon) return;

    const existing = vehicleData.find(v => v.id === vehicleId);
    if (existing) {
        existing.lat = lat;
        existing.lng = lon;
    } else {
        vehicleData.push({
            id: vehicleId,
            lat: lat,
            lng: lon,
            label: `VEHICLE ${vehicleId}`
        });
    }
    refreshGlobe();
}

function initUserLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;

            // Update User Data
            if (userData.length === 0) {
                // First lock - center view
                world.pointOfView({ lat: latitude, lng: longitude, altitude: 1.5 }, 2000);
            }

            userData = [{
                lat: latitude,
                lng: longitude,
                label: 'HOME BASE'
            }];

            refreshGlobe();

            const gpsStatus = document.getElementById('status-gps');
            if (gpsStatus) {
                gpsStatus.innerText = "LOCKED";
                gpsStatus.className = "value active";
            }

        }, (err) => {
            console.error("GPS Error:", err);
            const gpsStatus = document.getElementById('status-gps');
            if (gpsStatus) {
                gpsStatus.innerText = "ERROR";
                gpsStatus.className = "value";
            }
        }, {
            enableHighAccuracy: true
        });
    }
}

window.updateMap = updateMap;
window.initUserLocation = initUserLocation;

// Auto-rotate
world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;

// Stop rotation on interaction
document.getElementById('globe-viz').addEventListener('mousedown', () => {
    world.controls().autoRotate = false;
});
