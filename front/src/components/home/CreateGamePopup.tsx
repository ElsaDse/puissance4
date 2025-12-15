import { useEffect, useState } from "react";
import type { PlayerColor } from "../../utils/types.ts";
import './../../style/createGamePopup.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket.ts";

type CreateGamePopupProps={
    difficulty: "easy" | "medium" | "hard"| "",
    onClose: ()=>void,
    /*onColorChange: (color: PlayerColor) => void,
    color: PlayerColor,
    userId: number*/
}


export default function CreateGamePopup({difficulty, onClose}: CreateGamePopupProps) {
  const [color, setColor] = useState<PlayerColor>('R');
  const [waiting, setWaiting] = useState(false);
  const [gameId, setGameId] = useState<number>();
  const navigate= useNavigate();

  const stored = localStorage.getItem("user");
  const stored_user =JSON.parse(stored!)
  const host_user_id= stored_user.id
  const opponent_color= findOponentColor(color!)

    // écouter player_joined
    useEffect(()=>{
        if (!waiting || !gameId) return;

        if(!socket.connected){
            socket.connect()
        }
        const handlePlayerJoined = () => {
            console.log("Un joueur a rejoint ! Redirection...");
            localStorage.setItem('game', JSON.stringify({id: gameId}));
            navigate("/game");
        }
        socket.emit("host_join_room", gameId);
        socket.on("player_joined", handlePlayerJoined);
        return () => {
            socket.off("player_joined", handlePlayerJoined);
        };
    },[gameId, waiting, navigate])


  async function createGame() {
    if(difficulty===""){
        try{
            const res = await axios.post("http://localhost:4000/game/create", {host_user_id, color, opponent_color});
            const game = res.data.game;
            setGameId(game.id);
            setWaiting(true);
        } catch(err){
            console.error(err)
        }
    } else{
        try{
            const res = await axios.post("http://localhost:4000/game/create/ia", {userId:host_user_id, color:color, difficulty:difficulty});
            localStorage.setItem('game', JSON.stringify(res.data));
            navigate("/game");
        } catch(err){
            console.error(err)
        }
    }
  }


  return (
    <div className="popup-overlay">
        <div className="popup">
        {!waiting ? (
            <>
            <span className="popup-close-btn" onClick={onClose}> ✖ </span>
            <h2>Créer une partie</h2>

            <label>Choisis ta couleur :</label>
            <select
                value={color}
                onChange={(e) => setColor(e.target.value as PlayerColor)}
            >
                <option value='R'>🔴 Rouge</option>
                <option value='Y'>🟡 Jaune</option>
            </select>

            <button onClick={createGame}>Créer</button>
            </>
        ) : (
            <>
            <h3>🎮 Partie créée</h3>
            <p>ID : <strong>{gameId}</strong></p>
            <p>🕒 En attente de l’adversaire...</p>
            <div className="spinner" />
            </>
        )}
        </div>
    </div>
  );


}


function findOponentColor(color:PlayerColor): PlayerColor{
    if(color==='R') return 'Y'
    return 'R'
}