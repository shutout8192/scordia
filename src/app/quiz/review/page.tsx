"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QuizCard from "@/components/quiz/QuizCard";
import QuizSummary from "@/components/quiz/QuizSummary";
import { QuizQuestion, QuizSessionResult } from "@/types/quiz";
import { saveSession, getWrongAnswers, addWrongAnswers, removeWrongAnswer, WrongAnswer } from "@/lib/storage";
import { shuffle } from "@/lib/shuffle";

import grammarData from "@/data/quiz/grammar.json";
import vocabularyData from "@/data/quiz/vocabulary.json";

const allQuestions: QuizQuestion[] = [
  ...(grammarData.questions as QuizQuestion[]),
  ...(vocabularyData.questions as QuizQuestion[]),
];

export default function ReviewQuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<QuizSessionResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [empty, setEmpty] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const wrongAnswers = getWrongAnswers();
    if (wrongAnswers.length === 0) {
      setEmpty(true);
      return;
    }
    const wrongIds = new Set(wrongAnswers.map((w) => w.questionId));
    const qMap = new Map(allQuestions.map((q) => [q.id, q]));
    const reviewQs = [...wrongIds]
      .map((id) => qMap.get(id))
      .filter(Boolean) as QuizQuestion[];

    if (reviewQs.length === 0) {
      setEmpty(true);
      return;
    }
    setQuestions(shuffle(reviewQs).slice(0, 10));
  }, []);

  if (empty) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-surface rounded-xl border border-border/60 p-8 shadow-sm">
          <p className="text-2xl mb-3">🎉</p>
          <p className="text-base font-bold mb-2">復習する問題がありません</p>
          <p className="text-sm text-muted mb-6">間違えた問題がないか、すべて復習済みです。</p>
          <Link href="/quiz" className="text-sm font-semibold text-primary hover:underline">
            模擬問題に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const handleSelect = (label: string) => {
    setSelected(label);
    setAnswered(true);
    const correct = label === questions[currentIndex].answer;
    setResults((prev) => [...prev, { questionId: questions[currentIndex].id, selected: label, correct }]);
    // If correct this time, remove from wrong answers
    if (correct) {
      removeWrongAnswer(questions[currentIndex].id);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      const correctCount = results.filter((r) => r.correct).length;
      saveSession({
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        type: "quiz",
        category: "review",
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        scorePercent: Math.round((correctCount / questions.length) * 100),
        timeSpentSeconds: elapsed,
      });
      // Add still-wrong answers back
      const stillWrong: WrongAnswer[] = results
        .filter((r) => !r.correct)
        .map((r) => ({
          questionId: r.questionId,
          category: "review",
          selected: r.selected,
          date: new Date().toISOString(),
        }));
      if (stillWrong.length > 0) addWrongAnswers(stillWrong);
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    return (
      <div className="px-4 py-16">
        <QuizSummary results={results} category="review" categoryLabel="復習モード" timeSpent={elapsed} />
      </div>
    );
  }

  return (
    <div className="px-4 py-16">
      <div className="max-w-xl mx-auto mb-4 text-center">
        <span className="inline-block text-[10px] font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
          復習モード
        </span>
      </div>
      <QuizCard
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        selected={selected}
        answered={answered}
        onSelect={handleSelect}
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
