# アーキテクチャ

## システム構成

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   API Routes    │────▶│   Supabase      │
│   (Frontend)    │     │   (Backend)     │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │ yahoo-finance2  │
                       │ + 東証CSV       │
                       └─────────────────┘
```

## データフロー

1. **データ同期** (`/api/sync`)
   - Vercel Cron Jobs が平日 16:00 JST にトリガー
   - yahoo-finance2 から日経225銘柄の株価・配当データ取得
   - Supabase に upsert

2. **ランキング取得** (`/api/stocks`)
   - クライアントからリクエスト
   - Prisma でソート・フィルタ・ページネーション
   - JSON レスポンス

## キャッシュ戦略

Next.js 16 ではデフォルトで fetch がキャッシュされないため、明示的に設定が必要。

| データ種別 | revalidate | 理由 |
|-----------|------------|------|
| 株価データ | 60秒 | 市場営業時間中の更新頻度 |
| 配当情報 | 86400秒（1日） | 配当は頻繁に変わらない |
| ランキング | 1800秒（30分） | 適度な鮮度を保つ |
| 銘柄マスター | 604800秒（1週間） | ほぼ変更なし |

```typescript
// 使用例
const data = await fetch('https://api.example.com/stocks', {
  next: {
    revalidate: 1800,
    tags: ['rankings']
  }
})

// タグベースの再検証
import { revalidateTag } from 'next/cache'
revalidateTag('rankings')
```

## データベースモデル

```prisma
model Stock {
  id            String   @id @default(cuid())
  code          String   @unique  // 証券コード
  name          String            // 会社名
  sector        String            // 業種
  marketCap     BigInt?           // 時価総額
  price         Float?            // 株価
  dividend      Float?            // 年間配当金
  dividendYield Float?            // 配当利回り
  payoutRatio   Float?            // 配当性向
  updatedAt     DateTime @updatedAt
  createdAt     DateTime @default(now())
}
```

## データ同期スケジューリング

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "0 7 * * 1-5"
    }
  ]
}
```

- 平日 16:00 JST（UTC 07:00）= 市場終了後
- リトライ: 最大3回、指数バックオフ

## 外部API

### yahoo-finance2

- 日本株は `{code}.T` 形式で指定（例: `7203.T`）
- タイムアウト: 10秒
- リトライ: 最大3回
- フォールバック: キャッシュデータ利用

### 東証銘柄マスターCSV

- 業種データの補完に使用
- Yahoo Finance では業種データが限定的なため

---

## CI/CD設定

### GitHub Actions ワークフロー

#### CI（Pull Request時）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm type-check

      - name: Unit Tests
        run: pnpm test

      - name: Build
        run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm dlx playwright install --with-deps

      - name: Run E2E Tests
        run: pnpm test:e2e
```

#### CD（mainマージ時）

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Dependabot設定

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    groups:
      minor-and-patch:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
```

### ブランチ保護ルール

CIが失敗した場合にマージをブロックするには、GitHubリポジトリで以下を設定：

**Settings → Branches → Add branch protection rule**

| 設定項目 | 値 |
|---------|-----|
| Branch name pattern | `main` |
| Require a pull request before merging | ✅ |
| Require status checks to pass before merging | ✅ |
| Status checks that are required | `lint-and-test`, `e2e` |
| Do not allow bypassing the above settings | ✅ |

---

## 将来の拡張（Phase 2以降）

- ユーザー認証・ポートフォリオ管理
- 配当履歴グラフ
- 増配率ランキング
- スクリーニング機能強化
- メール通知機能
- 米国株対応
