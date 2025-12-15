import './../../style/QuitConfirmationModal.css'

interface QuitConfirmationModalProps {
  isOpen: boolean;
  onSaveAndQuit: () => void;
  onQuitWithoutSave: () => void;
  onCancel: () => void;
}

export function QuitConfirmationModal({
  isOpen,
  onSaveAndQuit,
  onQuitWithoutSave,
  onCancel,
}: QuitConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Quitter la partie ?</h2>
        <p>Que souhaitez-vous faire ?</p>
        <div className="modal-buttons">
          <button className="btn-save" onClick={onSaveAndQuit}>
            Sauvegarder et quitter
          </button>
          <button className="btn-no-save" onClick={onQuitWithoutSave}>
            Quitter sans sauvegarder
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}