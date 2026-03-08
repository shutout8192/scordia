export interface Question {
  id: string;
  image_url: string;
  pexels_source: string;
  scene: string;
  answer: 'A' | 'B' | 'C' | 'D';
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  explanation: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  difficulty: 1 | 2 | 3 | 4 | 5;
}
