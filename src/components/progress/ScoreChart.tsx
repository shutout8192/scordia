"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SessionRecord } from "@/types/progress";

interface Props {
  sessions: SessionRecord[];
}

export default function ScoreChart({ sessions }: Props) {
  const data = sessions.slice(-20).map((s) => ({
    date: new Date(s.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
    score: s.scorePercent,
    category: s.category,
  }));

  if (data.length === 0) return <p className="text-muted text-sm">データがありません</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" fontSize={12} stroke="var(--muted)" />
        <YAxis domain={[0, 100]} fontSize={12} stroke="var(--muted)" />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface)" }}
          formatter={(value) => [`${value}%`, "正答率"]}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--primary)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
