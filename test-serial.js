const { SerialPort } = require('serialport');

async function list() {
    try {
        const ports = await SerialPort.list();
        console.log('Ports:', ports);
    } catch (err) {
        console.error('Error:', err);
    }
}

list();
