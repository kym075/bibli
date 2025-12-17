import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/product_detail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);

        if (!response.ok) {
          throw new Error('商品が見つかりません');
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        console.error('商品取得エラー:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handlePurchase = () => {
    if (!product) return;
    navigate('/checkout', { state: { product } });
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'novel': '小説',
      'manga': '漫画',
      'specialist': '専門書',
      'picture': '絵本',
      'magazine': '雑誌',
      'foreign': '洋書',
      'business': 'ビジネス書',
      'self-help': '自己啓発'
    };
    return categoryMap[category] || category;
  };

  const getConditionLabel = (condition) => {
    const conditionMap = {
      'new': '新品・未使用',
      'like-new': '未使用に近い',
      'excellent': '目立った傷や汚れなし',
      'good': 'やや傷や汚れあり',
      'fair': '傷や汚れあり',
      'poor': '全体的に状態が悪い'
    };
    return conditionMap[condition] || condition;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
            読み込み中...
          </div>
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
          <div style={{ textAlign: 'center', padding: '3rem', color: '#e74c3c' }}>
            {error || '商品が見つかりません'}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="product-container">
          {/* 左カラム: 商品画像エリア */}
          <div className="product-images">
            <div className="main-image" id="mainImage">
              {product.images && product.images.length > 0 ? (
                <img
                  src={`http://localhost:5000/api/products/images/${product.images[selectedImageIndex].image_id}`}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                  backgroundColor: '#f5f5f5'
                }}>
                  📚
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={`http://localhost:5000/api/products/images/${image.image_id}`}
                      alt={`${product.title} - ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右カラム: 商品情報・購入エリア */}
          <div className="product-info">
            <h1 className="product-title">{product.title}</h1>

            <div className="product-meta">
              <span>📂 カテゴリ: {getCategoryLabel(product.category)}</span>
            </div>

            <div className="condition-badge">
              {getConditionLabel(product.condition)}
            </div>

            <div className="price">¥{product.price.toLocaleString()}</div>

            <div className="action-buttons">
              {product.status === 'available' ? (
                <>
                  <button onClick={handlePurchase} className="btn-large btn-purchase">
                    🛒 今すぐ購入
                  </button>
                  <button className="btn-large btn-cart">
                    💼 カートに入れる
                  </button>
                </>
              ) : (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  color: '#7f8c8d'
                }}>
                  {product.status === 'reserved' && '取引中'}
                  {product.status === 'sold' && '売却済み'}
                </div>
              )}
            </div>

            <div className="secondary-actions">
              <button className="btn-large btn-outline">
                💰 値下げ依頼
              </button>
              <button className="btn-large btn-outline">
                ❤️ お気に入り
              </button>
            </div>

            {product.seller && (
              <div className="seller-info">
                <div className="seller-profile">
                  <div className="seller-avatar">{product.seller.name.charAt(0)}</div>
                  <div className="seller-details">
                    <h4>{product.seller.name}</h4>
                    <div className="rating">
                      <span>⭐⭐⭐⭐⭐</span>
                      <span>(4.8)</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-small">👤 フォロー</button>
              </div>
            )}

            <div className="communication-actions">
              <button className="btn btn-primary btn-small">💬 チャットで質問</button>
              <button className="btn btn-outline btn-small">🔗 シェア</button>
              <button className="btn btn-outline btn-small">⚠️ 通報</button>
            </div>
          </div>
        </div>

        {/* 商品説明エリア */}
        <div className="product-description">
          <div className="description-section">
            <h3>📖 商品の説明</h3>
            <div className="description-text">
              <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
            </div>
          </div>

          <div className="description-section">
            <h3>🏷️ 付けられているタグ</h3>
            <div className="tags">
              <span className="tag">日本文学</span>
              <span className="tag">古典</span>
              <span className="tag">名作</span>
              <span className="tag">全集</span>
              <span className="tag">読書</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetail;
