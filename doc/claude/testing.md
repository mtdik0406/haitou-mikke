# テスト戦略

## テストツール

| 種別 | ツール | 用途 |
|------|--------|------|
| Unit Test | Vitest | 関数・コンポーネントの単体テスト |
| Component Test | React Testing Library | UIコンポーネントのテスト |
| E2E Test | Playwright | ブラウザ統合テスト |
| API Test | Vitest + MSW | API Routeのテスト |

## カバレッジ目標

- 全体: 80%以上
- ビジネスロジック（lib/）: 90%以上
- UIコンポーネント: 70%以上

## ディレクトリ構造

```
__tests__/
├── unit/           # 単体テスト
│   ├── lib/
│   └── utils/
├── components/     # コンポーネントテスト
└── api/            # APIテスト
e2e/                # E2Eテスト
```

## ユニットテスト例

```typescript
// __tests__/unit/lib/dividend.test.ts
import { describe, it, expect } from 'vitest'
import { calculateDividendYield } from '@/lib/dividend'

describe('calculateDividendYield', () => {
  it('should calculate yield correctly', () => {
    expect(calculateDividendYield(100, 2000)).toBe(0.05)
  })

  it('should return 0 when price is 0', () => {
    expect(calculateDividendYield(100, 0)).toBe(0)
  })

  it('should handle null dividend', () => {
    expect(calculateDividendYield(null, 2000)).toBe(0)
  })
})
```

## Prisma モック

```typescript
// __tests__/mocks/prisma.ts
import { vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    stock: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))
```

## E2E テスト例

```typescript
// e2e/rankings.spec.ts
import { test, expect } from '@playwright/test'

test('should display dividend rankings', async ({ page }) => {
  await page.goto('/')

  // ランキングテーブルが表示される
  await expect(page.getByRole('table')).toBeVisible()

  // ソート機能が動作する
  await page.click('[data-testid="sort-yield"]')
  const firstYield = await page.locator('tbody tr:first-child td:nth-child(3)').textContent()
  expect(parseFloat(firstYield!)).toBeGreaterThan(0)
})

test('should navigate to stock detail', async ({ page }) => {
  await page.goto('/')

  // 銘柄をクリック
  await page.click('[data-testid="stock-link-7203"]')

  // 詳細ページに遷移
  await expect(page).toHaveURL(/\/stocks\/7203/)
  await expect(page.getByRole('heading', { name: /トヨタ/ })).toBeVisible()
})
```

## コマンド

```bash
# ユニットテスト
pnpm test

# ウォッチモード
pnpm test --watch

# カバレッジ
pnpm test --coverage

# E2Eテスト
pnpm test:e2e

# E2Eテスト（UIモード）
pnpm dlx playwright test --ui
```

## MSW（API モック）

```typescript
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/stocks', () => {
    return HttpResponse.json({
      stocks: [
        { code: '7203', name: 'トヨタ自動車', dividendYield: 0.025 },
        { code: '8306', name: '三菱UFJ', dividendYield: 0.035 },
      ],
      total: 2,
    })
  }),
]
```

## CI での実行

```yaml
# .github/workflows/ci.yml
- name: Unit Tests
  run: pnpm test

- name: Install Playwright
  run: pnpm dlx playwright install --with-deps

- name: Run E2E Tests
  run: pnpm test:e2e
```
