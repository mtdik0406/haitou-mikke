# haitou-mikke

配当株情報サービス - 日本株の配当利回りランキング

## 技術スタック

Next.js 16 + React 19 + TypeScript / Tailwind + shadcn/ui / Prisma + Supabase / Biome

## コマンド

```bash
pnpm dev          # 開発サーバー
pnpm check        # Lint + Format
pnpm test         # テスト
pnpm build        # ビルド
```

## 開発ルール（厳守）

1. **mainブランチ直接コミット禁止** - featureブランチ → PR → マージ
2. **GitHub Issue駆動** - 作業前にIssue確認/作成、完了時にチェック更新
3. **PRはIssueにリンク** - `Closes #番号` を本文に含める
4. **品質チェック必須** - `pnpm check && pnpm test && pnpm build`
5. **lib/変更にはテスト必須**
6. **Issueチェックリスト完了時はクローズ** - 全タスク完了後 `gh issue close` を実行

## コーディング規約

- Server Components デフォルト（`'use client'` は必要時のみ）
- エラーは `ApiError` クラスで統一
- APIパラメータは Zod でバリデーション
- 日本株ティッカー: `{code}.T` 形式

## 詳細ドキュメント

- [開発ワークフロー](doc/claude/development-workflow.md) - Issue駆動開発の詳細手順
- [コーディング規約](doc/claude/coding-standards.md)
- [テスト戦略](doc/claude/testing.md)
- [アーキテクチャ](doc/claude/architecture.md)
- [セキュリティ](doc/claude/security.md)
