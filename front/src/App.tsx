
import './App.css'
import Connexion from './components/connexion/Connexion'
import { Game } from './components/game/Game'
import { Home } from './components/home/Home'

function App() {

  return (
    <>
      <Home player={{id:1, name:'Joueur 1'}}/>
    </>
  )
}

export default App
