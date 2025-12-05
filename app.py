from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(32)
# Database configuration - currently set for SQLite, but prepared for MySQL
# For MySQL, install MySQL server and set the URI like: 'mysql+pymysql://user:pass@localhost/bibli_db'
# Don't forget to create the database beforehand: CREATE DATABASE bibli_db;
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bibli.db'  # Change this to MySQL URI when ready
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)  # CORSを有効化してReactからのリクエストを許可

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask"})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Invalid input"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({"token": token, "user": {"id": user.id, "username": user.username, "email": user.email}})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    result = []
    for product in products:
        result.append({
            'id': product.id,
            'title': product.title,
            'price': product.price,
            'description': product.description or '',
            'category': product.category or ''
        })
    return jsonify(result)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({
        'id': product.id,
        'title': product.title,
        'price': product.price,
        'description': product.description or '',
        'category': product.category or '',
        'seller_id': product.seller_id
    })

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json()
    title = data.get('title')
    price = data.get('price')
    description = data.get('description')
    category = data.get('category')
    seller_id = data.get('seller_id')  # In a real app, get from token

    if not title or not price or seller_id is None:
        return jsonify({"error": "Invalid input"}), 400

    new_product = Product(title=title, price=price, description=description, category=category, seller_id=seller_id)
    db.session.add(new_product)
    db.session.commit()

    return jsonify({"message": "Product created", "id": new_product.id}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables
    app.run(debug=True, port=5000)
