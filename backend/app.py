# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import secrets
from decimal import Decimal
 
app = Flask(__name__)
 
# ---------------------------
# CORS（完全対応版）
# ---------------------------
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
 
# ---------------------------
# 設定
# ---------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/bibli_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = secrets.token_hex(32)
 
db = SQLAlchemy(app)
 
# ============================
# モデル定義
# ============================
 
class User(db.Model):
    __tablename__ = "users"
 
    user_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)  # ← 修正！
    user_name = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255))
    bio = db.Column(db.String(1000))
    address = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.String(20))
    status = db.Column(db.SmallInteger, nullable=False, default=1)  # ← デフォルト設定
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    real_name = db.Column(db.String(10), nullable=False)
 
 
# ============================
# ヘルスチェック
# ============================
@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "hello"}), 200
 
 
# ============================
# ユーザー登録
# ============================
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
 
    # React 側と一致するように修正
    required = ['user_name', 'email', 'password', 'address', 'phone', 'real_name']
    for r in required:
        if not data.get(r):
            return jsonify({"error": f"{r} が必要です"}), 400
 
    if User.query.filter_by(user_name=data['user_name']).first():
        return jsonify({"error": "user_name は既に使われています"}), 409
 
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "email は既に使われています"}), 409
 
    hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256')
 
    user = User(
        user_name=data['user_name'],
        email=data['email'],
        password=hashed_pw,
        profile_image=data.get('profile_image'),
        bio=data.get('bio', ''),
        address=data['address'],
        phone_number=data['phone'],     # ← 修正！
        birth_date=data.get('birth_date'),
        status=1,                       # ← デフォルト固定
        real_name=data['real_name']
    )
 
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "DB書き込みエラー", "detail": str(e)}), 500
 
    return jsonify({
        "message": "ユーザー登録完了",
        "user": {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "email": user.email
        }
    }), 201
 
 
# ============================
# ログイン
# ============================
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
 
    if not email or not password:
        return jsonify({"error": "email と password が必要"}), 400
 
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "認証失敗"}), 401
 
    payload = {
        "user_id": int(user.user_id),
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
 
    return jsonify({
        "token": token,
        "user": {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "email": user.email
        }
    }), 200
 
 
# ============================
# エントリポイント
# ============================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)