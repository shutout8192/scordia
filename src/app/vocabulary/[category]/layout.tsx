import type { Metadata } from "next";
import { VOCAB_CATEGORIES, SITE_URL } from "@/lib/constants";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = VOCAB_CATEGORIES.find((c) => c.slug === category);
  const title = cat ? `${cat.label} - 単語帳` : "単語帳";
  const description = cat
    ? `${cat.label}（${cat.wordCount}語）| フラッシュカードで効率的にTOEIC単語を暗記しよう。`
    : "TOEIC頻出単語をフラッシュカードで学習しよう。";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/vocabulary/${category}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
