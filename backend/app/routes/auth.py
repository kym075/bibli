from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.validators import validate_user_registration, validate_login
from app.utils.firebase_auth import firebase_required, get_current_user_id
import uuid

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """ユーザー登録API"""
    try:
        data = request.get_json()

        # バリデーション
        is_valid, errors = validate_user_registration(data)
        if not is_valid:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400

        # 既存ユーザーチェック
        if User.query.filter_by(user_id=data['userId']).first():
            return jsonify({'error': 'このユーザーIDは既に使用されています'}), 409

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'このメールアドレスは既に登録されています'}), 409

        # 新規ユーザー作成
        user = User(
            user_id=data['userId'],
            name=data['name'],
            name_kana=data['nameKana'],
            email=data['email'],
            phone=data['phone']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'message': 'ユーザー登録が完了しました',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '登録中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/login', methods=['POST'])
def login():
    """ログインAPI"""
    try:
        data = request.get_json()

        # バリデーション
        is_valid, errors = validate_login(data)
        if not is_valid:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400

        # ユーザー検索 (email または user_idでログイン可能)
        user = User.query.filter(
            (User.email == data['identifier']) | (User.user_id == data['identifier'])
        ).first()

        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'メールアドレス/ユーザーIDまたはパスワードが正しくありません'}), 401

        # JWTトークン生成
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'ログインに成功しました',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': 'ログイン中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """現在ログイン中のユーザー情報を取得"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'ユーザーが見つかりません'}), 404

        return jsonify({'user': user.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': 'ユーザー情報の取得中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/firebase/register', methods=['POST'])
def firebase_register():
    """Firebase認証後のユーザー登録API"""
    try:
        data = request.get_json()

        firebase_uid = data.get('firebase_uid')
        email = data.get('email')
        name = data.get('name')
        name_kana = data.get('nameKana', '')
        user_id_input = data.get('userId')
        phone = data.get('phone', '')

        # 必須フィールドチェック
        if not firebase_uid or not email or not name:
            return jsonify({'error': '必須フィールドが不足しています'}), 400

        # 既存ユーザーチェック（Firebase UIDで）
        existing_user = User.query.filter_by(firebase_uid=firebase_uid).first()
        if existing_user:
            return jsonify({
                'message': 'ユーザーは既に登録されています',
                'user': existing_user.to_dict()
            }), 200

        # メールアドレスの重複チェック
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'このメールアドレスは既に登録されています'}), 409

        # ユーザーIDの生成または検証
        if user_id_input:
            if User.query.filter_by(user_id=user_id_input).first():
                return jsonify({'error': 'このユーザーIDは既に使用されています'}), 409
            user_id = user_id_input
        else:
            # ユーザーIDを自動生成
            user_id = f"user_{uuid.uuid4().hex[:8]}"

        # 新規ユーザー作成
        user = User(
            user_id=user_id,
            firebase_uid=firebase_uid,
            name=name,
            name_kana=name_kana,
            email=email,
            phone=phone
        )

        db.session.add(user)
        db.session.commit()

        print(f'[INFO] Firebase経由でユーザー登録: {email} (UID: {firebase_uid})')

        return jsonify({
            'message': 'ユーザー登録が完了しました',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        print(f'[ERROR] Firebase登録エラー: {str(e)}')
        db.session.rollback()
        return jsonify({'error': '登録中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/firebase/me', methods=['GET'])
@firebase_required
def get_firebase_user():
    """Firebase認証ユーザーの情報取得"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'ユーザーが見つかりません'}), 404

        return jsonify({'user': user.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': 'ユーザー情報の取得中にエラーが発生しました', 'details': str(e)}), 500
