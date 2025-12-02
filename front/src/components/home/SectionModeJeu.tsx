import { useState } from "react";
import { SectionDifficulty } from "./SectionDifficulty";

/*type SectionModeJeuProps={
    mode?: "pvp"|"ia",
    onCreateGame: ()=>void
}*/

export function SectionModeJeu(){
   
   const [mode, setMode] = useState("")

   const onCreateGame=()=>{
    console.log('partie créée')
   }
   
    return(
        <>
        <section className="options">
            <section className="options-section">
                <div className="card full-width">
                <h3>Mode de jeu</h3>
                <div className="radio-group">
                    <label>
                        <input type="radio" name="mode" value="pvp"
                            checked={mode === "pvp"}
                            onChange={() => setMode("pvp")}/>
                        1 vs 1
                    </label> 
                    <label>
                        <input type="radio" name="mode" value="ia"
                            checked={mode === "ia"}
                            onChange={() => setMode("ia")}/>
                        1 vs machine
                    </label>
                </div>
                <button className="create-btn" onClick={onCreateGame}>
                    ➕ Créer une partie
                </button>
                </div>
            </section>
            <SectionDifficulty disable={mode==="pvp"}/>
        </section>
        </>
    )
}