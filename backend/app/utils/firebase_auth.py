"""
Firebase認証ユーティリティ（簡易版）
フロントエンドから送信されたFirebase IDトークンとUIDを処理
"""
from functools import wraps
from flask import request, jsonify
from app.models.user import User


def firebase_required(f):
    """
    Firebase認証が必要なエンドポイント用デコレータ（簡易版）

    フロントエンドからAuthorizationヘッダーで以下を送信:
    Authorization: Bearer <firebase_uid>

    注意: これは簡易実装です。本番環境では必ずFirebase Admin SDKでトークンを検証してください。
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({'error': '認証が必要です'}), 401

        try:
            # "Bearer <firebase_uid>" の形式を想定
            parts = auth_header.split()
            if len(parts) != 2 or parts[0] != 'Bearer':
                return jsonify({'error': '無効な認証形式です'}), 401

            firebase_uid = parts[1]

            # Firebase UIDでユーザーを検索
            user = User.query.filter_by(firebase_uid=firebase_uid).first()

            if not user:
                return jsonify({'error': 'ユーザーが見つかりません'}), 404

            # リクエストコンテキストにユーザー情報を追加
            request.current_user = user
            request.current_user_id = user.id

            return f(*args, **kwargs)

        except Exception as e:
            print(f'[ERROR] Firebase認証エラー: {str(e)}')
            return jsonify({'error': '認証に失敗しました', 'details': str(e)}), 401

    return decorated_function


def get_current_user():
    """現在認証されているユーザーを取得"""
    return getattr(request, 'current_user', None)


def get_current_user_id():
    """現在認証されているユーザーのIDを取得"""
    return getattr(request, 'current_user_id', None)
