import Link from "next/link";
import type { Metadata } from "next";
import { QUIZ_CATEGORIES } from "@/lib/constants";
import ReviewPrompt from "@/components/quiz/ReviewPrompt";

export const metadata: Metadata = {
  title: "模擬問題",
  description: "TOEIC Part 5/6形式の文法・語彙問題に挑戦。4択クイズで実力を測ろう。",
};

export default function QuizPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">模擬問題</h1>
        <p className="text-sm text-muted">TOEIC Part 5/6形式の問題に挑戦。カテゴリを選んでスタート。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUIZ_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/quiz/${cat.slug}`}
            className="group bg-surface rounded-xl border border-border/60 p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200"
          >
            <div className="text-2xl mb-3">{cat.icon}</div>
            <h2 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {cat.label}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              {cat.description}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <span>📄</span>
              <span>{cat.questionCount}問</span>
            </div>
          </Link>
        ))}
        <ReviewPrompt />
      </div>
    </div>
  );
}
