export interface QuizChoice {
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: "part5" | "part6";
  passage?: string | null;
  sentence: string;
  choices: QuizChoice[];
  answer: string;
  explanation: string;
  tags: string[];
  difficulty: number;
}

export interface QuizCategory {
  category: string;
  categoryLabel: string;
  questions: QuizQuestion[];
}

export interface QuizSessionResult {
  questionId: string;
  selected: string;
  correct: boolean;
}
