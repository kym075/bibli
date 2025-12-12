import re

def validate_user_registration(data):
    """ユーザー登録のバリデーション"""
    errors = {}

    # ユーザーID
    if not data.get('userId'):
        errors['userId'] = 'ユーザーIDは必須です'
    elif len(data['userId']) < 4:
        errors['userId'] = 'ユーザーIDは4文字以上で入力してください'
    elif not re.match(r'^[a-zA-Z0-9_]+$', data['userId']):
        errors['userId'] = '半角英数字とアンダースコア(_)のみ使用できます'

    # 氏名
    if not data.get('name'):
        errors['name'] = '氏名は必須です'

    # フリガナ
    if not data.get('nameKana'):
        errors['nameKana'] = 'フリガナは必須です'
    elif not re.match(r'^[ぁ-んァ-ヶー]+$', data['nameKana']):
        errors['nameKana'] = 'ひらがなまたはカタカナで入力してください'

    # メールアドレス
    if not data.get('email'):
        errors['email'] = 'メールアドレスは必須です'
    elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', data['email']):
        errors['email'] = '有効なメールアドレスを入力してください'

    # 電話番号
    if not data.get('phone'):
        errors['phone'] = '電話番号は必須です'
    elif not re.match(r'^[0-9]{10,11}$', data['phone']):
        errors['phone'] = '10桁または11桁の数字で入力してください'

    # パスワード
    if not data.get('password'):
        errors['password'] = 'パスワードは必須です'
    elif len(data['password']) < 8:
        errors['password'] = 'パスワードは8文字以上で入力してください'
    elif not (re.search(r'[a-zA-Z]', data['password']) and re.search(r'[0-9]', data['password'])):
        errors['password'] = 'パスワードは英字と数字を含める必要があります'

    return len(errors) == 0, errors


def validate_login(data):
    """ログインのバリデーション"""
    errors = {}

    if not data.get('identifier'):
        errors['identifier'] = 'メールアドレスまたはユーザーIDを入力してください'

    if not data.get('password'):
        errors['password'] = 'パスワードを入力してください'

    return len(errors) == 0, errors


def validate_product(data):
    """商品出品のバリデーション"""
    errors = {}

    # タイトル
    if not data.get('title'):
        errors['title'] = 'タイトルは必須です'
    elif len(data['title']) > 200:
        errors['title'] = 'タイトルは200文字以内で入力してください'

    # 説明
    if not data.get('description'):
        errors['description'] = '説明は必須です'

    # 価格
    if not data.get('price'):
        errors['price'] = '価格は必須です'
    elif not isinstance(data['price'], int) or data['price'] < 0:
        errors['price'] = '価格は0以上の整数で入力してください'

    # 状態
    if not data.get('condition'):
        errors['condition'] = '商品の状態は必須です'
    elif data['condition'] not in ['new', 'like-new', 'excellent', 'good', 'fair', 'poor']:
        errors['condition'] = '有効な状態を選択してください'

    # カテゴリ
    if not data.get('category'):
        errors['category'] = 'カテゴリは必須です'

    return len(errors) == 0, errors
