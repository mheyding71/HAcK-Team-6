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
  const [inputText, setInputText] = useState(""); // ← new input state
  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));

    socket.on('picture_taken', data => {
      console.log('📸 Taking picture and getting AI description...');  // ✅ THIS LINE
      setPictureStatus(data.message);

      if (data.success) {
        // 👇 update image by changing key
        setImageKey(Date.now());
      }

      setTimeout(() => setPictureStatus(""), 3000);
    });

socket.on('temp', value => {
  console.log("🌡️ Received temp:", value); // ✅ Add this
  setSensorData(prev => ({ ...prev, temperature: value }));
});

socket.on('ultrasonic', value => {
  console.log("📏 Received distance:", value);
  setSensorData(prev => ({ ...prev, distance: value }));
});

socket.on('humidity', value => {
  console.log("💧 Received humidity:", value);
  setSensorData(prev => ({ ...prev, humidity: value }));
});

socket.on('light', value => {
  console.log("💡 Received light:", value);
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

  function handleTextSubmit() {
    console.log("Submitted:", inputText);
    socket.emit("user_input", inputText); 
    setInputText(""); 
  }


  function export_photo() {
    console.log("📸 Take Picture button clicked frontend");  // ✅ ADD THIS

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

        <button onClick={() => socket.emit('servo_sweep')}>Turn Head</button>

        <button onClick={export_photo}>Take Photo</button>
        <button onClick={playAudio}>Play Sound</button>
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ padding: '8px', width: '200px', marginRight: '10px' }}
          />
          <button onClick={handleTextSubmit}>Enter</button>
        </div>

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
