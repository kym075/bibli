from datetime import datetime
from app import db

class Order(db.Model):
    """注文モデル"""
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)  # 注文番号
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)  # 購入者
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)  # 出品者
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)

    # 金額情報
    product_price = db.Column(db.Integer, nullable=False)  # 商品価格
    shipping_fee = db.Column(db.Integer, default=0, nullable=False)  # 送料
    service_fee = db.Column(db.Integer, default=0, nullable=False)  # 手数料
    total_amount = db.Column(db.Integer, nullable=False)  # 合計金額

    # ステータス
    status = db.Column(db.String(20), default='pending', nullable=False)
    # pending: 支払い待ち, paid: 支払い済み, shipped: 発送済み, delivered: 配送完了, completed: 取引完了, cancelled: キャンセル

    # 配送情報
    shipping_method = db.Column(db.String(100), nullable=True)  # 配送方法
    shipping_address = db.Column(db.Text, nullable=True)  # 配送先住所

    # 決済情報
    payment_method = db.Column(db.String(50), nullable=True)  # 支払い方法
    paid_at = db.Column(db.DateTime, nullable=True)  # 支払い完了日時

    # 発送情報
    shipped_at = db.Column(db.DateTime, nullable=True)  # 発送日時
    tracking_number = db.Column(db.String(100), nullable=True)  # 追跡番号

    # 配送完了
    delivered_at = db.Column(db.DateTime, nullable=True)  # 配送完了日時

    # タイムスタンプ
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # リレーション
    buyer = db.relationship('User', foreign_keys=[buyer_id], backref='purchases')
    seller = db.relationship('User', foreign_keys=[seller_id], backref='sales')
    product = db.relationship('Product', backref='orders')

    def to_dict(self, include_details=False):
        """辞書形式に変換"""
        data = {
            'id': self.id,
            'order_number': self.order_number,
            'buyer_id': self.buyer_id,
            'seller_id': self.seller_id,
            'product_id': self.product_id,
            'product_price': self.product_price,
            'shipping_fee': self.shipping_fee,
            'service_fee': self.service_fee,
            'total_amount': self.total_amount,
            'status': self.status,
            'shipping_method': self.shipping_method,
            'payment_method': self.payment_method,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'shipped_at': self.shipped_at.isoformat() if self.shipped_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

        if include_details:
            data['buyer'] = {
                'id': self.buyer.id,
                'user_id': self.buyer.user_id,
                'name': self.buyer.name
            }
            data['seller'] = {
                'id': self.seller.id,
                'user_id': self.seller.user_id,
                'name': self.seller.name
            }
            data['product'] = self.product.to_dict()

        return data

    def __repr__(self):
        return f'<Order {self.order_number}>'
