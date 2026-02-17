# DB設定

- **ブランチ**: `feat/database-setup`
- **ステータス**: 完了

## 作業内容

```bash
pnpm add prisma @prisma/client
pnpm dlx prisma init
```

- Prisma設定
- Supabase接続設定（.env.local）
- Stockモデル作成
- マイグレーション実行

## テスト方法

- `pnpm dlx prisma db push` で成功確認
- Supabaseダッシュボードでテーブル確認

## 完了条件

- [x] Prismaが設定されている
- [ ] Supabaseに接続できる（要.env.local設定）
- [ ] Stockテーブルが作成されている（要prisma db push）
