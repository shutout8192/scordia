"use client";
import Link from "next/link";
import { QuizSessionResult } from "@/types/quiz";
import ShareButtons from "@/components/share/ShareButtons";
import { SITE_NAME } from "@/lib/constants";

interface Props {
  results: QuizSessionResult[];
  category: string;
  categoryLabel: string;
  timeSpent: number;
}

export default function QuizSummary({ results, category, categoryLabel, timeSpent }: Props) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const percent = Math.round((correct / total) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const getMessage = () => {
    if (percent >= 90) return "素晴らしい！完璧に近い成績です！";
    if (percent >= 70) return "よくできました！この調子で！";
    if (percent >= 50) return "まずまず。復習でスコアアップを！";
    return "復習して再挑戦しましょう。";
  };

  const shareText = `${SITE_NAME}の${categoryLabel}で${correct}/${total}問正解（${percent}%）でした！`;

  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="max-w-xs mx-auto text-center">
      <p className="text-[11px] text-muted mb-1">{categoryLabel}</p>
      <h2 className="text-sm font-bold mb-5">結果発表</h2>

      <div className="relative inline-flex items-center justify-center w-[68px] h-[68px] mb-5">
        <svg className="w-[68px] h-[68px] -rotate-90">
          <circle cx="34" cy="34" r="30" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle cx="34" cy="34" r="30" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"
            className="ring-animate"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ "--ring-circumference": circumference } as React.CSSProperties} />
        </svg>
        <div className="absolute">
          <div className="text-sm font-bold">{percent}%</div>
          <div className="text-[9px] text-muted">{correct}/{total}</div>
        </div>
      </div>

      <p className="text-xs font-medium mb-1">{getMessage()}</p>
      <p className="text-[10px] text-muted mb-4">
        所要時間: {minutes}分{seconds.toString().padStart(2, "0")}秒
      </p>

      <div className="flex justify-center mb-5">
        <ShareButtons text={shareText} compact />
      </div>

      <div className="flex justify-center gap-4 text-[11px] font-semibold">
        <Link href={`/quiz/${category}`} className="text-primary hover:underline">もう一度挑戦</Link>
        <Link href="/quiz" className="text-muted hover:text-primary">カテゴリ一覧</Link>
      </div>
      <Link href="/progress" className="inline-block mt-3 text-[11px] text-muted hover:text-primary">
        学習記録を見る
      </Link>
    </div>
  );
}
