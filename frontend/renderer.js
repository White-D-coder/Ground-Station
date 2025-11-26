// DOM Elements
const portSelect = document.getElementById('port-select');
const loraPortSelect = document.getElementById('lora-port-select');
const consoleOutput = document.getElementById('console-output');
const clock = document.getElementById('clock');

// Status Elements
const elLink = document.getElementById('status-link');
const elGps = document.getElementById('status-gps');

// Telemetry Elements
const valAlt = document.getElementById('val-alt');
const valSpeed = document.getElementById('val-speed');

// New Sensors
const valPitch = document.getElementById('val-pitch');
const valRoll = document.getElementById('val-roll');
const valYaw = document.getElementById('val-yaw');
const valSats = document.getElementById('val-sats');
const valHdop = document.getElementById('val-hdop');
const valTemp = document.getElementById('val-temp');
const valRssi = document.getElementById('val-rssi');

const valVbat = document.getElementById('val-vbat');
const valLat = document.getElementById('val-lat');
const valLon = document.getElementById('val-lon');

// State
let currentMission = [];
let isRecording = false;

// Initialize
window.initUserLocation();

// Clock
setInterval(() => {
    clock.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
}, 1000);

function log(msg, type = 'info') {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerText = `> ${msg}`;
    if (type === 'error') line.style.color = 'var(--danger)';
    if (type === 'success') line.style.color = 'var(--success)';
    if (type === 'system') line.style.color = 'var(--accent)';

    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// --- Serial Connection ---

async function refreshPorts() {
    try {
        const ports = await window.api.serial.list();
        portSelect.innerHTML = '';
        loraPortSelect.innerHTML = '';

        ports.forEach(port => {
            const opt = document.createElement('option');
            opt.value = port.path;
            opt.innerText = port.path;
            portSelect.appendChild(opt.cloneNode(true));
            loraPortSelect.appendChild(opt);
        });
        log(`Scanned ${ports.length} ports.`, 'system');
    } catch (err) {
        log(`Error scanning ports: ${err.message}`, 'error');
        console.error(err);
    }
}

document.getElementById('btn-refresh').addEventListener('click', refreshPorts);
refreshPorts();

document.getElementById('btn-connect').addEventListener('click', async () => {
    try {
        const port = portSelect.value;
        const baud = parseInt(document.getElementById('baud-select').value) || 115200;

        if (!port) return log("No port selected", "error");

        log(`Connecting to ${port} at ${baud}...`, "system");
        await window.api.serial.connect(port, baud);

        document.getElementById('btn-connect').classList.add('hidden');
        document.getElementById('btn-disconnect').classList.remove('hidden');
        elLink.innerText = "ONLINE";
        elLink.style.color = "var(--success)";
        elLink.style.textShadow = "0 0 5px var(--success)";
        log("Serial Link Established.", "success");
    } catch (err) {
        log(`Connection Failed: ${err.message}`, 'error');
        console.error(err);
    }
});

document.getElementById('btn-disconnect').addEventListener('click', async () => {
    await window.api.serial.disconnect();
    document.getElementById('btn-connect').classList.remove('hidden');
    document.getElementById('btn-disconnect').classList.add('hidden');
    elLink.innerText = "OFFLINE";
    elLink.style.color = "white";
    elLink.style.textShadow = "none";
    log("Serial Link Terminated.", "error");
});

// --- Hardware Listeners ---

document.getElementById('btn-can-listen').addEventListener('click', () => {
    const iface = document.getElementById('can-iface').value;
    window.api.can.listen(iface);
    log(`CAN Interface Active: ${iface}`, "success");
});

document.getElementById('btn-lora-listen').addEventListener('click', () => {
    const port = loraPortSelect.value;
    window.api.lora.listen(port);
    log(`LoRa Listener Active: ${port}`, "success");
});

// --- Telemetry Handling ---

// --- RAW DATA MONITOR ---
window.api.on.raw((data) => {
    // Only log if it's NOT a JSON line (to avoid duplicates with the segregated log)
    // Or just log everything in a dim color if debugging
    if (!data.includes('{')) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-line raw';
        logEntry.style.color = 'rgba(255,255,255,0.3)';
        logEntry.style.fontSize = '10px';
        logEntry.innerText = `[RAW] ${data}`;
        consoleOutput.appendChild(logEntry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
});

// Refactor Telemetry Handler to be accessible
function handleTelemetry(data) {
    console.log("[Renderer] Telemetry Received:", data); // DEBUG LOG
    const d = data.data;

    // --- PARSE CUSTOM DATA FORMAT ---
    // Format: { pressure, altitude, gyro:{x,y,z}, accel:{x,y,z}, temp, gps:{lat,lon,alt}, battery, orientation, light }

    let alt = d.altitude || d.alt;
    let speed = d.speed || 0; // Not in provided format, default to 0
    let vbat = d.battery || d.vbat;
    let temp = d.temp;
    let rssi = d.rssi || 0; // Not in provided format

    let pitch = d.pitch;
    let roll = d.roll;
    let yaw = d.orientation || d.yaw; // Use 'orientation' as Yaw

    let lat = d.lat;
    let lon = d.lon;
    let sats = d.sats || 0;
    let hdop = d.hdop || 0;

    // Handle Nested GPS
    if (d.gps) {
        lat = d.gps.lat;
        lon = d.gps.lon;
        if (d.gps.alt && !alt) alt = d.gps.alt;
    }

    // Calculate Pitch/Roll from Accel if not provided directly
    if (d.accel && (pitch === undefined || roll === undefined)) {
        // Basic calculation (assuming static/low acceleration)
        // Pitch = atan2(accel.y, accel.z)
        // Roll = atan2(-accel.x, sqrt(accel.y^2 + accel.z^2))
        const ax = d.accel.x;
        const ay = d.accel.y;
        const az = d.accel.z;

        if (ax !== undefined && ay !== undefined && az !== undefined) {
            pitch = Math.atan2(ay, az) * (180 / Math.PI);
            roll = Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * (180 / Math.PI);
        }
    }

    // --- UPDATE UI ---

    // Standard Values
    if (alt !== undefined) valAlt.innerText = Number(alt).toFixed(1);
    if (speed !== undefined) valSpeed.innerText = Number(speed).toFixed(1);
    if (vbat !== undefined) valVbat.innerText = Number(vbat).toFixed(2);

    // Flight Dynamics
    if (pitch !== undefined) valPitch.innerText = Number(pitch).toFixed(1) + '°';
    if (roll !== undefined) valRoll.innerText = Number(roll).toFixed(1) + '°';
    if (yaw !== undefined) valYaw.innerText = Number(yaw).toFixed(1) + '°';

    // System Health
    if (sats !== undefined) valSats.innerText = sats;
    if (hdop !== undefined) valHdop.innerText = Number(hdop).toFixed(1);
    if (temp !== undefined) valTemp.innerHTML = Number(temp).toFixed(1) + '<span class="unit">°C</span>';
    if (rssi !== undefined) valRssi.innerHTML = rssi + '<span class="unit">dBm</span>';

    // Map Update
    if (lat && lon) {
        valLat.innerText = Number(lat).toFixed(6);
        valLon.innerText = Number(lon).toFixed(6);
        window.updateMap('V1', lat, lon);
    }

    // --- MONITOR LOGGING (Segregated) ---
    // User requested "segregate data represent in there divs" in the monitor
    const time = new Date().toLocaleTimeString();
    let logMsg = `[${time}] `;

    if (d.gps) logMsg += `GPS: ${d.gps.lat},${d.gps.lon} | `;
    if (d.accel) logMsg += `ACC: ${d.accel.x},${d.accel.y},${d.accel.z} | `;
    if (d.gyro) logMsg += `GYRO: ${d.gyro.x},${d.gyro.y},${d.gyro.z} | `;
    if (d.temp) logMsg += `ENV: ${d.temp}°C ${d.pressure}hPa | `;
    if (d.battery) logMsg += `PWR: ${d.battery}V`;

    // If custom format wasn't detected, just log raw
    if (logMsg === `[${time}] `) {
        logMsg += JSON.stringify(d);
    }

    // Create a segregated log entry
    const logEntry = document.createElement('div');
    logEntry.className = 'log-line data-packet';
    logEntry.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    logEntry.style.padding = '2px 0';
    logEntry.innerHTML = `<span style="color:var(--accent)">DATA RX:</span> ${logMsg}`;
    consoleOutput.appendChild(logEntry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;


    // --- UPDATE GRAPHS ---
    // Explicit Number() conversion to ensure Chart.js receives numbers
    if (alt !== undefined) window.updateGraph1(Number(alt));
    if (speed !== undefined) window.updateGraph2(Number(speed));
    if (vbat !== undefined) window.updateGraph3(Number(vbat));
    if (rssi !== undefined) window.updateGraph4(Number(rssi));

    if (pitch !== undefined) window.updateGraphPitch(Number(pitch));
    if (roll !== undefined) window.updateGraphRoll(Number(roll));
    if (yaw !== undefined) window.updateGraphYaw(Number(yaw));
    if (temp !== undefined) window.updateGraphTemp(Number(temp));

    // Record
    if (isRecording) {
        currentMission.push({ ...d, timestamp: Date.now() });
    }
}

window.api.on.telemetry(handleTelemetry);

// Simulation Loop
window.startSimulation = () => {
    log("Starting Simulation Mode...", "system");
    setInterval(() => {
        const t = Date.now() / 1000;
        const simData = {
            pressure: 1000 + Math.sin(t) * 10,
            altitude: 400 + Math.sin(t * 0.5) * 50,
            gyro: { x: Math.sin(t), y: Math.cos(t), z: 0 },
            accel: { x: 0, y: 0, z: 9.8 },
            temp: 25 + Math.sin(t * 0.1) * 5,
            gps: { lat: 28.37 + Math.sin(t * 0.01) * 0.001, lon: 77.10 + Math.cos(t * 0.01) * 0.001, alt: 400 },
            battery: 4.0 + Math.sin(t * 0.2) * 0.2,
            orientation: (t * 10) % 360,
            light: 500
        };
        handleTelemetry({ data: simData });
    }, 1000);
};

// --- Mission System ---

document.getElementById('btn-start-mission').addEventListener('click', () => {
    isRecording = true;
    currentMission = [];
    document.getElementById('btn-start-mission').classList.add('hidden');
    document.getElementById('btn-stop-mission').classList.remove('hidden');
    log("MISSION RECORDING STARTED", "success");
});

document.getElementById('btn-stop-mission').addEventListener('click', async () => {
    isRecording = false;
    document.getElementById('btn-start-mission').classList.remove('hidden');
    document.getElementById('btn-stop-mission').classList.add('hidden');
    log(`Recording Stopped. ${currentMission.length} data points.`, "info");

    if (currentMission.length > 0) {
        await window.api.mission.save({
            startTime: currentMission[0].timestamp,
            endTime: currentMission[currentMission.length - 1].timestamp,
            vehicleId: 'V1',
            totalDistance: 0,
            maxAlt: Math.max(...currentMission.map(d => d.alt || 0)),
            minVoltage: Math.min(...currentMission.map(d => d.vbat || 99)),
            gpsTrace: currentMission.map(d => ({ lat: d.lat, lon: d.lon }))
        });
        log("Mission saved to database.", "success");
    }
});

window.exportData = async (type) => {
    if (currentMission.length === 0) {
        log('No mission data to export.', 'error');
        return;
    }
    await window.api.export.save(type, currentMission);
};
