"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  /** Target time in seconds */
  targetSeconds: number;
  /** Whether the question has been answered (stops the timer) */
  answered: boolean;
  /** Reset key — change this to restart the timer (e.g. question id) */
  resetKey: string;
}

export default function QuestionTimer({ targetSeconds, answered, resetKey }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsed(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetKey]);

  useEffect(() => {
    if (answered && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [answered]);

  const overTarget = elapsed > targetSeconds;
  const ratio = Math.min(elapsed / targetSeconds, 1);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-surface-dim rounded-full overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all duration-1000 ${
            overTarget ? "bg-error" : ratio > 0.7 ? "bg-warning" : "bg-primary"
          }`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono font-semibold tabular-nums ${
        overTarget ? "text-error" : "text-muted"
      }`}>
        {elapsed}s
        <span className="text-muted/50"> / {targetSeconds}s</span>
      </span>
    </div>
  );
}
