import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename
from PIL import Image

def allowed_file(filename):
    """ファイル拡張子が許可されているかチェック"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def save_product_image(file, product_id):
    """商品画像を保存してIDとURLを返す"""
    # ファイル拡張子取得
    ext = file.filename.rsplit('.', 1)[1].lower()

    # 固有IDを生成 (UUID)
    image_id = f"{uuid.uuid4().hex}.{ext}"

    # 保存先ディレクトリ
    upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products')
    os.makedirs(upload_folder, exist_ok=True)

    # ファイルパス
    file_path = os.path.join(upload_folder, image_id)

    # 画像を保存 (Pillow経由でリサイズ・最適化)
    img = Image.open(file)

    # 最大サイズを1200pxに制限
    max_size = (1200, 1200)
    img.thumbnail(max_size, Image.Resampling.LANCZOS)

    # EXIF情報に基づいて画像を回転
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except:
        pass

    # 保存
    img.save(file_path, optimize=True, quality=85)

    # URL生成
    image_url = f"/api/products/images/{image_id}"

    return image_id, image_url
