type SkipQuestionModalProps = {
  isOpen: boolean;
  onSkipForSession: () => void;
  onSkipPermanently: () => void;
  onClose: () => void;
};

export function SkipQuestionModal({
  isOpen,
  onSkipForSession,
  onSkipPermanently,
  onClose,
}: SkipQuestionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" data-testid="skip-question-modal">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="skip-question-title">
        <div className="modal-card__header">
          <div>
            <h2 className="modal-card__title" id="skip-question-title" data-testid="skip-question-title">Frage überspringen</h2>
            <p className="modal-card__copy" data-testid="skip-question-copy">
              Soll diese Frage nur heute ausgelassen werden oder für dieses Spiel dauerhaft gesperrt sein?
            </p>
          </div>
          <button className="modal-card__close" type="button" onClick={onClose} data-testid="close-skip-modal-button">
            Schließen
          </button>
        </div>

        <div className="modal-card__actions modal-card__actions--stack">
          <button
            className="button button--ghost"
            type="button"
            onClick={onSkipForSession}
            data-testid="skip-session-button"
          >
            Nur heute überspringen
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={onSkipPermanently}
            data-testid="skip-permanent-button"
          >
            Für dieses Spiel sperren
          </button>
        </div>
      </div>
    </div>
  );
}
