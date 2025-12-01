import type { Player } from "../../utils/types";

type  VictoryPopupProps ={
  winner: Player;
  duration: string; // format 00:00
  onReplay: () => void;
  onQuit: () => void;
}

export  function VictoryPopup({ winner, duration, onReplay, onQuit }: VictoryPopupProps) {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h2 className="popup-title">🎉 Victoire !</h2>

        <p className="popup-text">
          <strong>{winner.name}</strong> a gagné la partie 🎯
        </p>
        <p className="popup-duration">
          ⏱️ Durée : <strong>{duration}</strong>
        </p>

        <div className="popup-buttons">
          <button className="popup-btn replay" onClick={onReplay}>
            Rejouer
          </button>
          <button className="popup-btn quit" onClick={onQuit}>
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
}
