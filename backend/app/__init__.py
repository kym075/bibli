from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

# データベースインスタンス
db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_class=Config):
    """Flaskアプリケーションファクトリ"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 拡張機能の初期化
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # ブループリント(ルート)の登録
    from app.routes import auth, products, orders
    app.register_blueprint(auth.bp)
    app.register_blueprint(products.bp)
    app.register_blueprint(orders.bp)

    # データベーステーブルの作成
    with app.app_context():
        db.create_all()

    return app
