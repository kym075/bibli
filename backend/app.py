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
        'real_name': data.get('real_name')
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
        name_kana='',
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

    return jsonify({
        "user_id": user.user_id,
        "user_name": user.user_name or user.name,  # user_nameがない場合nameを使用
        "email": user.email,
        "profile_image": user.profile_image,
        "bio": user.bio,
        "address": user.address,
        "phone_number": user.phone_number or user.phone,  # phone_numberがない場合phoneを使用
        "birth_date": user.birth_date,
        "real_name": user.real_name or user.name,  # real_nameがない場合nameを使用
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "status": user.status
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
            # TODO: 人気順のロジック（いいね数やビュー数で並び替え）
            query = query.order_by(Product.created_at.desc())
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
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "seller": {
                "id": seller.id if seller else None,
                "user_name": seller.user_name if seller else "不明",
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
        data = request.get_json()

        # 必須フィールドのバリデーション
        required_fields = ['title', 'price', 'seller_id']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field}は必須です"}), 400

        # 新しい商品を作成
        new_product = Product(
            title=data['title'],
            description=data.get('description', ''),
            price=data['price'],
            condition=data.get('condition', 'good'),
            sale_type=data.get('sale_type', 'fixed'),
            seller_id=data['seller_id'],
            category=data.get('category', ''),
            image_url=data.get('image_url', ''),
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
# エントリポイント
# ============================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)