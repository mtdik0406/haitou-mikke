# Phase 1: MVP

配当株ランキングサービスの最小限の機能を実装するフェーズ。

## 目標

- 日経225銘柄の配当利回りランキングを表示できるWebアプリを構築
- 基本的なフィルタ・ソート機能を実装
- 銘柄詳細ページで配当情報を確認可能に

## Issue一覧

| Issue                                    | ブランチ              | GitHub | ステータス |
| ---------------------------------------- | --------------------- | ------ | ---------- |
| [プロジェクト初期化](01-init-project.md) | `feat/init-project`   | -      | 完了       |
| [DB設定](02-database-setup.md)           | `feat/database-setup` | -      | 完了       |
| [データ取得基盤](03-data-fetcher.md)     | `feat/data-fetcher`   | [#1](https://github.com/mtdik0406/haitou-mikke/issues/1) | 未着手 |
| [ランキングAPI](04-ranking-api.md)       | `feat/ranking-api`    | [#2](https://github.com/mtdik0406/haitou-mikke/issues/2) | 未着手 |
| [ランキングUI](05-ranking-ui.md)         | `feat/ranking-ui`     | [#3](https://github.com/mtdik0406/haitou-mikke/issues/3) | 未着手 |
| [銘柄詳細ページ](06-stock-detail.md)     | `feat/stock-detail`   | [#4](https://github.com/mtdik0406/haitou-mikke/issues/4) | 未着手 |

## 完了条件

- [ ] ランキングページでソート・フィルタが動作する
- [ ] 銘柄詳細ページで配当情報が表示される
- [ ] モバイル対応（レスポンシブデザイン）
- [ ] 全テストがパスする
