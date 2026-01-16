import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/listing_complete.css';

function ListingComplete() {
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
            <h1 className="success-title">出品が完了しました！</h1>
            <p className="success-message">
              ありがとうございます！<br />
              あなたの大切な本の出品が正常に完了しました。<br />
              <strong>運営による審査後</strong>、商品が公開されます。
            </p>

            <div className="action-buttons">
              <Link to="/profile" className="action-btn btn-check" id="checkBtn">
                📋 出品した商品を確認する
              </Link>
              <Link to="/products/listing" className="action-btn btn-continue" id="continueBtn">
                ➕ 続けて別の本を出品する
              </Link>
              <Link to="/" className="action-btn btn-home" id="homeBtn">
                🏠 トップページへ戻る
              </Link>
            </div>

            <div className="additional-info">
              <div className="info-title">
                📋 今後の流れについて
              </div>
              <ul className="info-list">
                <li>運営チームが商品情報を確認します（通常24時間以内）</li>
                <li>審査完了後、商品が自動的に公開されます</li>
                <li>購入者が現れると、メッセージでお知らせします</li>
                <li>取引開始後は、購入者と直接やり取りできます</li>
                <li>商品発送後、評価を行って取引完了です</li>
              </ul>
            </div>

            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-number">24</div>
                <div className="stat-label">時間以内</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">95%</div>
                <div className="stat-label">審査通過率</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">3日</div>
                <div className="stat-label">平均売却期間</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ListingComplete;