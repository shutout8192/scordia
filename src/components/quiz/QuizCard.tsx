"use client";
import { QuizQuestion } from "@/types/quiz";

interface Props {
  question: QuizQuestion;
  current: number;
  total: number;
  selected: string | null;
  answered: boolean;
  onSelect: (label: string) => void;
}

export default function QuizCard({ question, current, total, selected, answered, onSelect }: Props) {
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
    </div>
  );
}
