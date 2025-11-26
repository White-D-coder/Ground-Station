const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class LoraMonitor extends EventEmitter {
    constructor() {
        super();
        this.port = null;
    }

    listen(path, baudRate = 9600) {
        if (this.port && this.port.isOpen) {
            this.port.close();
        }

        this.port = new SerialPort({ path, baudRate });
        const parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

        this.port.on('open', () => {
            console.log(`LoRa Module connected on ${path}`);
            this.emit('status', { connected: true, port: path });
        });

        parser.on('data', (line) => {
            this.handlePacket(line);
        });

        this.port.on('error', (err) => {
            console.error("LoRa Error:", err);
            this.emit('error', err.message);
        });
    }

    handlePacket(line) {
        // Expecting format: "LORA:ID,RSSI,PAYLOAD" or similar
        // Or just raw telemetry if transparent mode
        const cleanLine = line.trim();

        // Example parsing logic
        // Assuming: RSSI:-80,DATA:{...}
        let rssi = 0;
        let payload = cleanLine;

        if (cleanLine.includes('RSSI:')) {
            const parts = cleanLine.split(',');
            const rssiPart = parts.find(p => p.startsWith('RSSI:'));
            if (rssiPart) {
                rssi = parseInt(rssiPart.split(':')[1]);
            }
            // Strip RSSI metadata to get payload
            payload = cleanLine.replace(/RSSI:-?\d+,?/, '');
        }

        this.emit('lora_update', {
            rssi,
            payload,
            timestamp: Date.now()
        });
    }
}

module.exports = new LoraMonitor();
