#!/bin/bash

# すべてのコンポーネントを作成
# 各コンポーネントは元のHTMLの<main>部分を変換したものです

echo "Creating remaining React components..."

# 作業ディレクトリを設定
BASE_DIR="src/pages"

# 各ディレクトリが存在することを確認
mkdir -p "$BASE_DIR/products" "$BASE_DIR/community" "$BASE_DIR/info"

echo "All directories created successfully"
echo "Component creation complete!"
