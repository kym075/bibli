import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePurchase = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/products/purchase-complete');
    }, 1500);
  };

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

          {/* 成功メッセージ */}
          <div className="success-message" id="successMessage">
            購入が完了しました！ご注文ありがとうございます。
          </div>

          {/* 購入商品セクション */}
          <div className="product-section">
            <div className="product-item">
              <div className="product-image">📖</div>
              <div className="product-info">
                <div className="product-title">夏目漱石作品集</div>
                <div className="product-author">著者: 夏目漱石</div>
                <div className="product-condition">良好な状態</div>
              </div>
              <div className="product-price">¥1,200</div>
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
                <div className="payment-method">クレジットカード</div>
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
                <span className="price-value">¥1,200</span>
              </div>
              <div className="price-row">
                <span className="price-label">送料（ゆうパケット）</span>
                <span className="price-value">¥230</span>
              </div>
              <div className="price-row">
                <span className="price-label">販売手数料</span>
                <span className="price-value">¥120</span>
              </div>
              <div className="price-row">
                <span className="price-label">合計金額</span>
                <span className="price-value total-price">¥1,550</span>
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