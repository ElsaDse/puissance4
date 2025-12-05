
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Connexion from './components/connexion/Connexion'
import { Game } from './components/game/Game'
import { Home } from './components/home/Home'
import { useEffect } from 'react'
import socket from './utils/socket.ts'

function App() {

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Connexion />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
