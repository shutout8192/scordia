# TOEIC Master デプロイ手順

## 1. Vercelアカウント作成

1. https://vercel.com/signup にアクセス
2. GitHubアカウント、またはメールアドレスで登録（Hobbyプラン = 無料）
3. 登録完了後、ダッシュボードが表示される

## 2. Vercel CLIインストール & ログイン

```bash
npm install -g vercel
vercel login
# ブラウザが開くので、登録したアカウントでログイン
```

## 3. デプロイ

```bash
cd toeic-master
vercel
# 初回は対話形式で設定を聞かれる:
#   - Set up and deploy? → Y
#   - Which scope? → 自分のアカウントを選択
#   - Link to existing project? → N
#   - What's your project's name? → toeic-master
#   - In which directory is your code located? → ./
#   - Want to modify these settings? → N
```

プレビューURLが発行される。問題なければ本番デプロイ:

```bash
vercel --prod
```

## 4. カスタムドメイン（任意）

1. Vercelダッシュボード → Settings → Domains
2. 独自ドメインを追加（例: toeic-master.com）
3. DNSレコードを設定（CNAME or A record）

## 5. Google AdSense申請

### 前提条件
- サイトが公開されていること（Vercelデプロイ済み）
- 10ページ以上のコンテンツがあること（本サイトは12ページ以上）
- プライバシーポリシーページがあること（必要に応じて追加）

### 手順
1. https://www.google.com/adsense/ にアクセス
2. Googleアカウントでログイン
3. サイトのURL（例: https://toeic-master.vercel.app）を入力
4. 審査を申請（通常1〜2週間）
5. 承認後、Publisher ID（ca-pub-XXXXXXXXX）が発行される

### Publisher IDの設定
承認後、以下のファイルを編集:

```
src/components/ads/AdProvider.tsx
```

`ca-pub-XXXXXXXXXXXXXXXX` を実際のPublisher IDに置き換える。

```
src/components/ads/AdBanner.tsx
```

同様に `data-ad-client` の値を更新し、`data-ad-slot` に実際のスロットIDを設定。

## 6. Amazonアソシエイト申請

1. https://affiliate.amazon.co.jp/ にアクセス
2. アカウント作成 → サイト情報を登録
3. 審査通過後、アソシエイトID（例: yourid-22）が発行される
4. `src/app/about/page.tsx` のAmazonリンクにタグを追加:
   ```
   href="https://www.amazon.co.jp/s?k=TOEIC+金のフレーズ&tag=yourid-22"
   ```

## 7. Google Search Console登録

1. https://search.google.com/search-console/ にアクセス
2. プロパティを追加（URLプレフィックス: https://toeic-master.vercel.app）
3. HTML タグまたはDNSで所有権を確認
4. サイトマップを送信: `https://toeic-master.vercel.app/sitemap.xml`

## 8. 継続的な改善

- 問題データの追加: `src/data/` のJSONファイルに追加 → `vercel --prod` で再デプロイ
- Google Analytics: `src/app/layout.tsx` にGAスクリプトを追加
- プライバシーポリシー: AdSense審査に必要なら `/privacy` ページを追加
