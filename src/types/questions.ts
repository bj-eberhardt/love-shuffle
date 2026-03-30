export type QuestionCategory =
  | 'sex-intimitaet'
  | 'verbundenheit-wachstum'
  | 'erinnerungen'
  | 'beziehung'
  | 'ueber-dich';

export type Question = {
  id: string;
  text: string;
  category: QuestionCategory;
};

export type QuestionsValidationIssue = {
  path: string;
  message: string;
};

export type QuestionsLoadResult =
  | {
    status: 'loading';
  }
  | {
    status: 'ready';
    questions: Question[];
    datasetKey: string;
  }
  | {
    status: 'error';
    summary: string;
    issues: QuestionsValidationIssue[];
  };

export type QuestionsFileLoadResult =
  | {
    ok: true;
    questions: Question[];
    datasetKey: string;
    issues: [];
  }
  | {
    ok: false;
    issues: QuestionsValidationIssue[];
  };
