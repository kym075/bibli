import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/purchase_complete.css';

function PurchaseComplete() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [purchaseData, setPurchaseData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const fetchPurchase = async () => {
    if (!sessionId) {
      setError('決済セッションが見つかりません');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/session/${sessionId}`);
      const data = await response.json();
      if (response.ok && data.purchase) {
        setPurchaseData(data);
        setStatus('paid');
        return;
      }

      if (response.ok && data.status) {
        setStatus(data.status);
        return;
      }

      setError(data.error || '購入情報の取得に失敗しました');
      setStatus('error');
    } catch (err) {
      console.error('Purchase fetch error:', err);
      setError('購入情報の取得に失敗しました');
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchPurchase();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>購入情報を確認中です...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (status !== 'paid') {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>決済の確認中です。しばらくしてから再読み込みしてください。</p>
          {error && <p>{error}</p>}
          <button className="action-btn btn-secondary" type="button" onClick={fetchPurchase}>
            もう一度確認する
          </button>
        </main>
        <Footer />
      </>
    );
  }

  const purchase = purchaseData?.purchase;
  const product = purchaseData?.product;
  const orderNumber = purchase ? `#BL-${String(purchase.id).padStart(8, '0')}` : '不明';
  const totalAmount = purchase?.amount || 0;

  return (
    <>
      <div className="confetti" id="confetti"></div>

      <Header />
      <main className="main-content">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">OK</div>
            <h1 className="success-title">購入が完了しました！</h1>
            <p className="success-message">
              ご購入いただき、<strong>ありがとうございます</strong>。<br />
              注文確認メールをお送りしました。
            </p>

            <div className="order-info">
              <div className="order-title">ご注文内容</div>
              <div className="order-details">
                <div className="order-row">
                  <span className="order-label">注文番号</span>
                  <span className="order-value">{orderNumber}</span>
                </div>
                <div className="order-row">
                  <span className="order-label">商品名</span>
                  <span className="order-value">{product?.title || '不明'}</span>
                </div>
                <div className="order-row">
                  <span className="order-label">お支払い金額</span>
                  <span className="order-value">¥{totalAmount.toLocaleString()}</span>
                </div>
                <div className="order-row">
                  <span className="order-label">お届け予定</span>
                  <span className="order-value">3-5営業日後</span>
                </div>
              </div>
            </div>

            <div className="next-steps">
              <div className="steps-title">今後の流れ</div>
              <div className="steps-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div>出品者に購入通知が送信されます</div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div>出品者が商品を発送します（1-2営業日以内）</div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div>発送完了の通知をお送りします</div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div>商品到着後、評価をお願いします</div>
                </div>
              </div>
              <div className="countdown" id="countdown">
                発送まで最大 48時間 お待ちください
              </div>
            </div>

            <div className="action-buttons">
              <Link to="/" className="action-btn btn-primary" id="homeBtn">
                トップページへ戻る
              </Link>
              <Link to="/profile" className="action-btn btn-secondary" id="historyBtn">
                購入履歴を確認する
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default PurchaseComplete;

