# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
from datetime import datetime, timedelta
import secrets
from decimal import Decimal
import os
import stripe
from dotenv import load_dotenv
 
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
 
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
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, os.getenv("UPLOAD_FOLDER", "uploads"))

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
stripe.api_key = STRIPE_SECRET_KEY
 
db = SQLAlchemy(app)

FORUM_CATEGORY_LABELS = {
    "chat": "雑談",
    "question": "質問",
    "discussion": "考察",
    "recruitment": "募集",
    "recommendation": "おすすめ",
    "review": "感想・レビュー"
}

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed_image(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


def _save_product_image(file_storage):
    if not file_storage or not file_storage.filename:
        return ""
    if not _allowed_image(file_storage.filename):
        return None

    original_name = secure_filename(file_storage.filename)
    ext = original_name.rsplit(".", 1)[1].lower()
    unique_name = f"{secrets.token_hex(16)}.{ext}"
    upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'products')
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_name)
    file_storage.save(file_path)
    return f"uploads/products/{unique_name}"
 
# ============================
# モデル定義
# ============================
 
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    user_name = db.Column(db.String(20))
    name = db.Column(db.String(100))
    name_kana = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255))
    profile_image = db.Column(db.String(255))
    bio = db.Column(db.String(1000))
    address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    birth_date = db.Column(db.String(20))
    status = db.Column(db.SmallInteger, default=1)
    real_name = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Integer, nullable=False)
    condition = db.Column(db.String(50))  # 'excellent', 'good', 'fair'
    sale_type = db.Column(db.String(50))  # 'fixed', 'auction', 'negotiable'
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    category = db.Column(db.String(100))
    image_url = db.Column(db.String(255))
    status = db.Column(db.SmallInteger, default=1)  # 1: 販売中, 0: 売り切れ
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Purchase(db.Model):
    __tablename__ = "purchases"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    buyer_email = db.Column(db.String(120))
    amount = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(10), default='jpy')
    stripe_session_id = db.Column(db.String(255), unique=True, nullable=False)
    stripe_payment_intent_id = db.Column(db.String(255))
    status = db.Column(db.String(30), default='paid')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product')


class ProductView(db.Model):
    __tablename__ = "product_views"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product')


class ForumThread(db.Model):
    __tablename__ = "forum_threads"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    author_email = db.Column(db.String(120))
    view_count = db.Column(db.Integer, default=0)
    like_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ForumComment(db.Model):
    __tablename__ = "forum_comments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    thread_id = db.Column(db.Integer, db.ForeignKey('forum_threads.id'), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    author_email = db.Column(db.String(120))
    content = db.Column(db.Text, nullable=False)
    like_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    thread = db.relationship('ForumThread', backref=db.backref('comments', cascade='all, delete-orphan'))


class ForumFollow(db.Model):
    __tablename__ = "forum_follows"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    follower_email = db.Column(db.String(120), nullable=False)
    followee_email = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
 
 
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

    # React 側と一致するように修正（phone_numberを受け付ける）
    phone = data.get('phone_number') or data.get('phone')
    required_fields = {
        'user_name': data.get('user_name'),
        'email': data.get('email'),
        'password': data.get('password'),
        'address': data.get('address'),
        'phone': phone,
        'real_name': data.get('real_name'),
        'name_kana': data.get('name_kana'),
        'birth_date': data.get('birth_date')
    }

    for field, value in required_fields.items():
        if not value:
            return jsonify({"error": f"{field} が必要です"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "email は既に使われています"}), 409

    hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256')

    # user_idを自動生成（email のローカル部分を使用）
    user_id_base = data['email'].split('@')[0]

    user = User(
        user_id=user_id_base,
        user_name=data['user_name'],
        name=data['user_name'],
        name_kana=data.get('name_kana', ''),
        email=data['email'],
        phone=phone,
        phone_number=phone,
        password_hash=hashed_pw,
        password=hashed_pw,
        profile_image=data.get('profile_image'),
        bio=data.get('bio', ''),
        address=data['address'],
        birth_date=data.get('birth_date'),
        status=1,
        real_name=data['real_name'],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
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
# ユーザー情報取得（メールアドレスで検索）
# ============================
@app.route('/api/user/<email>', methods=['GET'])
def get_user(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    return jsonify({
        "id": user.id,
        "user_id": user.user_id,
        "user_name": user.user_name or user.name,
        "email": user.email,
        "profile_image": user.profile_image
    }), 200


# ============================
# プロフィール取得（メールアドレスで検索）
# ============================
@app.route('/api/profile/<email>', methods=['GET'])
def get_profile(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    follower_count = ForumFollow.query.filter_by(followee_email=user.email).count()
    following_count = ForumFollow.query.filter_by(follower_email=user.email).count()

    return jsonify({
        "id": user.id,
        "user_id": user.user_id,
        "user_name": user.user_name or user.name,
        "email": user.email,
        "profile_image": user.profile_image,
        "bio": user.bio,
        "address": user.address,
        "phone_number": user.phone_number or user.phone,
        "birth_date": user.birth_date,
        "real_name": user.real_name or user.name,
        "name_kana": user.name_kana,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "status": user.status,
        "follower_count": follower_count,
        "following_count": following_count
    }), 200


# ============================
# プロフィール取得（user_idで検索）
# ============================
@app.route('/api/profile/id/<user_id>', methods=['GET'])
def get_profile_by_id(user_id):
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    follower_count = ForumFollow.query.filter_by(followee_email=user.email).count()
    following_count = ForumFollow.query.filter_by(follower_email=user.email).count()

    return jsonify({
        "id": user.id,
        "user_id": user.user_id,
        "user_name": user.user_name or user.name,
        "email": user.email,
        "profile_image": user.profile_image,
        "bio": user.bio,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "follower_count": follower_count,
        "following_count": following_count
    }), 200


# ============================
# プロフィール更新
# ============================
@app.route('/api/profile/<email>', methods=['PUT'])
def update_profile(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    data = request.get_json() or {}

    # 更新可能なフィールドのみ更新
    if 'user_name' in data:
        user.user_name = data['user_name']
        user.name = data['user_name']  # nameも同期

    if 'profile_image' in data:
        user.profile_image = data['profile_image']

    if 'bio' in data:
        user.bio = data['bio']

    if 'address' in data:
        user.address = data['address']

    if 'phone_number' in data:
        user.phone_number = data['phone_number']
        user.phone = data['phone_number']  # phoneも同期

    if 'birth_date' in data:
        user.birth_date = data['birth_date']

    if 'real_name' in data:
        user.real_name = data['real_name']

    if 'name_kana' in data:
        user.name_kana = data['name_kana']

    # パスワード変更がある場合
    if 'password' in data and data['password']:
        hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256')
        user.password = hashed_pw
        user.password_hash = hashed_pw  # password_hashも同期

    user.updated_at = datetime.utcnow()

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "更新に失敗しました", "detail": str(e)}), 500

    return jsonify({
        "message": "プロフィールを更新しました",
        "user": {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "email": user.email,
            "profile_image": user.profile_image,
            "bio": user.bio
        }
    }), 200


# ============================
# 商品検索・一覧取得（検索・フィルター・ソート対応）
# ============================
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        # クエリパラメータを取得
        keyword = request.args.get('q', '').strip()
        min_price = request.args.get('min_price', type=int)
        max_price = request.args.get('max_price', type=int)
        condition = request.args.get('condition', '').strip()
        sale_type = request.args.get('sale_type', '').strip()
        seller_id = request.args.get('seller_id', type=int)
        sort = request.args.get('sort', 'newest')
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)

        # 基本クエリ
        query = Product.query.filter(Product.status == 1)

        # キーワード検索（タイトル、説明、カテゴリを検索）
        if keyword:
            search_pattern = f"%{keyword}%"
            query = query.filter(
                db.or_(
                    Product.title.like(search_pattern),
                    Product.description.like(search_pattern),
                    Product.category.like(search_pattern)
                )
            )

        # 価格フィルター
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # 商品状態フィルター
        if condition:
            query = query.filter(Product.condition == condition)

        # 販売形式フィルター
        if sale_type:
            query = query.filter(Product.sale_type == sale_type)

        # 出品者フィルター
        if seller_id:
            query = query.filter(Product.seller_id == seller_id)

        # ソート
        if sort == 'price_asc':
            query = query.order_by(Product.price.asc())
        elif sort == 'price_desc':
            query = query.order_by(Product.price.desc())
        elif sort == 'popular':
            query = (
                query.outerjoin(ProductView, ProductView.product_id == Product.id)
                .group_by(Product.id)
                .order_by(
                    db.func.count(ProductView.id).desc(),
                    Product.created_at.desc()
                )
            )
        else:  # newest (デフォルト)
            query = query.order_by(Product.created_at.desc())

        # 総件数を取得
        total = query.count()

        # ページネーション
        offset = (page - 1) * limit
        products = query.offset(offset).limit(limit).all()

        # レスポンスを構築
        result = {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
            "products": [
                {
                    "id": p.id,
                    "title": p.title,
                    "description": p.description,
                    "price": p.price,
                    "condition": p.condition,
                    "sale_type": p.sale_type,
                    "category": p.category,
                    "image_url": p.image_url,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in products
            ]
        }

        return jsonify(result), 200
    except Exception as e:
        print(f"Products API error: {e}")
        return jsonify({"error": str(e), "products": [], "total": 0}), 200


# ============================
# 商品詳細取得
# ============================
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    try:
        product = Product.query.filter_by(id=product_id, status=1).first()

        if not product:
            return jsonify({"error": "商品が見つかりません"}), 404

        try:
            db.session.add(ProductView(product_id=product.id))
            db.session.commit()
        except Exception:
            db.session.rollback()


        # 出品者情報を取得
        seller = User.query.filter_by(id=product.seller_id).first()

        result = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "condition": product.condition,
            "sale_type": product.sale_type,
            "category": product.category,
            "image_url": product.image_url,
            "status": product.status,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "seller": {
                "id": seller.id if seller else None,
                "user_id": seller.user_id if seller else None,
                "user_name": seller.user_name if seller else "不明",
                "email": seller.email if seller else None,
                "profile_image": seller.profile_image if seller else None
            } if seller else None
        }

        return jsonify(result), 200
    except Exception as e:
        print(f"Product detail API error: {e}")
        return jsonify({"error": str(e)}), 500


# ============================
# 商品作成
# ============================
@app.route('/api/products', methods=['POST'])
def create_product():
    try:
        image_url = ''
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.form.to_dict()
            image_file = request.files.get('image')
            if image_file and image_file.filename:
                image_url = _save_product_image(image_file)
                if image_url is None:
                    return jsonify({"error": "画像形式が不正です"}), 400
        else:
            data = request.get_json() or {}
            image_url = data.get('image_url', '') or ''

        # 必須フィールドのバリデーション
        title = (data.get('title') or '').strip()
        price_raw = data.get('price')
        seller_raw = data.get('seller_id')

        if not title:
            return jsonify({"error": "titleは必須です"}), 400
        if price_raw is None or price_raw == '':
            return jsonify({"error": "priceは必須です"}), 400
        if seller_raw is None or seller_raw == '':
            return jsonify({"error": "seller_idは必須です"}), 400

        try:
            price = int(price_raw)
        except (TypeError, ValueError):
            return jsonify({"error": "priceは数値で入力してください"}), 400

        try:
            seller_id = int(seller_raw)
        except (TypeError, ValueError):
            return jsonify({"error": "seller_idは数値で入力してください"}), 400

        # 新しい商品を作成
        new_product = Product(
            title=title,
            description=data.get('description', ''),
            price=price,
            condition=data.get('condition', 'good'),
            sale_type=data.get('sale_type', 'fixed'),
            seller_id=seller_id,
            category=data.get('category', ''),
            image_url=image_url,
            status=1
        )

        db.session.add(new_product)
        db.session.commit()

        return jsonify({
            "message": "商品を出品しました",
            "product_id": new_product.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Product creation error: {e}")
        return jsonify({"error": str(e)}), 500


# ============================
# テストデータ作成（開発用）
# ============================
@app.route('/api/seed-products', methods=['POST'])
def seed_products():
    try:
        # 既存の商品数を確認（8件以上あれば追加しない）
        existing_count = Product.query.count()
        if existing_count >= 8:
            return jsonify({
                "message": f"既に{existing_count}件の商品が存在します",
                "count": existing_count
            }), 200

        # テスト商品データ
        test_products = [
            {
                "title": "村上春樹 ノルウェイの森",
                "description": "村上春樹の代表作。綺麗な状態です。",
                "price": 800,
                "condition": "excellent",
                "sale_type": "fixed",
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "東野圭吾 白夜行",
                "description": "推理小説の名作。少し使用感がありますが読むには問題ありません。",
                "price": 950,
                "condition": "good",
                "sale_type": "fixed",
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "JavaScript完全ガイド",
                "description": "プログラミング学習に最適な一冊。",
                "price": 2800,
                "condition": "excellent",
                "sale_type": "fixed",
                "category": "専門書",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "ワンピース 1-100巻セット",
                "description": "人気漫画の全巻セット。",
                "price": 15000,
                "condition": "good",
                "sale_type": "negotiable",
                "category": "漫画",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "夏目漱石作品集",
                "description": "日本文学の古典。状態良好です。",
                "price": 1200,
                "condition": "excellent",
                "sale_type": "fixed",
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "Python入門書",
                "description": "プログラミング初心者向けの入門書。",
                "price": 2200,
                "condition": "good",
                "sale_type": "fixed",
                "category": "専門書",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "ハリー・ポッターシリーズ全巻",
                "description": "ファンタジー小説の名作。",
                "price": 5800,
                "condition": "good",
                "sale_type": "fixed",
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "ビジネス書セット 5冊",
                "description": "自己啓発・ビジネス書のセット。",
                "price": 3200,
                "condition": "fair",
                "sale_type": "fixed",
                "category": "ビジネス書",
                "seller_id": 1,
                "image_url": None
            }
        ]

        for product_data in test_products:
            product = Product(**product_data)
            db.session.add(product)

        db.session.commit()

        return jsonify({
            "message": f"{len(test_products)}件のテスト商品を作成しました",
            "count": len(test_products)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ============================
# blob URLクリーンアップ（開発用）
# ============================
@app.route('/api/cleanup-blob-urls', methods=['POST'])
def cleanup_blob_urls():
    try:
        # blob:で始まるURLを空文字列に置換
        products = Product.query.filter(Product.image_url.like('blob:%')).all()
        count = 0
        for product in products:
            product.image_url = ''
            count += 1

        db.session.commit()

        return jsonify({
            "message": f"{count}件の商品のblob URLをクリアしました",
            "count": count
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ============================
# 出品取り消し
# ============================
@app.route('/api/products/<int:product_id>/cancel', methods=['POST'])
def cancel_product(product_id):
    data = request.get_json() or {}
    seller_email = (data.get('seller_email') or '').strip()
    if not seller_email:
        return jsonify({"error": "seller_email が必要です"}), 400

    user = User.query.filter_by(email=seller_email).first()
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "商品が見つかりません"}), 404

    if product.seller_id != user.id:
        return jsonify({"error": "出品者のみ取り消しできます"}), 403

    if product.status != 1:
        return jsonify({"error": "販売中の商品ではありません"}), 400

    existing_purchase = Purchase.query.filter_by(product_id=product.id).first()
    if existing_purchase:
        return jsonify({"error": "購入済みのため取り消しできません"}), 400

    product.status = 0
    product.updated_at = datetime.utcnow()

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "取り消しに失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "出品を取り消しました"}), 200


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ============================
# 掲示板 API
# ============================
@app.route('/api/forum/threads', methods=['GET'])
def get_forum_threads():
    try:
        category = request.args.get('category', '').strip()
        sort = request.args.get('sort', 'newest').strip()
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)

        query = ForumThread.query
        if category and category != 'all':
            query = query.filter(ForumThread.category == category)

        if sort == 'popular':
            query = query.order_by(
                ForumThread.like_count.desc(),
                ForumThread.view_count.desc(),
                ForumThread.created_at.desc()
            )
        elif sort == 'oldest':
            query = query.order_by(ForumThread.created_at.asc())
        else:
            query = query.order_by(ForumThread.created_at.desc())

        total = query.count()
        offset = (page - 1) * limit
        threads = query.offset(offset).limit(limit).all()

        thread_ids = [thread.id for thread in threads]
        comment_counts = {}
        if thread_ids:
            rows = (
                db.session.query(ForumComment.thread_id, db.func.count(ForumComment.id))
                .filter(ForumComment.thread_id.in_(thread_ids))
                .group_by(ForumComment.thread_id)
                .all()
            )
            comment_counts = {thread_id: count for thread_id, count in rows}

        result = {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
            "threads": [
                {
                    "id": thread.id,
                    "category": thread.category,
                    "category_label": FORUM_CATEGORY_LABELS.get(thread.category, thread.category),
                    "title": thread.title,
                    "content": thread.content,
                    "author_name": thread.author_name,
                    "author_email": thread.author_email,
                    "created_at": thread.created_at.isoformat() if thread.created_at else None,
                    "updated_at": thread.updated_at.isoformat() if thread.updated_at else None,
                    "view_count": thread.view_count or 0,
                    "like_count": thread.like_count or 0,
                    "comment_count": comment_counts.get(thread.id, 0)
                }
                for thread in threads
            ]
        }

        return jsonify(result), 200
    except Exception as e:
        print(f"Forum list API error: {e}")
        return jsonify({"error": str(e), "threads": [], "total": 0}), 200


@app.route('/api/forum/threads', methods=['POST'])
def create_forum_thread():
    data = request.get_json() or {}

    category = (data.get('category') or '').strip()
    title = (data.get('title') or '').strip()
    content = (data.get('content') or '').strip()
    author_name = (data.get('author_name') or 'ゲスト').strip() or 'ゲスト'
    author_email = (data.get('author_email') or '').strip() or None

    if category not in FORUM_CATEGORY_LABELS:
        return jsonify({"error": "カテゴリが不正です"}), 400
    if not title:
        return jsonify({"error": "タイトルが必要です"}), 400
    if not content:
        return jsonify({"error": "本文が必要です"}), 400
    if len(title) > 100:
        return jsonify({"error": "タイトルが長すぎます"}), 400

    thread = ForumThread(
        category=category,
        title=title,
        content=content,
        author_name=author_name,
        author_email=author_email
    )

    try:
        db.session.add(thread)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "投稿に失敗しました", "detail": str(e)}), 500

    return jsonify({
        "message": "投稿が完了しました",
        "thread_id": thread.id
    }), 201


@app.route('/api/forum/threads/<int:thread_id>', methods=['GET'])
def get_forum_thread(thread_id):
    thread = ForumThread.query.get(thread_id)
    if not thread:
        return jsonify({"error": "スレッドが見つかりません"}), 404

    try:
        thread.view_count = (thread.view_count or 0) + 1
        db.session.commit()
    except Exception:
        db.session.rollback()

    comments = (
        ForumComment.query
        .filter_by(thread_id=thread_id)
        .order_by(ForumComment.created_at.asc())
        .all()
    )

    return jsonify({
        "thread": {
            "id": thread.id,
            "category": thread.category,
            "category_label": FORUM_CATEGORY_LABELS.get(thread.category, thread.category),
            "title": thread.title,
            "content": thread.content,
            "author_name": thread.author_name,
            "author_email": thread.author_email,
            "created_at": thread.created_at.isoformat() if thread.created_at else None,
            "updated_at": thread.updated_at.isoformat() if thread.updated_at else None,
            "view_count": thread.view_count or 0,
            "like_count": thread.like_count or 0,
            "comment_count": len(comments)
        },
        "comments": [
            {
                "id": comment.id,
                "thread_id": comment.thread_id,
                "author_name": comment.author_name,
                "author_email": comment.author_email,
                "content": comment.content,
                "like_count": comment.like_count or 0,
                "created_at": comment.created_at.isoformat() if comment.created_at else None
            }
            for comment in comments
        ]
    }), 200


@app.route('/api/forum/threads/<int:thread_id>/comments', methods=['POST'])
def create_forum_comment(thread_id):
    thread = ForumThread.query.get(thread_id)
    if not thread:
        return jsonify({"error": "スレッドが見つかりません"}), 404

    data = request.get_json() or {}
    content = (data.get('content') or '').strip()
    author_name = (data.get('author_name') or 'ゲスト').strip() or 'ゲスト'
    author_email = (data.get('author_email') or '').strip() or None

    if not content:
        return jsonify({"error": "コメント内容が必要です"}), 400

    comment = ForumComment(
        thread_id=thread_id,
        author_name=author_name,
        author_email=author_email,
        content=content
    )

    try:
        db.session.add(comment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "コメント投稿に失敗しました", "detail": str(e)}), 500

    return jsonify({
        "message": "コメントを投稿しました",
        "comment": {
            "id": comment.id,
            "thread_id": comment.thread_id,
            "author_name": comment.author_name,
            "author_email": comment.author_email,
            "content": comment.content,
            "like_count": comment.like_count or 0,
            "created_at": comment.created_at.isoformat() if comment.created_at else None
        }
    }), 201


@app.route('/api/forum/threads/<int:thread_id>/like', methods=['POST'])
def like_forum_thread(thread_id):
    thread = ForumThread.query.get(thread_id)
    if not thread:
        return jsonify({"error": "スレッドが見つかりません"}), 404

    thread.like_count = (thread.like_count or 0) + 1
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "いいねに失敗しました", "detail": str(e)}), 500

    return jsonify({"like_count": thread.like_count}), 200


@app.route('/api/forum/threads/<int:thread_id>/unlike', methods=['POST'])
def unlike_forum_thread(thread_id):
    thread = ForumThread.query.get(thread_id)
    if not thread:
        return jsonify({"error": "スレッドが見つかりません"}), 404

    thread.like_count = max((thread.like_count or 0) - 1, 0)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "いいね解除に失敗しました", "detail": str(e)}), 500

    return jsonify({"like_count": thread.like_count}), 200


@app.route('/api/forum/comments/<int:comment_id>/like', methods=['POST'])
def like_forum_comment(comment_id):
    comment = ForumComment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "コメントが見つかりません"}), 404

    comment.like_count = (comment.like_count or 0) + 1
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "いいねに失敗しました", "detail": str(e)}), 500

    return jsonify({"like_count": comment.like_count}), 200


@app.route('/api/forum/comments/<int:comment_id>/unlike', methods=['POST'])
def unlike_forum_comment(comment_id):
    comment = ForumComment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "コメントが見つかりません"}), 404

    comment.like_count = max((comment.like_count or 0) - 1, 0)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "いいね解除に失敗しました", "detail": str(e)}), 500

    return jsonify({"like_count": comment.like_count}), 200


@app.route('/api/forum/follow/status', methods=['GET'])
def get_forum_follow_status():
    follower_email = (request.args.get('follower_email') or '').strip()
    followee_email = (request.args.get('followee_email') or '').strip()

    if not follower_email or not followee_email:
        return jsonify({"error": "follower_email と followee_email が必要です"}), 400

    is_following = ForumFollow.query.filter_by(
        follower_email=follower_email,
        followee_email=followee_email
    ).first() is not None

    return jsonify({"following": is_following}), 200


@app.route('/api/forum/follow', methods=['POST'])
def follow_user():
    data = request.get_json() or {}
    follower_email = (data.get('follower_email') or '').strip()
    followee_email = (data.get('followee_email') or '').strip()

    if not follower_email or not followee_email:
        return jsonify({"error": "follower_email と followee_email が必要です"}), 400
    if follower_email == followee_email:
        return jsonify({"error": "自分自身はフォローできません"}), 400

    existing = ForumFollow.query.filter_by(
        follower_email=follower_email,
        followee_email=followee_email
    ).first()
    if existing:
        return jsonify({"message": "既にフォロー済みです"}), 200

    follow = ForumFollow(
        follower_email=follower_email,
        followee_email=followee_email
    )

    try:
        db.session.add(follow)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "フォローに失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "フォローしました"}), 201


@app.route('/api/forum/unfollow', methods=['POST'])
def unfollow_user():
    data = request.get_json() or {}
    follower_email = (data.get('follower_email') or '').strip()
    followee_email = (data.get('followee_email') or '').strip()

    if not follower_email or not followee_email:
        return jsonify({"error": "follower_email と followee_email が必要です"}), 400

    follow = ForumFollow.query.filter_by(
        follower_email=follower_email,
        followee_email=followee_email
    ).first()

    if not follow:
        return jsonify({"message": "フォローしていません"}), 200

    try:
        db.session.delete(follow)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "フォロー解除に失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "フォロー解除しました"}), 200


@app.route('/api/follow/status', methods=['GET'])
def get_follow_status():
    follower_email = (request.args.get('follower_email') or '').strip()
    followee_email = (request.args.get('followee_email') or '').strip()

    if not follower_email or not followee_email:
        return jsonify({"error": "follower_email と followee_email が必要です"}), 400

    is_following = ForumFollow.query.filter_by(
        follower_email=follower_email,
        followee_email=followee_email
    ).first() is not None

    return jsonify({"following": is_following}), 200


@app.route('/api/follow', methods=['POST'])
def follow_user_general():
    data = request.get_json() or {}
    follower_email = (data.get('follower_email') or '').strip()
    followee_email = (data.get('followee_email') or '').strip()

    if not follower_email or not followee_email:
        return jsonify({"error": "follower_email と followee_email が必要です"}), 400
    if follower_email == followee_email:
        return jsonify({"error": "自分自身はフォローできません"}), 400

    existing = ForumFollow.query.filter_by(
        follower_email=follower_email,
        followee_email=followee_email
    ).first()
    if existing:
        return jsonify({"message": "既にフォロー済みです"}), 200

    follow = ForumFollow(
        follower_email=follower_email,
        followee_email=followee_email
    )

    try:
        db.session.add(follow)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "フォローに失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "フォローしました"}), 201


@app.route('/api/unfollow', methods=['POST'])
def unfollow_user_general():
    data = request.get_json() or {}
    follower_email = (data.get('follower_email') or '').strip()
    followee_email = (data.get('followee_email') or '').strip()

    if not follower_email or not followee_email:
        return jsonify({"error": "follower_email と followee_email が必要です"}), 400

    follow = ForumFollow.query.filter_by(
        follower_email=follower_email,
        followee_email=followee_email
    ).first()

    if not follow:
        return jsonify({"message": "フォローしていません"}), 200

    try:
        db.session.delete(follow)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "フォロー解除に失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "フォロー解除しました"}), 200


# ============================
# Stripe 決済
# ============================
def _format_purchase_response(purchase, product):
    return {
        "purchase": {
            "id": purchase.id,
            "product_id": purchase.product_id,
            "seller_id": purchase.seller_id,
            "buyer_email": purchase.buyer_email,
            "amount": purchase.amount,
            "currency": purchase.currency,
            "stripe_session_id": purchase.stripe_session_id,
            "stripe_payment_intent_id": purchase.stripe_payment_intent_id,
            "status": purchase.status,
            "created_at": purchase.created_at.isoformat() if purchase.created_at else None
        },
        "product": {
            "id": product.id,
            "title": product.title,
            "price": product.price,
            "category": product.category,
            "condition": product.condition
        } if product else None
    }


def _upsert_purchase_from_session(session):
    session_id = session.get('id')
    if not session_id:
        return None, None

    existing = Purchase.query.filter_by(stripe_session_id=session_id).first()
    if existing:
        product = Product.query.get(existing.product_id)
        return existing, product

    metadata = session.get('metadata') or {}
    product_id = metadata.get('product_id')
    if not product_id:
        return None, None

    product = Product.query.get(int(product_id))
    if not product:
        return None, None

    amount_total = session.get('amount_total')
    if amount_total is None:
        amount_total = product.price

    purchase = Purchase(
        product_id=product.id,
        seller_id=product.seller_id,
        buyer_email=session.get('customer_email'),
        amount=int(amount_total),
        currency=session.get('currency') or 'jpy',
        stripe_session_id=session_id,
        stripe_payment_intent_id=session.get('payment_intent'),
        status=session.get('payment_status') or 'paid'
    )

    db.session.add(purchase)
    if product.status == 1:
        product.status = 0

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return None, product

    return purchase, product


@app.route('/api/stripe/create-checkout-session', methods=['POST'])
def create_checkout_session():
    if not STRIPE_SECRET_KEY:
        return jsonify({"error": "STRIPE_SECRET_KEY が設定されていません"}), 500

    data = request.get_json() or {}
    product_id = data.get('product_id')
    origin = (data.get('origin') or '').strip()
    customer_email = (data.get('customer_email') or '').strip() or None

    if not product_id:
        return jsonify({"error": "product_id が必要です"}), 400
    if not origin:
        return jsonify({"error": "origin が必要です"}), 400

    product = Product.query.filter_by(id=product_id, status=1).first()
    if not product:
        return jsonify({"error": "商品が見つかりません"}), 404

    if buyer_email and product.seller_id:
        buyer = User.query.filter_by(email=buyer_email).first()
        if buyer and buyer.id == product.seller_id:
            return jsonify({"error": "自分の商品は購入できません"}), 400

    description = (product.description or '').strip()
    if len(description) > 200:
        description = f"{description[:200]}..."

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='payment',
            line_items=[{
                'price_data': {
                    'currency': 'jpy',
                    'unit_amount': int(product.price),
                    'product_data': {
                        'name': product.title,
                        'description': description or None
                    }
                },
                'quantity': 1
            }],
            success_url=f"{origin}/products/purchase-complete?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin}/checkout?product_id={product.id}",
            customer_email=customer_email,
            metadata={
                'product_id': str(product.id),
                'seller_id': str(product.seller_id or '')
            }
        )
    except Exception as e:
        return jsonify({"error": "決済セッション作成に失敗しました", "detail": str(e)}), 500

    return jsonify({
        "id": session.id,
        "url": session.url
    }), 200


@app.route('/api/stripe/webhook', methods=['POST'])
def stripe_webhook():
    if not STRIPE_WEBHOOK_SECRET:
        return jsonify({"error": "STRIPE_WEBHOOK_SECRET が設定されていません"}), 400

    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return jsonify({"error": "不正なペイロード"}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({"error": "署名検証に失敗しました"}), 400

    if event.get('type') == 'checkout.session.completed':
        session = event['data']['object']
        _upsert_purchase_from_session(session)

    return jsonify({"status": "success"}), 200


@app.route('/api/purchases/session/<session_id>', methods=['GET'])
def get_purchase_by_session(session_id):
    if not STRIPE_SECRET_KEY:
        return jsonify({"error": "STRIPE_SECRET_KEY が設定されていません"}), 500

    purchase = Purchase.query.filter_by(stripe_session_id=session_id).first()
    if purchase:
        product = Product.query.get(purchase.product_id)
        return jsonify(_format_purchase_response(purchase, product)), 200

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        return jsonify({"error": "セッション取得に失敗しました", "detail": str(e)}), 500

    payment_status = session.get('payment_status')
    if payment_status != 'paid':
        return jsonify({"status": payment_status or "pending"}), 200

    purchase, product = _upsert_purchase_from_session(session)
    if not purchase:
        return jsonify({"error": "購入情報の作成に失敗しました"}), 500

    return jsonify(_format_purchase_response(purchase, product)), 200


# ============================
# エントリポイント
# ============================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
