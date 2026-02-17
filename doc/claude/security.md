# セキュリティ対策

## 環境変数の管理

### 必須環境変数

| 変数名 | 用途 | 取得元 |
|--------|------|--------|
| `DATABASE_URL` | Supabase接続文字列 | Supabase Dashboard → Settings → Database |
| `DIRECT_URL` | Prisma マイグレーション用 | 同上（Connection Pooling無効のURL） |

### 管理ルール

- `.env.local` にSupabase接続情報を保存
- `.gitignore` で `.env*` を除外（**絶対にコミットしない**）
- Vercelの環境変数機能で本番環境を管理
- `.env.example` をテンプレートとして維持

```bash
# .env.example（コミット可）
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

---

## APIセキュリティ

### 入力バリデーション（Zod）

すべてのAPIパラメータはZodでバリデーション:

```typescript
import { z } from 'zod'

// クエリパラメータのスキーマ
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sector: z.string().optional(),
})

// 使用例
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const result = querySchema.safeParse(Object.fromEntries(searchParams))

  if (!result.success) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const { page, limit, sector } = result.data
  // ...
}
```

### API保護

- データ同期API（`/api/sync`）はサーバーサイドのみ or 認証必須
- レート制限の検討（Vercel Edge Functions）
- CORSヘッダーの適切な設定

---

## データベースセキュリティ

- Supabase Row Level Security (RLS) は読み取り専用テーブルのため不要
- 接続文字列の安全な管理（環境変数のみ）
- Prismaのパラメータ化クエリでSQLインジェクション防止

---

## 依存関係のセキュリティ

### 脆弱性チェック

```bash
# 手動チェック
pnpm audit

# 脆弱性の自動修正（可能な場合）
pnpm audit --fix
```

### 自動化

- **Dependabot**: GitHubで有効化し、自動PRを受け取る
- **CI/CD**: `pnpm audit` をCIパイプラインに追加

---

## フロントエンドセキュリティ

- ReactによるXSS自動エスケープ
- ユーザー入力のサニタイズ
- 生のHTMLを直接DOMに挿入しない（Reactのエスケープ機能を活用）
- 外部リンクには `rel="noopener noreferrer"` を付与

---

## セキュリティチェックリスト（PR前）

- [ ] `.env.local` がコミットに含まれていないか確認
- [ ] APIパラメータのZodバリデーションが実装されているか
- [ ] ユーザー入力を直接HTMLに挿入していないか
- [ ] 新しい依存関係に既知の脆弱性がないか（`pnpm audit`）
- [ ] 機密情報がログに出力されていないか

---

## 注意事項

- yahoo-finance2は非公式APIのため、長期的な安定性は保証されない
- 本番運用時はレート制限に注意（過度なリクエストを避ける）
- 定期的なデータ同期バッチの設定が必要（1日1回程度推奨）
- 将来的にJ-Quants有料プランへの移行も検討
