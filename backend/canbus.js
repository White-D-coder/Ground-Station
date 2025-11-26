let can;
try {
    if (process.platform === 'linux') {
        can = require('socketcan');
    }
} catch (e) {
    console.warn("SocketCAN not available (not Linux or module missing).");
}

const EventEmitter = require('events');

class CanBusMonitor extends EventEmitter {
    constructor() {
        super();
        this.channel = null;
        this.isListening = false;
        // Simple DBC-like mapping: ID -> { name, parser }
        this.database = {
            0x100: { name: 'MOTOR_RPM', parse: (buf) => buf.readUInt16LE(0) },
            0x101: { name: 'BATTERY_VOLTAGE', parse: (buf) => buf.readUInt16LE(0) / 100 },
            0x102: { name: 'GPS_LAT', parse: (buf) => buf.readFloatLE(0) },
            0x103: { name: 'GPS_LON', parse: (buf) => buf.readFloatLE(0) }
        };
    }

    listen(interfaceName = 'can0') {
        if (!can) {
            console.warn("CAN Bus not supported on this platform. Mocking data.");
            this.startMockData();
            return;
        }

        try {
            this.channel = can.createRawChannel(interfaceName, true);
            this.channel.addListener('onMessage', (msg) => {
                this.handleMessage(msg);
            });
            this.channel.start();
            this.isListening = true;
            console.log(`CAN Bus listening on ${interfaceName}`);
            this.emit('status', { listening: true, interface: interfaceName });
        } catch (err) {
            console.error(`CAN Bus Error (${interfaceName}):`, err.message);
            this.emit('error', err.message);
        }
    }

    startMockData() {
        if (this.isListening) return;
        this.isListening = true;
        this.emit('status', { listening: true, interface: 'mock' });

        // Mock interval
        this.mockInterval = setInterval(() => {
            // Mock RPM
            const rpmBuf = Buffer.alloc(2);
            rpmBuf.writeUInt16LE(Math.floor(Math.random() * 5000));
            this.handleMessage({ id: 0x100, data: rpmBuf });

            // Mock Voltage
            const voltBuf = Buffer.alloc(2);
            voltBuf.writeUInt16LE(1200 + Math.random() * 50);
            this.handleMessage({ id: 0x101, data: voltBuf });
        }, 1000);
    }

    stop() {
        if (this.channel) {
            this.channel.stop();
        }
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
        }
        this.isListening = false;
        this.emit('status', { listening: false });
    }

    handleMessage(msg) {
        const id = msg.id;
        const data = msg.data;

        let decoded = null;
        let name = `CAN_${id.toString(16)}`;

        if (this.database[id]) {
            try {
                decoded = this.database[id].parse(data);
                name = this.database[id].name;
            } catch (e) {
                console.warn(`Failed to parse CAN ID ${id}`, e);
            }
        } else {
            // Auto-detect / generic hex string
            decoded = data.toString('hex');
        }

        this.emit('can_update', {
            id,
            name,
            decoded,
            raw: data.toString('hex'),
            timestamp: Date.now()
        });
    }
}

module.exports = new CanBusMonitor();
