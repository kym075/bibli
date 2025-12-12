from flask import Blueprint, request, jsonify
from models.database import db, Order, Product
from services.stripe_payment_service import StripePaymentService
from datetime import datetime, timedelta
import random

purchase_bp = Blueprint('purchase', __name__, url_prefix='/api/purchase')


@purchase_bp.route('/create', methods=['POST'])
def create_order():
    """
    注文作成API

    リクエストボディ:
    {
        "user_id": 1,
        "product_id": 123,
        "shipping_postal_code": "150-0001",
        "shipping_address": "東京都渋谷区...",
        "shipping_name": "山田太郎",
        "payment_method": "credit_card",
        "payment_card_last4": "1234"
    }
    """
    try:
        data = request.get_json()

        # バリデーション
        required_fields = [
            'user_id', 'product_id', 'shipping_postal_code',
            'shipping_address', 'shipping_name', 'payment_method'
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} は必須項目です'
                }), 400

        # 商品情報を取得（実際はDBから取得）
        # ここでは簡易的に固定値を使用
        product_id = data['product_id']
        product = Product.query.get(product_id)

        if not product:
            # モックデータを使用
            product_name = "吾輩は猫である"
            product_price = 1500
        else:
            product_name = product.title
            product_price = product.price
            # 在庫チェック
            if product.stock <= 0:
                return jsonify({
                    'success': False,
                    'message': 'この商品は在庫がありません'
                }), 400

        # 配送料と手数料を計算
        shipping_fee = 230  # ゆうパケット固定
        service_fee = int(product_price * 0.1)  # 10%
        total_amount = product_price + shipping_fee + service_fee

        # Stripe PaymentIntentを作成
        payment_result = StripePaymentService.create_payment_intent(
            amount=total_amount,
            currency='jpy',
            metadata={
                'user_id': str(data['user_id']),
                'product_id': str(product_id),
                'product_name': product_name
            }
        )

        if not payment_result['success']:
            return jsonify({
                'success': False,
                'message': payment_result['message']
            }), 400

        payment_intent_id = payment_result['payment_intent_id']
        client_secret = payment_result['client_secret']

        # 注文番号を生成
        order_number = f"BL-{datetime.now().strftime('%Y%m%d')}{random.randint(10, 99)}"

        # 配送予定日を計算（3～5営業日後）
        estimated_delivery_date = datetime.now() + timedelta(days=random.randint(3, 5))

        # 注文をDBに保存
        order = Order(
            order_number=order_number,
            user_id=data['user_id'],
            product_id=product_id,
            product_name=product_name,
            product_price=product_price,
            shipping_fee=shipping_fee,
            service_fee=service_fee,
            total_amount=total_amount,
            shipping_postal_code=data['shipping_postal_code'],
            shipping_address=data['shipping_address'],
            shipping_name=data['shipping_name'],
            payment_method=data['payment_method'],
            payment_card_last4=data.get('payment_card_last4'),
            status='paid',
            estimated_delivery_date=estimated_delivery_date
        )

        db.session.add(order)

        # 在庫を減らす
        if product:
            product.stock -= 1

        db.session.commit()

        return jsonify({
            'success': True,
            'message': '注文が正常に完了しました',
            'data': {
                'order_number': order_number,
                'order_id': order.id,
                'total_amount': total_amount,
                'estimated_delivery_date': estimated_delivery_date.strftime('%Y-%m-%d'),
                'payment_intent_id': payment_intent_id,
                'client_secret': client_secret
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@purchase_bp.route('/history/<int:user_id>', methods=['GET'])
def get_purchase_history(user_id):
    """
    購入履歴取得API

    パラメータ:
    - user_id: ユーザーID

    クエリパラメータ:
    - limit: 取得件数（デフォルト: 20）
    - offset: オフセット（デフォルト: 0）
    """
    try:
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)

        # 購入履歴を取得
        orders = Order.query.filter_by(user_id=user_id) \
            .order_by(Order.created_at.desc()) \
            .limit(limit) \
            .offset(offset) \
            .all()

        total_count = Order.query.filter_by(user_id=user_id).count()

        return jsonify({
            'success': True,
            'data': {
                'orders': [order.to_dict() for order in orders],
                'total_count': total_count,
                'limit': limit,
                'offset': offset
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@purchase_bp.route('/order/<int:order_id>', methods=['GET'])
def get_order_detail(order_id):
    """
    注文詳細取得API

    パラメータ:
    - order_id: 注文ID
    """
    try:
        order = Order.query.get(order_id)

        if not order:
            return jsonify({
                'success': False,
                'message': '注文が見つかりません'
            }), 404

        return jsonify({
            'success': True,
            'data': order.to_dict()
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@purchase_bp.route('/order/<int:order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    """
    注文キャンセルAPI

    パラメータ:
    - order_id: 注文ID
    """
    try:
        order = Order.query.get(order_id)

        if not order:
            return jsonify({
                'success': False,
                'message': '注文が見つかりません'
            }), 404

        # 発送済みの場合はキャンセル不可
        if order.status in ['shipped', 'completed']:
            return jsonify({
                'success': False,
                'message': 'この注文はキャンセルできません'
            }), 400

        # Stripe払い戻し処理
        # payment_intent_idが保存されていれば払い戻し実行
        # refund_result = StripePaymentService.create_refund(
        #     payment_intent_id=order.payment_card_last4,  # 実際はpayment_intent_idを保存する必要がある
        #     amount=order.total_amount
        # )

        # ステータスを更新
        order.status = 'cancelled'
        order.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'message': '注文がキャンセルされました',
            'data': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500
