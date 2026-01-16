const { SerialPort } = require('serialport');

console.log("Checking Serial Ports...");
SerialPort.list().then((ports) => {
    console.log("Ports Found:", ports.length);
    ports.forEach((port) => {
        console.log(` - ${port.path}\t(${port.manufacturer || 'Unknown'})`);
    });
}).catch((err) => {
    console.error("Error listing ports:", err);
});
