# 開発ガイド

## プロジェクト構造

```
サークルアプリ/
├── backend/                 # バックエンド（Node.js + Express + TypeScript）
│   ├── src/
│   │   ├── config/         # データベース設定
│   │   ├── controllers/    # リクエストハンドラー
│   │   ├── middleware/     # 認証などのミドルウェア
│   │   ├── migrations/     # データベースマイグレーション
│   │   ├── models/         # 型定義
│   │   ├── routes/         # APIルート
│   │   ├── services/       # ビジネスロジック
│   │   ├── utils/          # ユーティリティ関数
│   │   └── server.ts       # サーバーエントリーポイント
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # フロントエンド（React + TypeScript + Tailwind CSS）
│   ├── src/
│   │   ├── components/    # 再利用可能なコンポーネント
│   │   ├── contexts/      # React Context（認証など）
│   │   ├── pages/         # ページコンポーネント
│   │   ├── services/      # API通信
│   │   ├── types/         # TypeScript型定義
│   │   ├── utils/         # ユーティリティ関数
│   │   ├── App.tsx        # メインアプリケーション
│   │   └── index.tsx      # エントリーポイント
│   ├── package.json
│   └── tailwind.config.js
│
├── README.md              # プロジェクト概要
├── DEVELOPMENT.md         # このファイル
└── render.yaml           # Renderデプロイ設定
```

## 開発環境のセットアップ

### 1. 前提条件

- Node.js 18以上
- PostgreSQL 14以上
- Git

### 2. データベースのセットアップ

PostgreSQLでデータベースを作成:

```sql
CREATE DATABASE tennis_circle;
CREATE USER tennis_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tennis_circle TO tennis_user;
```

### 3. バックエンドのセットアップ

```bash
cd backend
npm install
cp .env.example .env
# .envファイルを編集してデータベース接続情報を設定
npm run migrate  # データベースマイグレーション
npm run dev      # 開発サーバー起動
```

### 4. フロントエンドのセットアップ

```bash
cd frontend
npm install
cp .env.example .env
# .envファイルを編集
npm start        # 開発サーバー起動
```

## データベーススキーマ

### Users（ユーザー）
- 認証情報とプロフィール
- 役割（admin/member）
- LINE Notifyトークン

### Practices（練習日程）
- 日時、場所、面数
- 締め切り設定
- コート代

### Participations（参加申し込み）
- 参加ステータス（参加/遅刻/不参加/キャンセル待ち）
- ユーザーと練習の紐付け

### Ball Bags（ボルバ）
- ボルバ名
- 現在の所持者

### Ball Bag Histories（ボルバ履歴）
- 持ち帰り記録
- 統計用

### Court Fees（コート代）
- 練習ごとの費用
- 一人あたりの金額

### Settings（設定）
- システム全体の設定値

## API開発

### 新しいエンドポイントの追加

1. `backend/src/controllers/` にコントローラーを作成
2. `backend/src/routes/index.ts` にルートを追加
3. 必要に応じてミドルウェアを追加

例:

```typescript
// controllers/exampleController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getExample = async (req: AuthRequest, res: Response) => {
  try {
    // ビジネスロジック
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// routes/index.ts
import { getExample } from '../controllers/exampleController';

router.get('/example', authenticate, getExample);
```

## フロントエンド開発

### 新しいページの追加

1. `frontend/src/pages/` にページコンポーネントを作成
2. `frontend/src/App.tsx` にルートを追加
3. 必要に応じてAPIサービスを `frontend/src/services/api.ts` に追加

### スタイリング

Tailwind CSSを使用:

```tsx
<div className="bg-primary-600 text-white p-4 rounded-lg">
  コンテンツ
</div>
```

カスタムカラー:
- `primary-*`: グリーン系（テニスコート）
- `tennis-court`: テニスコートカラー
- `tennis-ball`: テニスボールカラー

## テスト

### バックエンド

```bash
cd backend
npm test
```

### フロントエンド

```bash
cd frontend
npm test
```

## デバッグ

### バックエンド

VSCodeデバッグ設定（`.vscode/launch.json`）:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

### フロントエンド

React DevToolsを使用してコンポーネントの状態を確認。

## ビルド

### 本番用ビルド

```bash
# バックエンド
cd backend
npm run build

# フロントエンド
cd frontend
npm run build
```

## デプロイ

### Render

1. GitHubリポジトリをRenderに接続
2. `render.yaml` の設定に従って自動デプロイ
3. 環境変数を設定
4. カスタムドメインを設定（オプション）

詳細は [README.md](./README.md) を参照。

## トラブルシューティング

### データベース接続エラー

- DATABASE_URLが正しいか確認
- PostgreSQLが起動しているか確認
- データベースとユーザーが存在するか確認

### CORS エラー

- バックエンドの `.env` で `FRONTEND_URL` が正しいか確認
- フロントエンドの `.env` で `REACT_APP_API_URL` が正しいか確認

### 認証エラー

- JWTトークンの有効期限を確認
- localStorageのトークンをクリア

## コントリビューション

1. フィーチャーブランチを作成
2. 変更をコミット
3. プルリクエストを作成

## コーディング規約

### TypeScript

- strictモードを使用
- `any` の使用を避ける
- インターフェースで型を明示

### React

- 関数コンポーネントを使用
- カスタムフックで再利用可能なロジックを抽出
- プロップスの型を明示

### 命名規則

- ファイル名: PascalCase（コンポーネント）、camelCase（その他）
- コンポーネント: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE

## 今後の拡張予定

- [ ] 練習日程一覧ページ
- [ ] 参加履歴ページ
- [ ] 統計ページ（グラフ）
- [ ] 管理者ページ（メンバー管理、ボルバ管理）
- [ ] 設定ページ
- [ ] 通知スケジューラー（cron）
- [ ] メール通知機能
- [ ] モバイルアプリ（React Native）

## リソース

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [LINE Notify API](https://notify-bot.line.me/doc/ja/)
