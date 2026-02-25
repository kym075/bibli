# Bibli（提出用）

Bibli はフロントエンド（React/Vite）とバックエンド（Flask）で構成された、書籍売買プラットフォームです。

## 動作環境
- Python 3.10 以上
- Node.js 18 以上

## 提出時の前提
- DB は SQLite を使用します。
- `DATABASE_URL=sqlite:///instance/bibli.db` を使用します。
- `instance/bibli.db` がなくても、起動時に必要テーブルは自動作成されます。

## セットアップ（Windows PowerShell）
1. 環境変数ファイルを作成します。
```powershell
Copy-Item .env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

2. バックエンドを起動します。
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

3. フロントエンドを起動します。
```powershell
cd frontend
npm install
npm run dev
```

4. ブラウザで開きます。
- `http://localhost:5173`

## 環境変数
### バックエンド（`backend/.env`）
- `DATABASE_URL`（任意。未設定時は `sqlite:///instance/bibli.db`）
- `UPLOAD_FOLDER`（任意、既定: `uploads`）
- `STRIPE_SECRET_KEY`（任意）
- `STRIPE_WEBHOOK_SECRET`（任意）
- `FIREBASE_SERVICE_ACCOUNT_JSON`（任意）

### フロントエンド（`frontend/.env`）
- `VITE_API_BASE_URL`（必須）
- `VITE_FIREBASE_*`（ログイン/登録を使う場合は必須）

## 注意事項
- Firebase サービスアカウント鍵や Stripe 実鍵は提出物に含めないでください。
- サンプル鍵は `firebase.service-account.example.json` を参照してください。
