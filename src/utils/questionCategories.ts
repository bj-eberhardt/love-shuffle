import type { QuestionCategory } from '../types/questions';

export const QUESTION_CATEGORY_ORDER: QuestionCategory[] = [
  'sex-intimitaet',
  'verbundenheit-wachstum',
  'erinnerungen',
  'beziehung',
  'ueber-dich',
];

export const QUESTION_CATEGORY_META: Record<
  QuestionCategory,
  { label: string; iconSrc: string; accentClassName: string }
> = {
  'sex-intimitaet': {
    label: 'Sex & Intimität',
    iconSrc: '/assets/category-sex-intimitaet.svg',
    accentClassName: 'question-card--sex-intimitaet',
  },
  'verbundenheit-wachstum': {
    label: 'Verbundenheit & Wachstum',
    iconSrc: '/assets/category-verbundenheit-wachstum.svg',
    accentClassName: 'question-card--verbundenheit-wachstum',
  },
  erinnerungen: {
    label: 'Erinnerungen',
    iconSrc: '/assets/category-erinnerungen.svg',
    accentClassName: 'question-card--erinnerungen',
  },
  beziehung: {
    label: 'Beziehung',
    iconSrc: '/assets/category-beziehung.svg',
    accentClassName: 'question-card--beziehung',
  },
  'ueber-dich': {
    label: 'Über dich',
    iconSrc: '/assets/category-ueber-dich.svg',
    accentClassName: 'question-card--ueber-dich',
  },
};

export function getCategorySummary(categories: QuestionCategory[]): string {
  if (categories.length === QUESTION_CATEGORY_ORDER.length) return 'Alle Themen aktiv';
  return categories.map((category) => QUESTION_CATEGORY_META[category].label).join(', ');
}
