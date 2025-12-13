const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    serial: {
        list: () => ipcRenderer.invoke('serial:list'),
        connect: (port, baud) => ipcRenderer.invoke('serial:connect', port, baud),
        disconnect: () => ipcRenderer.invoke('serial:disconnect'),
        write: (data) => ipcRenderer.invoke('serial:write', data),
    },
    can: {
        listen: (iface) => ipcRenderer.invoke('can:listen', iface)
    },
    lora: {
        listen: (port) => ipcRenderer.invoke('lora:listen', port)
    },
    mission: {
        save: (data) => ipcRenderer.invoke('mission:save', data),
        list: () => ipcRenderer.invoke('mission:list')
    },
    export: {
        save: (type, data) => ipcRenderer.invoke('export:save', { type, data })
    },
    on: {
        telemetry: (callback) => ipcRenderer.on('telemetry:update', (e, data) => callback(data)),
        raw: (callback) => ipcRenderer.on('raw:update', (e, data) => callback(data)),
        schema: (callback) => ipcRenderer.on('schema:update', (e, data) => callback(data)),
        can: (callback) => ipcRenderer.on('can:update', (e, data) => callback(data)),
        lora: (callback) => ipcRenderer.on('lora:update', (e, data) => callback(data))
    }
});
