const TelemetrySchema = {
    timestamp: 'number',
    vehicleId: 'string',
    lat: 'number',
    lon: 'number',
    alt: 'number',
    speed: 'number',
    heading: 'number',
    vbat: 'number',
    rssi: 'number'
};

const MissionSchema = {
    startTime: 'number',
    endTime: 'number',
    vehicleId: 'string',
    trace: 'array'
};

module.exports = {
    TelemetrySchema,
    MissionSchema
};
