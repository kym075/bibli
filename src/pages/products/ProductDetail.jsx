import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/product_detail.css';

function ProductDetail() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 商品状態のラベル変換
  const getConditionLabel = (condition) => {
    const labels = {
      'excellent': '非常に良い',
      'good': '良好',
      'fair': '普通'
    };
    return labels[condition] || condition;
  };

  // 販売形式のラベル変換
  const getSaleTypeLabel = (saleType) => {
    const labels = {
      'fixed': '固定価格',
      'auction': 'オークション',
      'negotiable': '価格交渉可'
    };
    return labels[saleType] || saleType;
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

  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="product-container">
          {/* 左カラム: 商品画像エリア */}
          <div className="product-images">
            <div className="main-image" id="mainImage">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} />
              ) : (
                <div style={{ fontSize: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  📚
                </div>
              )}
            </div>
          </div>

          {/* 右カラム: 商品情報・購入エリア */}
          <div className="product-info">
            <h1 className="product-title">{product.title}</h1>

            <div className="product-meta">
              <span>📂 カテゴリ: {product.category || '未設定'}</span>
              <span>🏷️ 販売形式: {getSaleTypeLabel(product.sale_type)}</span>
            </div>

            <div className="condition-badge">
              ✨ {getConditionLabel(product.condition)}
            </div>

            <div className="price">¥{product.price?.toLocaleString()}</div>

            <div className="action-buttons">
              <Link to={`/checkout?product_id=${product.id}`} style={{textDecoration: 'none', width: '100%'}}>
                <button className="btn-large btn-purchase" style={{width: '100%'}}>
                  🛒 今すぐ購入
                </button>
              </Link>
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
                  <div className="seller-avatar">
                    {product.seller.profile_image ? (
                      <img src={product.seller.profile_image} alt={product.seller.user_name} />
                    ) : (
                      '📚'
                    )}
                  </div>
                  <div className="seller-details">
                    <h4>{product.seller.user_name}</h4>
                    <div className="rating">
                      <span>⭐⭐⭐⭐⭐</span>
                      <span>(5.0)</span>
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
              <p>{product.description || '商品の説明はありません。'}</p>
            </div>
          </div>

          <div className="description-section">
            <h3>📋 商品の詳細</h3>
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
                <div className="spec-label">販売形式</div>
                <div className="spec-value">{getSaleTypeLabel(product.sale_type)}</div>
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

        {/* 関連商品エリア */}
        <div className="related-products">
          <h3>📚 関連商品</h3>
          <div className="related-grid">
            <p>関連商品はまだありません。</p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetail;
