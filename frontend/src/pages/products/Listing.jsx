import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../../css/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/listing_page.css';

function Listing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    genre: '',
    condition: '',
    description: '',
    passion: '',
    saleType: 'fixed',
    price: '',
    shipping: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ログインチェック
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('商品を出品するにはログインが必要です');
      navigate('/login');
      return;
    }

    // バリデーション
    if (!formData.title || !formData.price || !formData.category || !formData.condition) {
      alert('必須項目を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // ユーザーIDを取得（Firebaseのメールアドレスでデータベースから検索）
      const userResponse = await fetch(`http://localhost:5000/api/user/${currentUser.email}`);
      if (!userResponse.ok) {
        throw new Error('ユーザー情報の取得に失敗しました');
      }
      const userData = await userResponse.json();

      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('price', parseInt(formData.price, 10));
      formPayload.append('condition', formData.condition);
      formPayload.append('sale_type', formData.saleType);
      formPayload.append('seller_id', userData.id);
      formPayload.append('category', formData.category);

      if (selectedImages.length > 0) {
        formPayload.append('image', selectedImages[0].file);
      }

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formPayload
      });

      if (!response.ok) {
        throw new Error('商品の出品に失敗しました');
      }

      navigate('/products/listing-complete');
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('商品の出品に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageUploadClick = () => {
    document.getElementById('imageInput').click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 10) {
      alert('最大10枚までアップロードできます');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
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

                <div className="image-upload-area" id="imageUploadArea" onClick={handleImageUploadClick} style={{cursor: 'pointer'}}>
                  <span className="upload-icon">📷</span>
                  <div className="upload-text">ファイルを選択またはドラッグ＆ドロップ</div>
                  <div className="upload-subtext">JPG, PNG, GIF (最大5MB)</div>
                  <input type="file" className="file-input" id="imageInput" multiple accept="image/*" onChange={handleImageChange} style={{display: 'none'}} />
                </div>

                <div className="image-preview-container" id="imagePreviewContainer">
                  {selectedImages.map((image, index) => (
                    <div key={index} style={{position: 'relative', display: 'inline-block', margin: '10px'}}>
                      <img src={image.preview} alt={`preview-${index}`} style={{width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px'}} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'rgba(255, 0, 0, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '25px',
                          height: '25px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
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
                  <option value="小説">小説</option>
                  <option value="漫画">漫画</option>
                  <option value="専門書">専門書</option>
                  <option value="絵本">絵本</option>
                  <option value="雑誌">雑誌</option>
                  <option value="洋書">洋書</option>
                  <option value="自己啓発">自己啓発</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              {/* ジャンル */}
              <div className="form-group">
                <label htmlFor="genre" className="form-label">ジャンル</label>
                <select
                  id="genre"
                  className="form-input form-select"
                  value={formData.genre}
                  onChange={handleInputChange}
                >
                  <option value="">ジャンルを選択してください（任意）</option>
                  <option value="ファンタジー">ファンタジー</option>
                  <option value="純文学">純文学</option>
                  <option value="ホラー">ホラー</option>
                  <option value="歴史">歴史</option>
                  <option value="童話">童話</option>
                  <option value="恋愛">恋愛</option>
                  <option value="ビジネス書">ビジネス書</option>
                  <option value="自己啓発">自己啓発</option>
                  <option value="その他">その他</option>
                </select>
                <div className="help-text">より詳細な分類を指定できます。</div>
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
                  <option value="excellent">非常に良い</option>
                  <option value="good">良い</option>
                  <option value="fair">普通</option>
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
                  <div className="radio-option selected" data-value="fixed">
                    <input type="radio" name="saleType" id="saleType" value="fixed" checked={formData.saleType === 'fixed'} onChange={handleInputChange} />
                    <label className="radio-label">固定価格</label>
                  </div>
                  <div className="radio-option" data-value="auction">
                    <input type="radio" name="saleType" value="auction" checked={formData.saleType === 'auction'} onChange={handleInputChange} />
                    <label className="radio-label">オークション</label>
                  </div>
                  <div className="radio-option" data-value="negotiable">
                    <input type="radio" name="saleType" value="negotiable" checked={formData.saleType === 'negotiable'} onChange={handleInputChange} />
                    <label className="radio-label">価格交渉可</label>
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
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? '出品中...' : '📤 出品する'}
              </button>
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
