"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, getWrongAnswers, WrongAnswer } from "@/lib/storage";
import { UserProgress } from "@/types/progress";
import ScoreChart from "@/components/progress/ScoreChart";
import CategoryBreakdown from "@/components/progress/CategoryBreakdown";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);

  useEffect(() => {
    setProgress(getProgress());
    setWrongAnswers(getWrongAnswers());
  }, []);

  if (!progress) return null;

  const { sessions, streaks } = progress;
  const totalSessions = sessions.length;
  const avgScore = totalSessions ? Math.round(sessions.reduce((s, r) => s + r.scorePercent, 0) / totalSessions) : 0;
  const totalQuestions = sessions.reduce((s, r) => s + r.totalQuestions, 0);

  // Today's stats
  const today = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter((s) => s.date.startsWith(today));
  const todayQuestions = todaySessions.reduce((s, r) => s + r.totalQuestions, 0);
  const todayCorrect = todaySessions.reduce((s, r) => s + r.correctAnswers, 0);
  const todayScore = todayQuestions ? Math.round((todayCorrect / todayQuestions) * 100) : 0;

  const categoryStats: Record<string, { total: number; correct: number; count: number }> = {};
  sessions.forEach((s) => {
    if (!categoryStats[s.category]) categoryStats[s.category] = { total: 0, correct: 0, count: 0 };
    categoryStats[s.category].total += s.totalQuestions;
    categoryStats[s.category].correct += s.correctAnswers;
    categoryStats[s.category].count += 1;
  });

  const categoryLabelMap: Record<string, string> = {
    grammar: "文法", vocabulary: "語彙", review: "復習",
    part1: "リスニングPart1", part2: "リスニングPart2", part3: "リスニングPart3",
  };

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
          {/* Today's stats */}
          {todaySessions.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <h2 className="text-xs font-bold text-primary mb-2">今日の学習</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{todaySessions.length}回</p>
                  <p className="text-[10px] text-muted">セッション</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{todayQuestions}問</p>
                  <p className="text-[10px] text-muted">解答数</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{todayScore}%</p>
                  <p className="text-[10px] text-muted">正答率</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "累計学習回数", value: `${totalSessions}回` },
              { label: "累計正答率", value: `${avgScore}%` },
              { label: "累計解答数", value: `${totalQuestions}問` },
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

          <div className="bg-surface rounded-xl border border-border/60 p-5 mb-4 shadow-sm">
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

          {/* Wrong answers / Review */}
          <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">間違えた問題</h2>
              {wrongAnswers.length > 0 && (
                <Link href="/quiz/review" className="text-xs font-semibold text-primary hover:underline">
                  復習する →
                </Link>
              )}
            </div>
            {wrongAnswers.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">間違えた問題はありません。素晴らしい！</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted mb-3">
                  {wrongAnswers.length}問の間違えた問題があります。復習して正解すると自動的にリストから削除されます。
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(
                    wrongAnswers.reduce<Record<string, number>>((acc, w) => {
                      acc[w.category] = (acc[w.category] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([cat, count]) => (
                    <div key={cat} className="bg-surface-dim rounded-lg px-3 py-2 text-center">
                      <p className="text-xs font-semibold">{categoryLabelMap[cat] || cat}</p>
                      <p className="text-sm font-bold text-error">{count}問</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
