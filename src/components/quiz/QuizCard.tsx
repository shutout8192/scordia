"use client";
import { useEffect } from "react";
import { QuizQuestion } from "@/types/quiz";
import QuestionTimer from "@/components/ui/QuestionTimer";

interface Props {
  question: QuizQuestion;
  current: number;
  total: number;
  selected: string | null;
  answered: boolean;
  onSelect: (label: string) => void;
  onNext?: () => void;
}

export default function QuizCard({ question, current, total, selected, answered, onSelect, onNext }: Props) {
  // Keyboard shortcuts: 1-4 for A-D, Enter for next
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!answered) {
        const keyMap: Record<string, string> = { "1": "A", "2": "B", "3": "C", "4": "D", a: "A", b: "B", c: "C", d: "D" };
        const label = keyMap[e.key.toLowerCase()];
        if (label && question.choices.some((c) => c.label === label)) {
          onSelect(label);
        }
      } else if (e.key === "Enter" && onNext) {
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answered, question.choices, onSelect, onNext]);
  const getOptionStyle = (label: string) => {
    const base = "quiz-option w-full text-left px-4 py-3 rounded-xl border text-sm";
    if (!answered) {
      return selected === label
        ? `${base} border-primary bg-primary/5 ring-2 ring-primary/15`
        : `${base} border-border/60 bg-surface`;
    }
    if (label === question.answer) return `${base} border-success bg-success-bg`;
    if (label === selected && label !== question.answer) return `${base} border-error bg-error-bg`;
    return `${base} border-border/40 bg-surface opacity-35`;
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-muted">
          <span className="font-bold text-foreground">{current}</span> / {total}
        </span>
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className={`text-[10px] ${i < question.difficulty ? "text-accent" : "text-border"}`}>★</span>
          ))}
        </div>
      </div>
      <div className="w-full bg-surface-dim rounded-full h-1 mb-6">
        <div
          className="bg-gradient-to-r from-primary to-primary-light h-1 rounded-full progress-bar"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>

      {/* Timer — TOEIC Part5: ~30s per question */}
      <div className="mb-4">
        <QuestionTimer targetSeconds={30} answered={answered} resetKey={question.id} />
      </div>

      {/* Question */}
      <div className="bg-surface rounded-xl border border-border/50 p-5 mb-5 shadow-sm">
        <p className="text-sm leading-relaxed font-medium">{question.sentence}</p>
      </div>

      {/* Choices */}
      <div className="space-y-2">
        {question.choices.map((c) => (
          <button
            key={c.label}
            onClick={() => !answered && onSelect(c.label)}
            disabled={answered}
            className={getOptionStyle(c.label)}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold bg-surface-dim mr-2">
              {c.label}
            </span>
            {c.text}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {answered && (
        <div className={`feedback-enter mt-5 p-4 rounded-xl border text-sm ${selected === question.answer ? "bg-success-bg border-success/30" : "bg-error-bg border-error/30"}`}>
          <p className="font-bold mb-0.5">
            {selected === question.answer ? "正解！" : `不正解 — 正解: ${question.answer}`}
          </p>
          <p className="text-muted leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <p className="hidden md:block text-center text-[10px] text-muted/50 mt-6">
        キーボード: 1〜4で選択 / Enterで次へ
      </p>
    </div>
  );
}
