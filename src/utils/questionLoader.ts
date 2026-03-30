import type { Question, QuestionCategory, QuestionsFileLoadResult, QuestionsValidationIssue } from '../types/questions';
import { QUESTION_CATEGORY_ORDER } from './questionCategories';

const VALID_CATEGORIES = new Set<QuestionCategory>(QUESTION_CATEGORY_ORDER);

function hashString(input: string) {
  let hash = 5381;

  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }

  return (hash >>> 0).toString(36);
}

export function createQuestionsDatasetKey(questions: Question[]) {
  return hashString(questions.map((question) => `${question.id}|${question.category}|${question.text}`).join('\n'));
}

export function validateQuestionsPayload(payload: unknown): {
  questions?: Question[];
  issues: QuestionsValidationIssue[];
} {
  const issues: QuestionsValidationIssue[] = [];

  if (!Array.isArray(payload)) {
    return {
      issues: [{ path: '$', message: 'Erwartet wurde ein JSON-Array mit Fragen.' }],
    };
  }

  const seenIds = new Set<string>();
  const questions: Question[] = [];

  payload.forEach((entry, index) => {
    const path = `$[${index}]`;

    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      issues.push({ path, message: 'Jeder Eintrag muss ein Objekt sein.' });
      return;
    }

    const candidate = entry as Record<string, unknown>;
    const { id, text, category } = candidate;

    if (typeof id !== 'string' || id.trim().length === 0) {
      issues.push({ path: `${path}.id`, message: 'Die ID muss ein nicht-leerer String sein.' });
    } else if (seenIds.has(id)) {
      issues.push({ path: `${path}.id`, message: `Die ID "${id}" ist doppelt vorhanden.` });
    } else {
      seenIds.add(id);
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      issues.push({ path: `${path}.text`, message: 'Der Text muss ein nicht-leerer String sein.' });
    }

    if (typeof category !== 'string' || !VALID_CATEGORIES.has(category as QuestionCategory)) {
      issues.push({
        path: `${path}.category`,
        message: `Ungültige Kategorie. Erlaubt sind: ${QUESTION_CATEGORY_ORDER.join(', ')}.`,
      });
    }

    if (
      typeof id === 'string' &&
      id.trim().length > 0 &&
      typeof text === 'string' &&
      text.trim().length > 0 &&
      typeof category === 'string' &&
      VALID_CATEGORIES.has(category as QuestionCategory)
    ) {
      questions.push({
        id,
        text,
        category: category as QuestionCategory,
      });
    }
  });

  return { questions, issues };
}

export async function loadQuestionsFromRuntimeFile(url: string): Promise<QuestionsFileLoadResult> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    return {
      ok: false,
      issues: [{ path: url, message: `Datei konnte nicht geladen werden (${response.status} ${response.statusText}).` }],
    };
  }

  const rawText = await response.text();

  let payload: unknown;
  try {
    payload = JSON.parse(rawText) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Parse-Fehler.';
    return {
      ok: false,
      issues: [{ path: url, message: `JSON konnte nicht gelesen werden: ${message}` }],
    };
  }

  const validation = validateQuestionsPayload(payload);
  if (validation.issues.length > 0 || !validation.questions) {
    return {
      ok: false,
      issues: validation.issues,
    };
  }

  const datasetKey = createQuestionsDatasetKey(validation.questions);
  return {
    ok: true,
    questions: validation.questions,
    issues: [],
    datasetKey,
  };
}
