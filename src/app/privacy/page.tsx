import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE_NAME}のプライバシーポリシーです。`,
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-muted">最終更新日: 2026年2月27日</p>
      </div>

      <div className="bg-surface rounded-xl border border-border/60 p-6 shadow-sm space-y-6">
        <section>
          <h2 className="text-sm font-bold mb-2">1. 収集する情報</h2>
          <p className="text-xs text-muted leading-relaxed">
            本サイトでは、サービス改善のためにアクセス解析ツール（Vercel Analytics）を使用しています。
            これにより、匿名化されたページビュー数やパフォーマンスデータが収集されます。
            個人を特定できる情報は収集しておりません。
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold mb-2">2. ローカルストレージの使用</h2>
          <p className="text-xs text-muted leading-relaxed">
            学習記録（正答率、学習回数等）はお使いのブラウザのローカルストレージに保存されます。
            このデータはサーバーには送信されず、お使いの端末にのみ保存されます。
            ブラウザのデータ消去により削除可能です。
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold mb-2">3. 広告について</h2>
          <p className="text-xs text-muted leading-relaxed">
            本サイトでは、Google AdSenseなどの第三者広告サービスを使用する場合があります。
            これらのサービスはCookieを使用してユーザーの興味に基づいた広告を表示することがあります。
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold mb-2">4. アフィリエイトリンク</h2>
          <p className="text-xs text-muted leading-relaxed">
            本サイトにはAmazonアソシエイトを含むアフィリエイトリンクが含まれています。
            リンク経由で商品を購入された場合、サイト運営者に紹介料が支払われることがあります。
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold mb-2">5. AI生成コンテンツ</h2>
          <p className="text-xs text-muted leading-relaxed">
            本サイトの問題・解説はAI（人工知能）により生成されています。
            内容の正確性には注意を払っておりますが、誤りが含まれる場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold mb-2">6. お問い合わせ</h2>
          <p className="text-xs text-muted leading-relaxed">
            本ポリシーに関するお問い合わせは、サイト内のお問い合わせフォームよりご連絡ください。
          </p>
        </section>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="text-xs font-semibold text-muted hover:text-primary hover:underline">
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
