# テニスサークル業務効率化Webアプリケーション

テニスサークルの業務を効率化するWebアプリケーション。LINE投票で管理していた参加申し込み、手作業で行っていたボルバ（ボールバッグ）管理、コート代精算などを自動化します。

## 技術スタック

### バックエンド
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT認証
- bcrypt（パスワードハッシュ化）

### フロントエンド
- React
- TypeScript
- Tailwind CSS
- React Router
- Axios

### 通知
- LINE Notify API

### デプロイ
- Render（推奨）
- カスタムドメイン対応

## 主要機能

### 1. 認証・権限管理
- メールアドレス + パスワード認証
- 管理者（admin）と一般メンバー（member）の2つの役割
- 新規登録は管理者承認制

### 2. メンバー管理
- メンバー一覧表示
- 新規メンバー登録申請
- 管理者による承認/却下
- LINE Notify Token設定（個別通知用）

### 3. 練習日程管理
- 管理者による練習日程の登録/編集/削除
- 日時、場所、面数、定員の管理
- 参加募集締め切り設定

### 4. 参加申し込み管理
- メンバーによる参加申し込み/変更
- 定員管理（面数 × 1面あたり定員）
- キャンセル待ち機能
- リアルタイム参加者数表示

### 5. ボルバ（ボールバッグ）管理
- ボルバの登録・管理
- 持ち帰り記録
- 年間持ち帰り回数統計
- 次回練習のボルバ担当者自動抽出

### 6. 面数削減提案機能
- 締め切り時に参加者数から適正面数を計算
- コスト削減提案の通知

### 7. コート代管理
- 練習ごとのコート代入力
- 参加者数での自動割り勘計算
- 年間支払い総額表示
- 年会費との差額計算

### 8. 全体設定
- デフォルト締め切り日数・時刻
- デフォルト1面あたり定員
- 年会費金額
- その他各種設定

### 9. LINE Notify通知
- 新規練習登録時の通知
- 締め切り前日のリマインダー
- ボルバ持参リマインダー
- 面数削減提案（管理者向け）

### 10. 統計・可視化
- メンバー別参加率
- ボルバ持ち帰りランキング
- コート代支払い統計

## セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL 14以上
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd サークルアプリ
```

### 2. バックエンドのセットアップ

```bash
cd backend
npm install
```

環境変数の設定（.envファイルを作成）:

```bash
cp .env.example .env
```

.envファイルを編集:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/tennis_circle
JWT_SECRET=your-secret-key-here
LINE_NOTIFY_TOKEN=your-line-notify-token
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

データベースのマイグレーション:

```bash
npm run migrate
```

開発サーバーの起動:

```bash
npm run dev
```

### 3. フロントエンドのセットアップ

```bash
cd frontend
npm install
```

環境変数の設定（.envファイルを作成）:

```bash
cp .env.example .env
```

.envファイルを編集:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

開発サーバーの起動:

```bash
npm start
```

アプリケーションは http://localhost:3000 で起動します。

## 初期管理者の作成

アプリケーションを初めて使用する際は、最初の管理者ユーザーを手動で作成する必要があります。

1. 新規登録画面から登録
2. データベースで直接 `is_active` を `true`、`role` を `'admin'` に変更

```sql
UPDATE users SET is_active = true, role = 'admin' WHERE email = 'your-email@example.com';
```

## デプロイ（Render）

### 1. データベースの作成

1. Renderダッシュボードで「New PostgreSQL」を選択
2. データベース名、リージョンを設定
3. 作成後、Internal Database URLをコピー

### 2. バックエンドのデプロイ

1. Renderダッシュボードで「New Web Service」を選択
2. GitHubリポジトリを接続
3. 以下の設定を入力:
   - **Name**: tennis-circle-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install && npm run build && npm run migrate`
   - **Start Command**: `npm start`
4. 環境変数を設定:
   - `DATABASE_URL`: PostgreSQLのInternal Database URL
   - `JWT_SECRET`: ランダムな文字列
   - `LINE_NOTIFY_TOKEN`: LINE Notifyトークン
   - `NODE_ENV`: production
   - `FRONTEND_URL`: フロントエンドのURL

### 3. フロントエンドのデプロイ

1. Renderダッシュボードで「New Static Site」を選択
2. 以下の設定を入力:
   - **Name**: tennis-circle-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: build
3. 環境変数を設定:
   - `REACT_APP_API_URL`: バックエンドのURL + `/api`

### 4. カスタムドメインの設定

1. Renderの各サービスの設定から「Custom Domain」を選択
2. `tennis.etsu-dev.com` などを追加
3. DNSレコードを設定（AレコードまたはCNAMEレコード）

## API エンドポイント

### 認証
- `POST /api/auth/register` - 新規登録
- `POST /api/auth/login` - ログイン

### ユーザー
- `GET /api/users` - ユーザー一覧（管理者のみ）
- `GET /api/users/:id` - ユーザー詳細
- `PUT /api/users/:id/approve` - ユーザー承認（管理者のみ）
- `PUT /api/users/:id` - ユーザー情報更新
- `DELETE /api/users/:id` - ユーザー削除（管理者のみ）

### 練習日程
- `POST /api/practices` - 練習登録（管理者のみ）
- `GET /api/practices` - 練習一覧
- `GET /api/practices/:id` - 練習詳細
- `PUT /api/practices/:id` - 練習更新（管理者のみ）
- `DELETE /api/practices/:id` - 練習削除（管理者のみ）

### 参加申し込み
- `POST /api/participations` - 参加申し込み
- `GET /api/participations/practice/:practice_id` - 練習の参加者一覧
- `GET /api/participations/my` - 自分の参加履歴
- `GET /api/participations/stats/:practice_id` - 参加統計
- `DELETE /api/participations/:id` - 参加キャンセル

### ボルバ
- `POST /api/ball-bags` - ボルバ登録（管理者のみ）
- `GET /api/ball-bags` - ボルバ一覧
- `POST /api/ball-bags/takeaway` - 持ち帰り記録（管理者のみ）
- `GET /api/ball-bags/:ball_bag_id/history` - 持ち帰り履歴
- `GET /api/ball-bags/holders/:practice_id` - 練習のボルバ担当者
- `GET /api/ball-bags/stats` - 持ち帰り統計

### コート代
- `POST /api/court-fees` - コート代記録（管理者のみ）
- `GET /api/court-fees/practice/:practice_id` - 練習のコート代
- `GET /api/court-fees/user/:user_id` - ユーザーの支払い統計
- `GET /api/court-fees/stats` - 全体の支払い統計

### 設定
- `GET /api/settings` - 設定一覧
- `GET /api/settings/:key` - 設定取得
- `PUT /api/settings/:key` - 設定更新（管理者のみ）

## LINE Notify の設定

### グループ通知の設定（管理者）

1. LINE Notifyにアクセス: https://notify-bot.line.me/
2. 「マイページ」→「トークンを発行する」
3. トークン名を入力（例: テニスサークル通知）
4. 通知を送信するグループを選択
5. トークンをコピーして環境変数に設定

### 個別通知の設定（各メンバー）

1. アプリケーションにログイン
2. 「マイページ」→「LINE Notify設定」
3. LINE Notifyにアクセスしてトークンを発行
4. トークンをアプリケーションに登録

## セキュリティ

- パスワードはbcryptでハッシュ化
- JWT認証
- SQL Injection対策（パラメータ化クエリ）
- XSS対策（React自動エスケープ）
- CSRF対策（トークンベース認証）
- Rate Limiting
- Helmet.js（セキュリティヘッダー）

## ライセンス

MIT

## サポート

問題が発生した場合は、GitHubのIssuesでお知らせください。
