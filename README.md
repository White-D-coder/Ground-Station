# Antigravity Ground Station Pro

A professional desktop Ground Station built with Electron, Node.js, and Leaflet.

## Features
- **Real-time Telemetry**: Serial, CAN Bus, LoRa.
- **Visualization**: Google Satellite Maps, Real-time Charts.
- **Mission Control**: Recording, Replay, Export (CSV, KML, JSON).
- **Architecture**: Modular Backend, IPC-safe Frontend.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   # This will automatically install dependencies for electron, backend, and shared folders via the postinstall script.
   ```

2. **Run Application**:
   ```bash
   npm start
   ```

## Hardware Requirements
- **Serial**: USB-UART adapter.
- **CAN**: SocketCAN compatible interface (Linux) or USB-CAN adapter.
- **LoRa**: Serial-based LoRa module (e.g., E22, SX127x via UART).

## Development
- **Backend**: `/backend` - Handles hardware I/O and DB.
- **Frontend**: `/frontend` - UI, Map, Charts.
- **Electron**: `/electron` - App lifecycle and IPC.

## License
ISC
