from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Order(db.Model):
    """注文テーブル"""
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    product_name = db.Column(db.String(200), nullable=False)
    product_price = db.Column(db.Integer, nullable=False)
    shipping_fee = db.Column(db.Integer, nullable=False)
    service_fee = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Integer, nullable=False)

    # 配送情報
    shipping_postal_code = db.Column(db.String(10), nullable=False)
    shipping_address = db.Column(db.String(300), nullable=False)
    shipping_name = db.Column(db.String(100), nullable=False)

    # 支払い情報
    payment_method = db.Column(db.String(50), nullable=False)
    payment_card_last4 = db.Column(db.String(4))

    # ステータス
    status = db.Column(db.String(50), default='pending')  # pending, paid, shipped, completed, cancelled

    # タイムスタンプ
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 配送予定日
    estimated_delivery_date = db.Column(db.DateTime)

    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_price': self.product_price,
            'shipping_fee': self.shipping_fee,
            'service_fee': self.service_fee,
            'total_amount': self.total_amount,
            'shipping_postal_code': self.shipping_postal_code,
            'shipping_address': self.shipping_address,
            'shipping_name': self.shipping_name,
            'payment_method': self.payment_method,
            'payment_card_last4': self.payment_card_last4,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'estimated_delivery_date': self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None
        }


class Product(db.Model):
    """商品テーブル（簡易版）"""
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100))
    price = db.Column(db.Integer, nullable=False)
    stock = db.Column(db.Integer, default=1)
    category = db.Column(db.String(50))
    condition = db.Column(db.String(50))
    seller_id = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'price': self.price,
            'stock': self.stock,
            'category': self.category,
            'condition': self.condition,
            'seller_id': self.seller_id,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
