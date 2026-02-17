---
name: conventional-commits
enabled: true
event: bash
pattern: git\s+commit
action: warn
---

## Conventional Commits 形式でコミットしてください

```
<type>[optional scope]: <description>
```

### type 一覧

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみ |
| `style` | フォーマット変更 |
| `refactor` | リファクタリング |
| `test` | テスト追加・修正 |
| `chore` | ビルド・補助ツール |

### 例

```
feat(ranking): 配当利回りフィルター機能を追加
fix(api): 株価取得タイムアウトエラーを修正
refactor(lib): ApiErrorクラスの改善
docs: READMEを更新
```

### ルール
- type は小文字
- scope はオプション（括弧内）
- description は小文字で開始
