# Bibli Backend API

Flask + MySQL で構築された書籍取引プラットフォームのバックエンドAPI

## 技術スタック

- **Flask** 3.0.0 - Webフレームワーク
- **Flask-SQLAlchemy** 3.1.1 - ORM
- **Flask-JWT-Extended** 4.6.0 - JWT認証
- **MySQL** - データベース
- **Pillow** 10.1.0 - 画像処理

## セットアップ手順

### 1. Python仮想環境の作成

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 3. 環境変数の設定

`.env.example`を`.env`にコピーして設定を編集:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

`.env`ファイルを編集:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bibli_db

JWT_SECRET_KEY=your_jwt_secret_key_here
SECRET_KEY=your_secret_key_here
```

### 4. MySQLデータベースの作成

MySQLにログインしてデータベースを作成:

```sql
CREATE DATABASE bibli_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. アプリケーションの起動

```bash
python run.py
```

サーバーは `http://localhost:5000` で起動します。

### 6. データベーステーブルの自動作成

初回起動時に自動的にテーブルが作成されます。

## API エンドポイント

### 認証 API

#### ユーザー登録
```
POST /api/auth/register
Content-Type: application/json

{
  "userId": "user123",
  "name": "山田 太郎",
  "nameKana": "ヤマダ タロウ",
  "email": "yamada@example.com",
  "phone": "09012345678",
  "password": "password123"
}
```

#### ログイン
```
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "user123",  // メールアドレスまたはユーザーID
  "password": "password123"
}
```

#### 現在のユーザー情報取得
```
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>
```

### 商品 API

#### 商品一覧取得
```
GET /api/products?status=available&page=1&per_page=20
```

#### 商品詳細取得
```
GET /api/products/<product_id>
```

#### 商品出品
```
POST /api/products
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "村上春樹 ノルウェイの森",
  "description": "美品です。カバー付き。",
  "price": 800,
  "condition": "良好",
  "category": "小説",
  "isbn": "9784062748774"
}
```

#### 商品更新
```
PUT /api/products/<product_id>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "price": 750,
  "status": "sold"
}
```

#### 商品削除
```
DELETE /api/products/<product_id>
Authorization: Bearer <JWT_TOKEN>
```

#### 商品画像アップロード
```
POST /api/products/<product_id>/images
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Form Data:
  image: <ファイル>
```

#### 商品画像取得
```
GET /api/products/images/<image_id>
```

## データベーススキーマ

### users テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INT | 主キー |
| user_id | VARCHAR(50) | ユーザーID (ユニーク) |
| name | VARCHAR(100) | 氏名 |
| name_kana | VARCHAR(100) | フリガナ |
| email | VARCHAR(120) | メールアドレス (ユニーク) |
| phone | VARCHAR(20) | 電話番号 |
| password_hash | VARCHAR(255) | パスワードハッシュ |
| created_at | DATETIME | 作成日時 |
| updated_at | DATETIME | 更新日時 |

### products テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INT | 主キー |
| user_id | INT | 出品者ID (外部キー) |
| title | VARCHAR(200) | 商品名 |
| description | TEXT | 説明 |
| price | INT | 価格 |
| condition | VARCHAR(50) | 状態 |
| category | VARCHAR(100) | カテゴリ |
| isbn | VARCHAR(20) | ISBN |
| status | VARCHAR(20) | ステータス (available/reserved/sold) |
| created_at | DATETIME | 作成日時 |
| updated_at | DATETIME | 更新日時 |

### product_images テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INT | 主キー |
| product_id | INT | 商品ID (外部キー) |
| image_id | VARCHAR(100) | 画像固有ID (UUID) |
| image_url | VARCHAR(500) | 画像URL |
| display_order | INT | 表示順序 |
| created_at | DATETIME | 作成日時 |

## 開発

### デバッグモードで起動

```bash
export FLASK_ENV=development  # Mac/Linux
set FLASK_ENV=development     # Windows

python run.py
```

### データベースのリセット

```sql
DROP DATABASE bibli_db;
CREATE DATABASE bibli_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

その後、アプリケーションを再起動してテーブルを再作成。

## トラブルシューティング

### ModuleNotFoundError: No module named 'pymysql'

```bash
pip install pymysql
```

### Access denied for user 'root'@'localhost'

`.env`ファイルの`DB_PASSWORD`を確認してください。

### table already exists エラー

データベースをリセットするか、既存のテーブルを削除してください。

## ライセンス

MIT License
