from datetime import datetime
from app import db

class Product(db.Model):
    """商品モデル"""
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    condition = db.Column(db.String(50), nullable=False)  # 新品/ほぼ新品/良好/可
    category = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), default='available', nullable=False)  # available/reserved/sold
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # リレーション
    images = db.relationship('ProductImage', backref='product', lazy=True, cascade='all, delete-orphan', order_by='ProductImage.display_order')

    def to_dict(self, include_seller=False):
        """辞書形式に変換"""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'condition': self.condition,
            'category': self.category,
            'isbn': self.isbn,
            'status': self.status,
            'images': [img.to_dict() for img in self.images],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        if include_seller:
            data['seller'] = {
                'id': self.seller.id,
                'user_id': self.seller.user_id,
                'name': self.seller.name
            }
        return data

    def __repr__(self):
        return f'<Product {self.title}>'


class ProductImage(db.Model):
    """商品画像モデル"""
    __tablename__ = 'product_images'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    image_id = db.Column(db.String(100), unique=True, nullable=False, index=True)  # 固有ID (UUID)
    image_url = db.Column(db.String(500), nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'image_id': self.image_id,
            'image_url': self.image_url,
            'display_order': self.display_order
        }

    def __repr__(self):
        return f'<ProductImage {self.image_id}>'
