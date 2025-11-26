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

// Initialize
loadPlugins();

module.exports = {
    serial,
    can,
    lora,
    db,
    plugins
};
