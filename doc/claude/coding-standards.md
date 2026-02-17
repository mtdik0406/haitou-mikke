# コーディング規約

## Next.js 16 の重要なポイント

### Async Request APIs

リクエスト依存のAPIは非同期で、`await` が必要。

```typescript
// cookies(), headers() などは await が必要
const cookieStore = await cookies()
const headersList = await headers()
```

対象API: `cookies()`, `headers()`, `params`, `searchParams`

#### searchParams の使用例

```typescript
// src/app/stocks/page.tsx
export default async function StocksPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { sort = 'dividendYield', page = '1' } = await searchParams
  // ...
}
```

### proxy.ts（リクエスト処理）

> **Note**: Phase 2（認証実装時）に作成予定。現在は未実装。

Next.js 16 では `proxy.ts` でリクエスト処理を行う。

```typescript
// src/proxy.ts（Phase 2 で実装予定）
export function proxy(request: Request) {
  // 認証チェック、リダイレクトなど
  const url = new URL(request.url)

  // 例: 認証が必要なページへのアクセス制御
  if (url.pathname.startsWith('/dashboard')) {
    // 認証チェック
  }
}
```

注意: Node.js ランタイムで実行される。

## Server Components / Server Actions

### Server Components（デフォルト）

```typescript
// src/app/page.tsx
// デフォルトでサーバーサイドレンダリング
export default async function RankingsPage() {
  const rankings = await fetchRankings()
  return <RankingsTable rankings={rankings} />
}
```

### Client Components

```typescript
// src/components/filter-panel.tsx
'use client'  // クライアントコンポーネントを明示

import { useState } from 'react'

export function FilterPanel() {
  const [sector, setSector] = useState('')
  // ...
}
```

### Server Actions

```typescript
// src/app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function refreshRankings() {
  revalidateTag('rankings')
}
```

## エラーハンドリング

### ApiError クラス

```typescript
// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}
```

### API Route での使用

```typescript
// src/app/api/stocks/route.ts
import { ApiError } from '@/lib/api-error'

export async function GET(request: Request) {
  try {
    const data = await fetchData()
    return Response.json(data)
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### グローバルエラーバウンダリ

| ファイル | 用途 |
|---------|------|
| `app/error.tsx` | ページレベルのエラー処理 |
| `app/global-error.tsx` | root layout含むエラー処理 |
| `app/not-found.tsx` | 404ページ |

## Zod バリデーション

### スキーマ定義

```typescript
// src/lib/validations/stock.ts
import { z } from 'zod'

export const stockQuerySchema = z.object({
  sort: z.enum(['dividendYield', 'price', 'name']).default('dividendYield'),
  order: z.enum(['asc', 'desc']).default('desc'),
  sector: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type StockQuery = z.infer<typeof stockQuerySchema>
```

### API Route での使用

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = stockQuerySchema.safeParse(Object.fromEntries(searchParams))

  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { sort, order, sector, page, limit } = parsed.data
  // ...
}
```

## リトライ処理

```typescript
// src/lib/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i)))
    }
  }
  throw new Error('Unreachable')
}
```

## パスエイリアス

`@/` は `src/` にマッピング。

```typescript
import { prisma } from '@/lib/db'
import { calculateDividendYield } from '@/lib/dividend'
```
