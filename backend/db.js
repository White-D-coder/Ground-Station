const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

let dataDir;

// Check if running in Electron
if (process.versions.electron) {
    const { app } = require('electron');
    // If app is not ready yet (which can happen if required early), we might need to wait or use a different approach.
    // However, usually backend is required after app is ready or we can use app.getPath safely.
    // Note: In the main process, 'electron' export has 'app'.
    try {
        dataDir = path.join(app.getPath('userData'), 'localdata');
    } catch (e) {
        // Fallback for when required from a context where app is not available (unlikely in this architecture)
        dataDir = path.join(__dirname, '../localdata');
    }
} else {
    // Web Server Mode (Node.js)
    dataDir = path.join(__dirname, '../localdata');
}

// Ensure local data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const missionsFile = path.join(dataDir, 'missions.json');
const eventsFile = path.join(dataDir, 'events.json');
const telemetryFile = path.join(dataDir, 'telemetry.log');

// Initialize files if they don't exist
function initDB() {
    if (!fs.existsSync(missionsFile)) fs.writeFileSync(missionsFile, '[]');
    if (!fs.existsSync(eventsFile)) fs.writeFileSync(eventsFile, '[]');
    // telemetry.log is appended to, so no need to init
}

// MongoDB Configuration (Optional)
let mongoClient = null;
let remoteDB = null;
let useRemote = false;

async function connectRemote(uri, dbName) {
    try {
        mongoClient = new MongoClient(uri);
        await mongoClient.connect();
        remoteDB = mongoClient.db(dbName);
        useRemote = true;
        console.log("Connected to Remote MongoDB");
    } catch (err) {
        console.error("Remote DB Connection Failed:", err);
        useRemote = false;
    }
}

function saveTelemetry(vehicleId, source, rawData, parsedData) {
    const timestamp = Date.now();
    const entry = { timestamp, vehicleId, source, raw: rawData, parsed: parsedData };

    // Append to log file (NDJSON format)
    fs.appendFile(telemetryFile, JSON.stringify(entry) + '\n', (err) => {
        if (err) console.error("Failed to write telemetry:", err);
    });

    // Remote Sync (if enabled)
    if (useRemote && remoteDB) {
        remoteDB.collection('telemetry').insertOne(entry)
            .catch(err => console.error("Remote Sync Error:", err));
    }
}

function getMissions(callback) {
    fs.readFile(missionsFile, 'utf8', (err, data) => {
        if (err) {
            if (callback) callback(err, []);
            return;
        }
        try {
            const missions = JSON.parse(data);
            // Sort by start_time DESC
            missions.sort((a, b) => b.startTime - a.startTime);
            if (callback) callback(null, missions);
        } catch (e) {
            if (callback) callback(e, []);
        }
    });
}

function saveMission(missionData) {
    fs.readFile(missionsFile, 'utf8', (err, data) => {
        let missions = [];
        if (!err) {
            try {
                missions = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing missions file:", e);
            }
        }
        missions.push(missionData);
        fs.writeFile(missionsFile, JSON.stringify(missions, null, 2), (err) => {
            if (err) console.error("Failed to save mission:", err);
        });
    });
}

function logEvent(type, message) {
    const entry = { timestamp: Date.now(), type, message };
    fs.readFile(eventsFile, 'utf8', (err, data) => {
        let events = [];
        if (!err) {
            try {
                events = JSON.parse(data);
            } catch (e) {
                // Ignore
            }
        }
        events.push(entry);
        // Keep only last 1000 events
        if (events.length > 1000) events = events.slice(-1000);

        fs.writeFile(eventsFile, JSON.stringify(events, null, 2), (err) => {
            if (err) console.error("Failed to save event:", err);
        });
    });
}

// Initialize on load
initDB();

module.exports = {
    connectRemote,
    saveTelemetry,
    getMissions,
    saveMission,
    logEvent
};
