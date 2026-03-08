"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress } from "@/lib/storage";
import { UserProgress } from "@/types/progress";
import ScoreChart from "@/components/progress/ScoreChart";
import CategoryBreakdown from "@/components/progress/CategoryBreakdown";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null;

  const { sessions, streaks } = progress;
  const totalSessions = sessions.length;
  const avgScore = totalSessions ? Math.round(sessions.reduce((s, r) => s + r.scorePercent, 0) / totalSessions) : 0;
  const totalQuestions = sessions.reduce((s, r) => s + r.totalQuestions, 0);

  const categoryStats: Record<string, { total: number; correct: number; count: number }> = {};
  sessions.forEach((s) => {
    if (!categoryStats[s.category]) categoryStats[s.category] = { total: 0, correct: 0, count: 0 };
    categoryStats[s.category].total += s.totalQuestions;
    categoryStats[s.category].correct += s.correctAnswers;
    categoryStats[s.category].count += 1;
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">学習記録</h1>
        <p className="text-sm text-muted">あなたの学習の成果を確認しましょう。</p>
      </div>

      {totalSessions === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border/60">
          <p className="text-sm mb-3">📊</p>
          <p className="text-sm font-bold mb-1">まだ学習記録がありません</p>
          <p className="text-xs text-muted mb-6">問題を解くと、ここに記録が表示されます。</p>
          <Link href="/quiz" className="text-sm font-semibold text-primary hover:underline">模擬問題に挑戦する</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "学習回数", value: `${totalSessions}回` },
              { label: "平均正答率", value: `${avgScore}%` },
              { label: "総解答数", value: `${totalQuestions}問` },
              { label: "連続学習", value: `${streaks.currentStreak}日` },
            ].map((s) => (
              <div key={s.label} className="bg-surface rounded-xl border border-border/60 p-4 text-center">
                <p className="text-sm font-bold text-primary">{s.value}</p>
                <p className="text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl border border-border/60 p-5 mb-4 shadow-sm">
            <h2 className="text-sm font-bold mb-3">スコア推移</h2>
            <ScoreChart sessions={sessions} />
          </div>

          <div className="bg-surface rounded-xl border border-border/60 p-5 mb-4 shadow-sm">
            <h2 className="text-sm font-bold mb-3">カテゴリ別正答率</h2>
            <CategoryBreakdown categoryStats={categoryStats} />
          </div>

          <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-sm">
            <h2 className="text-sm font-bold mb-4">学習ストリーク</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-surface-dim rounded-lg">
                <p className="text-base font-bold text-primary">{streaks.currentStreak}</p>
                <p className="text-[11px] text-muted">現在の連続日数</p>
              </div>
              <div className="text-center p-4 bg-surface-dim rounded-lg">
                <p className="text-base font-bold text-accent">{streaks.longestStreak}</p>
                <p className="text-[11px] text-muted">最長記録</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
