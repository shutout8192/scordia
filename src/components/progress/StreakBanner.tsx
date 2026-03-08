"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress } from "@/lib/storage";

export default function StreakBanner() {
  const [streak, setStreak] = useState(0);
  const [studiedToday, setStudiedToday] = useState(false);

  useEffect(() => {
    const progress = getProgress();
    setStreak(progress.streaks.currentStreak);
    const today = new Date().toISOString().split("T")[0];
    setStudiedToday(progress.streaks.lastStudyDate === today);
  }, []);

  if (streak === 0) return null;

  return (
    <Link
      href="/progress"
      className="block max-w-3xl mx-auto px-5 mt-6"
    >
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-xl px-4 py-3 flex items-center justify-between hover:border-accent/40 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-bold text-foreground">
              {streak}日連続学習中！
            </p>
            <p className="text-[10px] text-muted">
              {studiedToday ? "今日も学習済み" : "今日はまだ学習していません"}
            </p>
          </div>
        </div>
        {!studiedToday && (
          <span className="text-[10px] font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
            学習する →
          </span>
        )}
      </div>
    </Link>
  );
}
