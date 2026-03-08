import { UserProgress, SessionRecord } from "@/types/progress";
import { QuizSessionResult } from "@/types/quiz";
import { STORAGE_KEYS } from "./constants";

const defaultProgress: UserProgress = {
  sessions: [],
  streaks: { currentStreak: 0, longestStreak: 0, lastStudyDate: "" },
  vocabulary: { knownWords: [], reviewWords: [] },
};

/** Draft quiz session (for resume) */
export interface QuizDraft {
  category: string;
  questionIds: string[];
  currentIndex: number;
  results: QuizSessionResult[];
  startTime: number;
}

export function saveQuizDraft(draft: QuizDraft): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.QUIZ_DRAFT, JSON.stringify(draft));
}

export function getQuizDraft(category: string): QuizDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_DRAFT);
    if (!raw) return null;
    const draft: QuizDraft = JSON.parse(raw);
    return draft.category === category ? draft : null;
  } catch {
    return null;
  }
}

export function clearQuizDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.QUIZ_DRAFT);
}

/** Wrong answers tracking */
export interface WrongAnswer {
  questionId: string;
  category: string;
  selected: string;
  date: string;
}

export function getWrongAnswers(): WrongAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WRONG_ANSWERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addWrongAnswers(answers: WrongAnswer[]): void {
  if (typeof window === "undefined") return;
  const existing = getWrongAnswers();
  const existingIds = new Set(existing.map((a) => a.questionId));
  const newAnswers = answers.filter((a) => !existingIds.has(a.questionId));
  const merged = [...existing, ...newAnswers];
  // Keep latest 200 wrong answers
  const trimmed = merged.slice(-200);
  localStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(trimmed));
}

export function removeWrongAnswer(questionId: string): void {
  if (typeof window === "undefined") return;
  const existing = getWrongAnswers();
  const filtered = existing.filter((a) => a.questionId !== questionId);
  localStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(filtered));
}

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveSession(session: SessionRecord): void {
  const progress = getProgress();
  progress.sessions.push(session);
  updateStreak(progress);
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

function updateStreak(progress: UserProgress): void {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const last = progress.streaks.lastStudyDate;

  if (last === today) return;
  if (last === yesterday) {
    progress.streaks.currentStreak += 1;
  } else {
    progress.streaks.currentStreak = 1;
  }
  progress.streaks.lastStudyDate = today;
  progress.streaks.longestStreak = Math.max(
    progress.streaks.longestStreak,
    progress.streaks.currentStreak
  );
}

export function toggleVocabStatus(wordId: string, status: "known" | "review"): void {
  const progress = getProgress();
  const { knownWords, reviewWords } = progress.vocabulary;

  // Remove from both lists first
  progress.vocabulary.knownWords = knownWords.filter((id) => id !== wordId);
  progress.vocabulary.reviewWords = reviewWords.filter((id) => id !== wordId);

  // Add to the target list
  if (status === "known") {
    progress.vocabulary.knownWords.push(wordId);
  } else {
    progress.vocabulary.reviewWords.push(wordId);
  }

  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}
