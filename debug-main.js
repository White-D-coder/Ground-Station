console.log('Process Versions:', process.versions);
console.log('Process Type:', process.type);
const electron = require('electron');
console.log('Electron Module Type:', typeof electron);
console.log('Electron Module Keys:', Object.keys(electron));

if (typeof electron === 'string') {
    console.error('CRITICAL: require("electron") returned a string!');
} else {
    const { app } = electron;
    console.log('App Object:', app);

    app.whenReady().then(() => {
        console.log('App is ready!');
        app.quit();
    });
}
