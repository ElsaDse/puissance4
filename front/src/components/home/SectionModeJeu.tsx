import { useState } from "react";
import { SectionDifficulty } from "./SectionDifficulty";
import CreateGamePopup from "./CreateGamePopup";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export function SectionModeJeu(){
   
   const [mode, setMode] = useState<"pvp" | "ia" | "">("")
   const [isPopupOpen, setIsPopupOpen] = useState(false);
   const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">("");

   const stored = localStorage.getItem("user");
   const stored_user =JSON.parse(stored!)
   const is_guest= stored_user.is_guest

   const navigate= useNavigate()

   async function checkSavedGame() {
        if(mode !== "ia" || difficulty=== "") return false
        try{
            const res = await axios.post("http://localhost:4000/game/create/ia", {userId:stored_user.id, color:"R", difficulty:difficulty});
            if(res.data.resumed){
                localStorage.setItem('game', JSON.stringify(res.data));
                navigate("/game");
                return true
            }
        } catch(err){
            console.error(err)
        }
        return false
   }


   const onCreateGame= async ()=>{
        if (!mode) {
            alert("Veuillez d'abord choisir un mode de jeu");
            return;
        }

        if (mode === "ia" && !difficulty) {
            alert("Veuillez choisir une difficulté");
            return;
        }

        if (mode === "pvp") {
            setIsPopupOpen(true);
            return;
        }
        const hasSaved = await checkSavedGame();
        if (hasSaved) return; 
        setIsPopupOpen(true);
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
                        <input type="radio" name="mode" value="pvp"  disabled={is_guest}
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
                {isPopupOpen&& 
                    <CreateGamePopup difficulty={difficulty} 
                    onClose={closePopup}
                    />
                }
                </div>
            </section>
            <SectionDifficulty disable={mode==="pvp"}
                difficulty={difficulty}
                onChange={setDifficulty}
            />
        </section>
        </>
    )
}