# データ取得基盤

- **GitHub**: [#1](https://github.com/mtdik0406/haitou-mikke/issues/1)
- **ブランチ**: `feat/data-fetcher`
- **ステータス**: 未着手

## 作業内容

```bash
pnpm add yahoo-finance2
```

- 日経225銘柄リスト管理（定数またはJSON）
- yahoo-finance2 APIクライアント実装
- 銘柄マスターデータ取得（会社名、業種）
- データ同期APIエンドポイント作成（`/api/sync`）
- 株価・配当データ取得ロジック

## 日経225銘柄リスト

- 日本取引所グループの公式データを参照
- `data/nikkei225.json` にティッカーリストを保存

## テスト方法

- `/api/sync` 呼び出しでデータがDBに保存されることを確認

## 完了条件

- [ ] yahoo-finance2でデータ取得できる
- [ ] 銘柄マスターデータがDBに保存される
- [ ] 配当データがDBに保存される
