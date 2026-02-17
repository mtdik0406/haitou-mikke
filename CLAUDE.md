# haitou-mikke

配当株情報サービス - 日本株の配当利回りランキングを提供するWebアプリケーション

## 技術スタック

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + Supabase (PostgreSQL)
- yahoo-finance2 + 東証CSV
- Vitest + Playwright
- Biome (Linter/Formatter)

## よく使うコマンド

```bash
pnpm dev             # 開発サーバー起動
pnpm build           # ビルド
pnpm test            # ユニットテスト
pnpm test:e2e        # E2Eテスト
pnpm lint            # Biome lint
pnpm format          # Biome format
pnpm check           # Biome lint + format（自動修正）
pnpm dlx prisma db push   # DBマイグレーション
pnpm dlx prisma studio    # DB GUI
```

## ディレクトリ構造

```
src/
├── app/           # Next.js App Router ページ
├── components/    # Reactコンポーネント（ui/はshadcn）
├── lib/           # ユーティリティ・APIクライアント
└── types/         # 型定義
prisma/            # Prismaスキーマ
__tests__/         # テストファイル
e2e/               # E2Eテスト
```

## 開発ルール

1. **Server Components** をデフォルトで使用（`'use client'` は必要時のみ）
2. **Zod** でAPIパラメータをバリデーション
3. エラーは **ApiError** クラスで統一（`src/lib/api-error.ts`）
4. 日本株ティッカーは `{code}.T` 形式（例: `7203.T` = トヨタ）
5. Next.js 16 では `cookies()`, `headers()` 等は `await` が必要
6. `.env.local` は絶対にコミットしない（本番は Vercel 環境変数）
7. ブランチ命名: `feat/`, `fix/`, `refactor/` + 機能名
8. ビジネスロジック（`lib/`）には必ずテスト作成
9. コミット前に `pnpm check` でBiomeチェック

## Claude Code セキュリティ

### Sandboxモード（推奨）

```bash
claude --sandbox
```

| 制限 | 説明 |
|------|------|
| ファイル書き込み | プロジェクトディレクトリ外への書き込み禁止 |
| システムファイル | アクセス制限 |
| ネットワーク | 許可（pnpm, git, gh用） |

### 自動実行の安全制約

- mainブランチへの直接プッシュ禁止
- **PRマージ**: `/review-pr` でレビュー後、`gh pr merge` で自動マージ可
- 本番デプロイは手動確認
- `.claude/settings.local.json` で危険コマンドを拒否設定済み

### PRマージワークフロー

```
1. /commit-push-pr  → PR作成
2. /review-pr       → コードレビュー（問題があれば修正）
3. gh pr merge      → mainにマージ
```

## AIエージェント自動開発フロー

詳細は [開発ワークフロー](doc/claude/development-workflow.md) を参照。

### 品質ゲート（必須）

| チェック | コマンド |
|---------|---------|
| Lint/Format | `pnpm check` |
| テスト | `pnpm test` |
| ビルド | `pnpm build` |

### 基本原則

- Issue駆動で作業開始
- lib/の変更にはテスト必須
- マージ前に `/review-pr` でレビュー

## 詳細ドキュメント

- [アーキテクチャ](doc/claude/architecture.md)
- [コーディング規約](doc/claude/coding-standards.md)
- [テスト戦略](doc/claude/testing.md)
- [開発ワークフロー](doc/claude/development-workflow.md)
- [セキュリティ](doc/claude/security.md)
