import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="text-5xl mb-4">📖</p>
      <h1 className="text-2xl font-bold mb-2">ページが見つかりません</h1>
      <p className="text-sm text-muted mb-8">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          トップページへ
        </Link>
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 bg-surface text-foreground text-sm font-semibold px-5 py-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:text-primary transition-colors"
        >
          模擬問題に挑戦
        </Link>
      </div>
    </div>
  );
}
