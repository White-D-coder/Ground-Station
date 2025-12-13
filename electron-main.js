const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const backend = require('./backend/server');
const fs = require('fs');
const xlsx = require('xlsx');
const xmlbuilder = require('xmlbuilder');

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

let mainWindow;
let server;

function startWebServer() {
    const expressApp = express();
    server = http.createServer(expressApp);
    const wss = new WebSocket.Server({ server });

    expressApp.use(cors());
    expressApp.use(express.json());

    let distPath;
    if (app.isPackaged) {
        distPath = path.join(process.resourcesPath, 'app/frontend/dist');
        if (!fs.existsSync(distPath)) {
            distPath = path.join(__dirname, 'frontend/dist');
        }
    } else {
        distPath = path.join(__dirname, 'frontend/dist');
    }

    expressApp.use(express.static(distPath));

    expressApp.get('/api/ports', async (req, res) => {
        try {
            const ports = await backend.serial.listPorts();
            res.json(ports);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    expressApp.post('/api/connect', (req, res) => {
        const { port, baud } = req.body;
        try {
            backend.serial.connect(port, parseInt(baud));
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    expressApp.post('/api/disconnect', (req, res) => {
        try {
            backend.serial.disconnect();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    function broadcast(msg) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(msg));
            }
        });
    }

    backend.serial.on('telemetry', (data) => broadcast({ type: 'telemetry', data }));
    backend.serial.on('raw', (data) => broadcast({ type: 'raw', data }));

    expressApp.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });

    const PORT = 3001;
    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`[Main] Port ${PORT} is already in use. Is another instance running?`);
        } else {
            console.error('[Main] Server error:', e);
        }
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`[Main] Web Server running on port ${PORT}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: '#1a1a1a',
        webPreferences: {
            preload: path.join(__dirname, 'electron-preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();
    startWebServer();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (server) {
        server.close();
    }
});

ipcMain.handle('serial:list', async () => {
    console.log('[Main] Requesting serial port list...');
    try {
        const ports = await backend.serial.listPorts();
        console.log('[Main] Ports found:', ports.length);
        return ports;
    } catch (err) {
        console.error('[Main] Error listing ports:', err);
        return [];
    }
});

ipcMain.handle('serial:connect', (event, port, baud) => {
    backend.serial.connect(port, baud);
    return true;
});

ipcMain.handle('serial:disconnect', () => {
    backend.serial.disconnect();
    return true;
});

ipcMain.handle('serial:write', (event, data) => {
    backend.serial.write(data);
    return true;
});

ipcMain.handle('can:listen', (event, iface) => {
    backend.can.listen(iface);
    return true;
});

ipcMain.handle('lora:listen', (event, port) => {
    backend.lora.listen(port);
    return true;
});

ipcMain.handle('mission:save', (event, missionData) => {
    backend.db.saveMission(missionData);
    return true;
});

ipcMain.handle('mission:list', (event) => {
    return new Promise((resolve) => {
        backend.db.getMissions((err, rows) => {
            resolve(rows || []);
        });
    });
});

ipcMain.handle('export:save', async (event, { type, data }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: type.toUpperCase(), extensions: [type] }]
    });

    if (canceled || !filePath) return false;

    try {
        if (type === 'json') {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } else if (type === 'csv') {
            if (data.length > 0) {
                const flatten = (obj, prefix = '', res = {}) => {
                    for (const key in obj) {
                        const val = obj[key];
                        const newKey = prefix ? `${prefix}.${key}` : key;
                        if (val && typeof val === 'object' && !Array.isArray(val)) {
                            flatten(val, newKey, res);
                        } else {
                            res[newKey] = val;
                        }
                    }
                    return res;
                };

                const flatData = data.map(d => flatten(d));
                const headers = [...new Set(flatData.flatMap(d => Object.keys(d)))];

                const csvContent = [
                    headers.join(','),
                    ...flatData.map(row => headers.map(h => {
                        const val = row[h];
                        return val === undefined ? '' : JSON.stringify(val);
                    }).join(','))
                ].join('\n');

                fs.writeFileSync(filePath, csvContent);
            }
        } else if (type === 'xlsx') {
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(wb, ws, "Mission Data");
            xlsx.writeFile(wb, filePath);
        } else if (type === 'kml') {
            const kml = xmlbuilder.create('kml', { encoding: 'UTF-8' })
                .att('xmlns', 'http://www.opengis.net/kml/2.2')
                .ele('Document')
                .ele('Placemark')
                .ele('name', 'Mission Path').up()
                .ele('LineString')
                .ele('coordinates', data.map(d => `${d.lon},${d.lat},${d.alt}`).join(' '));

            fs.writeFileSync(filePath, kml.end({ pretty: true }));
        }
        return true;
    } catch (err) {
        console.error("Export failed:", err);
        return false;
    }
});

backend.serial.on('telemetry', (data) => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('telemetry:update', data);
    } catch (e) { console.error('Error sending telemetry:', e); }
});

backend.serial.on('raw', (data) => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('raw:update', data);
    } catch (e) { console.error('Error sending raw data:', e); }
});

backend.serial.on('schema_update', (schema) => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('schema:update', schema);
    } catch (e) { console.error('Error sending schema:', e); }
});

backend.can.on('can_update', (data) => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('can:update', data);
    } catch (e) { console.error('Error sending CAN data:', e); }
});

backend.lora.on('lora_update', (data) => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('lora:update', data);
    } catch (e) { console.error('Error sending LoRa data:', e); }
});
