from flask import Flask, jsonify
from flask_cors import CORS
from models.database import db
from routes.purchase_routes import purchase_bp
from config import Config

def create_app():
    """Flaskアプリケーションファクトリ"""
    app = Flask(__name__)

    # 設定をロード
    app.config.from_object(Config)

    # CORS設定（開発環境用）
    CORS(app, resources={
        r"/api/*": {
            "origins": Config.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # データベース初期化
    db.init_app(app)

    # ブループリント登録
    app.register_blueprint(purchase_bp)

    # ヘルスチェックエンドポイント
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'ok',
            'message': 'Bibli Purchase API is running'
        }), 200

    # ルート
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'message': 'Welcome to Bibli Purchase API',
            'version': '1.0.0',
            'endpoints': {
                'create_order': 'POST /api/purchase/create',
                'purchase_history': 'GET /api/purchase/history/<user_id>',
                'order_detail': 'GET /api/purchase/order/<order_id>',
                'cancel_order': 'POST /api/purchase/order/<order_id>/cancel'
            }
        }), 200

    # エラーハンドラー
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'エンドポイントが見つかりません'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': '内部サーバーエラーが発生しました'
        }), 500

    return app


if __name__ == '__main__':
    app = create_app()

    # データベーステーブルを作成
    with app.app_context():
        db.create_all()
        print("データベーステーブルが作成されました")

    # サーバー起動
    print("Bibli Purchase APIサーバーを起動中...")
    print("URL: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
