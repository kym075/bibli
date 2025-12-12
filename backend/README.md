# Bibli 購入機能バックエンドAPI

Flaskを使用した本のマーケットプレイス「Bibli」の購入機能バックエンドAPIです。

## 機能概要

- 注文作成（購入処理）with Stripe決済
- 購入履歴取得
- 注文詳細取得
- 注文キャンセル
- Stripe PaymentIntent連携

## 技術スタック

- **Python**: 3.8+
- **Flask**: 3.0.0
- **Flask-SQLAlchemy**: MySQLデータベースORM
- **Flask-CORS**: CORS対応
- **MySQL**: データベース
- **Stripe**: 決済処理

## プロジェクト構造

```
backend/
├── app.py                              # メインアプリケーション
├── config.py                           # 設定ファイル
├── requirements.txt                    # 依存パッケージ
├── .env.example                        # 環境変数サンプル
├── models/
│   └── database.py                     # データベースモデル（Order, Product）
├── routes/
│   └── purchase_routes.py              # 購入関連のルーティング
├── services/
│   ├── stripe_payment_service.py       # Stripe決済サービス
│   └── payment_service.py              # モック決済サービス（参考用）
└── README.md                           # このファイル
```

## セットアップ手順

### 1. MySQLデータベースの準備

MySQLサーバーをインストールし、データベースを作成します。

```sql
CREATE DATABASE bibli CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成します。

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下の情報を設定します：

```env
# データベース設定
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bibli
DB_USER=root
DB_PASSWORD=your_mysql_password

# Stripe API設定
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# アプリケーション設定
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key_here
```

**Stripe APIキーの取得方法:**
1. [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
2. 「開発者」→「APIキー」を選択
3. テスト用の「公開可能キー」と「シークレットキー」をコピー

### 3. 仮想環境の作成と有効化

```bash
# Windowsの場合
cd backend
python -m venv venv
venv\Scripts\activate

# macOS/Linuxの場合
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 4. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 5. データベーステーブルの作成

```bash
python app.py
```

初回起動時に、MySQLデータベースに必要なテーブルが自動生成されます。

### 6. サーバーの起動

```bash
python app.py
```

サーバーが起動すると、以下のURLでアクセスできます:
- **ベースURL**: http://localhost:5000
- **ヘルスチェック**: http://localhost:5000/health

## API エンドポイント

### 1. 注文作成（購入処理）

**エンドポイント**: `POST /api/purchase/create`

**説明**: Stripe PaymentIntentを作成し、注文をデータベースに保存します。

**リクエストボディ**:
```json
{
  "user_id": 1,
  "product_id": 123,
  "shipping_postal_code": "150-0001",
  "shipping_address": "東京都渋谷区神宮前1-2-3",
  "shipping_name": "山田太郎",
  "payment_method": "credit_card",
  "payment_card_last4": "1234"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "message": "注文が正常に完了しました",
  "data": {
    "order_number": "BL-2025121201",
    "order_id": 1,
    "total_amount": 1880,
    "estimated_delivery_date": "2025-12-17",
    "payment_intent_id": "pi_xxxxxxxxxxxxx",
    "client_secret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx"
  }
}
```

**client_secretの使い方:**
フロントエンドでStripe Elements/SDKを使用して決済を完了させます。

### 2. 購入履歴取得

**エンドポイント**: `GET /api/purchase/history/<user_id>`

**クエリパラメータ**:
- `limit`: 取得件数（デフォルト: 20）
- `offset`: オフセット（デフォルト: 0）

**例**: `GET /api/purchase/history/1?limit=10&offset=0`

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "BL-2025121201",
        "product_name": "吾輩は猫である",
        "product_price": 1500,
        "shipping_fee": 230,
        "service_fee": 150,
        "total_amount": 1880,
        "status": "paid",
        "created_at": "2025-12-12T10:30:00"
      }
    ],
    "total_count": 1,
    "limit": 10,
    "offset": 0
  }
}
```

### 3. 注文詳細取得

**エンドポイント**: `GET /api/purchase/order/<order_id>`

**例**: `GET /api/purchase/order/1`

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "BL-2025121201",
    "product_name": "吾輩は猫である",
    "product_price": 1500,
    "shipping_fee": 230,
    "service_fee": 150,
    "total_amount": 1880,
    "shipping_postal_code": "150-0001",
    "shipping_address": "東京都渋谷区神宮前1-2-3",
    "shipping_name": "山田太郎",
    "payment_method": "credit_card",
    "status": "paid",
    "estimated_delivery_date": "2025-12-17T00:00:00"
  }
}
```

### 4. 注文キャンセル

**エンドポイント**: `POST /api/purchase/order/<order_id>/cancel`

**例**: `POST /api/purchase/order/1/cancel`

**レスポンス例**:
```json
{
  "success": true,
  "message": "注文がキャンセルされました",
  "data": {
    "id": 1,
    "order_number": "BL-2025121201",
    "status": "cancelled"
  }
}
```

## データベーススキーマ

### Orderテーブル
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | Integer | 主キー |
| order_number | String(50) | 注文番号（例: BL-2025121201） |
| user_id | Integer | ユーザーID |
| product_id | Integer | 商品ID |
| product_name | String(200) | 商品名 |
| product_price | Integer | 商品価格 |
| shipping_fee | Integer | 配送料 |
| service_fee | Integer | 手数料 |
| total_amount | Integer | 合計金額 |
| shipping_postal_code | String(10) | 配送先郵便番号 |
| shipping_address | String(300) | 配送先住所 |
| shipping_name | String(100) | 受取人名 |
| payment_method | String(50) | 支払い方法 |
| payment_card_last4 | String(4) | カード下4桁 |
| status | String(50) | ステータス |
| created_at | DateTime | 作成日時 |
| updated_at | DateTime | 更新日時 |
| estimated_delivery_date | DateTime | 配送予定日 |

### Productテーブル（簡易版）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | Integer | 主キー |
| title | String(200) | 書籍タイトル |
| author | String(100) | 著者 |
| price | Integer | 価格 |
| stock | Integer | 在庫数 |
| category | String(50) | カテゴリ |
| condition | String(50) | 商品状態 |
| seller_id | Integer | 出品者ID |
| image_url | String(500) | 画像URL |
| created_at | DateTime | 作成日時 |

## 注文ステータス

- `pending`: 注文作成中
- `paid`: 決済完了
- `shipped`: 発送済み
- `completed`: 取引完了
- `cancelled`: キャンセル済み

## Stripe決済の流れ

### サーバーサイド（このAPI）

1. **PaymentIntent作成**: `/api/purchase/create`を呼び出すと、Stripe PaymentIntentが作成されます
2. **client_secretを返却**: フロントエンドに`client_secret`を返します
3. **注文をDBに保存**: 注文情報をMySQLに保存します

### フロントエンド（React）

1. **client_secretを受け取る**: APIから`client_secret`を取得
2. **Stripe Elementsで決済**: Stripe.jsを使用してカード情報を入力
3. **決済確認**: `stripe.confirmCardPayment(client_secret)`を実行
4. **完了画面へ遷移**: 決済成功後、購入完了ページへ

### Stripeの設定例（フロントエンド）

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

const handleCheckout = async (orderData) => {
  // 1. バックエンドAPIで注文作成
  const response = await fetch('http://localhost:5000/api/purchase/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  const { data } = await response.json();
  const { client_secret } = data;

  // 2. Stripeで決済実行
  const stripe = await stripePromise;
  const result = await stripe.confirmCardPayment(client_secret, {
    payment_method: {
      card: cardElement, // Stripe Card Element
      billing_details: {
        name: orderData.shipping_name,
      },
    },
  });

  if (result.error) {
    // エラー処理
    console.error(result.error.message);
  } else {
    // 成功: 購入完了ページへ
    navigate('/purchase-complete');
  }
};
```

## フロントエンドとの連携

### Reactからの呼び出し例

```javascript
// 購入処理
const createOrder = async (orderData) => {
  const response = await fetch('http://localhost:5000/api/purchase/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const result = await response.json();
  return result;
};

// 購入履歴取得
const getPurchaseHistory = async (userId) => {
  const response = await fetch(`http://localhost:5000/api/purchase/history/${userId}`);
  const result = await response.json();
  return result;
};
```

## 開発時の注意点

### CORS設定

現在、以下のオリジンからのアクセスを許可しています:
- `http://localhost:5173` (Vite開発サーバー)
- `http://localhost:3000` (一般的なReact開発サーバー)

本番環境では[config.py](config.py:27)の`CORS_ORIGINS`を適切なオリジンに変更してください。

### セキュリティ

現在の実装は開発用です。本番環境では以下の対応が必要です:

1. **認証・認可**: JWT、OAuth等の実装
2. **環境変数の保護**: `.env`ファイルを`.gitignore`に追加
3. **HTTPS通信**: SSL/TLS証明書の設定
4. **入力バリデーション**: より厳密なバリデーション
5. **レート制限**: APIの不正利用防止
6. **ログ記録**: アクセスログ、エラーログの記録
7. **Webhook対応**: Stripe Webhookでの決済完了確認

### Stripe Webhook（推奨）

本番環境では、Stripe Webhookを設定して決済完了を確実に検知することを推奨します。

```python
# routes/webhook_routes.py（例）
@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )

        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # 注文ステータスを更新

        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
```

## トラブルシューティング

### MySQL接続エラー

```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server...")
```

**解決方法**:
1. MySQLサーバーが起動していることを確認
2. `.env`ファイルの接続情報が正しいか確認
3. ファイアウォール設定を確認

### Stripe APIキーエラー

```
stripe.error.AuthenticationError: Invalid API Key provided
```

**解決方法**:
1. `.env`ファイルに正しいStripe APIキーが設定されているか確認
2. テスト環境では`sk_test_`で始まるキーを使用
3. Stripe Dashboardでキーが有効か確認

### ポート5000が使用中の場合

[app.py](app.py:83)の最後の行を変更:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # ポート番号を変更
```

### データベースのリセット

```sql
-- MySQLに接続
DROP DATABASE bibli;
CREATE DATABASE bibli CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

その後、サーバーを再起動してテーブルを再作成します。

## テスト用のStripeカード番号

Stripeのテストモードでは、以下のカード番号が使用できます：

- **成功**: `4242 4242 4242 4242`
- **認証が必要**: `4000 0025 0000 3155`
- **失敗**: `4000 0000 0000 9995`

有効期限: 将来の任意の日付（例: 12/34）
CVC: 任意の3桁（例: 123）

## 今後の拡張案

- [x] Stripe決済統合
- [x] MySQL対応
- [ ] Stripe Webhook対応
- [ ] 商品在庫管理の強化
- [ ] メール通知機能
- [ ] 管理者用ダッシュボード
- [ ] 商品検索API
- [ ] レビュー・評価機能
- [ ] クーポン・ポイントシステム
- [ ] 配送追跡機能

## 参考リンク

- [Stripe公式ドキュメント](https://stripe.com/docs)
- [Flask公式ドキュメント](https://flask.palletsprojects.com/)
- [SQLAlchemyドキュメント](https://docs.sqlalchemy.org/)

## ライセンス

MIT License

## 作成者

Bibli開発チーム
