import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  // 配送・決済情報
  const [shippingMethod, setShippingMethod] = useState('ゆうパケット');
  const [shippingFee, setShippingFee] = useState(230);
  const [paymentMethod, setPaymentMethod] = useState('クレジットカード');

  useEffect(() => {
    // location.stateから商品情報を取得
    if (location.state && location.state.product) {
      setProduct(location.state.product);
    } else {
      // 商品情報がない場合はホームに戻す
      navigate('/');
    }
  }, [location, navigate]);

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'novel': '小説',
      'manga': '漫画',
      'specialist': '専門書',
      'picture': '絵本',
      'magazine': '雑誌',
      'foreign': '洋書',
      'business': 'ビジネス書',
      'self-help': '自己啓発'
    };
    return categoryMap[category] || category;
  };

  const getConditionLabel = (condition) => {
    const conditionMap = {
      'new': '新品・未使用',
      'like-new': '未使用に近い',
      'excellent': '目立った傷や汚れなし',
      'good': 'やや傷や汚れあり',
      'fair': '傷や汚れあり',
      'poor': '全体的に状態が悪い'
    };
    return conditionMap[condition] || condition;
  };

  const handlePurchase = async () => {
    if (!product) return;

    setLoading(true);
    setError(null);

    try {
      const firebase_uid = localStorage.getItem('firebase_uid');

      if (!firebase_uid) {
        setError('ログインが必要です');
        setLoading(false);
        navigate('/login');
        return;
      }

      // 購入処理 - Firebase UIDを認証トークンとして送信
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebase_uid}`
        },
        body: JSON.stringify({
          product_id: product.id,
          shipping_method: shippingMethod,
          shipping_fee: shippingFee,
          payment_method: paymentMethod,
          shipping_address: '東京都渋谷区神南1-23-45 Bibliマンション 101号室'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '購入に失敗しました');
      }

      const data = await response.json();
      console.log('購入成功:', data);

      // 購入完了画面へ遷移
      navigate('/purchase-complete', { state: { order: data.order } });

    } catch (err) {
      console.error('購入エラー:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <>
        <Header />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
            読み込み中...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const productPrice = product.price;
  const serviceFee = Math.floor(productPrice * 0.1);
  const totalAmount = productPrice + shippingFee + serviceFee;

  return (
    <>
      <Header />
      <main className="main-content">
        {/* ページタイトル */}
        <div className="page-title">
          <h1>📋 購入内容の確認</h1>
          <p>ご注文内容をご確認の上、購入を確定してください</p>
        </div>

        {/* プログレスバー */}
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

        {/* 購入確認コンテナ */}
        <div className="checkout-container">
          {/* セクションヘッダー */}
          <div className="section-header">
            <h2>ご注文内容</h2>
            <p>以下の内容で購入手続きを進めます</p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          {/* 購入商品セクション */}
          <div className="product-section">
            <div className="product-item">
              <div className="product-image">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000/api/products/images/${product.images[0].image_id}`}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '📖'
                )}
              </div>
              <div className="product-info">
                <div className="product-title">{product.title}</div>
                <div className="product-author">カテゴリ: {getCategoryLabel(product.category)}</div>
                <div className="product-condition">{getConditionLabel(product.condition)}</div>
              </div>
              <div className="product-price">¥{productPrice.toLocaleString()}</div>
            </div>
          </div>

          {/* お届け先セクション */}
          <div className="info-section">
            <h3 className="section-title delivery-title">お届け先</h3>
            <div className="address-display">
              <div className="address-info">
                <div className="postal-code">〒123-4567</div>
                <div className="address-line">東京都渋谷区神南1-23-45</div>
                <div className="address-line">Bibliマンション 101号室</div>
                <div className="recipient-name">山田 太郎 様</div>
              </div>
              <a href="#" className="change-btn" id="changeAddressBtn">変更する</a>
            </div>
          </div>

          {/* 支払い方法セクション */}
          <div className="info-section">
            <h3 className="section-title payment-title">支払い方法</h3>
            <div className="payment-display">
              <div className="payment-icon">VISA</div>
              <div className="payment-info">
                <div className="payment-method">{paymentMethod}</div>
                <div className="card-info">**** **** **** 1234</div>
              </div>
              <a href="#" className="change-btn" id="changePaymentBtn">変更する</a>
            </div>
            <div className="security-info">
              この決済はSSL暗号化通信により保護されています
            </div>
          </div>

          {/* お支払い金額セクション */}
          <div className="info-section">
            <h3 className="section-title summary-title">お支払い金額</h3>
            <div className="price-summary">
              <div className="price-row">
                <span className="price-label">商品合計</span>
                <span className="price-value">¥{productPrice.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">送料（{shippingMethod}）</span>
                <span className="price-value">¥{shippingFee.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">販売手数料</span>
                <span className="price-value">¥{serviceFee.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">合計金額</span>
                <span className="price-value total-price">¥{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 購入ボタンセクション */}
          <div className="purchase-section">
            <button className="purchase-btn" id="purchaseBtn" onClick={handlePurchase} disabled={loading}>
              {loading && <span className="loading" id="loadingIndicator">処理中...</span>}
              {!loading && <span id="btnText">購入を確定する</span>}
            </button>
            <div className="purchase-note">
              ボタンを押すと購入が確定し、決済が実行されます。<br />
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