const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const backend = require('./backend/server');
const fs = require('fs');
const xlsx = require('xlsx');
const xmlbuilder = require('xmlbuilder');

let mainWindow;

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

    mainWindow.loadFile(path.join(__dirname, 'frontend/index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.handle('serial:list', async () => {
    return await backend.serial.listPorts();
});

ipcMain.handle('serial:connect', (event, port, baud) => {
    backend.serial.connect(port, baud);
    return true;
});

ipcMain.handle('serial:disconnect', () => {
    backend.serial.disconnect();
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
                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map(row => headers.map(h => row[h]).join(','))
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

// --- Real-time Emitters ---

backend.serial.on('telemetry', (data) => {
    if (mainWindow) mainWindow.webContents.send('telemetry:update', data);
});

backend.serial.on('raw', (data) => {
    if (mainWindow) mainWindow.webContents.send('raw:update', data);
});

backend.serial.on('schema_update', (schema) => {
    if (mainWindow) mainWindow.webContents.send('schema:update', schema);
});

backend.can.on('can_update', (data) => {
    if (mainWindow) mainWindow.webContents.send('can:update', data);
});

backend.lora.on('lora_update', (data) => {
    if (mainWindow) mainWindow.webContents.send('lora:update', data);
});
