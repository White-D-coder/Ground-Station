const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class SerialMonitor extends EventEmitter {
    constructor() {
        super();
        this.ports = [];
        this.activePort = null;
        this.parser = null;
        this.schemaDetected = false;
        this.currentSchema = null;
    }

    async listPorts() {
        try {
            this.ports = await SerialPort.list();
            return this.ports;
        } catch (err) {
            console.error("Error listing ports:", err);
            return [];
        }
    }

    connect(path, baudRate) {
        if (this.activePort && this.activePort.isOpen) {
            this.activePort.close();
        }

        this.activePort = new SerialPort({ path, baudRate });

        this.activePort.on('open', () => {
            console.log(`Connected to ${path} at ${baudRate}`);
            this.emit('status', { connected: true, port: path });
        });

        let buffer = '';
        this.activePort.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            console.log(`[Serial Raw Chunk] ${chunkStr}`); // DEBUG
            this.emit('raw', chunkStr); // Emit immediately for UI monitor

            buffer += chunkStr;

            // Process buffer for lines
            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                const line = buffer.substring(0, boundary).trim();
                buffer = buffer.substring(boundary + 1);

                if (line.length > 0) {
                    this.handleData(line);
                }
                boundary = buffer.indexOf('\n');
            }
        });

        this.activePort.on('error', (err) => {
            console.error("Serial Error:", err);
            this.emit('error', err.message);
        });

        this.activePort.on('close', () => {
            this.emit('status', { connected: false });
        });
    }

    disconnect() {
        if (this.activePort && this.activePort.isOpen) {
            this.activePort.close();
        }
        this.activePort = null;
    }

    write(data) {
        if (this.activePort && this.activePort.isOpen) {
            this.activePort.write(data);
        }
    }

    handleData(buffer) {
        // Convert buffer to string for text checks
        const text = buffer.toString().trim();
        console.log(`[Serial Raw] ${text}`); // DEBUG LOG

        // 1. Try JSON
        try {
            // Attempt to find JSON object within the string
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');

            if (start !== -1 && end !== -1 && end > start) {
                const jsonStr = text.substring(start, end + 1);
                console.log(`[Serial JSON Candidate] ${jsonStr}`); // DEBUG LOG

                const json = JSON.parse(jsonStr);
                this.detectSchema('json', json);
                this.emit('telemetry', { type: 'json', data: json, raw: text });
                console.log(`[Serial Emit] Telemetry emitted`); // DEBUG LOG
                return;
            }
        } catch (e) {
            console.error(`[Serial Parse Error] ${e.message}`); // DEBUG LOG
        }

        // 2. Try CSV (Key:Value pairs or Header/Row)
        if (text.includes(',') || text.includes(':')) {
            // Simple K:V detection (e.g., "temp:25,volt:12")
            if (text.includes(':')) {
                const parts = text.split(',');
                const data = {};
                let valid = true;
                for (const p of parts) {
                    const [k, v] = p.split(':');
                    if (k && v && !isNaN(parseFloat(v))) {
                        data[k.trim()] = parseFloat(v);
                    } else {
                        valid = false;
                        break;
                    }
                }
                if (valid && Object.keys(data).length > 0) {
                    this.detectSchema('csv_kv', data);
                    this.emit('telemetry', { type: 'csv_kv', data: data, raw: text });
                    return;
                }
            }

            // Standard CSV (requires state to know headers, simplified here for single-line streams)
            // Assuming numeric CSV stream if no keys: "12.5,3.4,100"
            const values = text.split(',').map(v => parseFloat(v));
            if (values.every(v => !isNaN(v))) {
                // Generate generic keys if schema not set
                const data = {};
                values.forEach((v, i) => data[`val_${i}`] = v);
                this.detectSchema('csv_raw', data);
                this.emit('telemetry', { type: 'csv_raw', data: data, raw: text });
                return;
            }
        }

        // 3. Binary Protocols (UBX, MAVLink)
        // This requires a buffer for stream processing
        if (!this.buffer) this.buffer = Buffer.alloc(0);
        this.buffer = Buffer.concat([this.buffer, buffer]);

        this.parseBuffer();

        // 4. Fallback: If text didn't match JSON or CSV, emit as raw text object
        // This ensures the frontend ALWAYS shows something.
        if (text.length > 0) {
            this.emit('telemetry', { type: 'text', data: { raw_message: text }, raw: text });
        }
    }

    parseBuffer() {
        // Loop while we have enough data
        while (this.buffer.length > 0) {
            // MAVLink v1 (0xFE) or v2 (0xFD)
            if (this.buffer[0] === 0xFE || this.buffer[0] === 0xFD) {
                if (this.tryParseMAVLink()) continue;
            }
            // UBX (0xB5 0x62)
            else if (this.buffer[0] === 0xB5 && this.buffer[1] === 0x62) {
                if (this.tryParseUBX()) continue;
            }

            // If no header matched, discard first byte and continue
            // (In production, we'd optimize this to search for next header)
            if (this.buffer.length > 0) {
                this.buffer = this.buffer.slice(1);
            }
        }
    }

    tryParseMAVLink() {
        // Minimal MAVLink Parser
        if (this.buffer.length < 8) return false; // Min header
        const len = this.buffer[1];
        const packetLen = len + 8; // simplified

        if (this.buffer.length >= packetLen) {
            const packet = this.buffer.slice(0, packetLen);
            const msgId = this.buffer[5]; // Very rough v1 extraction

            // Decode specific messages (Heartbeat, Attitude, etc.)
            // This is a simplified example. A full parser would use a generated library.
            const decoded = {
                sysid: this.buffer[3],
                compid: this.buffer[4],
                msgid: msgId,
                raw: packet.toString('hex')
            };

            this.detectSchema('mavlink', decoded);
            this.emit('telemetry', { type: 'mavlink', data: decoded, raw: packet.toString('hex') });

            this.buffer = this.buffer.slice(packetLen);
            return true;
        }
        return false;
    }

    tryParseUBX() {
        // UBX Parser
        if (this.buffer.length < 6) return false;
        const classId = this.buffer[2];
        const msgId = this.buffer[3];
        const len = this.buffer.readUInt16LE(4);
        const packetLen = len + 8; // Header(2) + Class(1) + ID(1) + Len(2) + Payload(N) + Checksum(2)

        if (this.buffer.length >= packetLen) {
            const payload = this.buffer.slice(6, 6 + len);

            // Example: NAV-PVT (0x01 0x07)
            let decoded = {};
            if (classId === 0x01 && msgId === 0x07) {
                decoded = {
                    iTOW: payload.readUInt32LE(0),
                    lat: payload.readInt32LE(28) / 1e7,
                    lon: payload.readInt32LE(24) / 1e7,
                    height: payload.readInt32LE(32) / 1000,
                    velN: payload.readInt32LE(48) / 1000,
                    velE: payload.readInt32LE(52) / 1000,
                    velD: payload.readInt32LE(56) / 1000
                };
            } else {
                decoded = { classId, msgId, len };
            }

            this.detectSchema('ubx', decoded);
            this.emit('telemetry', { type: 'ubx', data: decoded, raw: this.buffer.slice(0, packetLen).toString('hex') });

            this.buffer = this.buffer.slice(packetLen);
            return true;
        }
        return false;
    }

    detectSchema(format, sampleData) {
        // Simple schema detection: if keys change or it's the first time
        const fields = Object.keys(sampleData).map(key => ({
            key,
            type: typeof sampleData[key],
            sample: sampleData[key]
        }));

        // In a real app, we'd compare with this.currentSchema to avoid spamming updates
        // For now, we emit if we haven't seen this format/keys yet
        const schemaHash = JSON.stringify(fields.map(f => f.key));

        if (!this.currentSchema || this.currentSchema.hash !== schemaHash) {
            this.currentSchema = { format, fields, hash: schemaHash };
            this.emit('schema_update', { format, fields });
        }
    }
}

module.exports = new SerialMonitor();
