import Link from "next/link";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: "ja",
};

const features = [
  {
    href: "/quiz",
    icon: "📝",
    title: "模擬問題",
    description: "Part 5/6形式の文法・語彙問題",
    stat: "240問",
    statIcon: "📄",
    badge: "人気",
  },
  {
    href: "/vocabulary",
    icon: "📚",
    title: "単語帳",
    description: "頻出単語をフラッシュカードで暗記",
    stat: "150語",
    statIcon: "🔤",
  },
  {
    href: "/listening",
    icon: "🎧",
    title: "リスニング",
    description: "Part 1〜3形式の音声付き問題",
    stat: "70問",
    statIcon: "🔊",
  },
  {
    href: "/diagnosis",
    icon: "🎯",
    title: "スコア診断",
    description: "15問で予想TOEICスコアを診断",
    stat: "5分",
    statIcon: "⏱️",
    badge: "NEW",
  },
  {
    href: "/progress",
    icon: "📊",
    title: "学習記録",
    description: "正答率やスコア推移をグラフ表示",
    stat: "無料",
    statIcon: "📈",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-primary-light/10">
        <div className="max-w-3xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
            完全無料
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            TOEIC対策の<span className="gradient-text">最短ルート</span>
          </h1>
          <p className="text-sm md:text-base text-muted leading-relaxed max-w-lg mx-auto mb-8">
            文法・語彙・リスニングの練習問題で、目標スコアを効率的に達成しよう。
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/diagnosis"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
            >
              🎯 スコア診断
            </Link>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-surface text-foreground text-sm font-semibold px-5 py-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
            >
              📝 模擬問題
            </Link>
            <Link
              href="/vocabulary"
              className="inline-flex items-center gap-2 bg-surface text-foreground text-sm font-semibold px-5 py-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
            >
              📚 単語帳
            </Link>
            <Link
              href="/listening"
              className="inline-flex items-center gap-2 bg-surface text-foreground text-sm font-semibold px-5 py-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
            >
              🎧 リスニング
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-3xl mx-auto px-5 -mt-6">
        <div className="bg-surface rounded-2xl border border-border/60 shadow-sm grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/40 py-5">
          {[
            { value: "460+", label: "コンテンツ" },
            { value: "5種", label: "学習モード" },
            { value: "¥0", label: "利用料金" },
            { value: "3段階", label: "難易度" },
          ].map((s) => (
            <div key={s.label} className="text-center px-3">
              <p className="text-lg font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-16">
        <h2 className="text-lg font-bold mb-6 text-center">学習コンテンツ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group relative bg-surface rounded-xl border border-border/60 p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              {"badge" in f && f.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {f.badge}
                </span>
              )}
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                {f.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                <span>{f.statIcon}</span>
                <span>{f.stat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-surface-dim/50 to-surface-dim border-y border-border/40 py-14 px-5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-lg font-bold mb-2">毎日の学習が、スコアに変わる</p>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            1日10分の積み重ねが大きな差に。学習記録で成長を実感しよう。
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
            >
              模擬問題に挑戦
            </Link>
            <Link
              href="/vocabulary"
              className="inline-flex items-center gap-2 bg-surface text-foreground text-sm font-semibold px-5 py-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
            >
              単語帳を開く
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
