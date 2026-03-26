import { expect, test, type Page } from '@playwright/test';

const QUESTION_COUNT = 86;

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

test.beforeEach(async ({ page }) => {
  await bootstrapApp(page);
  await page.goto('/');
});

test('renders the intro view with footer version', async ({ page }) => {
  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'intro');
  await expect(page.getByTestId('hero')).toBeVisible();
  await expect(page.getByTestId('hero-progress')).toContainText(`0 von ${QUESTION_COUNT}`);
  await expect(page.getByTestId('intro-tips')).toBeVisible();
  await expect(page.getByTestId('home-footer')).toBeVisible();
  await expect(page.getByTestId('app-version')).toContainText(/^Version \d+\.\d+\.\d+/);
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

  await expect(page.getByTestId('app-shell')).toHaveAttribute('data-mode', 'questions');
  await expect(page.getByTestId('all-played-view')).toBeVisible();
  await expect(page.getByTestId('congrats-card')).toBeVisible();
  await expect(page.getByTestId('congrats-message')).toBeVisible();
  await expect(page.getByTestId('play-again-button')).toBeVisible();
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
  await expect(page.getByTestId('congrats-message')).toBeVisible();
});

test('beenden returns home and resuming still shows the finish panel', async ({ page }) => {
  await page.getByTestId('start-round-button').click();

  for (let i = 1; i < QUESTION_COUNT; i += 1) {
    await page.getByTestId('shuffle-button').click();
  }

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
