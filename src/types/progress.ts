export interface SessionRecord {
  id: string;
  date: string;
  type: "quiz" | "vocabulary" | "listening";
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  timeSpentSeconds: number;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
}

export interface VocabProgress {
  knownWords: string[];
  reviewWords: string[];
}

export interface UserProgress {
  sessions: SessionRecord[];
  streaks: StudyStreak;
  vocabulary: VocabProgress;
}
