import Link from "next/link";
import type { Metadata } from "next";
import { VOCAB_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "単語帳",
  description: "TOEIC頻出単語をフラッシュカードで暗記。レベル別に効率よく学習できます。",
};

export default function VocabularyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">単語帳</h1>
        <p className="text-sm text-muted">TOEIC頻出単語をフラッシュカードで暗記。レベルを選んでスタート。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {VOCAB_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/vocabulary/${cat.slug}`}
            className="group bg-surface rounded-xl border border-border/60 p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200 text-center"
          >
            <div className="text-3xl mb-3">{cat.icon}</div>
            <h2 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {cat.label}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-3">
              {cat.description}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                目標 {cat.targetScore}点
              </span>
              <span className="text-xs font-semibold text-muted bg-surface-dim px-3 py-1 rounded-full">
                {cat.wordCount}語
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
