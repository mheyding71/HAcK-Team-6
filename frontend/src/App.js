import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import './App.css';

// Connect to the Socket.IO server
const socket = io('http://localhost:8000');

function App() {
  const [pictureStatus, setPictureStatus] = useState("");
  const [sensorData, setSensorData] = useState({
    temperature: null,
    distance: null,
    humidity: null,
    light: null,
  });

  // ✅ Correct place for useEffect
  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));

    socket.on('picture_taken', data => {
      setPictureStatus(data.message);
      setTimeout(() => setPictureStatus(""), 3000);
    });

    socket.on('temp', value => {
      setSensorData(prev => ({ ...prev, temperature: value }));
    });

    socket.on('ultrasonic', value => {
      setSensorData(prev => ({ ...prev, distance: value }));
    });

    socket.on('humidity', value => {
      setSensorData(prev => ({ ...prev, humidity: value }));
    });

    socket.on('light', value => {
      setSensorData(prev => ({ ...prev, light: value }));
    });

    return () => {
      socket.off('picture_taken');
      socket.off('temp');
      socket.off('ultrasonic');
      socket.off('humidity');
      socket.off('light');
    };
  }, []);

  function playAudio() {
    const audio = new Audio('http://localhost:8000/audio/speech.mp3');
    audio.play().catch(e => console.error("Error playing audio:", e));
    console.log("PLaying...")
  }

  function export_photo() {
    socket.emit('take_picture');
    setPictureStatus("Taking picture...");
  }

  return (
    <div className="app">
      <h1>HAcK Team 6</h1>

      {pictureStatus && <p>{pictureStatus}</p>}

      <div className="measurement">
        <p><strong>Temperature (°F):</strong> {sensorData.temperature ?? '--'}</p>
        <p><strong>Distance (cm):</strong> {sensorData.distance ?? '--'}</p>
        <p><strong>Humidity (%):</strong> {sensorData.humidity ?? '--'}</p>
        <p><strong>Light (Lumens):</strong> {sensorData.light ?? '--'}</p>
        <button onClick={export_photo}>Take Photo</button>
        <button onClick={playAudio}>Play Sound</button>
      </div>
    </div>
  );
}

export default App;
