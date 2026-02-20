import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product_id');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isOwnProduct, setIsOwnProduct] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [deliveryProfile, setDeliveryProfile] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('商品IDが指定されていません');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        const data = await response.json();
        if (response.ok) {
          setProduct(data);
        } else {
          setError(data.error || '商品情報の取得に失敗しました');
        }
      } catch (err) {
        console.error('Checkout product fetch error:', err);
        setError('商品情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
      if (!user?.email) {
        setCurrentUserId(null);
        setDeliveryProfile(null);
        navigate('/login');
        return;
      }

      try {
        const [userResponse, profileResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/user/${user.email}`),
          fetch(`http://localhost:5000/api/profile/${user.email}`)
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserId(userData.id);
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setDeliveryProfile(profileData);
        } else {
          setDeliveryProfile(null);
        }
      } catch (err) {
        console.error('User fetch error:', err);
        setDeliveryProfile(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!product?.seller?.id || !currentUserId) {
      setIsOwnProduct(false);
      return;
    }

    setIsOwnProduct(product.seller.id === currentUserId);
  }, [product, currentUserId]);

  const handlePurchase = async () => {
    if (!productId) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (isOwnProduct) {
      setError('自分の商品は購入できません');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          origin: window.location.origin,
          customer_email: currentUser?.email || ''
        })
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setError(data.error || '決済の開始に失敗しました');
    } catch (err) {
      console.error('Checkout session error:', err);
      setError('決済の開始に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizePath = (value) => String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    return `http://localhost:5000/${normalizePath(imageUrl)}`;
  };

  const price = product?.price || 0;
  const shippingFee = 0;
  const serviceFee = 0;
  const totalPrice = price + shippingFee + serviceFee;
  const productImage = product?.image_url || (Array.isArray(product?.image_urls) ? product.image_urls[0] : '');
  const addressText = (deliveryProfile?.address || '').trim();
  const postalMatch = addressText.match(/〒?\d{3}-?\d{4}/);
  const postalCode = postalMatch ? (postalMatch[0].startsWith('〒') ? postalMatch[0] : `〒${postalMatch[0]}`) : '';
  const recipientName = (deliveryProfile?.real_name || deliveryProfile?.user_name || '').trim();
  const addressWithoutPostal = postalMatch ? addressText.replace(postalMatch[0], '').trim() : addressText;

  if (!authChecked || loading) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>読み込み中...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>{error || '商品が見つかりませんでした'}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-title">
          <h1>購入内容の確認</h1>
          <p>ご注文内容をご確認の上、購入を確定してください</p>
        </div>

        <div className="progress-bar">
          <div className="progress-step completed">
            <div className="step-number">1</div>
            <span>商品選択</span>
          </div>
          <div className="progress-divider completed"></div>
          <div className="progress-step active">
            <div className="step-number">2</div>
            <span>購入確認</span>
          </div>
          <div className="progress-divider"></div>
          <div className="progress-step">
            <div className="step-number">3</div>
            <span>購入完了</span>
          </div>
        </div>

        <div className="checkout-container">
          <div className="section-header">
            <h2>ご注文内容</h2>
            <p>以下の内容で購入手続きを進めます</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {isOwnProduct && (
            <div className="error-message">自分の商品は購入できません</div>
          )}

          <div className="product-section">
            <div className="product-item">
              <div className="product-image">
                {productImage ? (
                  <img src={getImageUrl(productImage)} alt={product.title} />
                ) : (
                  'NO IMAGE'
                )}
              </div>
              <div className="product-info">
                <div className="product-title">{product.title}</div>
                <div className="product-author">カテゴリ: {product.category || '未設定'}</div>
                <div className="product-condition">状態: {product.condition || '未設定'}</div>
              </div>
              <div className="product-price">¥{price.toLocaleString()}</div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title delivery-title">お届け先</h3>
            <div className="address-display">
              <div className="address-info">
                <div className="postal-code">{postalCode || '郵便番号未設定'}</div>
                <div className="address-line">
                  {addressWithoutPostal || addressText || '住所が未設定です。ユーザー設定で住所を登録してください。'}
                </div>
                {recipientName && <div className="recipient-name">{recipientName} 様</div>}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title summary-title">お支払い金額</h3>
            <div className="price-summary">
              <div className="price-row">
                <span className="price-label">商品合計</span>
                <span className="price-value">¥{price.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">送料</span>
                <span className="price-value">¥{shippingFee.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">販売手数料</span>
                <span className="price-value">¥{serviceFee.toLocaleString()}</span>
              </div>
              <div className="price-row total">
                <span className="price-label">合計金額</span>
                <span className="price-value total-price">¥{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="purchase-section">
            <div className="security-info">
              この決済はStripeの安全な画面で行われます
            </div>
            <button
              className="purchase-btn"
              id="purchaseBtn"
              onClick={handlePurchase}
              disabled={isSubmitting || isOwnProduct}
            >
              {isSubmitting && <span className="loading" id="loadingIndicator">処理中...</span>}
              {!isSubmitting && <span id="btnText">{isOwnProduct ? '購入できません' : 'Stripeで支払う'}</span>}
            </button>
            <div className="purchase-note">
              ボタンを押すとStripeの決済画面に移動します。<br />
              ご注文後のキャンセルはできませんので、内容をよくご確認ください。
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Checkout;
