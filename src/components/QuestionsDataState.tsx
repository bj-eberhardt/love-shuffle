import type { QuestionsValidationIssue } from '../types/questions';

type QuestionsDataStateProps =
  | {
    mode: 'loading';
  }
  | {
    mode: 'error';
    summary: string;
    issues: QuestionsValidationIssue[];
  };

export function QuestionsDataState(props: QuestionsDataStateProps) {
  if (props.mode === 'loading') {
    return (
      <section className="status-panel status-panel--data-state" data-testid="questions-loading-state">
        <div className="status-panel__badge" aria-hidden="true">
          <img src="/assets/heart-badge.svg" alt="" />
        </div>
        <p className="status-panel__eyebrow">Love Shuffle</p>
        <h1>Fragen werden geladen</h1>
        <p className="status-panel__lead">
          Die Fragen-Datei wird gerade zur Laufzeit eingelesen und geprüft.
        </p>
        <div className="status-panel__loading-bar" aria-hidden="true">
          <span className="status-panel__loading-fill" />
        </div>
      </section>
    );
  }

  return (
    <section className="status-panel status-panel--data-state status-panel--error" data-testid="questions-error-state">
      <div className="status-panel__badge status-panel__badge--error" aria-hidden="true">
        <span>!</span>
      </div>
      <p className="status-panel__eyebrow">Konfigurationsfehler</p>
      <h1>Fragen-Datei fehlerhaft</h1>
      <p className="status-panel__lead">{props.summary}</p>
      <ul className="status-panel__issues" data-testid="questions-error-list">
        {props.issues.map((issue) => (
          <li key={`${issue.path}:${issue.message}`}>
            <strong>{issue.path}</strong>
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
