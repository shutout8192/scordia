"use client";
import { useState, useEffect } from "react";
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

export default function VocabSessionPage() {
  const params = useParams();
  const category = params.category as string;
  const data = dataMap[category];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [vocabStatus, setVocabStatus] = useState<Record<string, "known" | "review">>({});

  useEffect(() => {
    const progress = getProgress();
    const statusMap: Record<string, "known" | "review"> = {};
    progress.vocabulary.knownWords.forEach((id) => (statusMap[id] = "known"));
    progress.vocabulary.reviewWords.forEach((id) => (statusMap[id] = "review"));
    setVocabStatus(statusMap);
  }, []);

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-4">カテゴリが見つかりません</h1>
        <Link href="/vocabulary" className="text-sm text-primary hover:underline">カテゴリ一覧に戻る</Link>
      </div>
    );
  }

  const word = data.words[currentIndex];
  const wordStatus = vocabStatus[word.id] ?? "unseen";

  const handleMark = (status: "known" | "review") => {
    toggleVocabStatus(word.id, status);
    setVocabStatus((prev) => ({ ...prev, [word.id]: status }));
  };

  const knownCount = data.words.filter((w) => vocabStatus[w.id] === "known").length;
  const reviewCount = data.words.filter((w) => vocabStatus[w.id] === "review").length;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-bold">{data.categoryLabel}</h1>
          <p className="text-xs text-muted">{currentIndex + 1} / {data.words.length}</p>
        </div>
        <div className="flex gap-1.5 text-[11px]">
          <span className="flex items-center gap-1 bg-success-bg text-success font-semibold px-2 py-1 rounded-full">{knownCount}</span>
          <span className="flex items-center gap-1 bg-warning-bg text-warning font-semibold px-2 py-1 rounded-full">{reviewCount}</span>
        </div>
      </div>

      <div className="w-full bg-surface-dim rounded-full h-1 mb-8">
        <div className="bg-primary h-1 rounded-full progress-bar" style={{ width: `${((currentIndex + 1) / data.words.length) * 100}%` }} />
      </div>

      <FlashCard word={word} status={wordStatus} onMark={handleMark} />

      <div className="flex justify-between mt-8 text-xs font-semibold">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          前へ
        </button>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(data.words.length - 1, i + 1))}
          disabled={currentIndex === data.words.length - 1}
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
