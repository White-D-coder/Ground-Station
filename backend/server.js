const fs = require('fs');
const path = require('path');
const serial = require('./serialmonitor');
const can = require('./canbus');
const lora = require('./lora');
const db = require('./db');

// Plugin System
const plugins = [];
const pluginDir = path.join(__dirname, 'plugins');

function loadPlugins() {
    if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir);
    }

    fs.readdirSync(pluginDir).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginDir, file));
                plugins.push(plugin);
                console.log(`Loaded plugin: ${file}`);
            } catch (err) {
                console.error(`Failed to load plugin ${file}:`, err);
            }
        }
    });
}

// Hook triggers
function runHooks(hookName, ...args) {
    plugins.forEach(p => {
        if (typeof p[hookName] === 'function') {
            try {
                p[hookName](...args);
            } catch (err) {
                console.error(`Error in plugin hook ${hookName}:`, err);
            }
        }
    });
}

// Event Aggregation
serial.on('telemetry', (data) => {
    // Save to DB
    db.saveTelemetry('SERIAL', 'SERIAL', data.raw, data.data);

    // Run Plugins
    runHooks('onSerial', data);
    runHooks('onTelemetry', data.data);
});

can.on('can_update', (data) => {
    db.saveTelemetry('CAN', 'CAN', data.raw, { [data.name]: data.decoded });
    runHooks('onCan', data.id, data.decoded);
});

lora.on('lora_update', (data) => {
    db.saveTelemetry('LORA', 'LORA', data.payload, { rssi: data.rssi });
    runHooks('onLora', data);
});

// Global Relay Logic
const REMOTE_RELAY_URL = process.env.REMOTE_RELAY_URL;
if (REMOTE_RELAY_URL) {
    console.log(`📡 Global Relay Active: Pushing data to ${REMOTE_RELAY_URL}`);
    
    // Listen for Remote Commands (Cloud -> Local)
    const WebSocket = require('ws');
    const wsUrl = REMOTE_RELAY_URL.replace(/^http/, 'ws') + '/ws';
    const cloudWs = new WebSocket(wsUrl);

    cloudWs.on('open', () => console.log('✅ Connected to Cloud Command Bridge'));
    cloudWs.on('message', (msg) => {
        try {
            const json = JSON.parse(msg.toString());
            if (json.type === 'command') {
                console.log(`🚀 Executing Cloud Command: ${json.command}`);
                serial.write(json.command + '\n');
            }
        } catch (e) { }
    });
}

async function relayToCloud(type, data) {
    if (!REMOTE_RELAY_URL) return;
    try {
        const response = await fetch(`${REMOTE_RELAY_URL}/api/relay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data })
        });
        if (response.ok) {
            // console.log(`✅ [Relay] Pushed ${type} data successfully`);
        }
    } catch (e) { }
}

// Push port list periodically to Cloud
setInterval(async () => {
    if (!REMOTE_RELAY_URL) return;
    try {
        const ports = await serial.listPorts();
        relayToCloud('ports_list', ports);
    } catch (e) { }
}, 5000);

serial.on('telemetry', (data) => relayToCloud('telemetry', data));
serial.on('raw', (data) => relayToCloud('raw', data));
can.on('can_update', (data) => relayToCloud('can', data));
lora.on('lora_update', (data) => relayToCloud('lora', data));

// Initialize
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:launch%40007@groundstation.kmljlk7.mongodb.net/';
if (MONGODB_URI) {
    db.connectRemote(MONGODB_URI, 'groundstation');
}

loadPlugins();

module.exports = {
    serial,
    can,
    lora,
    db,
    plugins
};
