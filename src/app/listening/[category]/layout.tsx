import type { Metadata } from "next";
import { LISTENING_CATEGORIES, SITE_URL } from "@/lib/constants";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = LISTENING_CATEGORIES.find((c) => c.slug === category);
  const title = cat ? `${cat.label} - リスニング` : "リスニング";
  const description = cat
    ? `${cat.label}（${cat.questionCount}問）| 音声付きリスニング練習問題に挑戦しよう。`
    : "TOEICリスニング練習問題に挑戦しよう。";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/listening/${category}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
