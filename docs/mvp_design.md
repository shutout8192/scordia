# ToeicMaster MVP — 設計ドキュメント

> 作成: 2026-03-07 | 更新: 2026-03-07 v2 (軍師レビュー反映: F5-F13修正) | 担当: 家老
> 目的: cmd_001 実装前の軍師レビュー用設計書

---

## 1. プロジェクト構成

```
toeic-master/           ← Next.js プロジェクトルート
├── .env.local.example  ← APIキー設定例
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx              # ルートレイアウト (dark mode provider)
│   │   ├── page.tsx                # ランディング (ログインCTA)
│   │   ├── practice/page.tsx       # メイン練習ページ
│   │   ├── diagnosis/page.tsx      # 12問スコア診断ページ
│   │   ├── review/page.tsx         # 復習モードページ (忘却曲線)
│   │   ├── dashboard/page.tsx      # デイリー統計ダッシュボード [F5修正]
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # NextAuth.js
│   │       ├── questions/generate/route.ts  # AI問題生成
│   │       ├── score/diagnose/route.ts      # スコア算出
│   │       └── review/route.ts              # 復習キュー管理
│   ├── components/
│   │   ├── QuestionCard.tsx        # 画像 + 4択
│   │   ├── ChoiceButton.tsx        # TTS付き選択肢ボタン
│   │   ├── ExplanationPanel.tsx    # 正答後解説
│   │   ├── ScoreDisplay.tsx        # 予測スコア表示
│   │   ├── ReviewBadge.tsx         # 復習待ちカウントバッジ
│   │   └── DarkModeToggle.tsx      # ダークモード切替
│   ├── lib/
│   │   ├── pexels.ts               # Pexels API クライアント
│   │   ├── claude.ts               # Claude API クライアント
│   │   ├── tts.ts                  # Web Speech API ラッパー
│   │   ├── score.ts                # スコア算出アルゴリズム
│   │   ├── db.ts                   # SQLite (better-sqlite3) クライアント
│   │   └── spaced-repetition.ts    # 忘却曲線アルゴリズム (SM-2簡易版)
│   └── types/
│       └── question.ts             # TypeScript 型定義
└── poc/                            # 既存PoCデータ (参照用)
```

---

## 2. 技術スタック

| 分類 | 採用技術 | 理由 |
|------|---------|------|
| Frontend | Next.js 14 (App Router) + TypeScript | 将来のSSR/ISR拡張を見据えた選択 |
| Styling | Tailwind CSS v3 + `darkMode: 'class'` | ダークモード実装が最も容易 |
| Auth | NextAuth.js v4 + Google Provider | App Routerとの統合実績が多い |
| 画像取得 | Pexels API (無料、商用OK) | PoC実証済み |
| AI問題生成 | Claude API (claude-haiku-4-5) | 高速・低コスト、画像分析対応 |
| TTS | Web Speech API (ブラウザ内蔵) | 外部依存なし、無料 |
| DB | SQLite (better-sqlite3) | 忘却曲線の復習スケジュール永続化が必要なため変更。localhost限定ならSQLiteで十分 |

---

## 3. データ型定義

```typescript
// PoCのJSON形式をそのまま型化
interface Question {
  id: string;
  image_url: string;          // Pexels画像URL or ローカルパス
  pexels_source: string;      // "pexels:XXXXXXX"
  scene: string;              // 画像の場面説明 (非表示)
  answer: 'A' | 'B' | 'C' | 'D';
  choices: { A: string; B: string; C: string; D: string };
  explanation: { A: string; B: string; C: string; D: string };
  difficulty: 1 | 2 | 3 | 4 | 5;  // スコア算出用
}

// SQLite スキーマ
// users: id, email, created_at
// review_queue: 忘却曲線復習キュー (機能5)
// daily_stats: 日次正答率統計 (機能6)
// question_stock: 事前生成済み問題ストック (常設指示)
```

### SQLite スキーマ詳細

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,        -- NextAuth userId
  email TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 機能5: 忘却曲線復習 [F8修正: question_id + UNIQUE制約 + UPSERT]
CREATE TABLE review_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,     -- "poc_001" or pexels_id等 (重複防止キー)
  question_json TEXT NOT NULL,   -- JSON stringified Question
  wrong_count INTEGER DEFAULT 1,
  interval_days INTEGER DEFAULT 1,
  next_review_at TEXT NOT NULL,  -- ISO8601
  last_seen_at TEXT,
  UNIQUE(user_id, question_id),  -- 同一ユーザー×同一問題は1行のみ
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- INSERT時: ON CONFLICT(user_id, question_id) DO UPDATE SET
--   wrong_count = wrong_count + 1, next_review_at = <翌日>, interval_days = 1

-- 機能6: デイリー統計
CREATE TABLE daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,            -- "YYYY-MM-DD"
  questions_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 常設指示: 問題ストック (事前生成キャッシュ)
CREATE TABLE question_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pexels_id TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  question_json TEXT NOT NULL,   -- JSON stringified Question
  quality_checked INTEGER DEFAULT 0,  -- 0=pending, 1=ok, 2=rejected
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 4. 主要フロー

### 4-1. 練習モード

```
[問題取得 /api/questions/generate — ストック優先フロー F11修正]
1. question_stock (quality_checked=1) をランダムに1件検索
2. ストックあり → ストックから取得 (Pexels/Claude APIコスト0)
3. ストックなし → Pexels API + Claude API でリアルタイム生成
   - Pexels: query="people working" (人物動作必須 — PoCの教訓)
   - Claude haiku: 画像URL直接渡し (source.type: "url") → JSON返却

[練習フロー]
4. 画面表示: 画像 + ChoiceButton×4 (TTSボタン付き)
5. ユーザー回答 → 正誤判定 → ExplanationPanel表示
6. 誤答時 → review_queue に UPSERT (question_id + UNIQUE制約)
7. 毎回 → daily_stats に UPSERT (questions_attempted++, 正解時correct_answers++)
8. 次の問題へ
```

### 4-2. スコア診断モード (12問)

```
1. 12問出題 (難易度1〜5を均等配分)
2. 全問終了後、スコア算出:
   base = 350
   correct_bonus = (correct / 12) * 400
   difficulty_bonus = avg_difficulty * 30
   raw = base + correct_bonus + difficulty_bonus
   score = Math.round(raw / 5) * 5  // 5点刻みに丸め (10〜990)
3. ScoreDisplay: 予測スコア + 正答率 + 強弱分析
```

### 4-3. デイリー統計ダッシュボード (機能6)

```
問題回答時 → daily_stats テーブルに UPSERT:
  questions_attempted += 1
  correct_answers += 1 (正解時のみ)

/dashboard ページ [F4修正: Recharts は 'use client' Client Component]:
  → Server Component: DB からデータ取得 → props でクライアントに渡す
  → Client Component (DashboardChart.tsx): Recharts BarChart でグラフ描画
  → 今日の正答率カード (solved/correct/accuracy%)
  → 過去30日の日別推移グラフ
  → ナビバーからどこでもアクセス可能
```

### 4-4. 忘却曲線復習フロー (SM-2簡易版)

```
回答を間違える → review_queue に追加 (next_review_at = 翌日)
  → 復習で再度間違える → interval_days × 1 (変わらず1日)
  → 復習で正解 → interval_days × 2.5 で指数的に延長
  → 間隔: 1日 → 2日 → 5日 → 12日 → 30日

/review ページ:
  → next_review_at <= NOW のキューを取得
  → 期限到来済みの問題を優先出題
  → ナビバーにバッジ表示 (e.g., 「復習: 5問」)
```

### 4-5. 問題ストック自律拡張 (常設指示)

```
足軽アイドル時の自律タスク (将軍指示不要):
  1. Pexels API → 未取得画像を10枚取得 (query: "people working")
  2. Claude API → 各画像から問題生成
  3. QC: 品質チェック (scene に人物動作があるか確認)
  4. question_stock テーブルに保存 (quality_checked=1)

これにより:
  - 練習モードではストックから優先取得 (APIコスト削減)
  - ストック不足時のみリアルタイム生成にフォールバック
```

### 4-6. Auth フロー

```
未ログイン → /page.tsx (ランディング) → Googleログイン → /practice
ログイン済 → /practice 直接アクセス可能
API routes → getServerSession() でセッション確認
```

---

## 5. 環境変数 (.env.local)

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated>
GOOGLE_CLIENT_ID=<google-oauth>
GOOGLE_CLIENT_SECRET=<google-oauth>
PEXELS_API_KEY=<pexels>
ANTHROPIC_API_KEY=<anthropic>
# 開発用モック認証 [F13修正]
MOCK_AUTH_ENABLED=true   # NODE_ENV=development時に有効化
```

> **開発時モック認証 (F13修正)**: `NODE_ENV=development` かつ `MOCK_AUTH_ENABLED=true` のとき、CredentialsProvider (email/password任意) でログイン可能。Google OAuthはAPIキー取得後に有効化。Batch1 QC時はモック認証で確認。

---

## 6. 実装バッチ計画

### Batch 1: プロジェクト基盤 [F6修正: 2フェーズ逐次実行]

**Phase 1-a: ashigaru1 単独 (NextAuth追加前に完了必須)**

| 担当 | タスク | 成果物 |
|------|--------|--------|
| ashigaru1 | Next.js 14 初期化 + Tailwind + darkMode + SQLite db.ts (lazy init) + .env.local.example + 基本layout | 起動できるNext.jsアプリ + DBスキーマ |

**Phase 1-b: ashigaru1 完了後 → ashigaru2 開始 (blocked_by: subtask_001a)**

| 担当 | タスク | 成果物 |
|------|--------|--------|
| ashigaru2 | NextAuth.js v4 + Google Provider + CredentialsProvider(dev mock) + ログインページ + ナビバー骨格 | 認証動作確認 |

**Batch1 QC基準 (Shogun確認):**
- `npm run dev` でlocalhost:3000が起動する
- モック認証 (任意email/password) でログインできる
- ダークモード切替が機能する
- `toeic-master/toeicmaster.db` が作成される (SQLite初期化確認)

### Batch 2: UI コンポーネント (ashigaru 2名並列)

| 担当 | タスク | 成果物 |
|------|--------|--------|
| ashigaru1 | QuestionCard + ChoiceButton (TTS付き) | 問題表示UI |
| ashigaru2 | ExplanationPanel + ScoreDisplay | 解説・スコアUI |

**Batch2 QC基準:**
- PoCデータ (`poc_questions.json`) を使って問題が表示される (**difficulty値は各問デフォルト3を使用** — F12修正)
- TTSボタンで選択肢が音声再生される
- 正答後に解説が表示される

### Batch 3: API 層 (ashigaru 2名並列)

| 担当 | タスク | 成果物 |
|------|--------|--------|
| ashigaru1 | Pexels APIルート + Claude問題生成APIルート | `/api/questions/generate` |
| ashigaru2 | スコア算出ロジック + `/api/score/diagnose` | スコア診断API |

**Batch3 QC基準:**
- `/api/questions/generate` がJSON問題を返す
- `/api/score/diagnose` が予測スコアを返す

### Batch 4: 統合 + 復習機能 (ashigaru 2名並列)

| 担当 | タスク | 成果物 |
|------|--------|--------|
| ashigaru1 | 練習ページ完成 (API統合 + 全フロー) + 誤答をreview_queueに保存 | /practice 動作 |
| ashigaru2 | 診断ページ完成 (12問モード + スコア表示) | /diagnosis 動作 |

### Batch 5: 復習モード + ダッシュボード (ashigaru 2名並列)

| 担当 | タスク | 成果物 |
|------|--------|--------|
| ashigaru1 | /review ページ + ReviewBadge + SM-2スケジューラ | /review 動作 |
| ashigaru2 | /dashboard ページ + デイリー統計 + Rechartsグラフ | /dashboard 動作 |

**Batch5 QC基準:**
- 間違い問題が翌日以降に復習キューに現れる
- ダッシュボードに今日の正答率と日別グラフが表示される

**Final QC (Shogun):** 全acceptance_criteriaをlocalhost確認

---

## 7. リスク・依存関係

| リスク | 対策 |
|--------|------|
| APIキー未取得 (Google OAuth等) | .env.local.example を先に作成。APIキーなしでもモックで開発可能 |
| Pexels API レート制限 | 開発中はPoCのローカル画像を使用、本番のみPexels呼出し |
| Claude APIコスト | haiku使用 + 問題をキャッシュして再利用 |
| Web Speech API ブラウザ差異 | Chrome/Edge優先、Firefoxはフォールバック (テキスト表示) |
| NextAuth v5 不安定 | v4を採用 (v5はApp Routerでバグ報告あり) |

---

## 8. 軍師レビュー結果 (v2反映済み)

**verdict: needs_revision → v2で全major修正完了**

| 指摘ID | 重要度 | 内容 | v2対応 |
|--------|--------|------|--------|
| F4 | minor | Recharts 'use client' 未記載 | ✅ Section 4-3に追記 |
| F5 | minor | dashboard/page.tsx 未記載 | ✅ Section 1に追記 |
| F6 | **major** | Batch1並列で依存関係衝突 | ✅ 2フェーズに分割 |
| F7 | **major** | DB初期化タイミング未定義 | ✅ Phase1-aにdb.ts追加 |
| F8 | **major** | review_queue重複防止欠如 | ✅ question_id+UNIQUE制約追加 |
| F9 | minor | SM-2倍率固定2.5 | ✅ MVP段階で許容 (将来拡張メモ追記) |
| F10 | minor | スコアレンジ380-900 | ✅ UI免責表示を追加指示 |
| F11 | minor | ストック消費フロー未記載 | ✅ Section 4-1に追加 |
| F12 | minor | PoCデータにdifficulty欠如 | ✅ Batch2でデフォルト3使用と明記 |
| F13 | minor | モック認証具体策なし | ✅ CredentialsProvider dev mode追加 |
