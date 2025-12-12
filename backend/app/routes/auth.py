from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.validators import validate_user_registration, validate_login

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Firebase Admin SDK の初期化は不要（IDトークンの検証のみ行う）
# 本番環境では firebase_admin.auth.verify_id_token() を使用してトークンを検証すべき

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


@bp.route('/firebase-register', methods=['POST'])
def firebase_register():
    """Firebase認証後のユーザー登録API"""
    try:
        data = request.get_json()

        # 必須フィールドチェック
        required_fields = ['uid', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field}が必要です'}), 400

        # Firebase UIDの重複チェック（user_idとしてFirebase UIDを保存）
        if User.query.filter_by(user_id=data['uid']).first():
            return jsonify({'error': 'このアカウントは既に登録されています'}), 409

        # メールアドレスの重複チェック
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'このメールアドレスは既に登録されています'}), 409

        # 新規ユーザー作成
        user = User(
            user_id=data['uid'],  # Firebase UIDをuser_idとして保存
            name=data.get('name', ''),  # オプション
            name_kana=data.get('name_kana', ''),  # オプション
            email=data['email'],
            phone=data.get('phone', '')  # オプション
        )
        # Firebaseで認証済みなのでパスワードハッシュは保存しない（ダミー値）
        user.password_hash = 'firebase_auth'

        db.session.add(user)
        db.session.commit()

        # JWTトークン生成
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'ユーザー登録が完了しました',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': '登録中にエラーが発生しました', 'details': str(e)}), 500


@bp.route('/firebase-login', methods=['POST'])
def firebase_login():
    """Firebase認証後のログインAPI"""
    try:
        data = request.get_json()

        # 必須フィールドチェック
        if 'uid' not in data:
            return jsonify({'error': 'UIDが必要です'}), 400

        # Firebase UIDでユーザー検索
        user = User.query.filter_by(user_id=data['uid']).first()

        if not user:
            return jsonify({'error': 'ユーザーが見つかりません。先に登録してください。'}), 404

        # JWTトークン生成
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'ログインに成功しました',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': 'ログイン中にエラーが発生しました', 'details': str(e)}), 500
