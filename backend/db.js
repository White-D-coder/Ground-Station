const sqlite3 = require('sqlite3').verbose();
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Ensure local data directory exists
const dataDir = path.join(__dirname, '../localdata');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'localdata.db');
const localDB = new sqlite3.Database(dbPath);

// MongoDB Configuration (Optional)
let mongoClient = null;
let remoteDB = null;
let useRemote = false;

function initDB() {
    localDB.serialize(() => {
        // Telemetry Raw Table
        localDB.run(`CREATE TABLE IF NOT EXISTS telemetry_raw (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            vehicle_id TEXT,
            source TEXT,
            raw_data TEXT
        )`);

        // Telemetry Parsed Table
        localDB.run(`CREATE TABLE IF NOT EXISTS telemetry_parsed (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            vehicle_id TEXT,
            key TEXT,
            value REAL
        )`);

        // Missions Table
        localDB.run(`CREATE TABLE IF NOT EXISTS missions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time INTEGER,
            end_time INTEGER,
            vehicle_id TEXT,
            total_distance REAL,
            max_alt REAL,
            min_voltage REAL,
            gps_trace TEXT
        )`);

        // Events Table
        localDB.run(`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            type TEXT,
            message TEXT
        )`);
    });
}

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

    // 1. Save Raw
    const stmtRaw = localDB.prepare(`INSERT INTO telemetry_raw (timestamp, vehicle_id, source, raw_data) VALUES (?, ?, ?, ?)`);
    stmtRaw.run(timestamp, vehicleId, source, JSON.stringify(rawData));
    stmtRaw.finalize();

    // 2. Save Parsed
    if (parsedData && typeof parsedData === 'object') {
        const stmtParsed = localDB.prepare(`INSERT INTO telemetry_parsed (timestamp, vehicle_id, key, value) VALUES (?, ?, ?, ?)`);
        for (const [key, value] of Object.entries(parsedData)) {
            if (typeof value === 'number') {
                stmtParsed.run(timestamp, vehicleId, key, value);
            }
        }
        stmtParsed.finalize();
    }

    // 3. Remote Sync (if enabled)
    if (useRemote && remoteDB) {
        remoteDB.collection('telemetry').insertOne({
            timestamp,
            vehicleId,
            source,
            raw: rawData,
            parsed: parsedData
        }).catch(err => console.error("Remote Sync Error:", err));
    }
}

function getMissions(callback) {
    localDB.all("SELECT * FROM missions ORDER BY start_time DESC", [], (err, rows) => {
        if (callback) callback(err, rows);
    });
}

function saveMission(missionData) {
    const stmt = localDB.prepare(`INSERT INTO missions (start_time, end_time, vehicle_id, total_distance, max_alt, min_voltage, gps_trace) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(
        missionData.startTime,
        missionData.endTime,
        missionData.vehicleId,
        missionData.totalDistance,
        missionData.maxAlt,
        missionData.minVoltage,
        JSON.stringify(missionData.gpsTrace)
    );
    stmt.finalize();
}

function logEvent(type, message) {
    const stmt = localDB.prepare("INSERT INTO events (timestamp, type, message) VALUES (?, ?, ?)");
    stmt.run(Date.now(), type, message);
    stmt.finalize();
}

// Initialize on load
initDB();

module.exports = {
    localDB,
    connectRemote,
    saveTelemetry,
    getMissions,
    saveMission,
    logEvent
};
