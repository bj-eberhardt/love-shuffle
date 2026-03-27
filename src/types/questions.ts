export type QuestionCategory =
  | 'sex-intimitaet'
  | 'verbundenheit-wachstum'
  | 'erinnerungen'
  | 'beziehung'
  | 'ueber-dich';

export type Question = {
  text: string;
  category: QuestionCategory;
};
