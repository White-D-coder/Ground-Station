# Ground Station Control System - User Manual

## 1. System Overview

**What is this?**
The Ground Station Control System (GSCS) is a professional-grade interface designed for monitoring and controlling Unmanned Aerial Vehicles (UAVs), CubeSats, or robotic platforms. It provides real-time telemetry visualization, live video feed integration, and direct command-and-control capabilities through a unified, high-performance dashboard.

**Why is this needed?**
This system bridges the gap between the operator and the remote vehicle. It translates raw data into actionable insights (visual maps, attitude indicators, health stats) and converts operator inputs (joystick movements, commands) into serial signals that the vehicle hardware can understand. It ensures mission safety, precise control, and comprehensive data logging.

---

## 2. Hardware Requirements & Setup

To operate this system, a physical data link is required between the Ground Station computer and the remote vehicle.

### Required Hardware
1.  **Ground Station Computer**: Running the GSCS application (Windows/macOS/Linux).
2.  **Data Receiver / Transceiver**: A hardware module (e.g., LoRa, XBee, RFD900) that receives telemetry from the vehicle and sends commands.
3.  **USB Connection**: The Data Receiver must be connected to the computer via USB.

### Setup Instructions
1.  **Connect the Receiver**: Plug your Data Receiver into an available USB port on your computer.
2.  **Install Drivers**: Ensure appropriate drivers (e.g., CP210x, FTDI) are installed so the device appears as a COM port (Windows) or `/dev/ttyUSB*` / `/dev/tty.usbserial*` (macOS/Linux).
3.  **Power On Vehicle**: Ensure the remote vehicle is powered on and transmitting data.

---

## 3. Operation Guide

### Step 1: Launching the Application
Open the Ground Station application. You will be greeted by the **Dashboard** view.

### Step 2: Establishing Connection
1.  Navigate to the **Sidebar** (left panel).
2.  Locate the **Connection Manager**.
3.  **Select Port**: Choose the COM port corresponding to your Data Receiver from the dropdown list.
4.  **Select Baud Rate**: Choose the baud rate matching your hardware configuration (default: `115200`).
5.  Click **CONNECT**.
    *   *Success*: The status indicator will turn **Green**, and telemetry data will begin populating the dashboard.
    *   *Failure*: Check your physical connection and ensure no other application is using the port.

### Step 3: Monitoring Telemetry
Once connected, the Dashboard provides real-time metrics:
*   **Attitude**: Pitch, Roll, and Yaw visualization (3D CubeSat model).
*   **GPS**: Live tracking on the map with path history.
*   **Health**: Battery voltage, signal strength (RSSI), and temperature.
*   **Environment**: Altitude, speed, and pressure.

### Step 4: Control Panel Operation
Click the **Joystick Icon** or navigate to the **Control Panel** view for active mission control.

*   **Live Feed**: Select your video source (USB Camera / Capture Card) to view the FPV feed.
*   **Arming**:
    *   Click **ARM** to enable vehicle motors/actuators. *Warning: Propellers may spin.*
    *   Click **DISARM** to safely disable the vehicle.
*   **Gimbal Control**:
    *   Use the on-screen **Joystick** to control the camera gimbal or vehicle orientation.
    *   **X-Axis**: Controls Yaw/Pan.
    *   **Y-Axis**: Controls Pitch/Tilt.
*   **Compass**: A professional 2D compass displays the vehicle's heading relative to North.

---

## 4. Command Reference

The Ground Station communicates with the vehicle using a specific serial command protocol. Below is the list of commands sent by the system.

| Command | Description | Trigger |
| :--- | :--- | :--- |
| `CMD:ARM` | Arms the vehicle (enables motors). | Clicking "ARM" button. |
| `CMD:DISARM` | Disarms the vehicle (disables motors). | Clicking "DISARM" button. |
| `CMD:SERVO:1:<angle>` | Sets Servo 1 (Pan) angle (0-180). | Moving Joystick X-axis. |
| `CMD:SERVO:2:<angle>` | Sets Servo 2 (Tilt) angle (0-180). | Moving Joystick Y-axis. |

### Telemetry Data Format (Input)
The system expects incoming data in **JSON format** ending with a newline (`\n`).
**Example:**
```json
{
  "gps": { "lat": 28.6139, "lon": 77.2090, "alt": 250 },
  "orientation": { "x": 10, "y": -5, "z": 120 },
  "battery": 4.1,
  "rssi": -65,
  "speed": 15.5
}
```

---

## 5. Troubleshooting

*   **No Data**: Verify the correct COM port and Baud Rate are selected. Check receiver power.
*   **Video Lag**: Ensure your capture card supports the selected resolution. Try a different USB port.
*   **Compass Not Rotating**: The compass relies on GPS movement for bearing. Ensure the vehicle is moving or has a valid magnetic compass sensor.

---

## 6. Hosting on Local Network

You can host the Ground Station on your local network to access the Control Panel from other devices (e.g., tablets, phones, or other laptops).

### Steps to Host

1.  **Ensure the Frontend is Built**:
    Run the following command to build the latest version of the interface:
    ```bash
    cd frontend && npm run build && cd ..
    ```

2.  **Start the Web Server**:
    Run the hosting script from the project root:
    ```bash
    npm run serve
    ```

3.  **Access from Other Devices**:
    The terminal will display the **Network URL** (e.g., `http://192.168.1.5:3001`).
    Open this URL in the browser of your tablet or other device.

> **Note**: Ensure your firewall allows incoming connections on port 3001.


---

## 7. Hosting Globally (Internet Access)

To access the Ground Station from anywhere in the world (outside your local network), you need to expose your local server to the internet.

Since the application requires access to your computer's **USB Serial Ports**, you cannot simply upload it to a cloud provider like Vercel or AWS. Instead, you must run the app on your laptop and use a **Tunneling Service**.

### Recommended Tool: ngrok

1.  **Download ngrok**:
    Visit [ngrok.com](https://ngrok.com/download) and install the tool for your OS.

2.  **Start the Ground Station**:
    Ensure your app is running locally:
    ```bash
    npm run serve
    ```

3.  **Start the Tunnel**:
    Open a *new* terminal window and run:
    ```bash
    ngrok http 3001
    ```

4.  **Access Globally**:
    ngrok will generate a public URL (e.g., `https://a1b2-c3d4.ngrok-free.app`).
    You can open this URL on any device, anywhere in the world, to view your Ground Station and control the vehicle.


---

## 8. Distribution (How to Share)

To allow other users to use the Ground Station with their own hardware, you can share the installer file.

### macOS Users
1.  Locate the installer file in the `release` folder:
    `GroundStation Ground Station-1.0.0-arm64.dmg` (for Apple Silicon) or `.dmg` (for Intel).
2.  Upload this file to Google Drive, Dropbox, or your website.
3.  Users download the `.dmg` file, open it, and drag the app to their Applications folder.
4.  **Note**: Since the app is not signed by Apple, they may need to right-click and select "Open" the first time to bypass the security warning.

### Windows Users
(To build for Windows, run `npm run dist` on a Windows machine)
1.  Share the generated `.exe` file.
2.  Users simply run the installer.


