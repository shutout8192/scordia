"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FlashCard from "@/components/vocabulary/FlashCard";
import { VocabCategory } from "@/types/vocabulary";
import { getProgress, toggleVocabStatus } from "@/lib/storage";

import beginnerData from "@/data/vocabulary/beginner.json";
import intermediateData from "@/data/vocabulary/intermediate.json";
import advancedData from "@/data/vocabulary/advanced.json";

const dataMap: Record<string, VocabCategory> = {
  beginner: beginnerData as VocabCategory,
  intermediate: intermediateData as VocabCategory,
  advanced: advancedData as VocabCategory,
};

type Filter = "all" | "unseen" | "review";

export default function VocabSessionPage() {
  const params = useParams();
  const category = params.category as string;
  const data = dataMap[category];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [vocabStatus, setVocabStatus] = useState<Record<string, "known" | "review">>({});
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const progress = getProgress();
    const statusMap: Record<string, "known" | "review"> = {};
    progress.vocabulary.knownWords.forEach((id) => (statusMap[id] = "known"));
    progress.vocabulary.reviewWords.forEach((id) => (statusMap[id] = "review"));
    setVocabStatus(statusMap);
  }, []);

  const filteredWords = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.words;
    if (filter === "unseen") return data.words.filter((w) => !vocabStatus[w.id]);
    return data.words.filter((w) => vocabStatus[w.id] === "review");
  }, [data, filter, vocabStatus]);

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-4">カテゴリが見つかりません</h1>
        <Link href="/vocabulary" className="text-sm text-primary hover:underline">カテゴリ一覧に戻る</Link>
      </div>
    );
  }

  // Reset index when filter changes and puts index out of bounds
  const safeIndex = Math.min(currentIndex, Math.max(0, filteredWords.length - 1));
  if (safeIndex !== currentIndex) {
    setCurrentIndex(safeIndex);
  }

  if (filteredWords.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-surface rounded-xl border border-border/60 p-8 shadow-sm">
          <p className="text-2xl mb-3">{filter === "review" ? "🎉" : "📚"}</p>
          <p className="text-base font-bold mb-2">
            {filter === "review" ? "復習する単語がありません" : "未学習の単語がありません"}
          </p>
          <p className="text-sm text-muted mb-6">
            {filter === "review" ? "「復習する」にマークした単語がないか、すべて覚えました。" : "すべての単語を学習済みです。素晴らしい！"}
          </p>
          <button onClick={() => setFilter("all")} className="text-sm font-semibold text-primary hover:underline">
            すべての単語を表示
          </button>
        </div>
      </div>
    );
  }

  const word = filteredWords[safeIndex];
  const wordStatus = vocabStatus[word.id] ?? "unseen";

  const handleMark = (status: "known" | "review") => {
    toggleVocabStatus(word.id, status);
    setVocabStatus((prev) => ({ ...prev, [word.id]: status }));
  };

  const knownCount = data.words.filter((w) => vocabStatus[w.id] === "known").length;
  const reviewCount = data.words.filter((w) => vocabStatus[w.id] === "review").length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `全て (${data.words.length})` },
    { key: "unseen", label: `未学習 (${data.words.length - knownCount - reviewCount})` },
    { key: "review", label: `復習 (${reviewCount})` },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-bold">{data.categoryLabel}</h1>
          <p className="text-xs text-muted">{safeIndex + 1} / {filteredWords.length}</p>
        </div>
        <div className="flex gap-1.5 text-[11px]">
          <span className="flex items-center gap-1 bg-success-bg text-success font-semibold px-2 py-1 rounded-full">{knownCount}</span>
          <span className="flex items-center gap-1 bg-warning-bg text-warning font-semibold px-2 py-1 rounded-full">{reviewCount}</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setCurrentIndex(0); }}
            className={`text-[10px] font-semibold px-3 py-1 rounded-full transition-colors ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-surface-dim text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="w-full bg-surface-dim rounded-full h-1 mb-8">
        <div className="bg-primary h-1 rounded-full progress-bar" style={{ width: `${((safeIndex + 1) / filteredWords.length) * 100}%` }} />
      </div>

      <FlashCard
        word={word}
        status={wordStatus}
        onMark={handleMark}
        onPrev={safeIndex > 0 ? () => setCurrentIndex((i) => i - 1) : undefined}
        onNext={safeIndex < filteredWords.length - 1 ? () => setCurrentIndex((i) => i + 1) : undefined}
      />

      <div className="flex justify-between mt-8 text-xs font-semibold">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          前へ
        </button>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(filteredWords.length - 1, i + 1))}
          disabled={safeIndex === filteredWords.length - 1}
          className="text-primary hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
        >
          次へ
        </button>
      </div>

      <div className="text-center mt-6">
        <Link href="/vocabulary" className="text-xs text-muted hover:text-primary transition-colors">カテゴリ一覧に戻る</Link>
      </div>
    </div>
  );
}
