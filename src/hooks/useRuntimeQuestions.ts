import { useEffect, useState } from 'react';
import type { QuestionsLoadResult } from '../types/questions';
import { loadQuestionsFromRuntimeFile } from '../utils/questionLoader';

const QUESTIONS_FILE_URL = '/data/questions.json';

export default function useRuntimeQuestions(): QuestionsLoadResult {
  const [result, setResult] = useState<QuestionsLoadResult>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    void loadQuestionsFromRuntimeFile(QUESTIONS_FILE_URL).then((loaded) => {
      if (cancelled) return;

      if (!loaded.ok) {
        setResult({
          status: 'error',
          summary: 'Die Fragen-Datei konnte nicht verwendet werden.',
          issues: loaded.issues,
        });
        return;
      }

      setResult({
        status: 'ready',
        questions: loaded.questions,
        datasetKey: loaded.datasetKey,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
