# Render デプロイガイド

このガイドでは、テニスサークル管理アプリをRenderにデプロイする手順を説明します。

## 前提条件

- Renderアカウント（https://render.com）
- GitHubまたはGitLabアカウント
- このプロジェクトのコードがGitリポジトリにプッシュされている

## 料金

- PostgreSQL: $7/月（Starter 25GB）
- Web Service（バックエンド）: $7/月（Starter 512MB RAM）
- Static Site（フロントエンド）: **無料**

**合計**: 月額$14（約2,000円）

---

## ステップ1: PostgreSQLデータベースの作成

### 1.1 Renderダッシュボードにログイン
https://dashboard.render.com

### 1.2 新しいPostgreSQLを作成
1. 「New +」→「PostgreSQL」をクリック
2. 以下の設定を入力：
   - **Name**: `tennis-circle-db`
   - **Database**: `tennis_circle`
   - **User**: 自動生成される
   - **Region**: `Singapore` （日本に最も近いリージョン）
   - **PostgreSQL Version**: `16`
   - **Plan**: `Starter` ($7/月)

3. 「Create Database」をクリック

### 1.3 接続情報を保存
作成後、以下の情報をメモしてください：
- **Internal Database URL**: バックエンドから接続する際に使用
- **External Database URL**: ローカルからマイグレーション実行時に使用

---

## ステップ2: バックエンド Web Serviceの作成

### 2.1 新しいWeb Serviceを作成
1. 「New +」→「Web Service」をクリック
2. GitHubまたはGitLabリポジトリを接続
3. リポジトリを選択

### 2.2 設定を入力

#### 基本設定
- **Name**: `tennis-circle-backend`
- **Region**: `Singapore`
- **Branch**: `main` （または使用しているブランチ名）
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Starter` ($7/月)

#### 環境変数
「Environment」タブで以下を設定：

```
NODE_ENV=production
PORT=5001
DATABASE_URL=<ステップ1.3のInternal Database URLをここに貼り付け>
JWT_SECRET=<強力なランダム文字列を生成>
FRONTEND_URL=https://your-frontend-name.onrender.com
```

**JWT_SECRETの生成方法**:
ターミナルで以下を実行してランダム文字列を生成：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 デプロイを開始
「Create Web Service」をクリック

### 2.4 マイグレーション実行
デプロイ完了後、Renderの「Shell」タブから以下を実行：
```bash
npm run migrate
```

または、ローカルから実行：
```bash
DATABASE_URL="<External Database URL>" npm run migrate
```

---

## ステップ3: フロントエンド Static Siteの作成

### 3.1 新しいStatic Siteを作成
1. 「New +」→「Static Site」をクリック
2. 同じGitリポジトリを選択

### 3.2 設定を入力

#### 基本設定
- **Name**: `tennis-circle-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

#### 環境変数
「Environment」タブで以下を設定：

```
REACT_APP_API_URL=https://tennis-circle-backend.onrender.com
```

**重要**: `tennis-circle-backend` は、ステップ2.2で設定したバックエンドのNameに合わせてください。

### 3.3 デプロイを開始
「Create Static Site」をクリック

---

## ステップ4: 動作確認

### 4.1 バックエンドの確認
ブラウザで以下にアクセス：
```
https://tennis-circle-backend.onrender.com/health
```

レスポンス例：
```json
{"status":"OK","timestamp":"2025-11-10T..."}
```

### 4.2 フロントエンドの確認
ブラウザで以下にアクセス：
```
https://tennis-circle-frontend.onrender.com
```

ログインページが表示されればOK。

### 4.3 ログインテスト
- **学籍番号**: `ADMIN001`
- **パスワード**: `admin123`

---

## ステップ5: カスタムドメインの設定（オプション）

### 5.1 お名前.comでドメイン取得済みの場合

#### バックエンドのカスタムドメイン
1. Renderのバックエンド Web Service設定を開く
2. 「Settings」→「Custom Domains」
3. ドメインを追加（例: `api.your-domain.com`）
4. 表示されるCNAMEレコードをお名前.comのDNS設定に追加

#### フロントエンドのカスタムドメイン
1. Renderのフロントエンド Static Site設定を開く
2. 「Settings」→「Custom Domains」
3. ドメインを追加（例: `www.your-domain.com` または `your-domain.com`）
4. 表示されるCNAMEレコードをお名前.comのDNS設定に追加

### 5.2 DNS設定後の環境変数更新

#### バックエンドの環境変数を更新
```
FRONTEND_URL=https://www.your-domain.com
```

#### フロントエンドの環境変数を更新
```
REACT_APP_API_URL=https://api.your-domain.com
```

両方とも再デプロイが必要です。

---

## トラブルシューティング

### デプロイが失敗する場合

#### ビルドエラー
- Renderのログを確認
- `package.json` の依存関係を確認
- ローカルで `npm run build` が成功するか確認

#### データベース接続エラー
- `DATABASE_URL` が正しく設定されているか確認
- Internal Database URL を使用しているか確認（External ではなく）

#### CORSエラー
- バックエンドの `FRONTEND_URL` が正しく設定されているか確認
- フロントエンドの `REACT_APP_API_URL` が正しく設定されているか確認

### パフォーマンスが遅い場合
- Renderの無料プランはスリープするため、初回アクセスが遅い
- 有料プラン（$7/月）では常時稼働

---

## セキュリティチェックリスト

✅ JWT_SECRETを強力なランダム文字列に変更済み
✅ 本番データベースの管理者パスワードを変更済み
✅ NODE_ENV=production を設定済み
✅ .envファイルをGitにコミットしていない
✅ レート制限が有効（100 req/15min）

---

## デプロイ後のメンテナンス

### 自動デプロイの設定
RenderはGitリポジトリの変更を自動検知してデプロイします。
- `main` ブランチにpushすると自動的に再デプロイ

### データベースバックアップ
Render Starter プランには自動バックアップが含まれています。
- 毎日自動バックアップ
- 7日間保存

### ログの確認
Renderダッシュボードの「Logs」タブでリアルタイムログを確認できます。

---

## サポート

問題が発生した場合：
1. Renderのログを確認
2. ブラウザの開発者ツールでエラーを確認
3. 環境変数が正しく設定されているか再確認

デプロイ成功をお祈りします！🎾
