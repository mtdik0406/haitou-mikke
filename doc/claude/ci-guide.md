# CI/CDガイド

## CI失敗時の対応

CIが失敗した場合の確認手順。

### 1. エラーログの確認

```bash
# PRのチェック状況を確認
gh pr checks <PR番号>

# 詳細なログはGitHub Actionsで確認
# https://github.com/<owner>/<repo>/actions
```

### 2. よくある失敗パターンと対処法

| 失敗 | 原因 | 対処法 |
|------|------|--------|
| **Lint** | コードフォーマット違反 | `pnpm check` で自動修正 |
| **Type Check** | 型エラー | エラー箇所の型を修正 |
| **Unit Tests** | テスト失敗 | `pnpm test` でローカル確認 |
| **Build** | ビルドエラー | `pnpm build` でローカル確認 |
| **E2E Tests** | 統合テスト失敗 | `pnpm test:e2e` でローカル確認 |

### 3. 修正後の手順

```bash
# 修正をコミット
git add .
git commit -m "fix: CI失敗を修正"
git push

# CIの再実行を待つ
gh pr checks <PR番号> --watch
```

---

## PRラベル

PR作成時に適切なラベルを付与する：

| ラベル | 用途 |
|--------|------|
| `docs` | ドキュメント変更 |
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | リファクタリング |
| `chore` | 設定変更など |
| `test` | テスト追加・修正 |

```bash
# PR作成時にラベルを指定
gh pr create --label feat

# 既存PRにラベルを追加
gh pr edit --add-label docs
```
