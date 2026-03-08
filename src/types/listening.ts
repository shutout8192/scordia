export interface ListeningQuestion {
  id: string;
  audioFile: string | null;
  transcript: string;
  choices: { label: string; text: string }[];
  answer: string;
  explanation: string;
  difficulty: number;
  imageUrl?: string;
  imageSource?: string;
  sceneEmoji?: string;
  sceneJa?: string;
  sceneBg?: string;
}

export interface ListeningCategory {
  category: string;
  categoryLabel: string;
  questions: ListeningQuestion[];
}
