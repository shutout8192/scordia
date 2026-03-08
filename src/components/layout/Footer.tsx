import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-xs">
            <p className="font-bold text-sm mb-2">{SITE_NAME}</p>
            <p className="text-xs text-muted leading-relaxed">
              無料でTOEIC対策ができる学習サイト。文法・語彙・リスニングの練習問題で目標スコアを達成しよう。
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">コンテンツ</h3>
              <ul className="space-y-1.5">
                {[
                  { href: "/quiz", label: "模擬問題" },
                  { href: "/vocabulary", label: "単語帳" },
                  { href: "/listening", label: "リスニング" },
                  { href: "/progress", label: "学習記録" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-muted hover:text-foreground transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">サイト情報</h3>
              <ul className="space-y-1.5">
                <li><Link href="/about" className="text-xs text-muted hover:text-foreground transition-colors">このサイトについて</Link></li>
                <li><Link href="/privacy" className="text-xs text-muted hover:text-foreground transition-colors">プライバシーポリシー</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border/60 mt-8 pt-5 flex flex-col items-center gap-2">
          <p className="text-[10px] text-muted/70 leading-relaxed text-center max-w-md">
            本サイトの問題・解説はAIにより自動生成されています。内容の正確性には注意を払っていますが、誤りがある場合があります。
          </p>
          <p className="text-[11px] text-muted">
            &copy; {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
