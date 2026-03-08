export interface VocabWord {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaningJa: string;
  meaningEn: string;
  exampleEn: string;
  exampleJa: string;
  tags: string[];
  difficulty: number;
}

export interface VocabCategory {
  category: string;
  categoryLabel: string;
  targetScore: number;
  words: VocabWord[];
}
