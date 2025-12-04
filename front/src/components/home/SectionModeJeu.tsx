import { useState } from "react";
import { SectionDifficulty } from "./SectionDifficulty";
import CreateGamePopup from "./CreateGamePopup";


export function SectionModeJeu(){
   
   const [mode, setMode] = useState<"pvp" | "ia" | "">("")
   const [isPopupOpen, setIsPopupOpen] = useState(false);

   const onCreateGame=()=>{
        if (mode === "pvp") {
        setIsPopupOpen(true);
        } else if (mode === "ia") {
        console.log("Partie contre l'IA créée !");
        } else {
        alert("Veuillez d'abord choisir un mode de jeu");
        }
   }

   const closePopup=()=>{
        setIsPopupOpen(false);
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
                {mode==="pvp" && isPopupOpen&& <CreateGamePopup onClose={closePopup}/>}
                </div>
            </section>
            <SectionDifficulty disable={mode==="pvp"}/>
        </section>
        </>
    )
}