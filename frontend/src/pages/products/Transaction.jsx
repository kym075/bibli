import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../css/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/transaction.css';

function Transaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product_id');

  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [error, setError] = useState('');

  const [purchaseStatusData, setPurchaseStatusData] = useState(null);
  const [purchaseStatusLoading, setPurchaseStatusLoading] = useState(false);
  const [purchaseStatusError, setPurchaseStatusError] = useState('');
  const [purchaseStatusUpdating, setPurchaseStatusUpdating] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatParticipants, setChatParticipants] = useState([]);
  const [selectedChatEmail, setSelectedChatEmail] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatScope, setChatScope] = useState('open');
  const chatThreadRef = useRef(null);
  const chatInputRef = useRef(null);
  const isFetchingChatRef = useRef(false);

  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  const purchase = purchaseStatusData?.purchase || null;
  const purchaseRole = purchaseStatusData?.role || 'viewer';
  const nextStatusOptions = Array.isArray(purchaseStatusData?.next_status_options)
    ? purchaseStatusData.next_status_options
    : [];
  const purchaseReviews = Array.isArray(purchaseStatusData?.reviews)
    ? purchaseStatusData.reviews
    : [];
  const canSubmitReview = Boolean(purchaseStatusData?.can_submit_review);
  const myPurchaseReview = purchaseStatusData?.my_review || null;
  const isPurchaseCompleted = (purchase?.status || '').toLowerCase() === 'completed';
  const isTransactionParty = purchaseRole === 'seller' || purchaseRole === 'buyer';

  const formatDateTime = (iso) => {
    if (!iso) return '未設定';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '未設定';
    return date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatChatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatRatingStars = (value) => {
    const numeric = parseInt(value, 10);
    const safeRating = Number.isFinite(numeric) ? Math.max(1, Math.min(5, numeric)) : 0;
    if (!safeRating) return '';
    return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}`;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    const trimmed = String(imageUrl).replace(/\\/g, '/').replace(/^\/+/, '');
    return `http://localhost:5000/${trimmed}`;
  };

  const fetchProduct = async () => {
    if (!productId) {
      setError('商品IDが指定されていません');
      setProductLoading(false);
      return;
    }

    setProductLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '商品情報の取得に失敗しました');
      }
      setProduct(data);
    } catch (err) {
      console.error('Transaction product fetch error:', err);
      setError(err.message || '商品情報の取得に失敗しました');
      setProduct(null);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchPurchaseStatus = async () => {
    if (!productId || !currentUser?.email) {
      setPurchaseStatusData(null);
      return;
    }

    setPurchaseStatusLoading(true);
    setPurchaseStatusError('');
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}/purchase-status?email=${encodeURIComponent(currentUser.email)}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '取引情報の取得に失敗しました');
      }
      setPurchaseStatusData(data);
    } catch (err) {
      console.error('Transaction purchase status error:', err);
      setPurchaseStatusError(err.message || '取引情報の取得に失敗しました');
      setPurchaseStatusData(null);
    } finally {
      setPurchaseStatusLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
      if (!user?.email) {
        navigate('/login', { state: { message: '取引画面を利用するにはログインが必要です' } });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!currentUser?.email) return;
    fetchPurchaseStatus();
  }, [productId, currentUser?.email]);

  const loadChatMessages = async (counterpartEmail = '', options = {}) => {
    const { silent = false } = options;
    if (!currentUser?.email || !productId || !isTransactionParty) {
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
      if (purchaseRole === 'seller') {
        const target = counterpartEmail || selectedChatEmail;
        if (target) {
          params.append('with_user', target);
        }
      }

      const response = await fetch(`http://localhost:5000/api/products/${productId}/chat/messages?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'チャットの読み込みに失敗しました');
      }

      setChatParticipants(Array.isArray(data.participants) ? data.participants : []);
      setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      setChatScope(data.chat_scope || 'open');

      if (purchaseRole === 'seller') {
        const resolved = data.selected_counterpart_email || '';
        if (resolved && resolved !== selectedChatEmail) {
          setSelectedChatEmail(resolved);
        } else if (!resolved && !selectedChatEmail && data.participants?.length) {
          setSelectedChatEmail(data.participants[0].email);
        }
      }
    } catch (err) {
      console.error('Transaction chat fetch error:', err);
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

  useEffect(() => {
    if (!isTransactionParty || !purchase || !currentUser?.email) {
      return;
    }
    const target = purchaseRole === 'seller' ? selectedChatEmail : '';
    loadChatMessages(target, { silent: false });
  }, [isTransactionParty, purchase?.id, purchaseRole, currentUser?.email, selectedChatEmail]);

  useEffect(() => {
    if (!isTransactionParty || !purchase || !currentUser?.email) {
      return;
    }

    const timer = setInterval(() => {
      if (chatSending) return;
      if (document.activeElement === chatInputRef.current) return;
      const target = purchaseRole === 'seller' ? selectedChatEmail : '';
      loadChatMessages(target, { silent: true });
    }, 10000);

    return () => clearInterval(timer);
  }, [isTransactionParty, purchase?.id, currentUser?.email, purchaseRole, selectedChatEmail, chatSending]);

  useEffect(() => {
    if (!chatThreadRef.current) return;
    chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
  }, [chatMessages]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.email || !productId || !isTransactionParty) {
      return;
    }

    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const receiverEmail = purchaseRole === 'seller' ? selectedChatEmail : product?.seller?.email;
    if (!receiverEmail) {
      setChatError(purchaseRole === 'seller' ? '購入者を選択してください' : '出品者情報が見つかりません');
      return;
    }

    setChatSending(true);
    setChatError('');
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Transaction chat send error:', err);
      setChatError(err.message || 'メッセージ送信に失敗しました');
    } finally {
      setChatSending(false);
    }
  };

  const handlePurchaseStatusUpdate = async (nextStatus) => {
    if (!purchase?.id || !currentUser?.email || !nextStatus) {
      return;
    }

    setPurchaseStatusUpdating(true);
    setPurchaseStatusError('');
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/${purchase.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Transaction status update error:', err);
      setPurchaseStatusError(err.message || '取引ステータスの更新に失敗しました');
    } finally {
      setPurchaseStatusUpdating(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!purchase?.id || !currentUser?.email) {
      setReviewError('評価対象の取引が見つかりません');
      return;
    }

    const rating = parseInt(reviewRating, 10);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setReviewError('評価は1〜5で選択してください');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewMessage('');
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/${purchase.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_email: currentUser.email,
          rating,
          comment: reviewComment
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '評価の投稿に失敗しました');
      }

      setReviewComment('');
      setReviewMessage(data.message || '評価を投稿しました');
      await fetchPurchaseStatus();
    } catch (err) {
      console.error('Transaction review submit error:', err);
      setReviewError(err.message || '評価の投稿に失敗しました');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!authChecked || productLoading || purchaseStatusLoading) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>取引情報を読み込み中...</p>
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
          <p>{error || '商品情報が見つかりませんでした'}</p>
          <Link to="/">ホームに戻る</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (!purchase) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>この商品の取引情報はまだありません。</p>
          <Link to={`/product-detail?id=${product.id}`}>商品詳細に戻る</Link>
        </main>
        <Footer />
      </>
    );
  }

  const chatInputPlaceholder = purchaseRole === 'seller'
    ? (selectedChatEmail ? '購入者へ返信...' : '購入者を選択してください')
    : '出品者へメッセージを送る';

  return (
    <>
      <Header />
      <main className="main-content transaction-page">
        <div className="transaction-layout">
          <aside className="transaction-sidebar">
            <h2>取引情報</h2>
            <Link to={`/product-detail?id=${product.id}`} className="transaction-product-card">
              <div className="transaction-product-image">
                {product.image_url ? <img src={getImageUrl(product.image_url)} alt={product.title} /> : 'NO IMAGE'}
              </div>
              <div className="transaction-product-meta">
                <strong>{product.title}</strong>
                <span>¥{(product.price || 0).toLocaleString()}</span>
              </div>
            </Link>

            <div className="transaction-info-list">
              <div className="transaction-info-row"><span>取引ID</span><strong>{purchase.id}</strong></div>
              <div className="transaction-info-row"><span>商品ID</span><strong>{product.id}</strong></div>
              <div className="transaction-info-row"><span>購入日時</span><strong>{formatDateTime(purchase.created_at)}</strong></div>
              <div className="transaction-info-row"><span>配送方法</span><strong>{product.shipping_method_label || '未設定'}</strong></div>
              <div className="transaction-info-row"><span>発送日の目安</span><strong>{product.shipping_days || '未設定'}</strong></div>
              <div className="transaction-info-row"><span>取引状態</span><strong>{purchase.status_label || purchase.status}</strong></div>
            </div>
          </aside>

          <section className="transaction-main-panel">
            <div className="transaction-main-head">
              <h1>取引画面</h1>
              <p>{isTransactionParty ? 'チャット・取引更新・評価ができます' : 'この取引は閲覧できません'}</p>
            </div>

            {!isTransactionParty ? (
              <div className="transaction-inline-error">取引当事者のみアクセスできます。</div>
            ) : (
              <>
                <section className="transaction-box">
                  <div className="transaction-box-head">
                    <h3>取引ステータス</h3>
                    <strong>{purchase.status_label || purchase.status}</strong>
                  </div>
                  {purchaseStatusError && <p className="transaction-inline-error">{purchaseStatusError}</p>}
                  {nextStatusOptions.length > 0 ? (
                    <div className="transaction-status-actions">
                      {nextStatusOptions.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          className="transaction-action-btn"
                          onClick={() => handlePurchaseStatusUpdate(option.value)}
                          disabled={purchaseStatusUpdating}
                        >
                          {purchaseStatusUpdating ? '更新中...' : option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="transaction-note">現在、更新可能なステータスはありません。</p>
                  )}
                </section>

                <section className="transaction-box">
                  <div className="transaction-box-head">
                    <h3>取引チャット</h3>
                    <span>{purchaseRole === 'seller' ? '出品者モード' : '購入者モード'}</span>
                  </div>

                  {purchaseRole === 'seller' && (
                    <div className="transaction-participants">
                      {chatParticipants.length === 0 ? (
                        <p className="transaction-note">まだ問い合わせはありません。</p>
                      ) : (
                        chatParticipants.map((participant) => (
                          <button
                            type="button"
                            key={participant.email}
                            className={`transaction-participant ${selectedChatEmail === participant.email ? 'is-active' : ''}`}
                            onClick={() => setSelectedChatEmail(participant.email)}
                            disabled={chatSending}
                          >
                            <span>{participant.user_name || participant.email}</span>
                            <small>{participant.is_purchased ? '購入者' : '購入希望者'}</small>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  <div className="transaction-chat-thread" ref={chatThreadRef}>
                    {chatLoading ? (
                      <p className="transaction-note">読み込み中...</p>
                    ) : chatMessages.length === 0 ? (
                      <p className="transaction-note">メッセージはまだありません。</p>
                    ) : (
                      chatMessages.map((item) => (
                        <div key={item.id} className={`transaction-chat-row ${item.is_own ? 'is-own' : ''}`}>
                          <div className="transaction-chat-bubble">
                            <div className="transaction-chat-meta">
                              <span>{item.sender_name || item.sender_email}</span>
                              <small>{formatChatTime(item.created_at)}</small>
                            </div>
                            <p>{item.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {chatError && <p className="transaction-inline-error">{chatError}</p>}

                  <form className="transaction-chat-form" onSubmit={handleChatSubmit}>
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={chatInputPlaceholder}
                      maxLength={1000}
                      disabled={chatLoading || chatSending || (purchaseRole === 'seller' && !selectedChatEmail)}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || chatSending || !chatInput.trim() || (purchaseRole === 'seller' && !selectedChatEmail)}
                    >
                      {chatSending ? '送信中' : '送信'}
                    </button>
                  </form>
                </section>

                {isPurchaseCompleted && (
                  <section className="transaction-box">
                    <div className="transaction-box-head">
                      <h3>取引評価</h3>
                      <span>受取完了後にお互い1回ずつ評価できます</span>
                    </div>

                    {purchaseReviews.length > 0 && (
                      <div className="transaction-review-list">
                        {purchaseReviews.map((review) => (
                          <div key={review.id} className="transaction-review-item">
                            <div className="transaction-review-meta">
                              <strong>{review.reviewer_role_label}</strong>
                              <span>{review.reviewer_name}</span>
                            </div>
                            <div className="transaction-review-stars">{formatRatingStars(review.rating)}</div>
                            {review.comment && <p>{review.comment}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {canSubmitReview ? (
                      <form className="transaction-review-form" onSubmit={handleReviewSubmit}>
                        <label>
                          評価
                          <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} disabled={reviewSubmitting}>
                            <option value="5">5 - とても良い</option>
                            <option value="4">4 - 良い</option>
                            <option value="3">3 - 普通</option>
                            <option value="2">2 - やや不満</option>
                            <option value="1">1 - 不満</option>
                          </select>
                        </label>
                        <label>
                          コメント（任意）
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="取引の感想を入力できます"
                            disabled={reviewSubmitting}
                          />
                        </label>
                        <button type="submit" className="transaction-action-btn" disabled={reviewSubmitting}>
                          {reviewSubmitting ? '投稿中...' : '評価を投稿'}
                        </button>
                      </form>
                    ) : (
                      <p className="transaction-note">
                        {myPurchaseReview ? 'あなたはこの取引を評価済みです。' : '相手の評価を待っています。'}
                      </p>
                    )}

                    {reviewError && <p className="transaction-inline-error">{reviewError}</p>}
                    {reviewMessage && <p className="transaction-note">{reviewMessage}</p>}
                  </section>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Transaction;

