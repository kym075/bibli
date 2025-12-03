import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/purchase_complete.css';

function PurchaseComplete() {
  const navigate = useNavigate();

  return (
    <>
      {/* 紙吹雪エフェクト */}
      <div className="confetti" id="confetti"></div>

      <Header />
      <main className="main-content">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h1 className="success-title">購入が完了しました！</h1>
            <p className="success-message">
              ご購入いただき、<strong>ありがとうございます</strong>。<br />
              注文確認メールをお送りしました。
            </p>

            {/* 注文情報 */}
            <div className="order-info">
              <div className="order-title">ご注文内容</div>
              <div className="order-details">
                <div className="order-row">
                  <span className="order-label">注文番号</span>
                  <span className="order-value">#BL-2025071401</span>
                </div>
                <div className="order-row">
                  <span className="order-label">商品名</span>
                  <span className="order-value">夏目漱石作品集</span>
                </div>
                <div className="order-row">
                  <span className="order-label">お支払い金額</span>
                  <span className="order-value">¥1,550</span>
                </div>
                <div className="order-row">
                  <span className="order-label">お届け予定</span>
                  <span className="order-value">3-5営業日後</span>
                </div>
              </div>
            </div>

            {/* 次のステップ */}
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

            {/* アクションボタン */}
            <div className="action-buttons">
              <Link to="/" className="action-btn btn-primary" id="homeBtn">
                🏠 トップページへ戻る
              </Link>
              <Link to="/profile" className="action-btn btn-secondary" id="historyBtn">
                📋 購入履歴を確認する
              </Link>
            </div>

            {/* 追加アクション */}
            <div className="additional-actions">
              <a href="#" className="additional-btn" id="contactBtn">
                💬 出品者にメッセージ
              </a>
              <a href="#" className="additional-btn" id="supportBtn">
                🆘 サポートに問い合わせ
              </a>
              <a href="#" className="additional-btn" id="shareBtn">
                📤 購入をシェア
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default PurchaseComplete;