# 起動方法

## 1. 環境変数ファイル作成
```powershell
Copy-Item .env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

`backend/.env` の `STRIPE_SECRET_KEY` と `STRIPE_WEBHOOK_SECRET`、`frontend/.env` の Firebase 設定値を必ず入力してください。

## 2. バックエンド起動
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

## 3. フロントエンド起動
```powershell
cd frontend
npm install
npm run dev
```

## 4. ブラウザで開く
`http://localhost:5173`

## セキュリティ運用
- `backend/.env` / `frontend/.env` は Git 管理しないでください（`.gitignore` で除外済み）。
- `instance/bibli.db` はローカル用途として扱い、Git へ追加しないでください。
- PR/Push 時は GitHub Actions の Secret Scan（gitleaks）を通してください。

# ログイン情報

- メールアドレス: `user1@example.com`
- パスワード: `password123`
