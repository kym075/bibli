# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
from datetime import datetime, timedelta
import secrets
from decimal import Decimal
import json
import os
import stripe
from dotenv import load_dotenv
 
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
 
# ---------------------------
# CORS（完全対応版）
# ---------------------------
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)
 
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


def _normalize_tags(raw_tags):
    if raw_tags is None:
        return []

    values = []
    if isinstance(raw_tags, list):
        values = raw_tags
    elif isinstance(raw_tags, str):
        text = raw_tags.strip()
        if not text:
            return []
        if text.startswith('['):
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    values = parsed
                else:
                    values = [text]
            except Exception:
                values = text.split(',')
        elif ',' in text:
            values = text.split(',')
        else:
            values = [text]

    tags = []
    seen = set()
    for value in values:
        tag = str(value or '').strip()
        if not tag:
            continue
        if tag.startswith('#'):
            tag = tag[1:].strip()
        if not tag:
            continue
        tag = tag[:30]
        key = tag.lower()
        if key in seen:
            continue
        seen.add(key)
        tags.append(tag)
        if len(tags) >= 10:
            break

    return tags

def _build_primary_image_map(product_ids):
    if not product_ids:
        return {}

    image_map = {}
    rows = (
        ProductImage.query
        .filter(ProductImage.product_id.in_(product_ids))
        .order_by(ProductImage.product_id.asc(), ProductImage.sort_order.asc(), ProductImage.id.asc())
        .all()
    )
    for row in rows:
        if row.product_id not in image_map and row.image_url:
            image_map[row.product_id] = row.image_url
    return image_map


def _serialize_product_card(product, image_map=None):
    primary_image = product.image_url or ''
    if not primary_image and image_map is not None:
        primary_image = image_map.get(product.id, '')

    return {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "price": product.price,
        "condition": product.condition,
        "category": product.category,
        "image_url": primary_image,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "seller_id": product.seller_id,
        "status": product.status
    }

 
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
    bio = db.Column(db.String(120))
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
    sale_type = db.Column(db.String(50))  # 固定価格販売のみ
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


class ProductImage(db.Model):
    __tablename__ = "product_images"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref=db.backref('images', cascade='all, delete-orphan'))






class ProductTag(db.Model):
    __tablename__ = "product_tags"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    tag = db.Column(db.String(50), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('product_id', 'tag', name='uq_product_tags_product_tag'),
    )


class ProductChatMessage(db.Model):
    __tablename__ = "product_chat_messages"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    sender_email = db.Column(db.String(120), nullable=False, index=True)
    receiver_email = db.Column(db.String(120), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    product = db.relationship('Product')
class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='uq_favorites_user_product'),
    )


class NewsPost(db.Model):
    __tablename__ = "news_posts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(30), default='general')
    author_email = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_email = db.Column(db.String(120), nullable=False, index=True)
    notification_type = db.Column(db.String(30), nullable=False, default='general')
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    related_product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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
 
 
def _create_notification(user_email, notification_type, title, message, related_product_id=None):
    email = (user_email or '').strip().lower()
    if not email:
        return

    db.session.add(Notification(
        user_email=email,
        notification_type=notification_type or 'general',
        title=title or '通知',
        message=message or '',
        related_product_id=related_product_id
    ))


def _serialize_notification(notification):
    return {
        "id": notification.id,
        "user_email": notification.user_email,
        "notification_type": notification.notification_type,
        "title": notification.title,
        "message": notification.message,
        "related_product_id": notification.related_product_id,
        "is_read": bool(notification.is_read),
        "created_at": notification.created_at.isoformat() if notification.created_at else None
    }


def _normalize_email(value):
    return (value or '').strip().lower()


def _find_user_by_email(email):
    normalized = _normalize_email(email)
    if not normalized:
        return None
    return User.query.filter(db.func.lower(User.email) == normalized).first()


def _display_name_from_email(email, user=None):
    if user:
        return user.user_name or user.name or (email.split('@')[0] if email else 'ユーザー')
    return (email.split('@')[0] if email else 'ユーザー')


def _serialize_chat_message(chat_message, seller_email, current_email):
    sender_email = _normalize_email(chat_message.sender_email)
    sender_user = _find_user_by_email(sender_email)
    sender_role = 'seller' if sender_email == _normalize_email(seller_email) else 'buyer'

    return {
        "id": chat_message.id,
        "product_id": chat_message.product_id,
        "sender_email": sender_email,
        "receiver_email": _normalize_email(chat_message.receiver_email),
        "sender_name": _display_name_from_email(sender_email, sender_user),
        "sender_role": sender_role,
        "message": chat_message.message,
        "created_at": chat_message.created_at.isoformat() if chat_message.created_at else None,
        "is_own": sender_email == _normalize_email(current_email)
    }
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

    bio = (data.get('bio') or '').strip()
    if len(bio) > 120:
        return jsonify({"error": "自己紹介は120文字以内で入力してください"}), 400

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
        bio=bio,
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
        bio = (data.get('bio') or '').strip()
        if len(bio) > 120:
            return jsonify({"error": "自己紹介は120文字以内で入力してください"}), 400
        user.bio = bio

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
        keyword = request.args.get('q', '').strip()
        min_price = request.args.get('min_price', type=int)
        max_price = request.args.get('max_price', type=int)
        condition = request.args.get('condition', '').strip()
        seller_id = request.args.get('seller_id', type=int)
        sort = request.args.get('sort', 'newest')
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)

        query = Product.query.filter(Product.status == 1)

        if keyword:
            if keyword.startswith('#'):
                tag_keyword = keyword[1:].strip()
                if tag_keyword:
                    tag_pattern = f"%{tag_keyword.lower()}%"
                    tagged_ids = db.session.query(ProductTag.product_id).filter(db.func.lower(ProductTag.tag).like(tag_pattern))
                    query = query.filter(Product.id.in_(tagged_ids))
                else:
                    query = query.filter(Product.id == -1)
            else:
                search_pattern = f"%{keyword}%"
                query = query.filter(
                    db.or_(
                        Product.title.like(search_pattern),
                        Product.description.like(search_pattern),
                        Product.category.like(search_pattern)
                    )
                )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        if condition:
            query = query.filter(Product.condition == condition)

        if seller_id:
            query = query.filter(Product.seller_id == seller_id)

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
        else:
            query = query.order_by(Product.created_at.desc())

        total = query.count()
        offset = (page - 1) * limit
        products = query.offset(offset).limit(limit).all()

        image_map = _build_primary_image_map([p.id for p in products])

        result = {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
            "products": [
                _serialize_product_card(p, image_map)
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
        product = Product.query.filter_by(id=product_id).first()

        if not product:
            return jsonify({"error": "商品が見つかりません"}), 404

        try:
            db.session.add(ProductView(product_id=product.id))
            db.session.commit()
        except Exception:
            db.session.rollback()

        images = (
            ProductImage.query
            .filter_by(product_id=product.id)
            .order_by(ProductImage.sort_order.asc(), ProductImage.id.asc())
            .all()
        )
        image_urls = [img.image_url for img in images if img.image_url]
        if not image_urls and product.image_url:
            image_urls = [product.image_url]

        tags = [
            row.tag for row in (
                ProductTag.query
                .filter_by(product_id=product.id)
                .order_by(ProductTag.id.asc())
                .all()
            )
        ]

        seller = User.query.filter_by(id=product.seller_id).first()

        result = {
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "condition": product.condition,
            "category": product.category,
            "image_url": product.image_url or (image_urls[0] if image_urls else ""),
            "status": product.status,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "image_urls": image_urls,
            "tags": tags,
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
        image_urls = []
        image_url = ''
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.form.to_dict()
            image_files = request.files.getlist('images')
            if not image_files:
                single_image = request.files.get('image')
                if single_image and single_image.filename:
                    image_files = [single_image]
            for image_file in image_files:
                if image_file and image_file.filename:
                    uploaded_url = _save_product_image(image_file)
                    if uploaded_url is None:
                        return jsonify({"error": "画像形式が不正です"}), 400
                    if uploaded_url:
                        image_urls.append(uploaded_url)
        else:
            data = request.get_json() or {}
            image_url = data.get('image_url', '') or ''
            raw_urls = data.get('image_urls') or data.get('images')
            if isinstance(raw_urls, list):
                image_urls = [u for u in raw_urls if u]

        primary_image_url = image_urls[0] if image_urls else image_url
        parsed_tags = _normalize_tags(data.get('tags'))

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

        new_product = Product(
            title=title,
            description=data.get('description', ''),
            price=price,
            condition=data.get('condition', 'good'),
            sale_type='fixed',
            seller_id=seller_id,
            category=data.get('category', ''),
            image_url=primary_image_url,
            status=1
        )

        db.session.add(new_product)
        db.session.flush()

        if image_urls:
            for index, url in enumerate(image_urls):
                db.session.add(ProductImage(
                    product_id=new_product.id,
                    image_url=url,
                    sort_order=index
                ))

        if parsed_tags:
            for tag in parsed_tags:
                db.session.add(ProductTag(
                    product_id=new_product.id,
                    tag=tag
                ))

        seller = User.query.get(seller_id)
        if seller and seller.email:
            seller_email = _normalize_email(seller.email)
            seller_name = seller.user_name or seller.name or (seller_email.split('@')[0] if seller_email else '出品者')

            _create_notification(
                user_email=seller.email,
                notification_type='listing',
                title='出品が完了しました',
                message=f"「{new_product.title}」を出品しました。",
                related_product_id=new_product.id
            )

            follower_rows = (
                ForumFollow.query
                .filter(db.func.lower(ForumFollow.followee_email) == seller_email)
                .all()
            )
            notified_followers = set()
            for row in follower_rows:
                follower_email = _normalize_email(row.follower_email)
                if not follower_email or follower_email == seller_email or follower_email in notified_followers:
                    continue
                notified_followers.add(follower_email)

                _create_notification(
                    user_email=follower_email,
                    notification_type='follow_listing',
                    title='フォロー中ユーザーが出品しました',
                    message=f"{seller_name}さんが「{new_product.title}」を出品しました。",
                    related_product_id=new_product.id
                )

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
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "東野圭吾 白夜行",
                "description": "推理小説の名作。少し使用感がありますが読むには問題ありません。",
                "price": 950,
                "condition": "good",
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "JavaScript完全ガイド",
                "description": "プログラミング学習に最適な一冊。",
                "price": 2800,
                "condition": "excellent",
                "category": "専門書",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "ワンピース 1-100巻セット",
                "description": "人気漫画の全巻セット。",
                "price": 15000,
                "condition": "good",
                "category": "漫画",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "夏目漱石作品集",
                "description": "日本文学の古典。状態良好です。",
                "price": 1200,
                "condition": "excellent",
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "Python入門書",
                "description": "プログラミング初心者向けの入門書。",
                "price": 2200,
                "condition": "good",
                "category": "専門書",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "ハリー・ポッターシリーズ全巻",
                "description": "ファンタジー小説の名作。",
                "price": 5800,
                "condition": "good",
                "category": "小説",
                "seller_id": 1,
                "image_url": None
            },
            {
                "title": "ビジネス書セット 5冊",
                "description": "自己啓発・ビジネス書のセット。",
                "price": 3200,
                "condition": "fair",
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





# ============================
# 商品チャット API
# ============================
@app.route('/api/products/<int:product_id>/chat/messages', methods=['GET'])
def get_product_chat_messages(product_id):
    current_email = _normalize_email(request.args.get('email'))
    requested_counterpart = _normalize_email(request.args.get('with_user'))

    if not current_email:
        return jsonify({"error": "email が必要です"}), 400

    current_user = _find_user_by_email(current_email)
    if not current_user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "商品が見つかりません"}), 404

    seller = User.query.get(product.seller_id)
    if not seller or not seller.email:
        return jsonify({"error": "出品者情報が見つかりません"}), 404

    seller_email = _normalize_email(seller.email)
    is_seller = current_email == seller_email

    purchase_rows = (
        Purchase.query
        .filter_by(product_id=product.id)
        .order_by(Purchase.created_at.desc(), Purchase.id.desc())
        .all()
    )
    purchase_buyer_emails = []
    seen_buyer = set()
    for purchase in purchase_rows:
        buyer_email = _normalize_email(purchase.buyer_email)
        if buyer_email and buyer_email not in seen_buyer:
            seen_buyer.add(buyer_email)
            purchase_buyer_emails.append(buyer_email)

    purchase_buyer_set = set(purchase_buyer_emails)
    is_sold = bool(purchase_buyer_set)
    is_purchase_buyer = current_email in purchase_buyer_set

    if is_sold and not is_seller and not is_purchase_buyer:
        return jsonify({"error": "購入後チャットは購入者と出品者のみ利用できます"}), 403

    base_query = ProductChatMessage.query.filter_by(product_id=product.id)
    participants = []
    selected_counterpart = ''

    if is_seller:
        related_rows = (
            base_query
            .filter(
                db.or_(
                    db.func.lower(ProductChatMessage.sender_email) == seller_email,
                    db.func.lower(ProductChatMessage.receiver_email) == seller_email
                )
            )
            .order_by(ProductChatMessage.created_at.desc(), ProductChatMessage.id.desc())
            .all()
        )

        latest_by_user = {}
        for row in related_rows:
            sender_email = _normalize_email(row.sender_email)
            receiver_email = _normalize_email(row.receiver_email)
            counterpart = receiver_email if sender_email == seller_email else sender_email
            if not counterpart or counterpart == seller_email:
                continue
            if counterpart not in latest_by_user:
                latest_by_user[counterpart] = row.created_at or datetime.utcnow()

        for purchase in purchase_rows:
            buyer_email = _normalize_email(purchase.buyer_email)
            if not buyer_email or buyer_email == seller_email:
                continue
            if buyer_email not in latest_by_user:
                latest_by_user[buyer_email] = purchase.created_at or datetime.utcnow()

        ordered_counterparts = sorted(
            latest_by_user.keys(),
            key=lambda email: latest_by_user[email],
            reverse=True
        )

        for email in ordered_counterparts:
            participant_user = _find_user_by_email(email)
            participants.append({
                "email": email,
                "user_name": _display_name_from_email(email, participant_user),
                "role": "buyer",
                "is_purchased": email in purchase_buyer_set,
                "last_message_at": latest_by_user[email].isoformat() if latest_by_user[email] else None
            })

        if ordered_counterparts:
            selected_counterpart = requested_counterpart if requested_counterpart in ordered_counterparts else ordered_counterparts[0]
    else:
        participants.append({
            "email": seller_email,
            "user_name": _display_name_from_email(seller_email, seller),
            "role": "seller",
            "is_purchased": is_purchase_buyer,
            "last_message_at": None
        })
        selected_counterpart = seller_email

    messages = []
    has_updates = False

    if selected_counterpart:
        chat_rows = (
            base_query
            .filter(
                db.or_(
                    db.and_(
                        db.func.lower(ProductChatMessage.sender_email) == current_email,
                        db.func.lower(ProductChatMessage.receiver_email) == selected_counterpart
                    ),
                    db.and_(
                        db.func.lower(ProductChatMessage.sender_email) == selected_counterpart,
                        db.func.lower(ProductChatMessage.receiver_email) == current_email
                    )
                )
            )
            .order_by(ProductChatMessage.created_at.asc(), ProductChatMessage.id.asc())
            .all()
        )

        for row in chat_rows:
            if _normalize_email(row.receiver_email) == current_email and not row.is_read:
                row.is_read = True
                has_updates = True
            messages.append(_serialize_chat_message(row, seller_email, current_email))

    if has_updates:
        db.session.commit()

    return jsonify({
        "product_id": product.id,
        "seller_email": seller_email,
        "current_email": current_email,
        "current_role": "seller" if is_seller else "buyer",
        "chat_scope": "sold" if is_sold else "open",
        "selected_counterpart_email": selected_counterpart,
        "participants": participants,
        "messages": messages
    }), 200


@app.route('/api/products/<int:product_id>/chat/messages', methods=['POST'])
def post_product_chat_message(product_id):
    data = request.get_json() or {}

    sender_email = _normalize_email(data.get('sender_email'))
    receiver_email = _normalize_email(data.get('receiver_email'))
    message = (data.get('message') or '').strip()

    if not sender_email:
        return jsonify({"error": "sender_email が必要です"}), 400
    if not message:
        return jsonify({"error": "メッセージを入力してください"}), 400
    if len(message) > 1000:
        return jsonify({"error": "メッセージは1000文字以内で入力してください"}), 400

    sender_user = _find_user_by_email(sender_email)
    if not sender_user:
        return jsonify({"error": "送信者が見つかりません"}), 404

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "商品が見つかりません"}), 404

    seller = User.query.get(product.seller_id)
    if not seller or not seller.email:
        return jsonify({"error": "出品者情報が見つかりません"}), 404

    seller_email = _normalize_email(seller.email)
    is_sender_seller = sender_email == seller_email

    purchase_rows = Purchase.query.filter_by(product_id=product.id).all()
    purchase_buyer_set = {
        _normalize_email(purchase.buyer_email)
        for purchase in purchase_rows
        if _normalize_email(purchase.buyer_email)
    }
    is_sold = bool(purchase_buyer_set)

    if is_sold and not is_sender_seller and sender_email not in purchase_buyer_set:
        return jsonify({"error": "購入後チャットは購入者と出品者のみ利用できます"}), 403

    if is_sender_seller:
        if not receiver_email:
            if len(purchase_buyer_set) == 1:
                receiver_email = next(iter(purchase_buyer_set))
            else:
                return jsonify({"error": "receiver_email が必要です"}), 400

        if receiver_email == seller_email:
            return jsonify({"error": "出品者自身には送信できません"}), 400

        receiver_user = _find_user_by_email(receiver_email)
        if not receiver_user:
            return jsonify({"error": "送信先ユーザーが見つかりません"}), 404

        if is_sold:
            if receiver_email not in purchase_buyer_set:
                return jsonify({"error": "購入者にのみ送信できます"}), 403
        else:
            existing_thread = (
                ProductChatMessage.query
                .filter_by(product_id=product.id)
                .filter(
                    db.or_(
                        db.and_(
                            db.func.lower(ProductChatMessage.sender_email) == seller_email,
                            db.func.lower(ProductChatMessage.receiver_email) == receiver_email
                        ),
                        db.and_(
                            db.func.lower(ProductChatMessage.sender_email) == receiver_email,
                            db.func.lower(ProductChatMessage.receiver_email) == seller_email
                        )
                    )
                )
                .first()
            )

            if not existing_thread:
                return jsonify({"error": "購入希望者からの問い合わせがありません"}), 400
    else:
        receiver_email = seller_email

    new_message = ProductChatMessage(
        product_id=product.id,
        sender_email=sender_email,
        receiver_email=receiver_email,
        message=message,
        is_read=False
    )

    try:
        db.session.add(new_message)

        if receiver_email != sender_email:
            sender_name = _display_name_from_email(sender_email, sender_user)
            _create_notification(
                user_email=receiver_email,
                notification_type='chat',
                title='取引チャットに新着メッセージ',
                message=f"「{product.title}」で{sender_name}さんからメッセージが届きました。",
                related_product_id=product.id
            )

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "メッセージ送信に失敗しました", "detail": str(e)}), 500

    return jsonify({
        "message": _serialize_chat_message(new_message, seller_email, sender_email)
    }), 201


# ============================
# お気に入り API
# ============================
@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    email = (request.args.get('email') or '').strip()
    if not email:
        return jsonify({"error": "email が必要です"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"favorites": []}), 200

    favorites = Favorite.query.filter_by(user_id=user.id).order_by(Favorite.created_at.desc()).all()
    product_ids = [f.product_id for f in favorites]
    if not product_ids:
        return jsonify({"favorites": []}), 200

    products = Product.query.filter(Product.id.in_(product_ids), Product.status == 1).all()
    product_map = {p.id: p for p in products}
    image_map = _build_primary_image_map([p.id for p in products])

    cards = []
    for favorite in favorites:
        product = product_map.get(favorite.product_id)
        if product:
            cards.append(_serialize_product_card(product, image_map))

    return jsonify({"favorites": cards}), 200


@app.route('/api/favorites/status', methods=['GET'])
def get_favorite_status():
    email = (request.args.get('email') or '').strip()
    product_id = request.args.get('product_id', type=int)

    if not email or not product_id:
        return jsonify({"error": "email と product_id が必要です"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"is_favorite": False}), 200

    is_favorite = Favorite.query.filter_by(user_id=user.id, product_id=product_id).first() is not None
    return jsonify({"is_favorite": is_favorite}), 200


@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip()
    product_id = data.get('product_id')

    if not email or not product_id:
        return jsonify({"error": "email と product_id が必要です"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    product = Product.query.filter_by(id=product_id, status=1).first()
    if not product:
        return jsonify({"error": "商品が見つかりません"}), 404

    existing = Favorite.query.filter_by(user_id=user.id, product_id=product.id).first()
    if existing:
        return jsonify({"message": "既にお気に入り済みです"}), 200

    favorite = Favorite(user_id=user.id, product_id=product.id)
    try:
        db.session.add(favorite)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "お気に入り登録に失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "お気に入りに追加しました"}), 201


@app.route('/api/favorites', methods=['DELETE'])
def remove_favorite():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or request.args.get('email') or '').strip()
    product_id = data.get('product_id') or request.args.get('product_id', type=int)

    if not email or not product_id:
        return jsonify({"error": "email と product_id が必要です"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "お気に入りに登録されていません"}), 200

    favorite = Favorite.query.filter_by(user_id=user.id, product_id=product_id).first()
    if not favorite:
        return jsonify({"message": "お気に入りに登録されていません"}), 200

    try:
        db.session.delete(favorite)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "お気に入り解除に失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "お気に入りを解除しました"}), 200


@app.route('/api/profile/<user_id>/favorites', methods=['GET'])
def get_profile_favorites(user_id):
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"favorites": []}), 200

    favorites = Favorite.query.filter_by(user_id=user.id).order_by(Favorite.created_at.desc()).all()
    product_ids = [f.product_id for f in favorites]
    if not product_ids:
        return jsonify({"favorites": []}), 200

    products = Product.query.filter(Product.id.in_(product_ids), Product.status == 1).all()
    product_map = {p.id: p for p in products}
    image_map = _build_primary_image_map([p.id for p in products])

    result = []
    for favorite in favorites:
        product = product_map.get(favorite.product_id)
        if product:
            result.append(_serialize_product_card(product, image_map))

    return jsonify({"favorites": result}), 200


@app.route('/api/profile/<user_id>/purchases', methods=['GET'])
def get_profile_purchases(user_id):
    user = User.query.filter_by(user_id=user_id).first()
    if not user or not user.email:
        return jsonify({"purchases": []}), 200

    purchases = (
        Purchase.query
        .filter_by(buyer_email=user.email)
        .order_by(Purchase.created_at.desc())
        .all()
    )
    if not purchases:
        return jsonify({"purchases": []}), 200

    product_ids = [p.product_id for p in purchases]
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    product_map = {p.id: p for p in products}
    image_map = _build_primary_image_map([p.id for p in products])

    result = []
    for purchase in purchases:
        product = product_map.get(purchase.product_id)
        image_url = ""
        title = "商品情報が見つかりません"
        category = ""
        condition = ""

        if product:
            image_url = product.image_url or image_map.get(product.id, "")
            title = product.title
            category = product.category or ""
            condition = product.condition or ""

        result.append({
            "purchase_id": purchase.id,
            "product_id": purchase.product_id,
            "title": title,
            "image_url": image_url,
            "category": category,
            "condition": condition,
            "amount": purchase.amount,
            "currency": purchase.currency,
            "status": purchase.status,
            "created_at": purchase.created_at.isoformat() if purchase.created_at else None
        })

    return jsonify({"purchases": result}), 200


@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    email = (request.args.get('email') or '').strip().lower()
    if not email:
        return jsonify({"notifications": [], "unread_count": 0}), 200

    notifications = (
        Notification.query
        .filter_by(user_email=email)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .all()
    )
    unread_count = sum(1 for item in notifications if not item.is_read)

    return jsonify({
        "notifications": [_serialize_notification(item) for item in notifications],
        "unread_count": unread_count
    }), 200


@app.route('/api/notifications/read-all', methods=['POST'])
def mark_notifications_read_all():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({"error": "emailが必要です"}), 400

    try:
        updated_count = (
            Notification.query
            .filter_by(user_email=email, is_read=False)
            .update({Notification.is_read: True}, synchronize_session=False)
        )
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "通知の更新に失敗しました", "detail": str(e)}), 500

    return jsonify({"message": "既読に更新しました", "updated": updated_count}), 200


# ============================
# お知らせ API（ダミーデータ固定）
# ============================
DUMMY_NEWS_POSTS = [
    {
        "id": 1,
        "title": "システムメンテナンスのお知らせ",
        "content": "2026年2月20日 02:00〜04:00 にシステムメンテナンスを実施します。作業中は一時的にサービスへアクセスしにくくなる場合があります。",
        "category": "important",
        "author_email": "Bibli運営",
        "created_at": "2026-02-13T09:00:00"
    },
    {
        "id": 2,
        "title": "掲示板機能アップデート",
        "content": "掲示板の表示速度改善と不具合修正を行いました。引き続き、安定性向上のため改善を進めます。",
        "category": "update",
        "author_email": "Bibli運営",
        "created_at": "2026-02-10T18:30:00"
    },
    {
        "id": 3,
        "title": "ご利用ガイドの更新",
        "content": "初めて利用する方向けに、出品から購入までの流れをガイドページに追記しました。",
        "category": "general",
        "author_email": "Bibli運営",
        "created_at": "2026-02-08T12:00:00"
    }
]


@app.route('/api/news', methods=['GET'])
def get_news_posts():
    return jsonify({"news": DUMMY_NEWS_POSTS}), 200


@app.route('/api/news/<int:news_id>', methods=['GET'])
def get_news_post(news_id):
    post = next((item for item in DUMMY_NEWS_POSTS if item["id"] == news_id), None)
    if not post:
        return jsonify({"error": "お知らせが見つかりません"}), 404
    return jsonify(post), 200

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

    buyer_email = (session.get('customer_email') or '').strip().lower()
    seller = User.query.get(product.seller_id) if product.seller_id else None
    seller_email = (seller.email or '').strip().lower() if seller and seller.email else ''

    if buyer_email:
        _create_notification(
            user_email=buyer_email,
            notification_type='purchase',
            title='購入が完了しました',
            message=f"「{product.title}」の購入が完了しました。",
            related_product_id=product.id
        )

    if seller_email and seller_email != buyer_email:
        _create_notification(
            user_email=seller_email,
            notification_type='sold',
            title='商品が購入されました',
            message=f"「{product.title}」が購入されました。",
            related_product_id=product.id
        )
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return None, product

    return purchase, product


@cross_origin(origins=['http://localhost:5173', 'http://127.0.0.1:5173'])
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

    if customer_email and product.seller_id:
        buyer = User.query.filter_by(email=customer_email).first()
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
            success_url=f"{origin}/purchase-complete?session_id={{CHECKOUT_SESSION_ID}}",
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







