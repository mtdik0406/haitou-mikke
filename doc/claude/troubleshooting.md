# トラブルシューティング

## データ取得に失敗する

**症状**: 「データの取得に失敗しました」エラー

**原因と対処法**:

1. **環境変数が設定されていない**
   ```bash
   # .env.local と .env の両方が必要
   cp .env.example .env.local
   cp .env.example .env
   # 各ファイルにSupabase接続情報を設定
   ```

2. **Prisma Clientが古い**
   ```bash
   pnpm dlx prisma generate
   pnpm dev
   ```

---

## Turbopackのキャッシュエラー

**症状**: `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`

**対処法**:
```bash
rm -rf .next
pnpm dev
```

---

## 依存関係のエラー

**症状**: モジュールが見つからない、Internal Server Error

**対処法**:
```bash
rm -rf .next node_modules
pnpm install
pnpm dlx prisma generate
pnpm dev
```
