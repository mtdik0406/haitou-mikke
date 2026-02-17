# プロジェクト初期化

- **ブランチ**: `feat/init-project`
- **ステータス**: 完了

## 作業内容

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npx shadcn@latest init
```

- Next.js 15 + TypeScript + Tailwind CSS初期化
- shadcn/ui設定
- 基本的なレイアウト作成
- Git初期化

## テスト方法

- `pnpm dev` で起動確認
- `pnpm build` で成功確認

## 完了条件

- [x] Next.jsプロジェクトが正常に起動する
- [x] shadcn/uiが設定されている
- [x] Gitリポジトリが初期化されている
