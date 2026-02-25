# 起動方法

## 1. 環境変数ファイル作成
```powershell
Copy-Item .env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

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

# ログイン情報

- メールアドレス: `user1@example.com`
- パスワード: `password123`
