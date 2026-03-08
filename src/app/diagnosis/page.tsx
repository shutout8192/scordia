"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QuizCard from "@/components/quiz/QuizCard";
import { QuizQuestion, QuizSessionResult } from "@/types/quiz";
import { saveSession } from "@/lib/storage";
import { shuffle } from "@/lib/shuffle";

import grammarData from "@/data/quiz/grammar.json";
import vocabularyData from "@/data/quiz/vocabulary.json";

const allQuestions: QuizQuestion[] = [
  ...(grammarData.questions as QuizQuestion[]),
  ...(vocabularyData.questions as QuizQuestion[]),
];

function pickDiagnosisQuestions(): QuizQuestion[] {
  const byDifficulty: Record<number, QuizQuestion[]> = { 1: [], 2: [], 3: [] };
  allQuestions.forEach((q) => {
    if (byDifficulty[q.difficulty]) byDifficulty[q.difficulty].push(q);
  });
  return [
    ...shuffle(byDifficulty[1]).slice(0, 5),
    ...shuffle(byDifficulty[2]).slice(0, 5),
    ...shuffle(byDifficulty[3]).slice(0, 5),
  ];
}

function estimateScore(results: { difficulty: number; correct: boolean }[]): number {
  let score = 300; // base
  results.forEach((r) => {
    if (r.correct) {
      score += r.difficulty === 1 ? 15 : r.difficulty === 2 ? 25 : 40;
    } else {
      score -= r.difficulty === 1 ? 10 : r.difficulty === 2 ? 5 : 0;
    }
  });
  return Math.max(10, Math.min(990, Math.round(score / 5) * 5));
}

function getScoreLabel(score: number): { label: string; color: string; message: string } {
  if (score >= 860) return { label: "上級", color: "text-primary", message: "素晴らしい実力です！860点以上を目指せるレベルです。" };
  if (score >= 730) return { label: "中上級", color: "text-primary", message: "730点レベル。上級単語と速読力を強化しましょう。" };
  if (score >= 600) return { label: "中級", color: "text-accent", message: "600点レベル。文法と語彙をバランスよく強化しましょう。" };
  if (score >= 470) return { label: "初中級", color: "text-accent", message: "基礎力はあります。苦手分野を集中的に学習しましょう。" };
  return { label: "初級", color: "text-error", message: "基本文法と頻出語彙から始めましょう。毎日の積み重ねが大切です。" };
}

export default function DiagnosisPage() {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<QuizSessionResult[]>([]);
  const [difficultyResults, setDifficultyResults] = useState<{ difficulty: number; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    setQuestions(pickDiagnosisQuestions());
  }, []);

  const handleStart = () => {
    startTime.current = Date.now();
    setStarted(true);
  };

  const handleSelect = (label: string) => {
    if (answered) return;
    setSelected(label);
    setAnswered(true);
    const q = questions[currentIndex];
    const correct = label === q.answer;
    setResults((prev) => [...prev, { questionId: q.id, selected: label, correct }]);
    setDifficultyResults((prev) => [...prev, { difficulty: q.difficulty, correct }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      const correctCount = results.filter((r) => r.correct).length;
      saveSession({
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        type: "quiz",
        category: "diagnosis",
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        scorePercent: Math.round((correctCount / questions.length) * 100),
        timeSpentSeconds: elapsed,
      });
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  // Start screen
  if (!started) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <div className="bg-surface rounded-xl border border-border/60 p-8 shadow-sm">
          <p className="text-3xl mb-4">🎯</p>
          <h1 className="text-xl font-bold mb-2">TOEIC スコア診断</h1>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            15問の問題に答えるだけで、あなたの予想TOEICスコアを診断します。
            文法・語彙の問題が難易度別に出題されます。
          </p>
          <div className="flex flex-col gap-2 text-xs text-muted mb-6">
            <div className="flex justify-between px-4">
              <span>問題数</span><span className="font-semibold text-foreground">15問</span>
            </div>
            <div className="flex justify-between px-4">
              <span>目安時間</span><span className="font-semibold text-foreground">5〜8分</span>
            </div>
            <div className="flex justify-between px-4">
              <span>出題範囲</span><span className="font-semibold text-foreground">文法 + 語彙</span>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            診断を開始する
          </button>
        </div>
      </div>
    );
  }

  // Result screen
  if (finished) {
    const correctCount = difficultyResults.filter((r) => r.correct).length;
    const estimatedScore = estimateScore(difficultyResults);
    const scoreInfo = getScoreLabel(estimatedScore);
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    const byDifficulty = [1, 2, 3].map((d) => {
      const qs = difficultyResults.filter((r) => r.difficulty === d);
      const correct = qs.filter((r) => r.correct).length;
      return { difficulty: d, total: qs.length, correct };
    });

    return (
      <div className="max-w-md mx-auto px-5 py-16">
        <div className="bg-surface rounded-xl border border-border/60 p-6 shadow-sm text-center mb-4">
          <p className="text-xs text-muted mb-1">あなたの予想スコア</p>
          <p className={`text-4xl font-bold ${scoreInfo.color} mb-1`}>{estimatedScore}</p>
          <p className={`text-sm font-semibold ${scoreInfo.color} mb-3`}>{scoreInfo.label}</p>
          <p className="text-xs text-muted leading-relaxed">{scoreInfo.message}</p>
        </div>

        <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-sm mb-4">
          <h2 className="text-sm font-bold mb-3">結果詳細</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-surface-dim rounded-lg">
              <p className="text-sm font-bold text-foreground">{correctCount}/{questions.length}</p>
              <p className="text-[10px] text-muted">正解数</p>
            </div>
            <div className="text-center p-3 bg-surface-dim rounded-lg">
              <p className="text-sm font-bold text-foreground">{Math.round((correctCount / questions.length) * 100)}%</p>
              <p className="text-[10px] text-muted">正答率</p>
            </div>
            <div className="text-center p-3 bg-surface-dim rounded-lg">
              <p className="text-sm font-bold text-foreground">{minutes}:{seconds.toString().padStart(2, "0")}</p>
              <p className="text-[10px] text-muted">所要時間</p>
            </div>
          </div>

          <h3 className="text-xs font-bold mb-2">難易度別正答率</h3>
          <div className="space-y-2">
            {byDifficulty.map((d) => {
              const pct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
              const label = d.difficulty === 1 ? "基礎（600点レベル）" : d.difficulty === 2 ? "標準（730点レベル）" : "応用（860点レベル）";
              return (
                <div key={d.difficulty}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted">{label}</span>
                    <span className="font-semibold">{d.correct}/{d.total}</span>
                  </div>
                  <div className="w-full bg-surface-dim rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Link href="/diagnosis" className="text-xs font-semibold text-primary hover:underline" onClick={() => {
            setStarted(false);
            setFinished(false);
            setCurrentIndex(0);
            setSelected(null);
            setAnswered(false);
            setResults([]);
            setDifficultyResults([]);
            setQuestions(pickDiagnosisQuestions());
          }}>
            もう一度診断
          </Link>
          <Link href="/quiz" className="text-xs font-semibold text-muted hover:text-primary hover:underline">
            模擬問題に挑戦
          </Link>
          <Link href="/progress" className="text-xs font-semibold text-muted hover:text-primary hover:underline">
            学習記録を見る
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentIndex];
  const diffLabel = question.difficulty === 1 ? "基礎" : question.difficulty === 2 ? "標準" : "応用";

  return (
    <div className="px-4 py-16">
      <div className="max-w-xl mx-auto mb-2 flex items-center justify-between">
        <span className="inline-block text-[10px] font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
          スコア診断
        </span>
        <span className="text-[10px] text-muted">難易度: {diffLabel}</span>
      </div>
      <QuizCard
        question={question}
        current={currentIndex + 1}
        total={questions.length}
        selected={selected}
        answered={answered}
        onSelect={handleSelect}
      />
      {answered && (
        <div className="max-w-2xl mx-auto mt-5 text-center">
          <button onClick={handleNext} className="text-sm font-semibold text-primary hover:underline">
            {currentIndex + 1 >= questions.length ? "診断結果を見る" : "次の問題へ"}
          </button>
        </div>
      )}
    </div>
  );
}
