# 開発ワークフロー

## 開発フロー

各機能をGitHub Issueとして管理し、以下のフローで開発を進める：

```
1. Issue作成 → 2. ブランチ作成 → 3. 実装 → 4. テスト → 5. PR作成 → 6. mainマージ
```

---

## フェーズ一覧

| フェーズ | 内容 | ステータス |
|---------|------|-----------|
| [Phase 1: MVP](issues/phase-1-mvp/README.md) | 配当利回りランキングの基本機能 | 進行中 |

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
