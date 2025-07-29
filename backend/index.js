require('dotenv').config();
const fs = require('fs');
const cors = require("cors");
const express = require("express");
const http = require('http');
const MQTT = require('mqtt');
const { spawn } = require('child_process');
const path = require('path');
const APP = express();
const server = http.createServer(APP);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const CLIENTID = "frontend";

const client = MQTT.connect(process.env.CONNECT_URL, {
  clientId: CLIENTID,
  clean: true,
  connectTimeout: 3000,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  reconnectPeriod: 10000,
  debug: true,
  rejectUnauthorized: false
});

// Debugging MQTT connection
client.on("error", (error) => console.error("Connection error:", error));
client.on("close", () => console.log("Connection closed"));
client.on("offline", () => console.log("Client went offline"));
client.on("reconnect", () => console.log("Attempting to reconnect..."));

client.on('connect', async () => {
  console.log("Connected to MQTT broker");

  ['ultrasonic', 'temp', 'humidity', 'light'].forEach(topic => {
    client.subscribe(topic, (err) => {
      if (err) console.error(`Subscription error for '${topic}':`, err);
      else console.log(`Subscribed to '${topic}'`);
    });
  });
});

APP.use(cors({ origin: '*' }));
APP.use(express.json());
APP.use('/audio', express.static(path.join(__dirname, '../AI')));
APP.use('/images', express.static(path.join(__dirname, '../AI')));

let latestTemp = null;
let latestUltrasonic = null;
let latestHumidity = null;
let latestLight = null;

io.on("connection", (socket) => {
  console.log("Frontend connected to socket");

  // Send latest data when frontend connects
  if (latestTemp) socket.emit('temp', latestTemp);
  if (latestUltrasonic) socket.emit('ultrasonic', latestUltrasonic);
  if (latestHumidity) socket.emit('humidity', latestHumidity);
  if (latestLight) socket.emit('light', latestLight);

  socket.on('display', (message) => {
    console.log('📟 Display message:', message);
    client.publish("display", message.toString());
  });
  socket.on('user_input', (text) => {
    console.log('User input received:', text);
    client.publish('device/input', text);
  });
  socket.on('servo_sweep', () => {
  console.log("🔁 Sending servo sweep command to Pico via MQTT");
  client.publish("servo/sweep", "servo_sweep");
  });

  socket.on('take_picture', () => {
    console.log('✅ Received take_picture from frontend');
    client.publish("camera/take", "snap");
    console.log('📡 Published "camera/take" to MQTT');
  
    const pythonProcess = spawn('python', ['../AI/receive.py'], {
      cwd: __dirname
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`🐍 Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`❌ Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`🔚 Python script exited with code ${code}`);
      socket.emit('picture_taken', {
        success: code === 0,
        message: code === 0 ? 'Picture analyzed successfully!' : 'Failed to analyze picture'
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("Frontend disconnected from socket");
  });
});

setInterval(() => {
  const payload = {
    temp: latestTemp,
    ultrasonic: latestUltrasonic,
    humidity: latestHumidity,
    light: latestLight
  };
  console.log("Emitting to frontend:", payload);

  io.emit('temp', latestTemp);
  io.emit('ultrasonic', latestUltrasonic);
  io.emit('humidity', latestHumidity);
  io.emit('light', latestLight);
}, 1000);

server.listen(8000, () => {
  console.log('Server is running on port 8000');
});

client.on('message', (topic, payload) => {
  const value = payload.toString();

  if (topic === 'temp') latestTemp = value;
  else if (topic === 'ultrasonic') latestUltrasonic = value;
  else if (topic === 'humidity') latestHumidity = value;
  else if (topic === 'light') latestLight = value;
});
