import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スコア診断",
  description: "15問の問題に答えるだけで、あなたの予想TOEICスコアを診断。無料で何度でも受けられます。",
};

export default function DiagnosisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
