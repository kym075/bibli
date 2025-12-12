"""
テストユーザー作成スクリプト
出品機能のテスト用に仮ユーザーを作成します
"""
from app import create_app, db
from app.models.user import User

def create_test_user():
    app = create_app()
    with app.app_context():
        # 既存のテストユーザーを確認
        existing_user = User.query.filter_by(email='test@example.com').first()

        if existing_user:
            print('テストユーザーは既に存在します')
            print(f'ユーザーID: {existing_user.user_id}')
            print(f'メール: {existing_user.email}')
            print(f'パスワード: test1234')
            return

        # テストユーザーを作成
        test_user = User(
            user_id='testuser',
            name='テストユーザー',
            name_kana='テストユーザー',
            email='test@example.com',
            phone='09012345678'
        )
        test_user.set_password('test1234')

        db.session.add(test_user)
        db.session.commit()

        print('テストユーザーを作成しました！')
        print(f'ユーザーID: testuser')
        print(f'メール: test@example.com')
        print(f'パスワード: test1234')
        print('\nこのユーザーでログインして出品機能をテストできます。')

if __name__ == '__main__':
    create_test_user()
