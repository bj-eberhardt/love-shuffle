import React, { useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { Controls } from './Controls';

export type QuestionAreaProps = {
  question?: string;
  index?: number;
  total: number;
  onShuffle: () => void;
  onBack: () => void;
  hint?: string;
  disableShuffle?: boolean;
  disableBack?: boolean;
};

export function QuestionArea({ question, index, total, onShuffle, onBack, hint, disableShuffle, disableBack }: QuestionAreaProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Space or Enter to shuffle
      if (e.code === 'Space' || e.code === 'Enter') {
        // prevent page scroll
        e.preventDefault();
        if (!disableShuffle) onShuffle();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onShuffle]);

  return (
    <div className="question-area" data-testid="question-area">
      {index !== undefined ? (
        <QuestionCard question={question ?? ''} index={index} total={total} />
      ) : (
        <div className="question-card" style={{ textAlign: 'center' }}>
          <p className="question-card__text">Noch keine Frage gewählt.</p>
        </div>
      )}

      <Controls onShuffle={onShuffle} onBack={onBack} disableShuffle={disableShuffle} disableBack={disableBack} />

      {hint && <div className="hint">{hint} <span className="hint__kbd">(Tastenkürzel: Leertaste)</span></div>}
    </div>
  );
}
