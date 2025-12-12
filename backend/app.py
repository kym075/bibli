# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta  # ← 修正：timedelta追加
import secrets
from decimal import Decimal

app = Flask(__name__)
CORS(app)

# --- 設定 ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/bibli_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = secrets.token_hex(32)

db = SQLAlchemy(app)

# ============================
# モデル定義
# ============================

class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.BigInteger, primary_key=True)
    user_name = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255))
    bio = db.Column(db.String(1000))
    address = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.String(20))
    status = db.Column(db.SmallInteger, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # ← 修正
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)  # ← 修正
    real_name = db.Column(db.String(10), nullable=False)


class Product(db.Model):
    __tablename__ = "products"

    product_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    seller_id = db.Column(db.BigInteger, db.ForeignKey("users.user_id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.category_id"), nullable=False)
    condition_type = db.Column(db.SmallInteger, nullable=False)
    isbn = db.Column(db.String(20))
    status = db.Column(db.SmallInteger, nullable=False)
    shipping_method = db.Column(db.SmallInteger, nullable=False)
    shipping_fee_payer = db.Column(db.SmallInteger, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # ← 修正
    update_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)  # ← 修正


class Category(db.Model):
    __tablename__ = 'categories'
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(50), nullable=False)
    parent_category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'), nullable=True)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # ← 修正
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)  # ← 修正


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

    required = ['user_name', 'email', 'password', 'address', 'phone_number', 'real_name']
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
        phone_number=data['phone_number'],
        birth_date=data.get('birth_date'),
        status=int(data.get('status', 1)),
        real_name=data['real_name']
    )

    try:
        db.session.add(user)
        db.session.commit()
    except:
        db.session.rollback()
        return jsonify({"error": "DB書き込みエラー"}), 500

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
        "exp": datetime.utcnow() + timedelta(hours=24)    # ← 修正
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
# カテゴリ一覧
# ============================
@app.route('/api/categories', methods=['GET'])
def get_categories():
    cats = Category.query.order_by(Category.sort_order).all()
    result = []
    for c in cats:
        result.append({
            "category_id": c.category_id,
            "category_name": c.category_name,
            "parent_category_id": c.parent_category_id,
            "sort_order": c.sort_order
        })
    return jsonify(result), 200


# ============================
# 商品一覧 / 商品作成
# ============================
@app.route('/api/products', methods=['GET'])
def get_products():
    prods = Product.query.all()
    out = []
    for p in prods:
        out.append({
            "product_id": p.product_id,
            "seller_id": p.seller_id,
            "title": p.title,
            "description": p.description or "",
            "price": str(p.price),
            "category_id": p.category_id,
            "condition_type": p.condition_type,
            "isbn": p.isbn,
            "status": p.status,
            "shipping_method": p.shipping_method,
            "shipping_fee_payer": p.shipping_fee_payer
        })
    return jsonify(out), 200


@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json() or {}

    required = ['seller_id', 'title', 'price', 'category_id', 'condition_type', 'shipping_method', 'shipping_fee_payer']
    for r in required:
        if r not in data:
            return jsonify({"error": f"{r} が必要です"}), 400

    try:
        price = Decimal(str(data['price']))
    except:
        return jsonify({"error": "price の形式が不正"}), 400

    product = Product(
        seller_id=data['seller_id'],
        title=data['title'],
        description=data.get('description'),
        price=price,
        category_id=data['category_id'],
        condition_type=int(data['condition_type']),
        isbn=data.get('isbn'),
        status=int(data.get('status', 1)),
        shipping_method=int(data['shipping_method']),
        shipping_fee_payer=int(data['shipping_fee_payer'])
    )

    try:
        db.session.add(product)
        db.session.commit()
    except:
        db.session.rollback()
        return jsonify({"error": "DB書き込みエラー"}), 500

    return jsonify({"message": "Product created", "product_id": product.product_id}), 201


# ============================
# エントリポイント
# ============================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
