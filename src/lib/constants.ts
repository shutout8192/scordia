export const SITE_NAME = "Scordia";
export const SITE_DESCRIPTION = "無料でTOEIC対策！文法・語彙・リスニングの練習問題で目標スコアを達成しよう。";
export const SITE_URL = "https://scordia.net";

export const STORAGE_KEYS = {
  PROGRESS: "scordia_progress",
  VOCAB_STATUS: "scordia_vocab_status",
  QUIZ_DRAFT: "scordia_quiz_draft",
  WRONG_ANSWERS: "scordia_wrong_answers",
} as const;

// Migrate old storage keys (toeic_ → scordia_)
const OLD_KEYS: Record<string, string> = {
  toeic_progress: STORAGE_KEYS.PROGRESS,
  toeic_vocab_status: STORAGE_KEYS.VOCAB_STATUS,
  toeic_quiz_draft: STORAGE_KEYS.QUIZ_DRAFT,
  toeic_wrong_answers: STORAGE_KEYS.WRONG_ANSWERS,
};
if (typeof window !== "undefined") {
  Object.entries(OLD_KEYS).forEach(([oldKey, newKey]) => {
    const val = localStorage.getItem(oldKey);
    if (val && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, val);
      localStorage.removeItem(oldKey);
    }
  });
}

export const QUIZ_CATEGORIES = [
  { slug: "grammar", label: "文法問題", description: "Part 5形式の文法・語法問題", icon: "📝", questionCount: 480 },
  { slug: "vocabulary", label: "語彙問題", description: "Part 5形式の語彙・語法問題", icon: "📚", questionCount: 540 },
  { slug: "mixed", label: "総合問題", description: "文法＋語彙のランダム出題", icon: "🔀", questionCount: 1020 },
] as const;

export const VOCAB_CATEGORIES = [
  { slug: "beginner", label: "初級（600点レベル）", description: "TOEIC600点を目指す基本単語", icon: "🌱", targetScore: 600, wordCount: 250 },
  { slug: "intermediate", label: "中級（730点レベル）", description: "TOEIC730点を目指す重要単語", icon: "🌿", targetScore: 730, wordCount: 250 },
  { slug: "advanced", label: "上級（860点レベル）", description: "TOEIC860点を目指す上級単語", icon: "🌳", targetScore: 860, wordCount: 250 },
] as const;

export const LISTENING_CATEGORIES = [
  { slug: "part1", label: "Part 1: 写真描写", description: "写真を見て正しい描写を選ぶ", icon: "🖼️", questionCount: 30 },
  { slug: "part2", label: "Part 2: 応答問題", description: "質問に対する適切な応答を選ぶ", icon: "💬", questionCount: 150 },
  { slug: "part3", label: "Part 3: 会話問題", description: "会話を聞いて質問に答える", icon: "🗣️", questionCount: 75 },
] as const;
