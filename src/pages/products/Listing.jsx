import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function Listing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    description: '',
    passion: '',
    saleType: 'normal',
    price: '',
    shipping: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/products/listing-complete');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-title">
          <h1>📚 商品を出品する</h1>
          <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        <div className="form-container fade-in">
          <form id="listingForm" onSubmit={handleSubmit}>
            <div className="success-message" id="successMessage">
              ✅ 出品が完了しました！商品は審査後に公開されます。
            </div>

            {/* 商品情報の入力 */}
            <div className="form-section">
              <h2 className="section-title">商品情報の入力</h2>

              {/* 出品画像 */}
              <div className="form-group">
                <label className="form-label">出品画像<span className="required">*</span></label>
                <div className="help-text">最大10枚まで登録できます。1枚目の画像がメイン画像として表示されます。</div>

                <div className="image-upload-area" id="imageUploadArea">
                  <span className="upload-icon">📷</span>
                  <div className="upload-text">ファイルを選択またはドラッグ＆ドロップ</div>
                  <div className="upload-subtext">JPG, PNG, GIF (最大5MB)</div>
                  <input type="file" className="file-input" id="imageInput" multiple accept="image/*" />
                </div>

                <div className="image-preview-container" id="imagePreviewContainer"></div>
              </div>

              {/* 書籍タイトル */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">書籍タイトル<span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  placeholder="例: 夏目漱石作品集"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
                <div className="help-text">正確なタイトルを入力してください。</div>
              </div>

              {/* カテゴリ */}
              <div className="form-group">
                <label htmlFor="category" className="form-label">カテゴリ<span className="required">*</span></label>
                <select
                  id="category"
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
                <label htmlFor="condition" className="form-label">商品の状態<span className="required">*</span></label>
                <select
                  id="condition"
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
                <label htmlFor="description" className="form-label">商品説明<span className="required">*</span></label>
                <textarea
                  id="description"
                  className="form-input form-textarea"
                  placeholder="本の状態、おすすめポイントなどを詳しく説明してください..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
                <div className="help-text">購入者が安心して購入できるよう、詳しい状態を記載してください。</div>
              </div>

              {/* 本への想い */}
              <div className="form-group">
                <label htmlFor="passion" className="form-label">本への想い</label>
                <textarea
                  id="passion"
                  className="form-input form-textarea"
                  placeholder="この本のどんなところが好きか、次の人にどう読んでほしいか等..."
                  value={formData.passion}
                  onChange={handleInputChange}
                ></textarea>
                <div className="help-text">任意項目です。この本に対するあなたの想いを次の読者に伝えましょう。</div>
              </div>

              {/* タグ付け */}
              <div className="form-group">
                <label htmlFor="tags" className="form-label">タグ付け</label>
                <input type="text" id="tagInput" className="form-input" placeholder="例: ミステリー, 感動, サイン本 (Enterキーで追加)" />
                <div className="help-text">商品を見つけやすくするためのタグを追加できます。Enterキーで追加してください。</div>
                <div className="tags-container" id="tagsContainer"></div>
              </div>
            </div>

            {/* 販売形式と価格 */}
            <div className="form-section">
              <h2 className="section-title">販売形式と価格</h2>

              {/* 販売形式 */}
              <div className="form-group">
                <label className="form-label">販売形式<span className="required">*</span></label>
                <div className="radio-group">
                  <div className="radio-option selected" data-value="normal">
                    <input type="radio" name="saleType" value="normal" checked={formData.saleType === 'normal'} onChange={handleInputChange} />
                    <label className="radio-label">通常販売</label>
                  </div>
                  <div className="radio-option" data-value="auction">
                    <input type="radio" name="saleType" value="auction" checked={formData.saleType === 'auction'} onChange={handleInputChange} />
                    <label className="radio-label">オークション</label>
                  </div>
                </div>
              </div>

              {/* 販売価格 */}
              <div className="form-group">
                <label htmlFor="price" className="form-label">販売価格<span className="required">*</span></label>
                <div style={{position: 'relative'}}>
                  <span style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#7f8c8d', fontWeight: '600'}}>¥</span>
                  <input
                    type="number"
                    id="price"
                    className="form-input"
                    style={{paddingLeft: '2.5rem'}}
                    placeholder="1000"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="100"
                    max="999999"
                  />
                </div>

                <div className="price-calculator" id="priceCalculator">
                  <div className="price-row">
                    <span>販売価格</span>
                    <span id="salePrice">¥0</span>
                  </div>
                  <div className="price-row">
                    <span>販売手数料 (10%)</span>
                    <span className="fee" id="fee">¥0</span>
                  </div>
                  <div className="price-row total">
                    <span>販売利益</span>
                    <span className="profit" id="profit">¥0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 配送について */}
            <div className="form-section">
              <h2 className="section-title">配送について</h2>

              {/* 配送方法 */}
              <div className="form-group">
                <label htmlFor="shipping" className="form-label">配送方法<span className="required">*</span></label>
                <select
                  id="shipping"
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
              <button type="submit" className="submit-btn">📤 出品する</button>
              <div className="help-text" style={{marginTop: '1rem'}}>
                出品後、運営による審査を経て公開されます。審査は通常24時間以内に完了します。
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Listing;
