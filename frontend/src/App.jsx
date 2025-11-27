import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DataSegments from './components/DataSegments';
import Charts from './components/Charts';
import Map from './components/Map';
import LogConsole from './components/LogConsole';
import './App.css';

function App() {
  const [serialData, setSerialData] = useState({});
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [missionData, setMissionData] = useState([]);
  const [isElectron, setIsElectron] = useState(true);

  useEffect(() => {
    if (!window.api) {
      setIsElectron(false);
    }
  }, []);

  if (!isElectron) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#222', // Dark grey instead of black
        color: 'red',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️ STOP ⚠️</h1>
        <h2 style={{ color: 'white' }}>You are running in a BROWSER.</h2>
        <p style={{ color: '#ccc', fontSize: '1.2rem', maxWidth: '600px', margin: '20px 0' }}>
          The Serial Port connection <b>CANNOT</b> work in a web browser.<br />
          You must run this app as a desktop application.
        </p>
        <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
          <p style={{ color: '#fff', marginBottom: '10px' }}>Please run this command in your terminal:</p>
          <code style={{ color: '#0f0', fontSize: '1.5rem', fontFamily: 'monospace' }}>npm start</code>
        </div>
      </div>
    );
  }

  const startRecording = () => {
    setIsRecording(true);
    setMissionData([]);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (window.api && missionData.length > 0) {
      await window.api.mission.save({
        startTime: missionData[0].timestamp,
        endTime: missionData[missionData.length - 1].timestamp,
        vehicleId: 'V1',
        totalDistance: 0,
        maxAlt: Math.max(...missionData.map(d => d.altitude || 0)),
        minVoltage: Math.min(...missionData.map(d => d.battery || 99)),
        gpsTrace: missionData.map(d => ({ lat: d.lat, lon: d.lon }))
      });
    }
  };

  // Utility to flatten nested objects for CSV/Excel
  const flattenData = (data) => {
    const result = {};
    const recurse = (cur, prop) => {
      if (Object(cur) !== cur) {
        result[prop] = cur;
      } else if (Array.isArray(cur)) {
        for (let i = 0, l = cur.length; i < l; i++)
          recurse(cur[i], prop ? prop + "." + i : "" + i);
        if (cur.length == 0)
          result[prop] = [];
      } else {
        let isEmpty = true;
        for (const p in cur) {
          isEmpty = false;
          recurse(cur[p], prop ? prop + "." + p : p);
        }
        if (isEmpty && prop)
          result[prop] = {};
      }
    }
    recurse(data, "");
    return result;
  };

  const exportData = async (type) => {
    if (window.api && missionData.length > 0) {
      // Flatten data for CSV/XLSX if needed
      let dataToExport = missionData;
      if (type === 'csv' || type === 'xlsx') {
        dataToExport = missionData.map(d => flattenData(d));
      }

      await window.api.export.save(type, dataToExport);
    }
  };

  useEffect(() => {
    // Listen for data
    if (window.api) {
      const cleanupTelemetry = window.api.on.telemetry((eventData) => {
        console.log("App received telemetry:", eventData); // DEBUG LOG
        const d = eventData.data;
        setSerialData(d);

        if (isRecording) {
          setMissionData(prev => [...prev, { ...d, timestamp: Date.now() }]);
        }
      });

      const cleanupRaw = window.api.on.raw((data) => {
        // console.log("App received raw:", data); // DEBUG LOG
        setLogs(prev => [...prev.slice(-99), data]); // Keep last 100 logs
      });

      // Cleanup listeners on unmount or re-run
      return () => {
        // Note: electron-preload needs to support removing listeners if we want true cleanup,
        // but for now, we just want to verify data flow. 
        // Since our preload exposes 'on' which calls ipcRenderer.on, we can't easily remove specific listeners 
        // unless we expose removeListener. 
        // However, the issue might be that we are NOT receiving data.
      };
    }
  }, [isRecording]);

  return (
    <div className="app-container">
      <Header isConnected={isConnected} />
      <div className="main-content">
        <Sidebar
          setIsConnected={setIsConnected}
          isConnected={isConnected}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          exportData={exportData}
        />
        <div className="dashboard-grid">
          <div className="top-row">
            <DataSegments data={serialData} />
            <Map lat={serialData.gps?.lat || serialData.lat} lon={serialData.gps?.lon || serialData.lon} />
          </div>
          <div className="bottom-row">
            <Charts data={serialData} />
            <LogConsole logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
