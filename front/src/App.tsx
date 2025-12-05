
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Connexion from './components/connexion/Connexion'
import { Game } from './components/game/Game'
import { Home } from './components/home/Home'

function App() {

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
