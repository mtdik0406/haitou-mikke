# ランキングAPI

- **GitHub**: [#2](https://github.com/mtdik0406/haitou-mikke/issues/2)
- **PR**: [#6](https://github.com/mtdik0406/haitou-mikke/pull/6)
- **ブランチ**: `feat/ranking-api`
- **ステータス**: 完了

## 作業内容

- 銘柄一覧API（`/api/stocks`）
- ソート・フィルタパラメータ対応
- ページネーション

## テスト方法

- `/api/stocks?sort=dividendYield&order=desc` でランキング取得確認

## 完了条件

- [x] 銘柄一覧APIが動作する
- [x] ソートパラメータが機能する
- [x] フィルタパラメータが機能する
- [x] ページネーションが実装されている
