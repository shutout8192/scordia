import Link from "next/link";
import type { Metadata } from "next";
import { LISTENING_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "リスニング練習",
  description: "TOEIC Part 1〜3形式のリスニング問題。音声を聞いて正しい答えを選ぼう。",
};

export default function ListeningPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">リスニング練習</h1>
        <p className="text-sm text-muted">TOEIC Part 1〜3形式のリスニング問題に挑戦。パートを選んでスタート。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LISTENING_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/listening/${cat.slug}`}
            className="group bg-surface rounded-xl border border-border/60 p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200 text-center"
          >
            <div className="text-3xl mb-3">{cat.icon}</div>
            <h2 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {cat.label}
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-surface rounded-xl border border-border/60">
        <p className="text-xs text-muted leading-relaxed">
          💡 音声はブラウザの音声合成機能（Web Speech API）を使用しています。Chrome / Edge で最も自然な音声が再生されます。速度は「遅い」「普通」「速い」から選択できます。
        </p>
      </div>
    </div>
  );
}
