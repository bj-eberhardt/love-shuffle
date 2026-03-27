import { expect, test, type Page } from '@playwright/test';
// @ts-ignore
import questions from '../../src/data/questions.json' with { type: 'json' };
import type { Question, QuestionCategory } from '../../src/types/questions';

const typedQuestions = questions as Question[];
const QUESTION_COUNT = typedQuestions.length;

function getCategoryQuestionCount(categories: QuestionCategory[]) {
  const categorySet = new Set(categories);
  return typedQuestions.filter((question) => categorySet.has(question.category)).length;
}

async function bootstrapApp(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0;

    const proto = HTMLElement.prototype as HTMLElement & {
      requestFullscreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => void;
    };

    proto.requestFullscreen = async () => {};
    proto.webkitRequestFullscreen = () => {};
  });
}

async function seedUsedQuestions(page: Page, count: number) {
  await page.addInitScript(([storageKey, questionCount]) => {
    const usedQuestions = Array.from({ length: questionCount }, (_, index) => index);
    window.localStorage.setItem(storageKey, JSON.stringify(usedQuestions));
  }, ['loveShuffle.usedQuestions.v1', count] as const);
}

async function readGameStorage(page: Page) {
  return page.evaluate(() => ({
    used: window.localStorage.getItem('loveShuffle.usedQuestions.v1'),
    history: window.localStorage.getItem('loveShuffle.history.v1'),
    pointer: window.localStorage.getItem('loveShuffle.historyPointer.v1'),
  }));
}

async function startFilteredRound(page: Page, categories: QuestionCategory[]) {
  await page.getByTestId('open-start-menu-button').click();
  await expect(page.getByTestId('category-filter-modal')).toBeVisible();

  for (const category of categories) {
    await page.getByTestId(`category-chip-${category}`).click();
  }

  await page.getByTestId('start-filtered-round-button').click();
}

test.beforeEach(async ({ page }) => {
  await bootstrapApp(page);
  await page.goto('/');
});

test('renders the intro view with footer version', async ({ page }) => {
  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'intro');
  await expect(page.getByTestId('hero')).toBeVisible();
  await expect(page.getByTestId('hero-progress')).toContainText(`0 von ${QUESTION_COUNT}`);
  await expect(page.getByTestId('hero-filter-summary')).toHaveCount(0);
  await expect(page.getByTestId('intro-tips')).toBeVisible();
  await expect(page.getByTestId('home-footer')).toBeVisible();
  await expect(page.getByTestId('app-version')).toContainText(/^Version \d+\.\d+\.\d+/);
});

test('opens the category modal with validation and can select all categories', async ({ page }) => {
  await page.getByTestId('open-start-menu-button').click();

  await expect(page.getByTestId('category-filter-modal')).toBeVisible();
  await expect(page.getByTestId('category-filter-title')).toHaveText('Kategorien auswählen');
  await expect(page.getByTestId('category-filter-copy')).toContainText('welche Themen heute in eure Runde kommen sollen');
  await expect(page.getByTestId('modal-category-validation')).toBeVisible();
  await expect(page.getByTestId('start-filtered-round-button')).toBeDisabled();

  await page.getByTestId('select-all-categories-button').click();

  await expect(page.getByTestId('modal-category-validation')).toHaveCount(0);
  await expect(page.getByTestId('start-filtered-round-button')).toBeEnabled();
});

test('category chips can be toggled on and off in the modal', async ({ page }) => {
  await page.getByTestId('open-start-menu-button').click();

  await expect(page.getByTestId('modal-category-validation')).toBeVisible();
  await expect(page.getByTestId('start-filtered-round-button')).toBeDisabled();

  await page.getByTestId('category-chip-beziehung').click();

  await expect(page.getByTestId('modal-category-validation')).toHaveCount(0);
  await expect(page.getByTestId('start-filtered-round-button')).toBeEnabled();

  await page.getByTestId('category-chip-beziehung').click();

  await expect(page.getByTestId('modal-category-validation')).toBeVisible();
  await expect(page.getByTestId('start-filtered-round-button')).toBeDisabled();
});

test('closing the category modal keeps the intro state unchanged', async ({ page }) => {
  await page.getByTestId('open-start-menu-button').click();
  await expect(page.getByTestId('category-filter-modal')).toBeVisible();

  await page.getByTestId('close-filter-modal-button').click();

  await expect(page.getByTestId('category-filter-modal')).toHaveCount(0);
  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'intro');
  await expect(page.getByTestId('hero')).toBeVisible();
});

test('starting a filtered round uses only the selected category', async ({ page }) => {
  const relationshipCount = getCategoryQuestionCount(['beziehung']);

  await startFilteredRound(page, ['beziehung']);

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'questions');
  await expect(page.getByTestId('filter-summary')).toHaveText('Beziehung');
  await expect(page.getByTestId('question-position')).toHaveText(`1 / ${relationshipCount}`);
  await expect(page.getByTestId('question-category')).toContainText('Beziehung');
});

test('starts a round, shuffles forward, and navigates back', async ({ page }) => {
  await page.getByTestId('start-round-button').click();

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'questions');
  await expect(page.getByTestId('home-footer')).toHaveCount(0);
  await expect(page.getByTestId('question-card')).toBeVisible();
  await expect(page.getByTestId('question-position')).toHaveText(`1 / ${QUESTION_COUNT}`);
  await expect(page.getByTestId('back-button')).toHaveCount(0);
  await expect(page.getByTestId('forward-button')).toHaveCount(0);

  const firstQuestion = await page.getByTestId('question-text').textContent();

  await page.keyboard.press('Space');

  await expect(page.getByTestId('question-position')).toHaveText(`2 / ${QUESTION_COUNT}`);
  await expect(page.getByTestId('back-button')).toBeEnabled();
  await expect(page.getByTestId('forward-button')).toHaveCount(0);
  await expect(page.getByTestId('status-message')).toContainText('Shuffle');
  await expect(page.getByTestId('question-text')).not.toHaveText(firstQuestion ?? '');

  const secondQuestion = await page.getByTestId('question-text').textContent();

  await page.getByTestId('back-button').click();

  await expect(page.getByTestId('question-position')).toHaveText(`1 / ${QUESTION_COUNT}`);
  await expect(page.getByTestId('question-text')).toHaveText(firstQuestion ?? '');
  await expect(page.getByTestId('forward-button')).toBeEnabled();

  await page.getByTestId('forward-button').click();

  await expect(page.getByTestId('question-position')).toHaveText(`2 / ${QUESTION_COUNT}`);
  await expect(page.getByTestId('question-text')).toHaveText(secondQuestion ?? '');
});

test('persists progress and resumes question history across reload', async ({ page }) => {
  await page.getByTestId('start-round-button').click();
  const firstQuestion = await page.getByTestId('question-text').textContent();
  await page.getByTestId('shuffle-button').click();
  const secondQuestion = await page.getByTestId('question-text').textContent();
  await page.getByTestId('end-round-button').click();

  await expect(page.getByTestId('hero-progress')).toContainText(`2 von ${QUESTION_COUNT}`);

  await page.reload();

  await expect(page.getByTestId('hero-progress')).toContainText(`2 von ${QUESTION_COUNT}`);
  await page.getByTestId('start-round-button').click();

  await expect(page.getByTestId('question-position')).toHaveText(`2 / ${QUESTION_COUNT}`);
  await expect(page.getByTestId('question-text')).toHaveText(secondQuestion ?? '');
  await expect(page.getByTestId('back-button')).toBeEnabled();

  await page.getByTestId('back-button').click();

  await expect(page.getByTestId('question-position')).toHaveText(`1 / ${QUESTION_COUNT}`);
  await expect(page.getByTestId('question-text')).toHaveText(firstQuestion ?? '');
  await expect(page.getByTestId('forward-button')).toBeEnabled();

  await page.getByTestId('end-round-button').click();
  await page.reload();
  await page.getByTestId('start-round-button').click();

  await expect(page.getByTestId('question-position')).toHaveText(`2 / ${QUESTION_COUNT}`);
  await expect(page.getByTestId('question-text')).toHaveText(secondQuestion ?? '');
  await expect(page.getByTestId('forward-button')).toHaveCount(0);
  await expect(page.getByTestId('back-button')).toBeEnabled();
});

test('reset clears persisted progress and history', async ({ page }) => {
  await page.getByTestId('start-round-button').click();
  await page.getByTestId('shuffle-button').click();
  await page.getByTestId('end-round-button').click();

  await page.getByTestId('reset-used-button').click();

  await expect(page.getByTestId('hero-progress')).toContainText(`0 von ${QUESTION_COUNT}`);
});

test('shows the finish panel after all questions were played', async ({ page }) => {
  await page.getByTestId('start-round-button').click();

  for (let i = 1; i < QUESTION_COUNT; i += 1) {
    await page.getByTestId('shuffle-button').click();
  }

  await expect(page.getByTestId('question-card')).toBeVisible();
  await expect(page.getByTestId('question-position')).toHaveText(`${QUESTION_COUNT} / ${QUESTION_COUNT}`);

  await page.getByTestId('shuffle-button').click();

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'questions');
  await expect(page.getByTestId('all-played-view')).toBeVisible();
  await expect(page.getByTestId('congrats-card')).toBeVisible();
  await expect(page.getByTestId('congrats-message')).toHaveText('Du hast das komplette Spiel durchgespielt.');
  await expect(page.getByTestId('play-again-button')).toHaveText('Erneut spielen');
  await expect(page.getByTestId('congrats-back-button')).toHaveCount(0);
});

test('shows the finish panel when all questions were already played in persisted state', async ({ page }) => {
  await seedUsedQuestions(page, QUESTION_COUNT);
  await page.goto('/');

  await expect(page.getByTestId('hero-progress')).toContainText(`${QUESTION_COUNT} von ${QUESTION_COUNT}`);

  await page.getByTestId('start-round-button').click();

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'questions');
  await expect(page.getByTestId('all-played-view')).toBeVisible();
  await expect(page.getByTestId('congrats-card')).toBeVisible();
  await expect(page.getByTestId('congrats-message')).toHaveText('Du hast das komplette Spiel durchgespielt.');
});

test('beenden returns home and resuming still shows the finish panel', async ({ page }) => {
  await page.getByTestId('start-round-button').click();

  for (let i = 1; i < QUESTION_COUNT; i += 1) {
    await page.getByTestId('shuffle-button').click();
  }

  await page.getByTestId('shuffle-button').click();

  await page.getByTestId('end-round-button').click();

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'intro');
  await expect(page.getByTestId('hero')).toBeVisible();
  await expect(page.getByTestId('hero-progress')).toContainText(`${QUESTION_COUNT} von ${QUESTION_COUNT}`);

  await page.getByTestId('start-round-button').click();

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'questions');
  await expect(page.getByTestId('all-played-view')).toBeVisible();
  await expect(page.getByTestId('congrats-message')).toBeVisible();
});

test('erneut spielen clears finished state and starts a new game at the first question', async ({ page }) => {
  await page.getByTestId('start-round-button').click();

  for (let i = 1; i < QUESTION_COUNT; i += 1) {
    await page.getByTestId('shuffle-button').click();
  }

  await page.getByTestId('shuffle-button').click();

  const storageBeforeRestart = await readGameStorage(page);
  await expect(storageBeforeRestart.used).not.toBeNull();
  await expect(storageBeforeRestart.history).not.toBeNull();
  await expect(storageBeforeRestart.pointer).toBeNull();

  await page.getByTestId('play-again-button').click();

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'questions');
  await expect(page.getByTestId('question-card')).toBeVisible();
  await expect(page.getByTestId('question-position')).toHaveText(`1 / ${QUESTION_COUNT}`);

  const storageAfterRestart = await readGameStorage(page);
  await expect(storageAfterRestart.pointer).toBeNull();
  await expect(JSON.parse(storageAfterRestart.used ?? '[]')).toHaveLength(1);
  await expect(JSON.parse(storageAfterRestart.history ?? '[]')).toHaveLength(1);
});

test('erneut spielen from a filtered finish continues with all categories without resetting progress', async ({ page }) => {
  const sexQuestionCount = getCategoryQuestionCount(['sex-intimitaet']);

  await startFilteredRound(page, ['sex-intimitaet']);

  await expect(page.getByTestId('question-position')).toHaveText(`1 / ${sexQuestionCount}`);

  for (let i = 1; i < sexQuestionCount; i += 1) {
    await page.getByTestId('shuffle-button').click();
  }

  await expect(page.getByTestId('question-position')).toHaveText(`${sexQuestionCount} / ${sexQuestionCount}`);
  await page.getByTestId('shuffle-button').click();

  await expect(page.getByTestId('all-played-view')).toBeVisible();
  await expect(page.getByTestId('congrats-message')).toContainText('Du hast');
  await expect(page.getByTestId('congrats-categories')).toHaveText('Sex & Intimität');
  await expect(page.getByTestId('play-again-button')).toHaveText('Weitere Kategorien spielen');

  await page.getByTestId('play-again-button').click();

  await expect(page.getByTestId('question-card')).toBeVisible();
  await expect(page.getByTestId('filter-summary')).toHaveText('Alle Themen aktiv');
  await expect(page.getByTestId('question-position')).toHaveText(`${sexQuestionCount} / ${QUESTION_COUNT}`);

  const storageAfterRestart = await readGameStorage(page);
  await expect(JSON.parse(storageAfterRestart.used ?? '[]')).toHaveLength(sexQuestionCount);
  await expect(JSON.parse(storageAfterRestart.history ?? '[]')).toHaveLength(sexQuestionCount);
});

test('selecting all categories in the modal behaves like a full game and keeps the restart label', async ({ page }) => {
  await seedUsedQuestions(page, QUESTION_COUNT);
  await page.goto('/');

  await page.getByTestId('open-start-menu-button').click();
  await page.getByTestId('select-all-categories-button').click();
  await page.getByTestId('start-filtered-round-button').click();

  await expect(page.getByTestId('all-played-view')).toBeVisible();
  await expect(page.getByTestId('congrats-message')).toHaveText('Du hast das komplette Spiel durchgespielt.');
  await expect(page.getByTestId('play-again-button')).toHaveText('Erneut spielen');
});

test('multi-category filtered finish shows translated categories and secondary continue label', async ({ page }) => {
  const memoriesAndRelationshipCount = getCategoryQuestionCount(['erinnerungen', 'beziehung']);

  await startFilteredRound(page, ['erinnerungen', 'beziehung']);

  await expect(page.getByTestId('filter-summary')).toHaveText('Erinnerungen, Beziehung');

  for (let i = 1; i < memoriesAndRelationshipCount; i += 1) {
    await page.getByTestId('shuffle-button').click();
  }

  await expect(page.getByTestId('question-position')).toHaveText(`${memoriesAndRelationshipCount} / ${memoriesAndRelationshipCount}`);
  await page.getByTestId('shuffle-button').click();

  await expect(page.getByTestId('all-played-view')).toBeVisible();
  await expect(page.getByTestId('congrats-categories')).toHaveText('Erinnerungen und Beziehung');
  await expect(page.getByTestId('play-again-button')).toHaveText('Weitere Kategorien spielen');
});

test('ending a filtered round resets the home screen back to the unfiltered default', async ({ page }) => {
  await startFilteredRound(page, ['erinnerungen', 'beziehung']);

  await expect(page.getByTestId('filter-summary')).toHaveText('Erinnerungen, Beziehung');
  await page.getByTestId('end-round-button').click();

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'intro');
  await expect(page.getByTestId('hero-filter-summary')).toHaveCount(0);
  await expect(page.getByTestId('hero-progress')).toContainText(`1 von ${QUESTION_COUNT}`);
});

test('expanding a finished category filter starts with a new remaining question instead of resuming an old one', async ({ page }) => {
  const memoriesCount = getCategoryQuestionCount(['erinnerungen']);

  await startFilteredRound(page, ['erinnerungen']);

  for (let i = 1; i < memoriesCount; i += 1) {
    await page.getByTestId('shuffle-button').click();
  }

  await expect(page.getByTestId('question-position')).toHaveText(`${memoriesCount} / ${memoriesCount}`);
  const lastMemoryQuestion = await page.getByTestId('question-text').textContent();

  await page.getByTestId('shuffle-button').click();
  await expect(page.getByTestId('all-played-view')).toBeVisible();

  await page.getByTestId('end-round-button').click();

  await startFilteredRound(page, ['erinnerungen', 'beziehung']);

  await expect(page.getByTestId('question-card')).toBeVisible();
  await expect(page.getByTestId('question-text')).not.toHaveText(lastMemoryQuestion ?? '');
  await expect(page.getByTestId('question-category')).toContainText('Beziehung');
});
