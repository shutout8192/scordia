import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学習記録",
  description: "あなたのTOEIC学習の成果を確認。正答率、スコア推移、連続学習日数をグラフで表示。",
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
