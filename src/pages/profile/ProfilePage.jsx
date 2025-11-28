import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function ProfilePage() {
  return (
    <>
      <Header />

      {/* ===== MAIN CONTENT SECTION ===== */}
      <main className="main-content">
        {/* === PROFILE HEADER SUBSECTION === */}
        <section className="profile-header">
          <div className="profile-main">
            <div className="profile-avatar">📚</div>
            <div className="profile-info">
              <div className="profile-name-section">
                <div className="profile-name">
                  本好きユーザー
                  <div className="verified-badge">認証済み</div>
                </div>
                <div className="profile-actions">
                  <button className="action-btn btn-follow" id="followBtn">
                    👤 フォローする
                  </button>
                  <Link to="/user-settings">
                    <button className="action-btn btn-usrsettings" id="usrSettingsBtn">
                      ⚙️ ユーザー設定
                    </button>
                  </Link>
                </div>
              </div>
              <p className="profile-bio">
                本を愛する20代です。小説から専門書まで幅広く読んでいます。特に日本文学とミステリーが好きで、読み終わった本は大切に次の読者にお譲りしています。丁寧な梱包と迅速な発送を心がけています。
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">127</span>
                  <span className="stat-label">出品数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">95</span>
                  <span className="stat-label">販売実績</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">4.9</span>
                  <span className="stat-label">評価</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1,234</span>
                  <span className="stat-label">フォロワー</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === USER DETAILS SUBSECTION === */}
        <section className="user-details">
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <div className="detail-label">登録日</div>
                <div className="detail-value">2023年4月15日</div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">📦</div>
              <div className="detail-content">
                <div className="detail-label">発送日数</div>
                <div className="detail-value">1-2日で発送</div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">📍</div>
              <div className="detail-content">
                <div className="detail-label">発送元</div>
                <div className="detail-value">東京都</div>
              </div>
            </div>
          </div>
        </section>

        {/* === TAB NAVIGATION SUBSECTION === */}
        <section className="tab-navigation">
          <div className="tab-buttons">
            <button className="tab-btn active" data-tab="products">出品商品 (127)</button>
            <button className="tab-btn" data-tab="purchases">購入履歴 (23)</button>
            <button className="tab-btn" data-tab="reviews">評価・レビュー (89)</button>
            <button className="tab-btn" data-tab="favorites">お気に入り本</button>
          </div>

          <div className="tab-content">
            {/* === PRODUCTS SUBSECTION === */}
            <div className="tab-panel active" id="products-panel">
              <div className="sort-controls">
                <span className="sort-label">表示:</span>
                <button className="sort-btn active" data-status="all">すべて</button>
                <button className="sort-btn" data-status="available">販売中</button>
                <button className="sort-btn" data-status="reserved">取引中</button>
                <button className="sort-btn" data-status="sold">売却済み</button>
              </div>
              <div className="products-grid">
                <div className="product-card" data-status="available">
                  <div className="product-image">
                    📖
                    <div className="product-status status-available">販売中</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">村上春樹 ノルウェイの森</div>
                    <div className="product-price">¥800</div>
                  </div>
                </div>

                <div className="product-card" data-status="reserved">
                  <div className="product-image">
                    📚
                    <div className="product-status status-reserved">取引中</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">東野圭吾 白夜行</div>
                    <div className="product-price">¥950</div>
                  </div>
                </div>

                <div className="product-card" data-status="available">
                  <div className="product-image">
                    📘
                    <div className="product-status status-available">販売中</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">JavaScript完全ガイド</div>
                    <div className="product-price">¥2,800</div>
                  </div>
                </div>

                <div className="product-card" data-status="available">
                  <div className="product-image">
                    📗
                    <div className="product-status status-available">販売中</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">哲学入門書</div>
                    <div className="product-price">¥1,500</div>
                  </div>
                </div>

                <div className="product-card" data-status="available">
                  <div className="product-image">
                    📙
                    <div className="product-status status-available">販売中</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">ビジネス書セット</div>
                    <div className="product-price">¥3,200</div>
                  </div>
                </div>

                <div className="product-card" data-status="available">
                  <div className="product-image">
                    📕
                    <div className="product-status status-available">販売中</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">芥川龍之介作品集</div>
                    <div className="product-price">¥1,200</div>
                  </div>
                </div>

                {/* 売却済み商品 */}
                <div className="product-card" data-status="sold">
                  <div className="product-image">
                    📖
                    <div className="product-status status-sold">SOLD</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">夏目漱石作品集</div>
                    <div className="product-price">¥1,200</div>
                  </div>
                </div>

                <div className="product-card" data-status="sold">
                  <div className="product-image">
                    📚
                    <div className="product-status status-sold">SOLD</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">人気コミック全巻セット</div>
                    <div className="product-price">¥4,500</div>
                  </div>
                </div>

                <div className="product-card" data-status="sold">
                  <div className="product-image">
                    📘
                    <div className="product-status status-sold">SOLD</div>
                  </div>
                  <div className="product-info">
                    <div className="product-title">プログラミング教本</div>
                    <div className="product-price">¥2,200</div>
                  </div>
                </div>
              </div>
            </div>

            {/* === PURCHASE HISTORY SUBSECTION === */}
            <div className="tab-panel" id="purchases-panel">
              <div className="purchase-list">
                <div className="purchase-item">
                  <div className="purchase-image">📖</div>
                  <div className="purchase-info">
                    <div className="purchase-title">太宰治作品集</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥1,800</span>
                      <span className="purchase-date">2024年7月15日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image">📚</div>
                  <div className="purchase-info">
                    <div className="purchase-title">推理小説コレクション</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥2,500</span>
                      <span className="purchase-date">2024年7月10日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image">📘</div>
                  <div className="purchase-info">
                    <div className="purchase-title">Python入門書</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥3,200</span>
                      <span className="purchase-date">2024年7月5日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image">📗</div>
                  <div className="purchase-info">
                    <div className="purchase-title">世界文学全集</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥5,800</span>
                      <span className="purchase-date">2024年6月28日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image">📙</div>
                  <div className="purchase-info">
                    <div className="purchase-title">現代思想入門</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥1,500</span>
                      <span className="purchase-date">2024年6月20日</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === REVIEWS SUBSECTION === */}
            <div className="tab-panel" id="reviews-panel">
              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">A</div>
                    <div className="review-info">
                      <div className="reviewer-name">購入者A</div>
                      <div className="review-date">2024年7月10日</div>
                    </div>
                    <div className="review-rating">
                      ⭐⭐⭐⭐⭐
                    </div>
                  </div>
                  <div className="review-text">
                    丁寧な梱包で迅速に発送していただきました。本の状態も説明通りで、とても満足しています。また機会があればよろしくお願いします。
                  </div>
                </div>

                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">B</div>
                    <div className="review-info">
                      <div className="reviewer-name">本好きB</div>
                      <div className="review-date">2024年7月8日</div>
                    </div>
                    <div className="review-rating">
                      ⭐⭐⭐⭐⭐
                    </div>
                  </div>
                  <div className="review-text">
                    希少な本を譲っていただき、ありがとうございました。状態も良く、大切に読ませていただきます。
                  </div>
                </div>

                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">C</div>
                    <div className="review-info">
                      <div className="reviewer-name">読書家C</div>
                      <div className="review-date">2024年7月5日</div>
                    </div>
                    <div className="review-rating">
                      ⭐⭐⭐⭐☆
                    </div>
                  </div>
                  <div className="review-text">
                    発送が早く、梱包も丁寧でした。本の状態についても事前に詳しく説明していただき、安心して購入できました。
                  </div>
                </div>

                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">D</div>
                    <div className="review-info">
                      <div className="reviewer-name">コレクターD</div>
                      <div className="review-date">2024年7月2日</div>
                    </div>
                    <div className="review-rating">
                      ⭐⭐⭐⭐⭐
                    </div>
                  </div>
                  <div className="review-text">
                    非常に信頼できる出品者様です。商品説明も正確で、質問にも親切に答えていただきました。またよろしくお願いします。
                  </div>
                </div>
              </div>
            </div>

            {/* === FAVORITES SUBSECTION === */}
            <div className="tab-panel" id="favorites-panel">
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <div className="empty-message">お気に入りの本</div>
                <div className="empty-description">このユーザーのお気に入り本は公開されていません</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ProfilePage;
