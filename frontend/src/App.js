import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:8000');

function App() {
  const [pictureStatus, setPictureStatus] = useState("");
  const [imageKey, setImageKey] = useState(Date.now()); // 👈 used to force reload
  const [sensorData, setSensorData] = useState({
    temperature: null,
    distance: null,
    humidity: null,
    light: null,
  });

  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));

    socket.on('picture_taken', data => {
      setPictureStatus(data.message);

      if (data.success) {
        // 👇 update image by changing key
        setImageKey(Date.now());
      }

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

        {/* Image always shows, auto-refreshes when imageKey changes */}
        <div style={{ marginTop: '20px' }}>
          <p><strong>Captured Image:</strong></p>
          <img
            src={`http://localhost:8000/images/downloaded_image.jpg?ts=${imageKey}`}
            alt="Captured"
            style={{ width: '300px', height: 'auto', borderRadius: '8px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
