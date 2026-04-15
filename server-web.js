const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const backend = require('./backend/server');

const app = express();
const server = http.createServer(app);
let remotePorts = [];
const wss = new WebSocket.Server({ server, path: '/ws' }); // Explicit path match

// Simulation Mode disabled per user request
// if (process.env.SIMULATE) { ... }


app.use(cors({
    origin: '*', // Allow all origins (Vercel, Localhost, etc.)
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

app.get('/api/ports', async (req, res) => {
    try {
        // If we are in production (Render) and have remote ports from a laptop, use them
        if (process.env.NODE_ENV === 'production' && remotePorts.length > 0) {
            return res.json(remotePorts);
        }
        const ports = await backend.serial.listPorts();
        res.json(ports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/connect', (req, res) => {
    const { port, baud } = req.body;
    try {
        backend.serial.connect(port, parseInt(baud));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/disconnect', (req, res) => {
    try {
        backend.serial.disconnect();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/relay', (req, res) => {
    const { type, data } = req.body;
    if (type === 'ports_list') {
        remotePorts = data;
    }
    broadcast({ type, data });
    res.json({ success: true });
});

// Command Relay: From Cloud -> Local
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'secret123';

app.post('/api/command', (req, res) => {
    const { command, secret } = req.body;
    
    if (secret !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log(`📡 Cloud Command Received: ${command}`);
    
    // Broadcast to all clients (One of which will be your local laptop)
    broadcast({ type: 'command', command });
    res.json({ success: true });
});

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => console.log('Client disconnected'));
});

backend.serial.on('telemetry', (data) => {
    broadcast({ type: 'telemetry', data });
});

backend.serial.on('raw', (data) => {
    broadcast({ type: 'raw', data });
});

function broadcast(msg) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`
    🚀 Ground Station Web Server Running!
    
    > Local:   http://localhost:${PORT}
    > Network: http://${ip}:${PORT}
    
    Access this URL from any device on your network.
    `);
});
