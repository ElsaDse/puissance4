import { useState } from "react";

/*type SectionDifficultyProps={
    difficulty?: "easy"|"medium"| "hard",
}*/

export function SectionDifficulty({disable}:{disable:boolean}){
   
   const [difficulty, setDifficulty] = useState("");
   
    return(
        <>
        <section className="options-section" >
            <div className={`card full-width ${disable} ? "disabled" : ""}`} >
                <h3>Niveau de difficulté</h3>
                <div className="radio-group">
                    <label>
                        <input type="radio" name="difficulty" value="easy" disabled={disable}
                        checked={difficulty === "easy"}
                        onChange={() => setDifficulty("easy")}/>
                        Facile
                    </label>
                    <label>
                        <input type="radio" name="difficulty" value="medium" disabled={disable}
                        checked={difficulty === "medium"}
                        onChange={() => setDifficulty("medium")}/>
                        Moyen
                    </label>
                    <label>
                        <input type="radio" name="difficulty" value="hard" disabled={disable}
                        checked={difficulty === "hard"}
                        onChange={() => setDifficulty("hard")}/>
                        Difficile
                    </label>
                </div>
            </div>
        </section>
        </>
    )
}