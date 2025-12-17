import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.utils.firebase_auth import firebase_required, get_current_user_id

bp = Blueprint('orders', __name__, url_prefix='/api/orders')

def generate_order_number():
    """注文番号を生成"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_part = str(uuid.uuid4().hex[:6]).upper()
    return f"BL-{timestamp}{random_part}"


@bp.route('', methods=['POST'])
@firebase_required
def create_order():
    """注文作成API（商品購入）- Firebase認証対応"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()

        print(f'[DEBUG] 購入リクエスト受信 - ユーザーID: {current_user_id}')
        print(f'[DEBUG] リクエストデータ: {data}')

        # 必須パラメータのチェック
        product_id = data.get('product_id')
        if not product_id:
            return jsonify({'error': '商品IDが指定されていません'}), 400

        # 商品の取得
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': '商品が見つかりません'}), 404

        # 自分の商品は購入できない
        if product.user_id == current_user_id:
            return jsonify({'error': '自分の商品は購入できません'}), 400

        # 商品のステータスチェック
        if product.status != 'available':
            return jsonify({'error': 'この商品は購入できません'}), 400

        # 配送情報と決済情報（オプション）
        shipping_method = data.get('shipping_method', 'ゆうパケット')
        shipping_address = data.get('shipping_address')
        payment_method = data.get('payment_method', 'クレジットカード')

        # 金額計算
        product_price = product.price
        shipping_fee = data.get('shipping_fee', 230)  # デフォルトはゆうパケット料金
        service_fee = int(product_price * 0.1)  # 10%の手数料
        total_amount = product_price + shipping_fee + service_fee

        # 注文番号生成
        order_number = generate_order_number()

        # 注文作成
        order = Order(
            order_number=order_number,
            buyer_id=current_user_id,
            seller_id=product.user_id,
            product_id=product_id,
            product_price=product_price,
            shipping_fee=shipping_fee,
            service_fee=service_fee,
            total_amount=total_amount,
            status='paid',  # 決済は即座に完了する想定
            shipping_method=shipping_method,
            shipping_address=shipping_address,
            payment_method=payment_method,
            paid_at=datetime.utcnow()
        )

        db.session.add(order)

        # 商品のステータスを「取引中」に更新
        product.status = 'reserved'

        db.session.commit()

        print(f'[DEBUG] 注文作成成功 - 注文番号: {order.order_number}')

        return jsonify({
            'message': '購入が完了しました',
            'order': order.to_dict(include_details=True)
        }), 201

    except Exception as e:
        print(f'[ERROR] 購入エラー: {type(e).__name__}: {str(e)}')
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': '購入中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('', methods=['GET'])
@firebase_required
def get_orders():
    """注文一覧取得API - Firebase認証対応"""
    try:
        current_user_id = get_current_user_id()

        # クエリパラメータ
        order_type = request.args.get('type', 'purchases')  # purchases: 購入履歴, sales: 販売履歴
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # クエリ構築
        if order_type == 'purchases':
            query = Order.query.filter_by(buyer_id=current_user_id)
        elif order_type == 'sales':
            query = Order.query.filter_by(seller_id=current_user_id)
        else:
            return jsonify({'error': '無効なorder_typeです'}), 400

        if status:
            query = query.filter_by(status=status)

        # ページネーション
        orders = query.order_by(Order.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'orders': [o.to_dict(include_details=True) for o in orders.items],
            'total': orders.total,
            'page': orders.page,
            'pages': orders.pages
        }), 200

    except Exception as e:
        return jsonify({'error': '注文一覧の取得中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:order_id>', methods=['GET'])
@firebase_required
def get_order(order_id):
    """注文詳細取得API - Firebase認証対応"""
    try:
        current_user_id = get_current_user_id()
        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': '注文が見つかりません'}), 404

        # 購入者または出品者のみアクセス可能
        if order.buyer_id != current_user_id and order.seller_id != current_user_id:
            return jsonify({'error': '権限がありません'}), 403

        return jsonify({'order': order.to_dict(include_details=True)}), 200

    except Exception as e:
        return jsonify({'error': '注文詳細の取得中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:order_id>/ship', methods=['POST'])
@firebase_required
def ship_order(order_id):
    """発送処理API - Firebase認証対応"""
    try:
        current_user_id = get_current_user_id()
        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': '注文が見つかりません'}), 404

        # 出品者のみ実行可能
        if order.seller_id != current_user_id:
            return jsonify({'error': '権限がありません'}), 403

        # ステータスチェック
        if order.status != 'paid':
            return jsonify({'error': 'この注文は発送できません'}), 400

        data = request.get_json()
        tracking_number = data.get('tracking_number')

        # 発送処理
        order.status = 'shipped'
        order.shipped_at = datetime.utcnow()
        order.tracking_number = tracking_number

        db.session.commit()

        return jsonify({
            'message': '発送処理が完了しました',
            'order': order.to_dict(include_details=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '発送処理中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:order_id>/complete', methods=['POST'])
@firebase_required
def complete_order(order_id):
    """取引完了API - Firebase認証対応"""
    try:
        current_user_id = get_current_user_id()
        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': '注文が見つかりません'}), 404

        # 購入者のみ実行可能
        if order.buyer_id != current_user_id:
            return jsonify({'error': '権限がありません'}), 403

        # ステータスチェック
        if order.status != 'shipped':
            return jsonify({'error': 'この注文は完了できません'}), 400

        # 取引完了
        order.status = 'completed'
        order.delivered_at = datetime.utcnow()

        # 商品のステータスを「売却済み」に更新
        product = Product.query.get(order.product_id)
        if product:
            product.status = 'sold'

        db.session.commit()

        return jsonify({
            'message': '取引が完了しました',
            'order': order.to_dict(include_details=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '取引完了処理中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/<int:order_id>/cancel', methods=['POST'])
@firebase_required
def cancel_order(order_id):
    """注文キャンセルAPI - Firebase認証対応"""
    try:
        current_user_id = get_current_user_id()
        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': '注文が見つかりません'}), 404

        # 購入者または出品者のみ実行可能
        if order.buyer_id != current_user_id and order.seller_id != current_user_id:
            return jsonify({'error': '権限がありません'}), 403

        # ステータスチェック（発送済みはキャンセル不可）
        if order.status in ['shipped', 'delivered', 'completed', 'cancelled']:
            return jsonify({'error': 'この注文はキャンセルできません'}), 400

        # キャンセル処理
        order.status = 'cancelled'

        # 商品を販売中に戻す
        product = Product.query.get(order.product_id)
        if product:
            product.status = 'available'

        db.session.commit()

        return jsonify({
            'message': '注文がキャンセルされました',
            'order': order.to_dict(include_details=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'キャンセル処理中にエラーが発生しました', 'details': str(e)}), 500
