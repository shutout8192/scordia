"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AudioPlayer from "@/components/listening/AudioPlayer";
import { ListeningCategory, ListeningQuestion } from "@/types/listening";
import { saveSession } from "@/lib/storage";
import { shuffle } from "@/lib/shuffle";

import part1Data from "@/data/listening/part1.json";
import part2Data from "@/data/listening/part2.json";
import part3Data from "@/data/listening/part3.json";

const dataMap: Record<string, ListeningCategory> = {
  part1: part1Data as ListeningCategory,
  part2: part2Data as ListeningCategory,
  part3: part3Data as ListeningCategory,
};

export default function ListeningSessionPage() {
  const params = useParams();
  const category = params.category as string;
  const data = dataMap[category];

  const [questions, setQuestions] = useState<ListeningQuestion[]>(data?.questions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [results, setResults] = useState<{ correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (data) setQuestions(shuffle(data.questions));
  }, [data]);

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold mb-4">カテゴリが見つかりません</h1>
        <Link href="/listening" className="text-sm text-primary hover:underline">カテゴリ一覧に戻る</Link>
      </div>
    );
  }

  const question = questions[currentIndex];

  const handleSelect = (label: string) => {
    if (answered) return;
    setSelected(label);
    setAnswered(true);
    setResults((prev) => [...prev, { correct: label === question.answer }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      const correctCount = results.filter((r) => r.correct).length;
      saveSession({
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        type: "listening",
        category,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        scorePercent: Math.round((correctCount / questions.length) * 100),
        timeSpentSeconds: elapsed,
      });
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setShowTranscript(false);
    }
  };

  if (finished) {
    const correctCount = results.filter((r) => r.correct).length;
    const percent = Math.round((correctCount / questions.length) * 100);
    const circumference = 2 * Math.PI * 32;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-xs text-muted mb-1">{data.categoryLabel}</p>
        <h2 className="text-base font-bold mb-4">結果発表</h2>
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
          <svg className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)" }} />
          </svg>
          <div className="absolute">
            <div className="text-sm font-bold">{percent}%</div>
            <div className="text-[10px] text-muted">{correctCount}/{questions.length}</div>
          </div>
        </div>
        <div className="flex justify-center gap-2.5">
          <Link href={`/listening/${category}`} className="text-xs font-semibold text-primary hover:underline">もう一度挑戦</Link>
          <Link href="/listening" className="text-xs font-semibold text-muted hover:text-primary hover:underline">カテゴリ一覧</Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const getOptionStyle = (label: string) => {
    const base = "w-full text-left px-3 py-2 rounded-lg border transition-all text-xs";
    if (!answered) {
      return selected === label
        ? `${base} border-primary bg-primary/5 ring-2 ring-primary/20`
        : `${base} border-border/60 bg-surface hover:border-primary/40`;
    }
    if (label === question.answer) return `${base} border-success bg-success-bg`;
    if (label === selected && label !== question.answer) return `${base} border-error bg-error-bg`;
    return `${base} border-border/60 bg-surface opacity-40`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted">
          <span className="text-foreground font-bold">{currentIndex + 1}</span> / {questions.length}
        </span>
        <span className="text-xs text-muted">{data.categoryLabel}</span>
      </div>
      <div className="w-full bg-surface-dim rounded-full h-1 mb-8">
        <div className="bg-primary h-1 rounded-full progress-bar" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="bg-surface rounded-xl border border-border/60 p-5 mb-5 shadow-sm">
        {category === "part1" ? (
          <>
            <p className="text-xs text-muted mb-3">写真を見て音声を聞き、正しい描写を選んでください。</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/listening/${question.id}.png`}
              alt={question.sceneJa || "場面写真"}
              width={600}
              height={400}
              className="w-full rounded-lg border border-border/40 mb-3"
            />
            <AudioPlayer text={question.transcript} mode="choices" choices={question.choices} />
          </>
        ) : category === "part3" ? (
          <>
            <p className="text-xs text-muted mb-3">会話を聞いて、質問に答えてください。</p>
            <AudioPlayer text={question.transcript} mode="dialogue" />
            <div className="mt-3">
              <button onClick={() => setShowTranscript(!showTranscript)} className="text-xs text-primary hover:underline">
                {showTranscript ? "トランスクリプトを隠す ▲" : "トランスクリプトを表示 ▼"}
              </button>
              {showTranscript && (
                <div className="mt-2 p-3 bg-surface-dim rounded-lg text-xs whitespace-pre-line leading-relaxed">{question.transcript}</div>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-muted mb-3">音声を聞いて、最も適切な応答を選んでください。</p>
            <AudioPlayer text={question.transcript} />
            <div className="mt-3">
              <button onClick={() => setShowTranscript(!showTranscript)} className="text-xs text-primary hover:underline">
                {showTranscript ? "トランスクリプトを隠す ▲" : "トランスクリプトを表示 ▼"}
              </button>
              {showTranscript && (
                <div className="mt-2 p-3 bg-surface-dim rounded-lg text-xs whitespace-pre-line leading-relaxed">{question.transcript}</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="space-y-2.5">
        {question.choices.map((c) => (
          <button key={c.label} onClick={() => handleSelect(c.label)} disabled={answered} className={getOptionStyle(c.label)}>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold bg-surface-dim mr-2">{c.label}</span>
            {category === "part1" && !answered ? "" : c.text}
          </button>
        ))}
      </div>

      {answered && (
        <>
          <div className={`mt-4 p-3 rounded-lg border text-xs ${selected === question.answer ? "bg-success-bg border-success/30" : "bg-error-bg border-error/30"}`}>
            <p className="font-bold mb-1">{selected === question.answer ? "正解！" : `不正解 — 正解: ${question.answer}`}</p>
            <p className="text-muted leading-relaxed text-xs">{question.explanation}</p>
          </div>
          <div className="mt-5 text-center">
            <button onClick={handleNext} className="text-sm font-semibold text-primary hover:underline">
              {currentIndex + 1 >= questions.length ? "結果を見る" : "次の問題へ"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
