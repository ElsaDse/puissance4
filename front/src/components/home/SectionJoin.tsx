import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket.ts";


export function SectionJoin(){
   
    const [roomId, setRoomId] = useState<number>();
    const navigate= useNavigate();

    const stored = localStorage.getItem("user");
    const stored_user =JSON.parse(stored!)
    const oponent_user_id= stored_user.id

    async function onJoin(){
        if(!roomId) return;
        try{
            const res= await axios.put('http://localhost:4000/game/join',{
                game_id:roomId,
                oponent_user_id: oponent_user_id
            })
            const starterUserId = res.data.currentPlayer;
            if (!socket.connected) {
                socket.connect();
            }
            socket.emit("opponent_join_room", {gameId:roomId, starterUserId});
            navigate('/game')

        } catch(err){
            console.log(err)
        }
        console.log(`Joindre la partie ${roomId}`)
    }
   
    return(
        <>
        <section className="join-section">
            <input required
            type="number"
            placeholder="ID de partie..."
            value={roomId===undefined? "": roomId}
            onChange={(e) => setRoomId(parseInt(e.target.value))}
            />
            <button onClick={() => onJoin()}>Rejoindre une partie</button>
        </section>
        </>
    )
}