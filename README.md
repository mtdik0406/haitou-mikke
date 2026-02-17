# haitou-mikke（配当みっけ）

日本株の配当利回りランキングを提供するWebアプリケーション

## 機能

- 日経225銘柄の配当利回りランキング
- 業種別・時価総額別フィルタ
- 銘柄詳細ページ

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + React 19 + TypeScript
- **スタイリング**: Tailwind CSS + shadcn/ui
- **データベース**: Supabase (PostgreSQL) + Prisma
- **データソース**: yahoo-finance2
- **デプロイ**: Vercel

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集してSupabase接続情報を設定

# データベースのセットアップ
pnpm dlx prisma db push

# 開発サーバー起動
pnpm dev
```

## コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm test` | ユニットテスト |
| `pnpm test:e2e` | E2Eテスト |
| `pnpm lint` | Biome lint |
| `pnpm format` | Biome format |
| `pnpm check` | lint + format（自動修正） |
| `pnpm dlx prisma db push` | DBマイグレーション |
| `pnpm dlx prisma studio` | DB GUI |

## ライセンス

MIT
