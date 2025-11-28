from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)  # Allow cross-origin requests for API

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and '.' in path:
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API endpoints
@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "Flask backend is running"})

@app.route('/api/products')
def get_products():
    # Dummy data for testing
    products = [
        {"id": 1, "title": "夏目漱石作品集", "price": 1200},
        {"id": 2, "title": "JavaScript完全ガイド", "price": 2800}
    ]
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True)
