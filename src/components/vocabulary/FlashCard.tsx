"use client";
import { useState } from "react";
import { VocabWord } from "@/types/vocabulary";

interface Props {
  word: VocabWord;
  status: "known" | "review" | "unseen";
  onMark: (status: "known" | "review") => void;
}

export default function FlashCard({ word, status, onMark }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="max-w-sm mx-auto">
      <div className="flip-card w-full h-56 cursor-pointer" onClick={() => setFlipped(!flipped)}>
        <div className={`flip-card-inner relative w-full h-full ${flipped ? "flipped" : ""}`}>
          <div className="flip-card-front absolute inset-0 bg-surface rounded-xl border border-border/60 p-5 flex flex-col items-center justify-center shadow-sm">
            <p className="text-lg font-bold mb-1 tracking-tight">{word.word}</p>
            <p className="text-muted text-[11px] mb-1">{word.pronunciation}</p>
            <span className="text-[10px] bg-surface-dim text-muted px-2 py-0.5 rounded-full">{word.partOfSpeech}</span>
            <p className="text-[10px] text-border-hover mt-4">タップして意味を見る</p>
          </div>
          <div className="flip-card-back absolute inset-0 rounded-xl p-5 flex flex-col items-center justify-center shadow-sm text-white bg-gradient-to-br from-primary to-primary-dark">
            <p className="text-base font-bold mb-1">{word.meaningJa}</p>
            <p className="text-white/70 text-[11px] mb-3">{word.meaningEn}</p>
            <div className="w-full bg-white/10 rounded p-2.5 text-left">
              <p className="text-[11px] text-white/90 leading-relaxed">{word.exampleEn}</p>
              <p className="text-[11px] text-white/60 mt-1">{word.exampleJa}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-5 justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); onMark("known"); }}
          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
            status === "known"
              ? "bg-success text-white"
              : "bg-success/10 text-success hover:bg-success/20"
          }`}
        >
          ✓ 覚えた
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMark("review"); }}
          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
            status === "review"
              ? "bg-warning text-white"
              : "bg-warning/10 text-warning hover:bg-warning/20"
          }`}
        >
          ↻ 復習する
        </button>
      </div>
    </div>
  );
}
