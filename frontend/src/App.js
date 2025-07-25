import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import './App.css';




// Connect to the Socket.IO server



const socket = io('http://localhost:8000');

function App() {
  const [pictureStatus, setPictureStatus] = useState("");

  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));
    socket.on('picture_taken', data => {
      setPictureStatus(data.message);
      setTimeout(() => setPictureStatus(""), 3000); // Clear status after 3 seconds
    });
    return () => {
      socket.off('picture_taken');
    };
  }, []);

  

  return (
    <div className="app">
      <h1 > Title </h1>
      <p className ="measurement.text"> Temperature (F)</p>



      <p> Distance (cm)</p>



      <p> Humidity % </p>



      <p> Light (Lumens) </p>








    </div>
  );
}

export default App;
