"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import QuizCard from "@/components/quiz/QuizCard";
import QuizSummary from "@/components/quiz/QuizSummary";
import { QuizCategory, QuizSessionResult } from "@/types/quiz";
import {
  saveSession,
  saveQuizDraft,
  getQuizDraft,
  clearQuizDraft,
  addWrongAnswers,
  WrongAnswer,
} from "@/lib/storage";
import { shuffle } from "@/lib/shuffle";

import grammarData from "@/data/quiz/grammar.json";
import vocabularyData from "@/data/quiz/vocabulary.json";

const mixedData: QuizCategory = {
  category: "mixed",
  categoryLabel: "総合問題",
  questions: [
    ...(grammarData.questions as QuizCategory["questions"]),
    ...(vocabularyData.questions as QuizCategory["questions"]),
  ],
};

const dataMap: Record<string, QuizCategory> = {
  grammar: grammarData as QuizCategory,
  vocabulary: vocabularyData as QuizCategory,
  mixed: mixedData,
};

export default function QuizSessionPage() {
  const params = useParams();
  const category = params.category as string;
  const data = dataMap[category];

  const [questions, setQuestions] = useState(data?.questions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<QuizSessionResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const startTime = useRef(Date.now());
  const initialized = useRef(false);

  // Check for saved draft on mount
  useEffect(() => {
    if (!data || initialized.current) return;
    initialized.current = true;

    const draft = getQuizDraft(category);
    if (draft && draft.currentIndex < draft.questionIds.length) {
      // Restore questions in saved order
      const qMap = new Map(data.questions.map((q) => [q.id, q]));
      const restored = draft.questionIds.map((id) => qMap.get(id)).filter(Boolean);
      if (restored.length === draft.questionIds.length) {
        setQuestions(restored as typeof questions);
        setResults(draft.results);
        setCurrentIndex(draft.currentIndex);
        startTime.current = draft.startTime;
        setShowResume(true);
        return;
      }
    }
    // No valid draft — start fresh
    setQuestions(shuffle(data.questions).slice(0, 10));
  }, [data, category]);

  // Save draft on each answer
  const persistDraft = useCallback(
    (idx: number, res: QuizSessionResult[]) => {
      saveQuizDraft({
        category,
        questionIds: questions.map((q) => q.id),
        currentIndex: idx,
        results: res,
        startTime: startTime.current,
      });
    },
    [category, questions]
  );

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold mb-4">カテゴリが見つかりません</h1>
        <a href="/quiz" className="text-sm text-primary hover:underline">カテゴリ一覧に戻る</a>
      </div>
    );
  }

  const handleResumeContinue = () => {
    setShowResume(false);
  };

  const handleResumeRestart = () => {
    setShowResume(false);
    clearQuizDraft();
    setResults([]);
    setCurrentIndex(0);
    setQuestions(shuffle(data.questions).slice(0, 10));
    startTime.current = Date.now();
  };

  const handleSelect = (label: string) => {
    setSelected(label);
    setAnswered(true);
    const correct = label === questions[currentIndex].answer;
    const newResults = [...results, { questionId: questions[currentIndex].id, selected: label, correct }];
    setResults(newResults);
    persistDraft(currentIndex + 1, newResults);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      const correctCount = results.filter((r) => r.correct).length;
      saveSession({
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        type: "quiz",
        category,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        scorePercent: Math.round((correctCount / questions.length) * 100),
        timeSpentSeconds: elapsed,
      });
      // Save wrong answers for review
      const wrong: WrongAnswer[] = results
        .filter((r) => !r.correct)
        .map((r) => ({
          questionId: r.questionId,
          category,
          selected: r.selected,
          date: new Date().toISOString(),
        }));
      if (wrong.length > 0) addWrongAnswers(wrong);
      clearQuizDraft();
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  // Resume prompt
  if (showResume) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-surface rounded-xl border border-border/60 p-6 shadow-sm">
          <p className="text-base font-bold mb-2">途中のクイズがあります</p>
          <p className="text-sm text-muted mb-1">
            {data.categoryLabel} — {results.length}/{questions.length}問回答済み
          </p>
          <p className="text-xs text-muted mb-6">
            正答率: {results.length > 0 ? Math.round((results.filter((r) => r.correct).length / results.length) * 100) : 0}%
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleResumeContinue}
              className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              続きから再開
            </button>
            <button
              onClick={handleResumeRestart}
              className="bg-surface text-foreground text-sm font-semibold px-5 py-2.5 rounded-lg border border-border/60 hover:border-primary/40 transition-colors"
            >
              最初から
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    return (
      <div className="px-4 py-16">
        <QuizSummary results={results} category={category} categoryLabel={data.categoryLabel} timeSpent={elapsed} />
      </div>
    );
  }

  return (
    <div className="px-4 py-16">
      <QuizCard
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        selected={selected}
        answered={answered}
        onSelect={handleSelect}
        onNext={handleNext}
      />
      {answered && (
        <div className="max-w-2xl mx-auto mt-5 text-center">
          <button onClick={handleNext} className="text-sm font-semibold text-primary hover:underline">
            {currentIndex + 1 >= questions.length ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      )}
    </div>
  );
}
