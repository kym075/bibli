import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/profile_page.css';

function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [productFilter, setProductFilter] = useState('all');
  const [userProducts, setUserProducts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFollowCounts({
      followers: profile.follower_count ?? 0,
      following: profile.following_count ?? 0
    });
  }, [profile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      try {
        // URLにuserIdがない場合、ログインユーザーのプロフィールにリダイレクト
        if (!userId && firebaseUser) {
          const userResponse = await fetch(`http://localhost:5000/api/user/${firebaseUser.email}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            navigate(`/profile/${userData.user_id}`, { replace: true });
            return;
          }
        }

        // URLにuserIdがない＆未ログインの場合
        if (!userId && !firebaseUser) {
          setError('ログインしてください');
          setLoading(false);
          return;
        }

        // userIdでプロフィールを取得
        const response = await fetch(`http://localhost:5000/api/profile/id/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);

          // 自分のプロフィールかどうか判定
          if (firebaseUser) {
            const myUserResponse = await fetch(`http://localhost:5000/api/user/${firebaseUser.email}`);
            if (myUserResponse.ok) {
              const myUserData = await myUserResponse.json();
              setIsOwnProfile(myUserData.user_id === userId);
            }
          }

          // ユーザーの出品商品を取得
          const productsResponse = await fetch(`http://localhost:5000/api/products?seller_id=${data.id}`);
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setUserProducts(productsData.products || []);
          }

          setFavoritesLoading(true);
          try {
            const favoritesResponse = await fetch(`http://localhost:5000/api/profile/${data.user_id}/favorites`);
            if (favoritesResponse.ok) {
              const favoritesData = await favoritesResponse.json();
              setFavoriteProducts(favoritesData.favorites || []);
            } else {
              setFavoriteProducts([]);
            }
          } catch (err) {
            console.error('Favorites fetch error:', err);
            setFavoriteProducts([]);
          } finally {
            setFavoritesLoading(false);
          }

          setPurchasesLoading(true);
          try {
            const purchasesResponse = await fetch(`http://localhost:5000/api/profile/${data.user_id}/purchases`);
            if (purchasesResponse.ok) {
              const purchasesData = await purchasesResponse.json();
              setPurchaseHistory(purchasesData.purchases || []);
            } else {
              setPurchaseHistory([]);
            }
          } catch (err) {
            console.error('Purchases fetch error:', err);
            setPurchaseHistory([]);
          } finally {
            setPurchasesLoading(false);
          }
        } else {
          setError('ユーザーが見つかりません');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('プロフィール情報の取得に失敗しました');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, navigate]);

  useEffect(() => {
    const followerEmail = currentUser?.email;
    const followeeEmail = profile?.email;

    if (!followerEmail || !followeeEmail || followerEmail === followeeEmail) {
      setIsFollowing(false);
      return;
    }

    const fetchFollowStatus = async () => {
      setIsFollowLoading(true);
      try {
        const params = new URLSearchParams({
          follower_email: followerEmail,
          followee_email: followeeEmail
        });
        const response = await fetch(`http://localhost:5000/api/follow/status?${params}`);
        const data = await response.json();
        if (response.ok) {
          setIsFollowing(Boolean(data.following));
        }
      } catch (err) {
        console.error('Follow status error:', err);
      } finally {
        setIsFollowLoading(false);
      }
    };

    fetchFollowStatus();
  }, [currentUser, profile]);

  const handleFollowToggle = async () => {
    const followerEmail = currentUser?.email;
    const followeeEmail = profile?.email;

    if (!followerEmail) {
      navigate('/login');
      return;
    }
    if (!followeeEmail || followerEmail === followeeEmail) {
      return;
    }

    setIsFollowLoading(true);
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          follower_email: followerEmail,
          followee_email: followeeEmail
        })
      });
      if (response.ok) {
        setIsFollowing(prev => !prev);
        setFollowCounts(prev => ({
          ...prev,
          followers: Math.max(0, prev.followers + (isFollowing ? -1 : 1))
        }));
      } else {
        const data = await response.json();
        console.error('Follow toggle error:', data.error || data.message);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>{error || 'プロフィールが見つかりません'}</p>
        </main>
        <Footer />
      </>
    );
  }

  // 登録日をフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '不明';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 住所から都道府県を抽出
  const extractPrefecture = (address) => {
    if (!address) return '未設定';
    const match = address.match(/^(.{2,3}[都道府県])/);
    return match ? match[1] : address.substring(0, 10);
  };


  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    const trimmed = imageUrl.replace(/^\/+/, '');
    return `http://localhost:5000/${trimmed}`;
  };

  // タブ切り替え
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 商品フィルター切り替え
  const handleProductFilter = (filter) => {
    setProductFilter(filter);
  };

  return (
    <>
      <Header />

      {/* ===== MAIN CONTENT SECTION ===== */}
      <main className="main-content">
        {/* === PROFILE HEADER SUBSECTION === */}
        <section className="profile-header">
          <div className="profile-main">
            <div className="profile-avatar">
              {profile.profile_image ? (
                <img src={profile.profile_image} alt="プロフィール" />
              ) : (
                'USER'
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name-section">
                <div className="profile-name">
                  {profile.user_name}
                  <div className="verified-badge">認証済み</div>
                </div>
                <div className="profile-actions">
                  {!isOwnProfile && (
                    <button
                      className={`action-btn btn-follow ${isFollowing ? 'following' : ''}`}
                      id="followBtn"
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading || !profile?.email || currentUser?.email === profile?.email}
                    >
                      {!currentUser ? 'ログインでフォロー' : (isFollowing ? 'フォロー中' : 'フォローする')}
                    </button>
                  )}
                  <Link to="/user-settings">
                    <button className="action-btn btn-usrsettings" id="usrSettingsBtn">
                      ユーザー設定
                    </button>
                  </Link>
                </div>
              </div>
              <p className="profile-bio">
                {profile.bio || '自己紹介が設定されていません'}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{userProducts.length}</span>
                  <span className="stat-label">出品数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">販売実績</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">-</span>
                  <span className="stat-label">評価</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{followCounts.followers}</span>
                  <span className="stat-label">フォロワー</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{followCounts.following}</span>
                  <span className="stat-label">フォロー</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === USER DETAILS SUBSECTION === */}
        <section className="user-details">
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-icon">D</div>
              <div className="detail-content">
                <div className="detail-label">登録日</div>
                <div className="detail-value">{formatDate(profile.created_at)}</div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">S</div>
              <div className="detail-content">
                <div className="detail-label">発送日数</div>
                <div className="detail-value">1-2日で発送</div>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">L</div>
              <div className="detail-content">
                <div className="detail-label">発送元</div>
                <div className="detail-value">{extractPrefecture(profile.address)}</div>
              </div>
            </div>
          </div>
        </section>

        {/* === TAB NAVIGATION SUBSECTION === */}
        <section className="tab-navigation">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => handleTabChange('products')}
            >
              出品商品 ({userProducts.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => handleTabChange('purchases')}
            >
              購入履歴 ({purchaseHistory.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              評価・レビュー (0)
            </button>
            <button
              className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => handleTabChange('favorites')}
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
                  onClick={() => handleProductFilter('all')}
                >
                  すべて
                </button>
                <button
                  className={`sort-btn ${productFilter === 'available' ? 'active' : ''}`}
                  onClick={() => handleProductFilter('available')}
                >
                  販売中
                </button>
                <button
                  className={`sort-btn ${productFilter === 'reserved' ? 'active' : ''}`}
                  onClick={() => handleProductFilter('reserved')}
                >
                  取引中
                </button>
                <button
                  className={`sort-btn ${productFilter === 'sold' ? 'active' : ''}`}
                  onClick={() => handleProductFilter('sold')}
                >
                  売却済み
                </button>
              </div>

              {userProducts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">P</div>
                  <div className="empty-message">出品商品がありません</div>
                  <div className="empty-description">商品を出品すると、ここに表示されます</div>
                </div>
              ) : (
                <div className="products-grid">
                  {userProducts
                    .filter(product => {
                      if (productFilter === 'all') return true;
                      if (productFilter === 'available') return product.status === 1;
                      if (productFilter === 'reserved') return product.status === 2;
                      if (productFilter === 'sold') return product.status === 3;
                      return true;
                    })
                    .map(product => (
                      <Link to={`/product-detail?id=${product.id}`} key={product.id} className="product-card">
                        <div className="product-image">
                          {product.image_url ? (
                            <img src={getImageUrl(product.image_url)} alt={product.title} />
                          ) : (
                            <div className="no-image">NO</div>
                          )}
                        </div>
                        <div className="product-info">
                          <h3 className="product-title">{product.title}</h3>
                          <p className="product-price">¥{product.price.toLocaleString()}</p>
                          <p className="product-condition">{product.condition === 'excellent' ? '美品' : product.condition === 'good' ? '良好' : '可'}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>

            {/* === PURCHASE HISTORY SUBSECTION === */}
            <div className={`tab-panel ${activeTab === 'purchases' ? 'active' : ''}`} id="purchases-panel">
              {purchasesLoading ? (
                <div className="empty-state">
                  <div className="empty-message">読み込み中...</div>
                </div>
              ) : purchaseHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">H</div>
                  <div className="empty-message">購入履歴がありません</div>
                  <div className="empty-description">商品を購入すると、ここに表示されます</div>
                </div>
              ) : (
                <div className="purchase-list">
                  {purchaseHistory.map((purchase) => (
                    <div className="purchase-item" key={purchase.purchase_id}>
                      <div className="purchase-image">
                        {purchase.image_url ? (
                          <img src={getImageUrl(purchase.image_url)} alt={purchase.title} />
                        ) : (
                          <div className="no-image">NO</div>
                        )}
                      </div>
                      <div className="purchase-info">
                        <div className="purchase-title">{purchase.title}</div>
                        <div className="purchase-details">
                          <span className="purchase-price">¥{(purchase.amount || 0).toLocaleString()}</span>
                          <span className="purchase-date">{formatDate(purchase.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* === REVIEWS SUBSECTION === */}
            <div className={`tab-panel ${activeTab === 'reviews' ? 'active' : ''}`} id="reviews-panel">
              <div className="empty-state">
                <div className="empty-icon">R</div>
                <div className="empty-message">評価・レビューがありません</div>
                <div className="empty-description">取引が完了すると、評価が表示されます</div>
              </div>
            </div>

            {/* === FAVORITES SUBSECTION === */}
            <div className={`tab-panel ${activeTab === 'favorites' ? 'active' : ''}`} id="favorites-panel">
              {favoritesLoading ? (
                <div className="empty-state">
                  <div className="empty-message">読み込み中...</div>
                </div>
              ) : favoriteProducts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">F</div>
                  <div className="empty-message">お気に入りの本はありません</div>
                  <div className="empty-description">お気に入りに追加した商品がここに表示されます</div>
                </div>
              ) : (
                <div className="products-grid">
                  {favoriteProducts.map((product) => (
                    <Link to={`/product-detail?id=${product.id}`} key={product.id} className="product-card">
                      <div className="product-image">
                        {product.image_url ? (
                          <img src={getImageUrl(product.image_url)} alt={product.title} />
                        ) : (
                          <div className="no-image">NO</div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-price">¥{product.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ProfilePage;



