import React, { useState } from 'react';

const ListingPage = () => {
  // State管理
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    bookTitle: '',
    category: '',
    condition: '',
    description: '',
    passion: '',
    saleType: 'normal',
    price: '',
    shipping: ''
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 価格計算
  const calculatePrices = (price) => {
    const salePrice = parseInt(price) || 0;
    const fee = Math.floor(salePrice * 0.1);
    const profit = salePrice - fee;
    return { salePrice, fee, profit };
  };

  const prices = calculatePrices(formData.price);

  // 画像アップロード処理
  const handleImageFiles = (files) => {
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      if (uploadedImages.length >= 10) {
        alert('画像は最大10枚まで登録できます。');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください。');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('画像ファイルのみアップロード可能です。');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // ドラッグ&ドロップイベント
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleImageFiles(files);
  };

  // ファイル選択
  const handleFileSelect = (e) => {
    const files = e.target.files;
    handleImageFiles(files);
  };

  // 画像削除
  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // フォーム入力変更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // タグ追加
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  // タグ削除
  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // フォーム送信
  const handleSubmit = (e) => {
    e.preventDefault();

    // バリデーション
    if (uploadedImages.length === 0) {
      alert('画像を最低1枚アップロードしてください。');
      return;
    }

    if (!formData.bookTitle || !formData.category || !formData.condition ||
        !formData.description || !formData.price || !formData.shipping) {
      alert('必須項目をすべて入力してください。');
      return;
    }

    // 出品データをまとめる
    const listingData = {
      ...formData,
      images: uploadedImages,
      tags: tags,
      calculatedPrices: prices
    };

    console.log('出品データ:', listingData);

    // 出品完了ページへ遷移（React Routerを使う場合）
    // navigate('/listing-complete');
    alert('出品が完了しました！');
  };

  return (
    <div className="listing-page">
      {/* ヘッダー */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <a href="/index.html" className="logo">Bibli</a>
            <div className="search-bar">
              <input type="text" placeholder="キーワードで検索..." />
            </div>
          </div>
          <div className="header-right">
            <div className="header-buttons">
              <a href="/listing_page.html" className="btn btn-primary">出品</a>
              <a href="/login.html" className="btn btn-secondary">ログイン/登録</a>
              <button className="hamburger-menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="page-title">
          <h1>📚 商品を出品する</h1>
          <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        <div className="form-container fade-in">
          <form onSubmit={handleSubmit}>
            {/* 商品情報の入力 */}
            <div className="form-section">
              <h2 className="section-title">商品情報の入力</h2>

              {/* 出品画像 */}
              <div className="form-group">
                <label className="form-label">
                  出品画像<span className="required">*</span>
                </label>
                <div className="help-text">
                  最大10枚まで登録できます。1枚目の画像がメイン画像として表示されます。
                </div>

                <div
                  className={`image-upload-area ${isDragging ? 'dragover' : ''}`}
                  onClick={() => document.getElementById('imageInput').click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <span className="upload-icon">📷</span>
                  <div className="upload-text">ファイルを選択またはドラッグ＆ドロップ</div>
                  <div className="upload-subtext">JPG, PNG, GIF (最大5MB)</div>
                  <input
                    type="file"
                    className="file-input"
                    id="imageInput"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="image-preview-container">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img src={image} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ✕
                      </button>
                      {index === 0 && <div className="main-badge">メイン</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 書籍タイトル */}
              <div className="form-group">
                <label htmlFor="bookTitle" className="form-label">
                  書籍タイトル<span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  className="form-input"
                  placeholder="例: 夏目漱石作品集"
                  value={formData.bookTitle}
                  onChange={handleInputChange}
                  required
                />
                <div className="help-text">正確なタイトルを入力してください。</div>
              </div>

              {/* カテゴリ */}
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  カテゴリ<span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-input form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">カテゴリを選択してください</option>
                  <option value="novel">小説</option>
                  <option value="manga">漫画</option>
                  <option value="specialist">専門書</option>
                  <option value="picture">絵本</option>
                  <option value="magazine">雑誌</option>
                  <option value="foreign">洋書</option>
                  <option value="business">ビジネス書</option>
                  <option value="self-help">自己啓発</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* 商品の状態 */}
              <div className="form-group">
                <label htmlFor="condition" className="form-label">
                  商品の状態<span className="required">*</span>
                </label>
                <select
                  id="condition"
                  name="condition"
                  className="form-input form-select"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">状態を選択してください</option>
                  <option value="new">新品・未使用</option>
                  <option value="like-new">未使用に近い</option>
                  <option value="excellent">目立った傷や汚れなし</option>
                  <option value="good">やや傷や汚れあり</option>
                  <option value="fair">傷や汚れあり</option>
                  <option value="poor">全体的に状態が悪い</option>
                </select>
              </div>

              {/* 商品説明 */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  商品説明<span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input form-textarea"
                  placeholder="本の状態、おすすめポイントなどを詳しく説明してください..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
                <div className="help-text">
                  購入者が安心して購入できるよう、詳しい状態を記載してください。
                </div>
              </div>

              {/* 本への想い */}
              <div className="form-group">
                <label htmlFor="passion" className="form-label">
                  本への想い
                </label>
                <textarea
                  id="passion"
                  name="passion"
                  className="form-input form-textarea"
                  placeholder="この本のどんなところが好きか、次の人にどう読んでほしいか等..."
                  value={formData.passion}
                  onChange={handleInputChange}
                />
                <div className="help-text">
                  任意項目です。この本に対するあなたの想いを次の読者に伝えましょう。
                </div>
              </div>

              {/* タグ付け */}
              <div className="form-group">
                <label htmlFor="tagInput" className="form-label">
                  タグ付け
                </label>
                <input
                  type="text"
                  id="tagInput"
                  className="form-input"
                  placeholder="例: ミステリー, 感動, サイン本 (Enterキーで追加)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                />
                <div className="help-text">
                  商品を見つけやすくするためのタグを追加できます。Enterキーで追加してください。
                </div>
                <div className="tags-container">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 販売形式と価格 */}
            <div className="form-section">
              <h2 className="section-title">販売形式と価格</h2>

              {/* 販売形式 */}
              <div className="form-group">
                <label className="form-label">
                  販売形式<span className="required">*</span>
                </label>
                <div className="radio-group">
                  <div
                    className={`radio-option ${formData.saleType === 'normal' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, saleType: 'normal' }))}
                  >
                    <input
                      type="radio"
                      name="saleType"
                      value="normal"
                      checked={formData.saleType === 'normal'}
                      onChange={handleInputChange}
                    />
                    <label className="radio-label">通常販売</label>
                  </div>
                  <div
                    className={`radio-option ${formData.saleType === 'auction' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, saleType: 'auction' }))}
                  >
                    <input
                      type="radio"
                      name="saleType"
                      value="auction"
                      checked={formData.saleType === 'auction'}
                      onChange={handleInputChange}
                    />
                    <label className="radio-label">オークション</label>
                  </div>
                </div>
              </div>

              {/* 販売価格 */}
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  販売価格<span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#7f8c8d',
                      fontWeight: 600
                    }}
                  >
                    ¥
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="1000"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="100"
                    max="999999"
                  />
                </div>

                <div className="price-calculator">
                  <div className="price-row">
                    <span>販売価格</span>
                    <span>¥{prices.salePrice.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>販売手数料 (10%)</span>
                    <span className="fee">¥{prices.fee.toLocaleString()}</span>
                  </div>
                  <div className="price-row total">
                    <span>販売利益</span>
                    <span className="profit">¥{prices.profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 配送について */}
            <div className="form-section">
              <h2 className="section-title">配送について</h2>

              {/* 配送方法 */}
              <div className="form-group">
                <label htmlFor="shipping" className="form-label">
                  配送方法<span className="required">*</span>
                </label>
                <select
                  id="shipping"
                  name="shipping"
                  className="form-input form-select"
                  value={formData.shipping}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">配送方法を選択してください</option>
                  <option value="yu-packet">ゆうパケット (¥230)</option>
                  <option value="yu-packet-plus">ゆうパケットプラス (¥455)</option>
                  <option value="takkyubin">宅急便コンパクト (¥450)</option>
                  <option value="takkyubin-normal">宅急便 (¥700〜)</option>
                  <option value="letter-pack">レターパック (¥370〜)</option>
                  <option value="other">その他</option>
                </select>
                <div className="help-text">配送料は購入者負担となります。</div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="submit-section">
              <button type="submit" className="submit-btn">
                📤 出品する
              </button>
              <div className="help-text" style={{ marginTop: '1rem' }}>
                出品後、運営による審査を経て公開されます。審査は通常24時間以内に完了します。
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* フッター */}
      <footer className="footer">
        <div className="footer-content">
          <a href="/commercial.html" className="footer-link">特定商取引法に基づく表記</a>
          <a href="/terms.html" className="footer-link">利用規約</a>
          <a href="/privacy.html" className="footer-link">プライバシーポリシー</a>
          <a href="/contact.html" className="footer-link">お問い合わせ</a>
        </div>
      </footer>
    </div>
  );
};

export default ListingPage;
