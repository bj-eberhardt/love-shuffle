import React, { useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { Controls } from './Controls';

export type QuestionAreaProps = {
  question?: string;
  index?: number;
  total: number;
  onShuffle: () => void;
  onBack: () => void;
  onForward: () => void;
  hint?: string;
  disableShuffle?: boolean;
  showBack?: boolean;
  showForward?: boolean;
};

export function QuestionArea({
  question,
  index,
  total,
  onShuffle,
  onBack,
  onForward,
  hint,
  disableShuffle,
  showBack,
  showForward,
}: QuestionAreaProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!disableShuffle) onShuffle();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disableShuffle, onShuffle]);

  return (
    <div className="question-area" data-testid="question-area">
      {index !== undefined ? (
        <QuestionCard question={question ?? ''} index={index} total={total} />
      ) : (
        <div className="question-card" style={{ textAlign: 'center' }}>
          <p className="question-card__text">Noch keine Frage gewählt.</p>
        </div>
      )}

      <Controls
        onShuffle={onShuffle}
        onBack={onBack}
        onForward={onForward}
        disableShuffle={disableShuffle}
        showBack={showBack}
        showForward={showForward}
      />

      {hint && <div className="hint">{hint} <span className="hint__kbd">(Tastenkürzel: Leertaste)</span></div>}
    </div>
  );
}
