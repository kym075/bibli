import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
    price: '',
    shipping: '',
    shippingOrigin: '',
    shippingDays: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const interrupted = sessionStorage.getItem('listing_upload_interrupted');
    if (interrupted) {
      setFormError('画像アップロードが中断されました。再度アップロードしてください。');
      sessionStorage.removeItem('listing_upload_interrupted');
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedImages.length > 0 && !isSubmitting) {
        sessionStorage.setItem('listing_upload_interrupted', '1');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedImages, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      setFormError('送信中です。しばらくお待ちください。');
      return;
    }
    if (!navigator.onLine) {
      setFormError('ネットワークに接続されていません。通信状況を確認してください。');
      return;
    }

    // ログインチェック
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login', { state: { message: '商品を出品するにはログインが必要です' } });
      return;
    }

    // バリデーション（まとめて表示 + 項目別表示）
    const nextErrors = {};
    if (!selectedImages.length) nextErrors.images = '出品画像を追加してください';
    if (!formData.title) nextErrors.title = '書籍タイトルを入力してください';
    if (!formData.category) nextErrors.category = 'カテゴリを選択してください';
    if (!formData.condition) nextErrors.condition = '商品の状態を選択してください';
    if (!formData.description) nextErrors.description = '商品説明を入力してください';
    if (!formData.price) nextErrors.price = '販売価格を入力してください';
    if (!formData.shippingOrigin) nextErrors.shippingOrigin = '発送元の地域を選択してください';
    if (!formData.shippingDays) nextErrors.shippingDays = '発送までの日数を選択してください';
    if (!formData.shipping) nextErrors.shipping = '配送方法を選択してください';

    const priceValue = parseInt(formData.price, 10);
    if (formData.price && (!Number.isFinite(priceValue) || priceValue < 300 || priceValue > 999999)) {
      nextErrors.price = '販売価格は300〜999999円で入力してください';
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setFormError('入力内容を確認してください。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

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
      formPayload.append('sale_type', 'fixed');
      formPayload.append('seller_id', userData.id);
      formPayload.append('category', formData.category);
      formPayload.append('shipping_origin', formData.shippingOrigin);
      formPayload.append('shipping_days', formData.shippingDays);

      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          formPayload.append('images', image.file);
        });
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
      setFormError('商品の出品に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (formError) setFormError('');
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleImageUploadClick = () => {
    document.getElementById('imageInput').click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 10) {
      setFormError('最大10枚までアップロードできます');
      setFieldErrors(prev => ({ ...prev, images: '出品画像は最大10枚まで追加できます' }));
      return;
    }

    const validFiles = [];
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setFormError('画像ファイルのみアップロード可能です。');
        setFieldErrors(prev => ({ ...prev, images: '画像ファイルのみアップロード可能です。' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('ファイルサイズは5MB以下にしてください。');
        setFieldErrors(prev => ({ ...prev, images: 'ファイルサイズは5MB以下にしてください。' }));
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    if (formError) setFormError('');
    if (fieldErrors.images) {
      setFieldErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      if (newImages.length === 0) {
        sessionStorage.removeItem('listing_upload_interrupted');
      }
      return newImages;
    });
  };

  const priceValue = parseInt(formData.price, 10);
  const safePrice = Number.isFinite(priceValue) ? priceValue : 0;
  const fee = Math.floor(safePrice * 0.1);
  const profit = safePrice - fee;
  const shippingFees = {
    'yu-packet': 230,
    'yu-packet-plus': 455,
    'takkyubin': 450,
    'takkyubin-normal': 700,
    'letter-pack': 370,
    'other': 0
  };
  const shippingFee = shippingFees[formData.shipping] ?? 0;
  const buyerTotal = safePrice + shippingFee;

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-title">
          <h1>商品を出品する</h1>
          <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        <div className="form-container fade-in">
          <form id="listingForm" onSubmit={handleSubmit} noValidate>
            {formError && <div className="error-message">{formError}</div>}
            <div className="success-message" id="successMessage">
              出品が完了しました！商品は審査後に公開されます。
            </div>

            {/* 商品情報の入力 */}
            <div className="form-section">
              <h2 className="section-title">商品情報の入力</h2>

              {/* 出品画像 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">出品画像<span className="required">*</span></span>
                  {fieldErrors.images && <span className="form-error-inline">{fieldErrors.images}</span>}
                </label>
                <div className="help-text">最大10枚まで登録できます。1枚目の画像がメイン画像として表示されます。</div>

                <div className="image-upload-area" id="imageUploadArea" onClick={handleImageUploadClick} style={{cursor: 'pointer'}}>
                  <span className="upload-icon">IMG</span>
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
                <label htmlFor="title" className="form-label form-label-row">
                  <span className="label-text">書籍タイトル<span className="required">*</span></span>
                  {fieldErrors.title && <span className="form-error-inline">{fieldErrors.title}</span>}
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  placeholder="例: 夏目漱石作品集"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                
                <div className="help-text">正確なタイトルを入力してください。</div>
              </div>

              {/* カテゴリ */}
              <div className="form-group">
                <label htmlFor="category" className="form-label form-label-row">
                  <span className="label-text">カテゴリ<span className="required">*</span></span>
                  {fieldErrors.category && <span className="form-error-inline">{fieldErrors.category}</span>}
                </label>
                <select
                  id="category"
                  className="form-input form-select"
                  value={formData.category}
                  onChange={handleInputChange}
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
                <label htmlFor="condition" className="form-label form-label-row">
                  <span className="label-text">商品の状態<span className="required">*</span></span>
                  {fieldErrors.condition && <span className="form-error-inline">{fieldErrors.condition}</span>}
                </label>
                <select
                  id="condition"
                  className="form-input form-select"
                  value={formData.condition}
                  onChange={handleInputChange}
                >
                  <option value="">状態を選択してください</option>
                  <option value="excellent">非常に良い</option>
                  <option value="good">良い</option>
                  <option value="fair">普通</option>
                </select>
                
              </div>

              {/* 商品説明 */}
              <div className="form-group">
                <label htmlFor="description" className="form-label form-label-row">
                  <span className="label-text">商品説明<span className="required">*</span></span>
                  {fieldErrors.description && <span className="form-error-inline">{fieldErrors.description}</span>}
                </label>
                <textarea
                  id="description"
                  className="form-input form-textarea"
                  placeholder="本の状態、おすすめポイントなどを詳しく説明してください..."
                  value={formData.description}
                  onChange={handleInputChange}
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

            {/* 販売価格 */}
            <div className="form-section">
              <h2 className="section-title">販売価格</h2>

              {/* 販売価格 */}
              <div className="form-group">
                <label htmlFor="price" className="form-label form-label-row">
                  <span className="label-text">販売価格<span className="required">*</span></span>
                  {fieldErrors.price && <span className="form-error-inline">{fieldErrors.price}</span>}
                </label>
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
                    min="300"
                    max="999999"
                  />
                </div>
                

                <div className="price-calculator" id="priceCalculator">
                  <div className="price-row">
                    <span>販売価格</span>
                    <span id="salePrice">¥{safePrice.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>送料</span>
                    <span id="shippingFee">¥{shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>購入者支払額</span>
                    <span id="buyerTotal">¥{buyerTotal.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>販売手数料 (10%)</span>
                    <span className="fee" id="fee">-¥{fee.toLocaleString()}</span>
                  </div>
                  <div className="price-row total">
                    <span>販売利益</span>
                    <span className="profit" id="profit">¥{profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 配送について */}
            <div className="form-section">
              <h2 className="section-title">配送について</h2>

              {/* 発送元の地域 */}
              <div className="form-group">
                <label htmlFor="shippingOrigin" className="form-label form-label-row">
                  <span className="label-text">発送元の地域<span className="required">*</span></span>
                  {fieldErrors.shippingOrigin && <span className="form-error-inline">{fieldErrors.shippingOrigin}</span>}
                </label>
                <select
                  id="shippingOrigin"
                  className="form-input form-select"
                  value={formData.shippingOrigin}
                  onChange={handleInputChange}
                >
                  <option value="">発送元の地域を選択してください</option>
                  <option value="北海道">北海道</option>
                  <option value="東北">東北</option>
                  <option value="関東">関東</option>
                  <option value="中部">中部</option>
                  <option value="近畿">近畿</option>
                  <option value="中国">中国</option>
                  <option value="四国">四国</option>
                  <option value="九州">九州</option>
                  <option value="沖縄">沖縄</option>
                </select>
                
              </div>

              {/* 発送までの日数 */}
              <div className="form-group">
                <label htmlFor="shippingDays" className="form-label form-label-row">
                  <span className="label-text">発送までの日数<span className="required">*</span></span>
                  {fieldErrors.shippingDays && <span className="form-error-inline">{fieldErrors.shippingDays}</span>}
                </label>
                <select
                  id="shippingDays"
                  className="form-input form-select"
                  value={formData.shippingDays}
                  onChange={handleInputChange}
                >
                  <option value="">発送までの日数を選択してください</option>
                  <option value="1-2日">1-2日で発送</option>
                  <option value="2-3日">2-3日で発送</option>
                  <option value="4-7日">4-7日で発送</option>
                </select>
                
              </div>

              {/* 配送方法 */}
              <div className="form-group">
                <label htmlFor="shipping" className="form-label form-label-row">
                  <span className="label-text">配送方法<span className="required">*</span></span>
                  {fieldErrors.shipping && <span className="form-error-inline">{fieldErrors.shipping}</span>}
                </label>
                <select
                  id="shipping"
                  className="form-input form-select"
                  value={formData.shipping}
                  onChange={handleInputChange}
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
                {isSubmitting ? '出品中...' : '出品する'}
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
