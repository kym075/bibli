import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/product_detail.css';

function ProductDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isOwnProduct, setIsOwnProduct] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setError('商品IDが指定されていません');
      setLoading(false);
      return;
    }

    // 商品詳細を取得
    fetch(`http://localhost:5000/api/products/${productId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('商品が見つかりません');
        }
        return response.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Product detail fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    setImageError(false);
    setSelectedImageIndex(0);
    setShowCancelConfirm(false);
  }, [productId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user?.email) {
        setCurrentUserId(null);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/user/${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error('User fetch error:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!product?.seller?.id || !currentUserId) {
      setIsOwnProduct(false);
      return;
    }

    setIsOwnProduct(product.seller.id === currentUserId);
  }, [product, currentUserId]);

  useEffect(() => {
    const followerEmail = currentUser?.email;
    const followeeEmail = product?.seller?.email;

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
  }, [currentUser, product]);


  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!currentUser?.email || !product?.id || isOwnProduct) {
        setIsFavorite(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          email: currentUser.email,
          product_id: String(product.id)
        });
        const response = await fetch(`http://localhost:5000/api/favorites/status?${params}`);
        const data = await response.json();
        if (response.ok) {
          setIsFavorite(Boolean(data.is_favorite));
        }
      } catch (err) {
        console.error('Favorite status error:', err);
      }
    };

    fetchFavoriteStatus();
  }, [currentUser, product, isOwnProduct]);

  // 商品状態のラベル変換
  const getConditionLabel = (condition) => {
    const labels = {
      'excellent': '非常に良い',
      'good': '良好',
      'fair': '普通'
    };
    return labels[condition] || condition;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    const trimmed = imageUrl.replace(/^\/+/, '');
    return `http://localhost:5000/${trimmed}`;
  };

  const handlePurchaseClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (isOwnProduct || product?.status !== 1) {
      return;
    }
    navigate(`/checkout?product_id=${product.id}`);
  };


  const handleFavoriteToggle = async () => {
    if (!product?.id) return;
    if (!currentUser?.email) {
      navigate('/login');
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        const response = await fetch('http://localhost:5000/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: currentUser.email,
            product_id: product.id
          })
        });
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        const response = await fetch('http://localhost:5000/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: currentUser.email,
            product_id: product.id
          })
        });
        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    const followerEmail = currentUser?.email;
    const followeeEmail = product?.seller?.email;

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
      } else {
        const data = await response.json();
        console.error('Follow error:', data.error || data.message);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCancelRequest = () => {
    if (!currentUser?.email) {
      navigate('/login');
      return;
    }
    if (!product?.id || isCancelling) {
      return;
    }
    if (productStatus !== 1) {
      return;
    }
    setShowCancelConfirm(true);
  };

  const handleCancelDismiss = () => {
    setShowCancelConfirm(false);
  };

  const handleCancelConfirm = async () => {
    if (!currentUser?.email) {
      navigate('/login');
      return;
    }
    if (!product?.id || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setCancelError('');
    setCancelMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/products/${product.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seller_email: currentUser.email })
      });
      const data = await response.json();
      if (response.ok) {
        setCancelMessage('出品を取り消しました');
        setProduct(prev => ({ ...prev, status: 0 }));
        setShowCancelConfirm(false);
      } else {
        setCancelError(data.error || '出品の取り消しに失敗しました');
      }
    } catch (err) {
      console.error('Cancel product error:', err);
      setCancelError('出品の取り消しに失敗しました');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
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
          <Link to="/">ホームに戻る</Link>
        </main>
        <Footer />
      </>
    );
  }

  const imageUrls = Array.isArray(product.image_urls) && product.image_urls.length
    ? product.image_urls
    : (product.image_url ? [product.image_url] : []);
  const safeIndex = selectedImageIndex < imageUrls.length ? selectedImageIndex : 0;
  const mainImageUrl = imageUrls[safeIndex] || '';
  const imageUrl = imageError ? '' : getImageUrl(mainImageUrl);
  const productStatus = product.status ?? 1;

  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content product-detail-page">
        <div className="product-detail-layout">
          {/* 左カラム: 商品画像エリア */}
          <div className="product-images">
            <div className="main-image" id="mainImage">
              {imageUrl ? (
                <img src={imageUrl} alt={product.title} onError={() => setImageError(true)} />
              ) : (
                <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                  NO IMAGE
                </div>
              )}
            </div>
            {imageUrls.length > 1 && (
              <div className="thumbnail-list">
                {imageUrls.map((url, index) => (
                  <button
                    type="button"
                    className={`thumbnail ${index === safeIndex ? 'active' : ''}`}
                    key={`${url}-${index}`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setImageError(false);
                    }}
                  >
                    <img src={getImageUrl(url)} alt={`thumbnail-${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右カラム: 商品情報・購入エリア */}
          <div className="product-detail-content">
            <div className="product-info">
              <div className="product-title-row">

                <h1 className="product-detail-title">{product.title}</h1>

                <Link to="/contact" className="report-link">通報</Link>

              </div>

              <div className="price">¥{product.price?.toLocaleString()}</div>

              {!isOwnProduct && (
                <div className="action-buttons is-row">
                  <button className="btn-large btn-purchase" onClick={handlePurchaseClick} disabled={productStatus !== 1}>
                    {productStatus === 1 ? '今すぐ購入' : '売り切れ'}
                  </button>
                  <button
                    className={`btn-large btn-outline btn-favorite ${isFavorite ? 'is-active' : ''}`}
                    onClick={handleFavoriteToggle}
                    disabled={isFavoriteLoading}
                  >
                    {isFavoriteLoading ? '更新中...' : (isFavorite ? 'お気に入り済み' : 'お気に入り')}
                  </button>
                </div>
              )}

              {isOwnProduct && (
                <div className="secondary-actions cancel-section">
                  {productStatus !== 1 ? (
                    <button className="btn-large btn-outline btn-cancel" disabled>
                      出品取り消し済み
                    </button>
                  ) : showCancelConfirm ? (
                    <div className="cancel-confirm">
                      <div className="cancel-confirm-text">出品を取り消しますか？</div>
                      <div className="cancel-confirm-actions">
                        <button
                          className="btn-large btn-cancel"
                          onClick={handleCancelConfirm}
                          disabled={isCancelling}
                        >
                          {isCancelling ? '取り消し中...' : '削除する'}
                        </button>
                        <button
                          className="btn-large btn-outline"
                          onClick={handleCancelDismiss}
                          disabled={isCancelling}
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn-large btn-outline btn-cancel"
                      onClick={handleCancelRequest}
                      disabled={isCancelling}
                    >
                      出品を取り消す
                    </button>
                  )}
                </div>
              )}
              {(cancelError || cancelMessage) && (
                <div className={`cancel-message ${cancelError ? 'is-error' : 'is-success'}`}>
                  {cancelError || cancelMessage}
                </div>
              )}

              {product.seller && (
                <div className="seller-info">
                  <Link to={`/profile/${product.seller.user_id}`} className="seller-profile">
                    <div className="seller-avatar">
                      {product.seller.profile_image ? (
                        <img src={product.seller.profile_image} alt={product.seller.user_name} />
                      ) : (
                        'USER'
                      )}
                    </div>
                    <div className="seller-details">
                      <h4>{product.seller.user_name}</h4>
                      <div className="rating">
                        <span>(5.0)</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    className={`btn btn-secondary btn-small ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading || currentUser?.email === product?.seller?.email || !product?.seller?.email}
                  >
                    {!currentUser ? 'ログインでフォロー' : (isFollowing ? 'フォロー中' : 'フォロー')}
                  </button>
                </div>
              )}

              <div className="communication-actions">
                <button className="btn btn-primary btn-small">チャットで質問</button>
              </div>
            </div>

            <div className="product-description">
              <div className="description-section">
                <h3>商品の説明</h3>
                <div className="description-text">
                  <p>{product.description || '商品の説明はありません。'}</p>
                </div>
              </div>

              <div className="description-section">
                <h3>商品の詳細</h3>
                <div className="specs">
                  <div className="spec-item">
                    <div className="spec-label">カテゴリ</div>
                    <div className="spec-value">{product.category || '未設定'}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">商品の状態</div>
                    <div className="spec-value">{getConditionLabel(product.condition)}</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">配送料</div>
                    <div className="spec-value">購入者負担</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">配送方法</div>
                    <div className="spec-value">未定</div>
                  </div>
                  <div className="spec-item">
                    <div className="spec-label">発送日の目安</div>
                    <div className="spec-value">1-2日で発送</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="related-products">
              <h3>関連商品</h3>
              <div className="related-grid">
                <p>関連商品はまだありません。</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetail;

