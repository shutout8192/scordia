import type { Metadata } from "next";
import Link from "next/link";
import AffiliateCard from "@/components/ads/AffiliateCard";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "Scordiaは無料でTOEIC対策ができる学習サイトです。文法・語彙・リスニングの練習問題を提供しています。",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">このサイトについて</h1>
        <p className="text-sm text-muted">
          <strong className="text-foreground">{SITE_NAME}</strong>は、TOEIC対策を無料で行える学習サイトです。
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border/60 p-6 mb-6 shadow-sm">
        <h2 className="text-sm font-bold mb-4">提供コンテンツ</h2>
        <div className="space-y-2">
          {[
            { icon: "📝", title: "模擬問題", desc: "Part 5/6形式の文法・語彙問題（1020問）" },
            { icon: "📚", title: "単語帳", desc: "レベル別（600点/730点/860点）のフラッシュカード（750語）" },
            { icon: "🎧", title: "リスニング練習", desc: "Part 1〜3形式の音声付き問題（251問）" },
            { icon: "🎯", title: "スコア診断", desc: "15問で予想TOEICスコアを診断" },
            { icon: "📊", title: "学習記録", desc: "正答率やスコア推移のグラフ表示" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-surface-dim transition-colors">
              <span className="text-base">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border/60 p-6 mb-8 shadow-sm">
        <h2 className="text-sm font-bold mb-4">学習のコツ</h2>
        <div className="space-y-3">
          {[
            "毎日10〜15分の学習を習慣にしましょう。",
            "間違えた問題の解説をしっかり読みましょう。",
            "「復習する」マークの単語を重点的に反復学習。",
            "同じ音声を繰り返し聞いて耳を慣らしましょう。",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-md flex items-center justify-center text-[11px] font-bold">{i + 1}</span>
              <p className="text-xs text-muted leading-relaxed pt-0.5">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border/60 p-6 mb-8 shadow-sm">
        <h2 className="text-sm font-bold mb-4">AI生成コンテンツについて</h2>
        <div className="space-y-3 text-xs text-muted leading-relaxed">
          <p>
            本サイトの問題・選択肢・解説は、<strong className="text-foreground">AI（人工知能）</strong>により自動生成されています。
            TOEIC公式問題集や過去問のデータを使用しておらず、すべてオリジナルの問題です。
          </p>
          <p>
            内容の正確性には十分注意を払っておりますが、AI生成の性質上、まれに不自然な表現や誤りが含まれる場合があります。
            お気づきの点がございましたら、お知らせいただけると幸いです。
          </p>
          <p className="text-[10px] text-muted/70">
            TOEIC is a registered trademark of ETS. This site is not affiliated with or endorsed by ETS.
          </p>
        </div>
      </div>

      <h2 className="text-sm font-bold mb-4">おすすめ教材・サービス</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <AffiliateCard title="TOEIC 金のフレーズ" description="TOEIC頻出単語1000語収録。スキマ時間に最適。" linkText="Amazonで見る" href="https://www.amazon.co.jp/s?k=TOEIC+%E9%87%91%E3%81%AE%E3%83%95%E3%83%AC%E3%83%BC%E3%82%BA" />
        <AffiliateCard title="公式TOEIC問題集" description="ETS公式の本番形式問題集。" linkText="Amazonで見る" href="https://www.amazon.co.jp/s?k=%E5%85%AC%E5%BC%8FTOEIC+Listening+Reading+%E5%95%8F%E9%A1%8C%E9%9B%86" />
        <AffiliateCard title="スタディサプリ TOEIC" description="スマホで手軽にTOEIC対策。" linkText="公式サイトを見る" href="https://eigosapuri.jp/toeic/" />
        <AffiliateCard title="DMM英会話" description="毎日25分のオンラインレッスン。" linkText="公式サイトを見る" href="https://eikaiwa.dmm.com/" />
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs font-semibold text-muted hover:text-primary hover:underline">トップページに戻る</Link>
      </div>
    </div>
  );
}
