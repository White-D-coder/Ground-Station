import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DataSegments from './components/DataSegments';
import Charts from './components/Charts';
import Map from './components/Map';
import CubeSat from './components/CubeSat';
import LogConsole from './components/LogConsole';
import './App.css';

const createWebApi = () => {
  const listeners = { telemetry: [], raw: [] };
  let ws = null;

  const connectWs = () => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${proto}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry') {
          listeners.telemetry.forEach(cb => cb(msg.data));
        } else if (msg.type === 'raw') {
          listeners.raw.forEach(cb => cb(msg.data));
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    ws.onclose = () => {
      console.log("WS Closed, reconnecting...");
      setTimeout(connectWs, 2000);
    };
  };

  connectWs();

  return {
    serial: {
      list: async () => {
        const res = await fetch('/api/ports');
        return await res.json();
      },
      connect: async (port, baud) => {
        await fetch('/api/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ port, baud })
        });
      },
      disconnect: async () => {
        await fetch('/api/disconnect', { method: 'POST' });
      }
    },
    on: {
      telemetry: (cb) => listeners.telemetry.push(cb),
      raw: (cb) => listeners.raw.push(cb)
    },
    mission: {
      save: async () => console.log("Mission save not implemented in web mode"),
      list: async () => []
    },
    export: {
      save: async () => alert("Export not supported in web mode yet")
    },
    can: { listen: () => { } },
    lora: { listen: () => { } }
  };
};

import History from './components/History';
import TrackVisualizer from './components/TrackVisualizer';
import ControlPanel from './components/ControlPanel';

function App() {
  const [serialData, setSerialData] = useState({});
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [missionData, setMissionData] = useState([]);
  const [isElectron, setIsElectron] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'history' | 'track' | 'control'
  const [gpsPath, setGpsPath] = useState([]);

  const [isReady, setIsReady] = useState(false);

  const apiRef = useRef(null);

  useEffect(() => {
    if (window.api) {
      setIsElectron(true);
      apiRef.current = window.api;
    } else {
      setIsElectron(false);
      console.log("Running in WEB MODE");
      apiRef.current = createWebApi();
      window.api = apiRef.current;
    }
    setIsReady(true);
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setMissionData([]);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (apiRef.current && missionData.length > 0) {
      await apiRef.current.mission.save({
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

  const exportData = async (type) => {
    if (apiRef.current && missionData.length > 0) {
      await apiRef.current.export.save(type, missionData);
    }
  };

  useEffect(() => {
    if (!apiRef.current) return;

    const cleanupTelemetry = apiRef.current.on.telemetry((eventData) => {
      console.log("App received telemetry:", eventData);
      const d = eventData.data || eventData;
      setSerialData(d);

      // Track GPS Path
      if (d.gps && d.gps.lat !== 0 && d.gps.lon !== 0) {
        setGpsPath(prev => [...prev, { lat: d.gps.lat, lon: d.gps.lon }]);
      } else if (d.lat && d.lon && d.lat !== 0 && d.lon !== 0) {
        setGpsPath(prev => [...prev, { lat: d.lat, lon: d.lon }]);
      }

      if (isRecording) {
        setMissionData(prev => [...prev, { ...d, timestamp: Date.now() }]);
      }
    });

    const cleanupRaw = apiRef.current.on.raw((data) => {
      console.log("App received raw:", data);
      setLogs(prev => [...prev.slice(-99), data]);
    });

    return () => {
    };
  }, [isRecording, isElectron]);

  if (!isReady) {
    return <div style={{ color: 'white' }}>Initializing...</div>;
  }

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
          setView={setCurrentView}
          currentView={currentView}
        />
        {currentView === 'dashboard' ? (
          <div className="dashboard-grid">
            <div className="top-row">
              <DataSegments data={serialData} />
              <CubeSat data={serialData} />
              <Map lat={serialData.gps?.lat || serialData.lat} lon={serialData.gps?.lon || serialData.lon} />
            </div>
            <div className="bottom-row">
              <Charts data={serialData} />
              <LogConsole logs={logs} />
            </div>
          </div>
        ) : currentView === 'history' ? (
          <History onBack={() => setCurrentView('dashboard')} />
        ) : currentView === 'track' ? (
          <TrackVisualizer
            path={gpsPath}
            currentPos={gpsPath.length > 0 ? gpsPath[gpsPath.length - 1] : null}
            onBack={() => setCurrentView('dashboard')}
          />
        ) : (
          <ControlPanel
            onBack={() => setCurrentView('dashboard')}
            data={serialData}
            gpsPath={gpsPath}
            isConnected={isConnected}
          />
        )}
      </div>
    </div>
  );
}

export default App;
