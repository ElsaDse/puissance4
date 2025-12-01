import { useState } from "react";

/*type SectionJoinProps={
    GameId?: number,
    onJoin: (id: number)=>void
}*/

export function SectionJoin(){
   
    const [roomId, setRoomId] = useState<number>();

    const onJoin= (id: number)=>{
        console.log(`Joindre la partie ${id}`)
    }
   
    return(
        <>
        <section className="join-section">
            <input
            type="number"
            placeholder="ID de partie..."
            value={roomId===undefined? "": roomId}
            onChange={(e) => setRoomId(parseInt(e.target.value))}
            />
            <button onClick={() => onJoin(roomId!)}>Rejoindre une partie</button>
        </section>
        </>
    )
}