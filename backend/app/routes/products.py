import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.product import Product, ProductImage
from app.utils.validators import validate_product
from app.utils.image_handler import allowed_file, save_product_image

bp = Blueprint('products', __name__, url_prefix='/api/products')

@bp.route('', methods=['GET'])
def get_products():
    """商品一覧取得API"""
    try:
        # クエリパラメータ
        status = request.args.get('status', 'available')
        category = request.args.get('category')
        user_id = request.args.get('user_id')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # クエリ構築
        query = Product.query

        if status:
            query = query.filter_by(status=status)
        if category:
            query = query.filter_by(category=category)
        if user_id:
            query = query.filter_by(user_id=user_id)

        # ページネーション
        products = query.order_by(Product.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'products': [p.to_dict(include_seller=True) for p in products.items],
            'total': products.total,
            'page': products.page,
            'pages': products.pages
        }), 200

    except Exception as e:
        return jsonify({'error': '商品一覧の取得中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """商品詳細取得API"""
    try:
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': '商品が見つかりません'}), 404

        return jsonify({'product': product.to_dict(include_seller=True)}), 200

    except Exception as e:
        return jsonify({'error': '商品詳細の取得中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """商品出品API"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()

        print(f'[DEBUG] 商品出品リクエスト受信 - ユーザーID: {current_user_id}')
        print(f'[DEBUG] リクエストデータ: {data}')

        # バリデーション
        is_valid, errors = validate_product(data)
        print(f'[DEBUG] バリデーション結果: valid={is_valid}, errors={errors}')

        if not is_valid:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400

        # 商品作成
        print('[DEBUG] 商品オブジェクトを作成中...')
        product = Product(
            user_id=current_user_id,
            title=data['title'],
            description=data['description'],
            price=data['price'],
            condition=data['condition'],
            category=data['category'],
            isbn=data.get('isbn'),
            status='available'
        )

        print('[DEBUG] DBに追加中...')
        db.session.add(product)
        db.session.commit()
        print(f'[DEBUG] 商品作成成功 - ID: {product.id}')

        return jsonify({
            'message': '商品を出品しました',
            'product': product.to_dict()
        }), 201

    except Exception as e:
        print(f'[ERROR] 商品出品エラー: {type(e).__name__}: {str(e)}')
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': '出品中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/my-products', methods=['GET'])
@jwt_required()
def get_my_products():
    """ログイン中のユーザーの出品商品一覧取得API"""
    try:
        current_user_id = int(get_jwt_identity())

        # クエリパラメータ
        status = request.args.get('status')  # 'available', 'reserved', 'sold' など
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)

        # クエリ構築
        query = Product.query.filter_by(user_id=current_user_id)

        if status:
            query = query.filter_by(status=status)

        # ページネーション
        products = query.order_by(Product.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'products': [p.to_dict() for p in products.items],
            'total': products.total,
            'page': products.page,
            'pages': products.pages
        }), 200

    except Exception as e:
        return jsonify({'error': '商品一覧の取得中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """商品更新API"""
    try:
        current_user_id = int(get_jwt_identity())
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': '商品が見つかりません'}), 404

        if product.user_id != current_user_id:
            return jsonify({'error': '権限がありません'}), 403

        data = request.get_json()

        # 更新
        if 'title' in data:
            product.title = data['title']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'condition' in data:
            product.condition = data['condition']
        if 'category' in data:
            product.category = data['category']
        if 'isbn' in data:
            product.isbn = data['isbn']
        if 'status' in data:
            product.status = data['status']

        db.session.commit()

        return jsonify({
            'message': '商品情報を更新しました',
            'product': product.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '更新中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """商品削除API"""
    try:
        current_user_id = int(get_jwt_identity())
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': '商品が見つかりません'}), 404

        if product.user_id != current_user_id:
            return jsonify({'error': '権限がありません'}), 403

        # 画像ファイルの削除
        for image in product.images:
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products', image.image_id)
            if os.path.exists(image_path):
                os.remove(image_path)

        db.session.delete(product)
        db.session.commit()

        return jsonify({'message': '商品を削除しました'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '削除中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:product_id>/images', methods=['POST'])
@jwt_required()
def upload_product_image(product_id):
    """商品画像アップロードAPI"""
    try:
        current_user_id = int(get_jwt_identity())
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': '商品が見つかりません'}), 404

        if product.user_id != current_user_id:
            return jsonify({'error': '権限がありません'}), 403

        if 'image' not in request.files:
            return jsonify({'error': '画像ファイルが送信されていません'}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'ファイル名が空です'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': '許可されていないファイル形式です'}), 400

        # 画像保存
        image_id, image_url = save_product_image(file, product_id)

        # データベースに保存
        display_order = len(product.images)
        product_image = ProductImage(
            product_id=product_id,
            image_id=image_id,
            image_url=image_url,
            display_order=display_order
        )

        db.session.add(product_image)
        db.session.commit()

        return jsonify({
            'message': '画像をアップロードしました',
            'image': product_image.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '画像アップロード中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/images/<image_id>', methods=['GET'])
def get_product_image(image_id):
    """商品画像取得API"""
    try:
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products')
        return send_from_directory(upload_folder, image_id)
    except Exception as e:
        return jsonify({'error': '画像が見つかりません'}), 404
