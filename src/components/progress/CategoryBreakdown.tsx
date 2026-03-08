"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  categoryStats: Record<string, { total: number; correct: number; count: number }>;
}

const categoryLabels: Record<string, string> = {
  grammar: "文法",
  vocabulary: "語彙",
  listening: "リスニング",
};

export default function CategoryBreakdown({ categoryStats }: Props) {
  const data = Object.entries(categoryStats).map(([key, stat]) => ({
    name: categoryLabels[key] ?? key,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    sessions: stat.count,
  }));

  if (data.length === 0) return <p className="text-muted text-sm">データがありません</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" fontSize={12} stroke="var(--muted)" />
        <YAxis domain={[0, 100]} fontSize={12} stroke="var(--muted)" />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface)" }}
          formatter={(value) => [`${value}%`, "正答率"]}
        />
        <Bar dataKey="accuracy" fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
