# 開発ワークフロー

## 開発フロー（必須手順）

**GitHub Issueをベースに作業を進める。以下の手順を厳守すること。**

### 1. Issue確認・作成

```bash
# 既存Issueを確認
gh issue view <番号>

# 新規Issue作成（作業内容と完了条件を明記）
gh issue create --title "feat: 機能名" --body "## 作業内容
- [ ] タスク1
- [ ] タスク2

## 完了条件
- [ ] 条件1
- [ ] 条件2"
```

### 2. ブランチ作成・実装

```bash
git checkout -b feat/機能名
# 実装...
pnpm check && pnpm test && pnpm build  # 品質チェック必須
```

### 3. PR作成（Issueにリンク）

```bash
# 1. mainブランチの最新を取得してマージ
git fetch origin main
git merge origin/main

# 2. 品質チェック
pnpm check && pnpm test && pnpm build

# 3. ローカルサーバーで動作確認
pnpm dev
# http://localhost:3000 でアクセスし、問題ないことを確認

# 4. コミット・プッシュ・PR作成
git add . && git commit -m "feat: 説明"
git push -u origin feat/機能名
gh pr create --base main --title "feat: 機能名" --body "Closes #<Issue番号>

## Summary
- 変更内容

## Test plan
- テスト方法"

# 5. CIが通ることを確認してからマージ
gh pr checks <PR番号> --watch
```

### 4. マージ・Issue更新

```bash
gh pr merge <PR番号> --squash --delete-branch
gh issue edit <Issue番号> --body "（完了項目に[x]を付ける）"
```

---

## フェーズ一覧

| フェーズ | 内容 | ステータス |
|---------|------|-----------|
| [Phase 1: MVP](issues/phase-1-mvp/README.md) | 配当利回りランキングの基本機能 | 完了 |

---

## 新機能追加時のフロー

新しい機能を追加する場合：

1. **フェーズを計画**
   - `doc/claude/issues/phase-X-xxx/` ディレクトリを作成
   - `README.md` にフェーズの目標を記載

2. **Issueに分割**
   - [テンプレート](issues/_template.md)を使用して各Issueファイルを作成
   - 依存関係を考慮して実装順を決定

3. **GitHub Issue作成**
   ```bash
   # Issue作成
   gh issue create --title "feat: 機能名" --body "## 概要\n\n## タスク\n- [ ] タスク1"

   # テンプレートから作成
   gh issue create --title "タイトル" --body-file doc/claude/issues/phase-X/XX-name.md
   ```

4. **Issue順に開発**
   - ブランチ作成 → 実装 → テスト → PR
   - PR作成時にIssueを紐付け: `gh pr create --body "Closes #<Issue番号>"`

5. **ステータス更新**
   - 各Issue完了時にステータスを更新
   - フェーズ完了後、README.mdのチェックリストを更新

---

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

---

## 検証方法

1. **開発サーバー起動**
   ```bash
   pnpm dev
   ```
   http://localhost:3000 でアクセス確認

2. **データ同期テスト**
   - yfinanceからデータ取得確認
   - 東証マスターCSVパース確認
   - データベースへの保存確認

3. **機能テスト**
   - ランキング表示確認
   - ソート機能動作確認
   - 銘柄詳細ページ遷移確認

4. **レスポンシブ確認**
   - モバイル表示確認
   - テーブルのスクロール動作

5. **自動テスト**
   ```bash
   pnpm test        # Unit Tests
   pnpm test:e2e    # E2E Tests
   ```
