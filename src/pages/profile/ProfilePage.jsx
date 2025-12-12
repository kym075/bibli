import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/profile_page.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [productFilter, setProductFilter] = useState('all');
  const [myProducts, setMyProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 出品商品を取得
  useEffect(() => {
    const fetchMyProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');

        // トークンがない場合はログインページへリダイレクト
        if (!token) {
          console.log('[ProfilePage] トークンがないため、ログインページへリダイレクトします');
          setError('ログインが必要です');
          setIsLoading(false);
          navigate('/login');
          return;
        }

        console.log('[ProfilePage] 商品一覧を取得します...');
        const response = await fetch('http://localhost:5000/api/products/my-products', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('[ProfilePage] 商品一覧レスポンスステータス:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[ProfilePage] 商品一覧取得エラー:', errorData);
          throw new Error(errorData.error || '商品の取得に失敗しました');
        }

        const data = await response.json();
        console.log('[ProfilePage] 取得した商品数:', data.products?.length || 0);
        setMyProducts(data.products || []);
      } catch (err) {
        console.error('[ProfilePage] 商品取得エラー:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'products') {
      fetchMyProducts();
    }
  }, [activeTab]);

  // ステータスに応じた日本語ラベルを取得
  const getStatusLabel = (status) => {
    const statusMap = {
      'available': '販売中',
      'reserved': '取引中',
      'sold': '売却済み'
    };
    return statusMap[status] || status;
  };

  // ステータスに応じたCSSクラスを取得
  const getStatusClass = (status) => {
    const classMap = {
      'available': 'status-available',
      'reserved': 'status-reserved',
      'sold': 'status-sold'
    };
    return classMap[status] || '';
  };

  // フィルターに応じた商品をフィルタリング
  const filteredProducts = myProducts.filter(product => {
    if (productFilter === 'all') return true;
    return product.status === productFilter;
  });

  // 商品カードクリック時の処理
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <Header />

      {/* ===== MAIN CONTENT SECTION ===== */}
      <main className="main-content">
        {/* === PROFILE HEADER SUBSECTION === */}
        <section className="profile-header">
          <div className="profile-main">
            <div className="profile-avatar">U</div>
            <div className="profile-info">
              <div className="profile-name-section">
                <div className="profile-name">
                  本好きユーザー
                  <div className="verified-badge">認証済み</div>
                </div>
                <div className="profile-actions">
                  <button className="action-btn btn-follow" id="followBtn">
                    フォローする
                  </button>
                  <Link to="/user-settings">
                    <button className="action-btn btn-usrsettings" id="usrSettingsBtn">
                      ユーザー設定
                    </button>
                  </Link>
                </div>
              </div>
              <p className="profile-bio">
                本を愛する20代です。小説から専門書まで幅広く読んでいます。特に日本文学とミステリーが好きで、読み終わった本は大切に次の読者にお譲りしています。丁寧な梱包と迅速な発送を心がけています。
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{myProducts.length}</span>
                  <span className="stat-label">出品数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{myProducts.filter(p => p.status === 'sold').length}</span>
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
              <div className="detail-content">
                <div className="detail-label">登録日</div>
                <div className="detail-value">2023年4月15日</div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-content">
                <div className="detail-label">発送日数</div>
                <div className="detail-value">1-2日で発送</div>
              </div>
            </div>
            <div className="detail-item">
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
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              出品商品 ({myProducts.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              購入履歴 (23)
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              評価・レビュー (89)
            </button>
            <button
              className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              お気に入り本
            </button>
          </div>

          <div className="tab-content">
            {/* === PRODUCTS SUBSECTION === */}
            <div className={`tab-panel ${activeTab === 'products' ? 'active' : ''}`} id="products-panel">
              <div className="sort-controls">
                <span className="sort-label">表示:</span>
                <button
                  className={`sort-btn ${productFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setProductFilter('all')}
                >
                  すべて
                </button>
                <button
                  className={`sort-btn ${productFilter === 'available' ? 'active' : ''}`}
                  onClick={() => setProductFilter('available')}
                >
                  販売中
                </button>
                <button
                  className={`sort-btn ${productFilter === 'reserved' ? 'active' : ''}`}
                  onClick={() => setProductFilter('reserved')}
                >
                  取引中
                </button>
                <button
                  className={`sort-btn ${productFilter === 'sold' ? 'active' : ''}`}
                  onClick={() => setProductFilter('sold')}
                >
                  売却済み
                </button>
              </div>
              <div className="products-grid">
                {isLoading && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#7f8c8d'
                  }}>
                    読み込み中...
                  </div>
                )}

                {error && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#e74c3c',
                    backgroundColor: '#fee',
                    borderRadius: '8px'
                  }}>
                    {error}
                  </div>
                )}

                {!isLoading && !error && filteredProducts.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#7f8c8d'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>出品商品がありません</div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <Link to="/listing" style={{ color: '#4a90e2', textDecoration: 'underline' }}>
                        最初の商品を出品する
                      </Link>
                    </div>
                  </div>
                )}

                {!isLoading && !error && filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="product-card"
                    data-status={product.status}
                    onClick={() => handleProductClick(product.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000/api/products/images/${product.images[0].image_id}`}
                          alt={product.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          backgroundColor: '#f5f5f5'
                        }}>
                          📚
                        </div>
                      )}
                      <div className={`product-status ${getStatusClass(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </div>
                    </div>
                    <div className="product-info">
                      <div className="product-title">{product.title}</div>
                      <div className="product-price">¥{product.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* === PURCHASE HISTORY SUBSECTION === */}
            <div className={`tab-panel ${activeTab === 'purchases' ? 'active' : ''}`} id="purchases-panel">
              <div className="purchase-list">
                <div className="purchase-item">
                  <div className="purchase-image"></div>
                  <div className="purchase-info">
                    <div className="purchase-title">太宰治作品集</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥1,800</span>
                      <span className="purchase-date">2024年7月15日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image"></div>
                  <div className="purchase-info">
                    <div className="purchase-title">推理小説コレクション</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥2,500</span>
                      <span className="purchase-date">2024年7月10日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image"></div>
                  <div className="purchase-info">
                    <div className="purchase-title">Python入門書</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥3,200</span>
                      <span className="purchase-date">2024年7月5日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image"></div>
                  <div className="purchase-info">
                    <div className="purchase-title">世界文学全集</div>
                    <div className="purchase-details">
                      <span className="purchase-price">¥5,800</span>
                      <span className="purchase-date">2024年6月28日</span>
                    </div>
                  </div>
                </div>

                <div className="purchase-item">
                  <div className="purchase-image"></div>
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
            <div className={`tab-panel ${activeTab === 'reviews' ? 'active' : ''}`} id="reviews-panel">
              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">A</div>
                    <div className="review-info">
                      <div className="reviewer-name">購入者A</div>
                      <div className="review-date">2024年7月10日</div>
                    </div>
                    <div className="review-rating">
                      
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
                      ☆
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
                      
                    </div>
                  </div>
                  <div className="review-text">
                    非常に信頼できる出品者様です。商品説明も正確で、質問にも親切に答えていただきました。またよろしくお願いします。
                  </div>
                </div>
              </div>
            </div>

            {/* === FAVORITES SUBSECTION === */}
            <div className={`tab-panel ${activeTab === 'favorites' ? 'active' : ''}`} id="favorites-panel">
              <div className="empty-state">
                <div className="empty-icon"></div>
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
