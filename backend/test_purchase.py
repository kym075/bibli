"""
購入機能のテストスクリプト
テストユーザーと商品を作成して、購入フローをテストします
"""
from app import create_app, db
from app.models.user import User
from app.models.product import Product
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # 既存のデータをクリア（注意: 本番環境では実行しないこと）
    print("既存のデータをクリアしています...")
    db.drop_all()
    db.create_all()

    # テストユーザー1（出品者）
    seller = User(
        user_id='seller_test_001',
        name='出品太郎',
        name_kana='シュッピンタロウ',
        email='seller@example.com',
        phone='090-1234-5678',
        password_hash=generate_password_hash('password123')
    )
    db.session.add(seller)

    # テストユーザー2（購入者）
    buyer = User(
        user_id='buyer_test_001',
        name='購入花子',
        name_kana='コウニュウハナコ',
        email='buyer@example.com',
        phone='090-8765-4321',
        password_hash=generate_password_hash('password123')
    )
    db.session.add(buyer)

    db.session.commit()

    # テスト商品を作成
    product1 = Product(
        user_id=seller.id,
        title='夏目漱石「こころ」',
        description='綺麗な状態です。一度読んだだけなので、ほぼ新品同様です。',
        price=1200,
        condition='excellent',
        category='novel',
        isbn='9784101010014',
        status='available'
    )

    product2 = Product(
        user_id=seller.id,
        title='ワンピース 1巻',
        description='初版です。少し日焼けがあります。',
        price=800,
        condition='good',
        category='manga',
        status='available'
    )

    product3 = Product(
        user_id=seller.id,
        title='Python入門',
        description='プログラミング初心者向けの専門書です。',
        price=2500,
        condition='like-new',
        category='specialist',
        status='available'
    )

    db.session.add_all([product1, product2, product3])
    db.session.commit()

    print("\n✅ テストデータの作成が完了しました！\n")
    print("=" * 60)
    print("📝 テストアカウント情報")
    print("=" * 60)
    print("\n【出品者アカウント】")
    print(f"  メールアドレス: {seller.email}")
    print(f"  パスワード: password123")
    print(f"  ユーザーID: {seller.user_id}")
    print(f"  登録商品数: 3件")

    print("\n【購入者アカウント】")
    print(f"  メールアドレス: {buyer.email}")
    print(f"  パスワード: password123")
    print(f"  ユーザーID: {buyer.user_id}")

    print("\n" + "=" * 60)
    print("📦 出品商品一覧")
    print("=" * 60)
    products = Product.query.all()
    for p in products:
        print(f"\n商品ID: {p.id}")
        print(f"  タイトル: {p.title}")
        print(f"  価格: ¥{p.price}")
        print(f"  状態: {p.condition}")
        print(f"  カテゴリ: {p.category}")

    print("\n" + "=" * 60)
    print("🚀 次のステップ:")
    print("=" * 60)
    print("1. http://localhost:5173 にアクセス")
    print("2. 購入者アカウントでログイン")
    print("   - メール: buyer@example.com")
    print("   - パスワード: password123")
    print("3. 商品一覧から商品を選択")
    print("4. 「購入する」ボタンをクリック")
    print("5. 購入確認画面で「購入を確定する」をクリック")
    print("6. 購入完了画面が表示されることを確認")
    print("=" * 60)
