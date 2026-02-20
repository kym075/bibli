import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
  const [sellerOtherProducts, setSellerOtherProducts] = useState([]);
  const [sellerProductsLoading, setSellerProductsLoading] = useState(false);
  const [genreRecommendProducts, setGenreRecommendProducts] = useState([]);
  const [genreRecommendLoading, setGenreRecommendLoading] = useState(false);
  const [showAllRecommendProducts, setShowAllRecommendProducts] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatParticipants, setChatParticipants] = useState([]);
  const [selectedChatEmail, setSelectedChatEmail] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatScope, setChatScope] = useState('open');
  const chatThreadRef = useRef(null);
  const chatInputRef = useRef(null);
  const isFetchingChatRef = useRef(false);
  const [purchaseStatusData, setPurchaseStatusData] = useState(null);
  const [purchaseStatusLoading, setPurchaseStatusLoading] = useState(false);
  const [purchaseStatusError, setPurchaseStatusError] = useState('');
  const [purchaseStatusUpdating, setPurchaseStatusUpdating] = useState(false);

  useEffect(() => {
    if (!productId) {
      setError('商品IDが指定されていません');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/products/${productId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('商品が見つかりません');
        }
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Product detail fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    setImageError(false);
    setSelectedImageIndex(0);
    setShowCancelConfirm(false);
    setShowAllRecommendProducts(false);

    setIsChatOpen(false);
    setChatMessages([]);
    setChatParticipants([]);
    setSelectedChatEmail('');
    setChatInput('');
    setChatError('');
    setPurchaseStatusData(null);
    setPurchaseStatusError('');
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
      if (!currentUser?.email || !product?.id || isOwnProduct || product?.status !== 1) {
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

  useEffect(() => {
    if (!isChatOpen || !chatThreadRef.current) {
      return;
    }
    chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
  }, [chatMessages, isChatOpen]);

  const getConditionLabel = (condition) => {
    const labels = {
      new_unused: '新品、未使用',
      nearly_unused: '未使用に近い',
      no_visible_damage: '目立った傷や汚れなし',
      slight_damage: 'やや傷や汚れあり',
      damaged: '傷や汚れあり',
      poor_condition: '全体的に状態が悪い',
      excellent: '目立った傷や汚れなし',
      good: 'やや傷や汚れあり',
      fair: '傷や汚れあり',
      slightly_bad: '全体的に状態が悪い',
      bad: '全体的に状態が悪い'
    };
    return labels[condition] || condition;
  };
  const buildRelatedKeywords = (item) => {
    if (!item) return [];

    const keywords = [];
    const seen = new Set();
    const pushUnique = (value) => {
      const text = String(value || '').trim();
      if (!text) return;
      const key = text.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      keywords.push(text);
    };
    const pickTokens = (text) => {
      const parts = String(text || '').split(/[\s\\/・,，。!！?？「」『』()（）【】\[\]{}]+/);
      return parts
        .map((part) => part.trim())
        .filter((part) => part.length >= 2 && part.length <= 20);
    };

    if (Array.isArray(item.tags)) {
      item.tags.forEach((tag) => pushUnique(tag));
    }
    pushUnique(item.category);
    pushUnique(getConditionLabel(item.condition));
    pickTokens(item.title).forEach(pushUnique);
    pickTokens(item.description).forEach(pushUnique);

    ['古本', '読書', '本好き', 'おすすめ', '人気'].forEach(pushUnique);

    return keywords.slice(0, 6);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    const trimmed = String(imageUrl).replace(/\\/g, '/').replace(/^\/+/, '');
    return `http://localhost:5000/${trimmed}`;
  };

  const formatChatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const loadChatMessages = async (counterpartEmail = '', options = {}) => {
    const { silent = false } = options;
    if (!currentUser?.email || !product?.id) {
      return;
    }
    if (isFetchingChatRef.current) {
      return;
    }

    isFetchingChatRef.current = true;

    if (!silent) {
      setChatLoading(true);
      setChatError('');
    }

    try {
      const params = new URLSearchParams({ email: currentUser.email });
      if (isOwnProduct) {
        const target = counterpartEmail || selectedChatEmail;
        if (target) {
          params.append('with_user', target);
        }
      }

      const response = await fetch(`http://localhost:5000/api/products/${product.id}/chat/messages?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'チャットの読み込みに失敗しました');
      }

      setChatParticipants(Array.isArray(data.participants) ? data.participants : []);
      setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      setChatScope(data.chat_scope || 'open');

      if (isOwnProduct) {
        const resolved = data.selected_counterpart_email || '';
        if (resolved && resolved !== selectedChatEmail) {
          setSelectedChatEmail(resolved);
        }
      }
    } catch (err) {
      console.error('Chat fetch error:', err);
      if (!silent) {
        setChatError(err.message || 'チャットの読み込みに失敗しました');
      }
    } finally {
      if (!silent) {
        setChatLoading(false);
      }
      isFetchingChatRef.current = false;
    }
  };

  const openChatWidget = async () => {
    if (!currentUser?.email) {
      navigate('/login', { state: { message: 'チャットを利用するにはログインが必要です' } });
      return;
    }
    setIsChatOpen(true);
    await loadChatMessages('', { silent: false });
  };

  const handleChatFabClick = async () => {
    if (isChatOpen) {
      setIsChatOpen(false);
      return;
    }
    await openChatWidget();
  };

  const handleParticipantSelect = async (email) => {
    if (!email || isChatSending) {
      return;
    }
    setSelectedChatEmail(email);
    await loadChatMessages(email, { silent: false });
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.email) {
      navigate('/login', { state: { message: 'チャットを利用するにはログインが必要です' } });
      return;
    }

    const trimmed = chatInput.trim();
    if (!trimmed) {
      return;
    }

    const receiverEmail = isOwnProduct ? selectedChatEmail : product?.seller?.email;
    if (!receiverEmail) {
      setChatError(isOwnProduct ? '購入希望者を選択してください' : '出品者情報が見つかりません');
      return;
    }

    setIsChatSending(true);
    setChatError('');

    try {
      const response = await fetch(`http://localhost:5000/api/products/${product.id}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_email: currentUser.email,
          receiver_email: receiverEmail,
          message: trimmed
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'メッセージ送信に失敗しました');
      }

      setChatInput('');
      await loadChatMessages(receiverEmail, { silent: true });
    } catch (err) {
      console.error('Chat send error:', err);
      setChatError(err.message || 'メッセージ送信に失敗しました');
    } finally {
      setIsChatSending(false);
    }
  };


  useEffect(() => {
    if (!isChatOpen || !currentUser?.email || !product?.id) {
      return;
    }

    const chatPollingTarget = isOwnProduct ? selectedChatEmail : '';
    const timer = setInterval(() => {
      if (isChatSending) {
        return;
      }
      if (document.activeElement === chatInputRef.current) {
        return;
      }
      loadChatMessages(chatPollingTarget, { silent: true });
    }, 10000);

    return () => clearInterval(timer);
  }, [isChatOpen, currentUser, product, isOwnProduct, selectedChatEmail, isChatSending]);
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
    if (product?.status !== 1) return;
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
        setIsFollowing((prev) => !prev);
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
    if (product?.status !== 1) {
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
        setProduct((prev) => ({ ...prev, status: 0 }));
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

  const fetchPurchaseStatus = async () => {
    if (!product?.id) {
      setPurchaseStatusData(null);
      return;
    }

    setPurchaseStatusLoading(true);
    setPurchaseStatusError('');
    try {
      const emailParam = currentUser?.email ? `?email=${encodeURIComponent(currentUser.email)}` : '';
      const response = await fetch(`http://localhost:5000/api/products/${product.id}/purchase-status${emailParam}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '取引ステータスの取得に失敗しました');
      }
      setPurchaseStatusData(data);
    } catch (err) {
      console.error('Purchase status fetch error:', err);
      setPurchaseStatusError(err.message || '取引ステータスの取得に失敗しました');
      setPurchaseStatusData(null);
    } finally {
      setPurchaseStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseStatus();
  }, [product?.id, currentUser?.email]);

  useEffect(() => {
    const sellerId = product?.seller?.id;
    if (!sellerId || !product?.id) {
      setSellerOtherProducts([]);
      return;
    }

    let active = true;
    const fetchSellerProducts = async () => {
      setSellerProductsLoading(true);
      try {
        const params = new URLSearchParams({
          seller_id: String(sellerId),
          include_sold: '1',
          limit: '12'
        });
        if (currentUser?.email) {
          params.set('viewer_email', currentUser.email);
        }

        const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
        const data = await response.json();
        if (!active) return;

        if (response.ok && Array.isArray(data.products)) {
          setSellerOtherProducts(data.products.filter((item) => item.id !== product.id));
        } else {
          setSellerOtherProducts([]);
        }
      } catch (err) {
        console.error('Seller products fetch error:', err);
        if (active) {
          setSellerOtherProducts([]);
        }
      } finally {
        if (active) {
          setSellerProductsLoading(false);
        }
      }
    };

    fetchSellerProducts();
    return () => {
      active = false;
    };
  }, [product?.seller?.id, product?.id, currentUser?.email]);

  useEffect(() => {
    const category = (product?.category || '').trim();
    if (!category || !product?.id) {
      setGenreRecommendProducts([]);
      return;
    }

    let active = true;
    const fetchGenreRecommendations = async () => {
      setGenreRecommendLoading(true);
      try {
        const params = new URLSearchParams({
          q: category,
          include_sold: '1',
          limit: '24'
        });
        if (currentUser?.email) {
          params.set('viewer_email', currentUser.email);
        }

        const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
        const data = await response.json();
        if (!active) return;

        if (response.ok && Array.isArray(data.products)) {
          const filtered = data.products.filter((item) => item.id !== product.id);
          setGenreRecommendProducts(filtered);
        } else {
          setGenreRecommendProducts([]);
        }
      } catch (err) {
        console.error('Genre recommendation fetch error:', err);
        if (active) {
          setGenreRecommendProducts([]);
        }
      } finally {
        if (active) {
          setGenreRecommendLoading(false);
        }
      }
    };

    fetchGenreRecommendations();
    return () => {
      active = false;
    };
  }, [product?.category, product?.id, currentUser?.email]);

  const handlePurchaseStatusUpdate = async (nextStatus) => {
    const purchaseId = purchaseStatusData?.purchase?.id;
    if (!purchaseId || !currentUser?.email || !nextStatus) {
      return;
    }

    setPurchaseStatusUpdating(true);
    setPurchaseStatusError('');
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/${purchaseId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actor_email: currentUser.email,
          status: nextStatus
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '取引ステータスの更新に失敗しました');
      }
      await fetchPurchaseStatus();
    } catch (err) {
      console.error('Purchase status update error:', err);
      setPurchaseStatusError(err.message || '取引ステータスの更新に失敗しました');
    } finally {
      setPurchaseStatusUpdating(false);
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
  const selectedChatParticipant = chatParticipants.find((item) => item.email === selectedChatEmail) || null;
  const chatInputPlaceholder = isOwnProduct
    ? (selectedChatEmail ? '購入希望者に返信...' : '購入希望者を選択してください')
    : '出品者へメッセージを送る';
  const purchase = purchaseStatusData?.purchase || null;
  const purchaseRole = purchaseStatusData?.role || 'viewer';
  const nextStatusOptions = Array.isArray(purchaseStatusData?.next_status_options)
    ? purchaseStatusData.next_status_options
    : [];
  const isPurchaseCompleted = (purchase?.status || '').toLowerCase() === 'completed';
  const shippingMethodLabel = product.shipping_method_label || product.shipping_method || '未定';
  const shippingDaysLabel = product.shipping_days || '未設定';
  const relatedKeywords = buildRelatedKeywords(product);
  const hasMoreSellerProducts = sellerOtherProducts.length > 8;
  const hasMoreRecommendProducts = genreRecommendProducts.length > 8;
  const visibleSellerProducts = sellerOtherProducts.slice(0, 8);
  const visibleRecommendProducts = showAllRecommendProducts
    ? genreRecommendProducts
    : genreRecommendProducts.slice(0, 8);

  return (
    <>
      <Header />

      <main className="main-content product-detail-page">
        <div className="product-detail-layout">
          <div className="product-images">
            <div className="image-stage">
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
              <div className="main-image" id="mainImage">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.title} onError={() => setImageError(true)} />
                ) : (
                  <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                    NO IMAGE
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="product-detail-content">
            <div className="product-detail-stream">
              <div className="product-info">
                <div className="product-title-row">
                  <h1 className="product-detail-title">{product.title}</h1>
                  <Link to="/contact" className="report-link">通報</Link>
                </div>

                <div className="price">¥{product.price?.toLocaleString()}</div>

                {!isOwnProduct && (
                  <div className="action-buttons">
                    <div className="social-action-row">
                      {productStatus === 1 && (
                        <button
                          className={`btn-large btn-outline btn-favorite ${isFavorite ? 'is-active' : ''}`}
                          onClick={handleFavoriteToggle}
                          disabled={isFavoriteLoading}
                        >
                          {isFavoriteLoading ? '更新中...' : (isFavorite ? 'いいね済み' : 'いいね！')}
                        </button>
                      )}
                      <button className="btn-large btn-outline btn-comment" onClick={openChatWidget}>
                        コメント
                      </button>
                    </div>
                    <button className="btn-large btn-purchase purchase-primary" onClick={handlePurchaseClick} disabled={productStatus !== 1}>
                      {productStatus === 1 ? '購入手続きへ' : '売り切れ'}
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
                          <button className="btn-large btn-cancel" onClick={handleCancelConfirm} disabled={isCancelling}>
                            {isCancelling ? '取り消し中...' : '削除する'}
                          </button>
                          <button className="btn-large btn-outline" onClick={handleCancelDismiss} disabled={isCancelling}>
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-large btn-outline btn-cancel" onClick={handleCancelRequest} disabled={isCancelling}>
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

                {purchase && (
                  <div className="purchase-status-panel">
                    <div className="purchase-status-head">
                      <span>取引ステータス</span>
                      <strong>{purchase.status_label || purchase.status}</strong>
                    </div>
                    {purchaseStatusLoading && <p className="purchase-status-note">更新中...</p>}
                    {purchaseStatusError && <p className="purchase-status-error">{purchaseStatusError}</p>}
                    {!purchaseStatusLoading && nextStatusOptions.length > 0 && (
                      <div className="purchase-status-actions">
                        {nextStatusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="btn-small purchase-status-btn"
                            onClick={() => handlePurchaseStatusUpdate(option.value)}
                            disabled={purchaseStatusUpdating}
                          >
                            {purchaseStatusUpdating ? '更新中...' : option.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {purchaseRole !== 'viewer' && (
                      <div className="purchase-status-actions">
                        <Link to={`/transaction?product_id=${product.id}`} className="btn-small purchase-status-btn purchase-screen-link">
                          取引画面を開く
                        </Link>
                      </div>
                    )}
                    {!purchaseStatusLoading && nextStatusOptions.length === 0 && (
                      <p className="purchase-status-note">
                        {purchaseRole === 'viewer'
                          ? '取引当事者のみステータスを更新できます。'
                          : '現在、更新可能なステータスはありません。'}
                      </p>
                    )}

                    {isPurchaseCompleted && purchaseRole !== 'viewer' && (
                      <div className="purchase-review-panel">
                        <p className="purchase-status-note">取引評価は専用の取引画面で行えます。</p>
                      </div>
                    )}
                  </div>
                )}
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
                      <div className="spec-label">タグ</div>
                      <div className="spec-value">
                        {Array.isArray(product.tags) && product.tags.length
                          ? product.tags.map((tag) => `#${tag}`).join(' / ')
                          : 'なし'}
                      </div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">配送料</div>
                      <div className="spec-value">購入者負担</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">配送方法</div>
                      <div className="spec-value">{shippingMethodLabel}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">発送日の目安</div>
                      <div className="spec-value">{shippingDaysLabel}</div>
                    </div>
                  </div>
                </div>
              </div>

              {product.seller && (
                <div className="seller-info">
                  <Link to={`/profile/${product.seller.user_id}`} className="seller-profile">
                    <div className="seller-avatar">
                      {product.seller.profile_image ? (
                        <img src={getImageUrl(product.seller.profile_image)} alt={product.seller.user_name} />
                      ) : (
                        'USER'
                      )}
                    </div>
                    <div className="seller-details">
                      <h4>{product.seller.user_name}</h4>
                      <div className="rating"><span>(5.0)</span></div>
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
            </div>
          </div>
        </div>

        <div className="detail-lower-sections">
          <div className="related-products">
            <h3>関連する検索キーワード</h3>
            <div className="keyword-list">
              {relatedKeywords.map((keyword) => (
                <Link key={keyword} to={`/search?q=${encodeURIComponent(keyword)}`} className="keyword-chip">
                  #{keyword}
                </Link>
              ))}
            </div>
          </div>

          <div className="related-products">
            <div className="section-head">
              <h3>この出品者の商品</h3>
              {hasMoreSellerProducts && product?.seller?.user_id && (
                <Link to={`/profile/${product.seller.user_id}`} className="section-more-link">
                  もっと見る
                </Link>
              )}
            </div>
              {sellerProductsLoading ? (
                <p>読み込み中...</p>
              ) : sellerOtherProducts.length === 0 ? (
                <p>この出品者の商品はまだありません。</p>
              ) : (
                <div className="seller-products-grid">
                  {visibleSellerProducts.map((item) => (
                    <Link key={item.id} to={`/product-detail?id=${item.id}`} className="seller-product-card">
                      <div className="seller-product-image">
                        {item.image_url ? <img src={getImageUrl(item.image_url)} alt={item.title} /> : 'NO IMAGE'}
                        {item.status !== 1 && <span className="sold-badge">Sold out</span>}
                        <span className="seller-product-price-badge">¥{item.price?.toLocaleString()}</span>
                      </div>
                      <div className="seller-product-title">{item.title}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          <div className="related-products">
            <div className="section-head">
              <h3>この商品を見ている人におすすめ</h3>
              {hasMoreRecommendProducts && (
                <button
                  type="button"
                  className="section-more-link"
                  onClick={() => setShowAllRecommendProducts((prev) => !prev)}
                >
                  {showAllRecommendProducts ? '閉じる' : 'もっと見る'}
                </button>
              )}
            </div>
              {genreRecommendLoading ? (
                <p>読み込み中...</p>
              ) : genreRecommendProducts.length === 0 ? (
                <p>おすすめ商品はまだありません。</p>
              ) : (
                <div className="seller-products-grid">
                  {visibleRecommendProducts.map((item) => (
                    <Link key={item.id} to={`/product-detail?id=${item.id}`} className="seller-product-card">
                      <div className="seller-product-image">
                        {item.image_url ? <img src={getImageUrl(item.image_url)} alt={item.title} /> : 'NO IMAGE'}
                        {item.status !== 1 && <span className="sold-badge">Sold out</span>}
                        <span className="seller-product-price-badge">¥{item.price?.toLocaleString()}</span>
                      </div>
                      <div className="seller-product-title">{item.title}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
        </div>
      </main>

      <button
        type="button"
        className={`chat-fab ${isChatOpen ? 'is-open' : ''}`}
        onClick={handleChatFabClick}
        aria-label="商品チャットを開く"
      >
        <span aria-hidden="true">✉</span>
      </button>

      {isChatOpen && (
        <section className="chat-widget" aria-label="商品チャット">
          <div className="chat-widget-header">
            <div>
              <h3>商品チャット</h3>
              <p>{isOwnProduct ? '出品者モード' : '購入希望者モード'}</p>
            </div>
            <button
              type="button"
              className="chat-widget-close"
              onClick={() => setIsChatOpen(false)}
              aria-label="チャットを閉じる"
            >
              ×
            </button>
          </div>

          {isOwnProduct && (
            <div className="chat-participant-list">
              {chatParticipants.length === 0 ? (
                <div className="chat-empty-line">まだ問い合わせはありません</div>
              ) : (
                chatParticipants.map((participant) => (
                  <button
                    type="button"
                    key={participant.email}
                    className={`chat-participant-item ${selectedChatEmail === participant.email ? 'is-active' : ''}`}
                    onClick={() => handleParticipantSelect(participant.email)}
                    disabled={isChatSending}
                  >
                    <span className="chat-participant-name">{participant.user_name || participant.email}</span>
                    <span className="chat-participant-role">{participant.is_purchased ? '購入者' : '購入希望者'}</span>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="chat-thread" ref={chatThreadRef}>
            {chatLoading ? (
              <div className="chat-empty-line">読み込み中...</div>
            ) : chatMessages.length === 0 ? (
              <div className="chat-empty-line">
                {isOwnProduct ? '購入希望者からのメッセージを待っています' : '気になる点を出品者に質問できます'}
              </div>
            ) : (
              chatMessages.map((item) => (
                <div key={item.id} className={`chat-bubble-row ${item.is_own ? 'is-own' : ''}`}>
                  <div className={`chat-bubble ${item.is_own ? 'is-own' : ''}`}>
                    <div className="chat-bubble-meta">
                      <span className={`chat-role-badge ${item.sender_role === 'seller' ? 'seller' : 'buyer'}`}>
                        {item.sender_role === 'seller' ? '出品者' : (chatScope === 'sold' ? '購入者' : '購入希望者')}
                      </span>
                      <span className="chat-sender-name">{item.sender_name || item.sender_email}</span>
                      <span className="chat-time">{formatChatTime(item.created_at)}</span>
                    </div>
                    <div className="chat-text">{item.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {chatError && <div className="chat-inline-error">{chatError}</div>}

          {isOwnProduct && selectedChatParticipant && (
            <div className="chat-current-target">
              返信先: {selectedChatParticipant.user_name || selectedChatParticipant.email}
            </div>
          )}

          <form className="chat-input-row" onSubmit={handleChatSubmit}>
            <input
              ref={chatInputRef}
              type="text"
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={chatInputPlaceholder}
              maxLength={1000}
              disabled={chatLoading || isChatSending || (isOwnProduct && !selectedChatEmail)}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={chatLoading || isChatSending || !chatInput.trim() || (isOwnProduct && !selectedChatEmail)}
            >
              {isChatSending ? '送信中' : '送信'}
            </button>
          </form>
        </section>
      )}

      <Footer />
    </>
  );
}

export default ProductDetail;




