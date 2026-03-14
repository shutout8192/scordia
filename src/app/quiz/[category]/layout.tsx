import type { Metadata } from "next";
import { QUIZ_CATEGORIES, SITE_URL } from "@/lib/constants";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = QUIZ_CATEGORIES.find((c) => c.slug === category);
  const title = cat ? `${cat.label} - 模擬問題` : "模擬問題";
  const description = cat
    ? `${cat.label}（${cat.questionCount}問）| TOEIC Part 5/6形式の${cat.label}に挑戦しよう。`
    : "TOEIC模擬問題に挑戦しよう。";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/quiz/${category}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
