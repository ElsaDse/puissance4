export function GameOverPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="popup-overlay-game-over">
      <div className="popup-game-over">
        <h2>GAME OVER</h2>

        <button onClick={onClose} className="popup-btn-game-over">
          OK
        </button>
      </div>
    </div>
  );
}
