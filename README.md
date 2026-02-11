# Bibli

フロントエンド(React/Vite)とバックエンド(Flask)で構成されたアプリです。

## 前提
- Python 3.10+
- Node.js 18+

## セットアップ
### 1. 環境変数
- ルートの `.env.example` を `.env` にコピーして設定
- `frontend/.env.example` を `frontend/.env` にコピーして設定

### 2. バックエンド
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

### 3. フロントエンド
```bash
cd frontend
npm install
npm run dev
```

## 開発メモ
- APIベースURL: `VITE_API_BASE_URL`
- Firebase設定: `VITE_FIREBASE_*`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- DB: `DATABASE_URL`
- Firebase Admin: `FIREBASE_SERVICE_ACCOUNT_JSON`
