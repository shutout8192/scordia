"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getWrongAnswers } from "@/lib/storage";

export default function ReviewPrompt() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getWrongAnswers().length);
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/quiz/review"
      className="group bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/30 p-6 hover:shadow-md hover:border-accent/50 transition-all duration-200 block"
    >
      <div className="text-2xl mb-3">🔄</div>
      <h2 className="text-base font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
        間違えた問題を復習
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-3">
        過去に間違えた問題を集中的に復習できます。
      </p>
      <div className="flex items-center gap-1.5 text-xs text-accent font-semibold">
        <span>📋</span>
        <span>{count}問</span>
      </div>
    </Link>
  );
}
