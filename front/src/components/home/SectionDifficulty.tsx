
type Props = {
  disable: boolean;
  difficulty: "easy" | "medium" | "hard" | "";
  onChange: (value: "easy" | "medium" | "hard") => void;
};

export function SectionDifficulty({ disable, difficulty, onChange }: Props){
   
    return(
        <>
        <section className="options-section" >
            <div className={`card full-width ${disable} ? "disabled" : ""}`} >
                <h3>Niveau de difficulté</h3>
                <div className="radio-group">
                    <label>
                        <input type="radio" name="difficulty" value="easy" disabled={disable}
                        checked={difficulty === "easy"}
                        onChange={() => onChange("easy")}/>
                        Facile
                    </label>
                    <label>
                        <input type="radio" name="difficulty" value="medium" disabled={disable}
                        checked={difficulty === "medium"}
                        onChange={() => onChange("medium")}/>
                        Moyen
                    </label>
                    <label>
                        <input type="radio" name="difficulty" value="hard" disabled={disable}
                        checked={difficulty === "hard"}
                        onChange={() => onChange("hard")}/>
                        Difficile
                    </label>
                </div>
            </div>
        </section>
        </>
    )
}