import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/search_results.css';

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  // フィルター・ソートの状態
  const [filters, setFilters] = useState({
    keyword: searchParams.get('q') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    condition: searchParams.get('condition') || '',
    saleType: searchParams.get('sale_type') || ''
  });

  // API から商品を取得
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('q', filters.keyword);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.saleType) params.append('sale_type', filters.saleType);
      params.append('page', currentPage);
      params.append('limit', 20);

      const response = await fetch(`http://localhost:5000/api/products?${params}`);
      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
        setTotalCount(data.total || 0);
        setTotalPages(data.total_pages || 1);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('商品取得エラー:', error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // URLパラメータの変更を監視
  useEffect(() => {
    const keyword = searchParams.get('q') || '';
    setFilters(prev => ({ ...prev, keyword }));
  }, [searchParams]);

  // フィルター変更時に商品を再取得
  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  // フィルター変更ハンドラ
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // ページを1に戻す
  };

  // お気に入りトグル
  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  // 商品状態のラベル変換
  const getConditionLabel = (condition) => {
    const labels = {
      'excellent': '非常に良い',
      'good': '良好',
      'fair': '普通'
    };
    return labels[condition] || condition;
  };

  // 相対時間表示
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return `${Math.floor(diffDays / 7)}週間前`;
  };

  // ページネーション処理
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ページネーション番号の生成
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        {/* 検索結果ヘッダー */}
        <div className="search-header">
          <h1 className="search-results-title">🔍 検索結果</h1>
          <p className="search-info">
            {filters.keyword && (
              <>
                「<span className="search-keyword">{filters.keyword}</span>」の検索結果：
              </>
            )}
            <span className="results-count">{totalCount}</span>件
          </p>
        </div>

        {/* 絞り込み・ソートエリア */}
        <div className="filter-sort-area">
          <div className="controls-row">
            <div className="control-group">
              <span className="control-label">📊 ソート機能</span>
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="price_asc">価格順（安い順）</option>
                  <option value="price_desc">価格順（高い順）</option>
                  <option value="popular">人気順</option>
                  <option value="newest">新着順</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">💰 価格帯</span>
              <div className="price-range">
                <input
                  type="number"
                  className="price-input"
                  placeholder="最低価格"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>〜</span>
                <input
                  type="number"
                  className="price-input"
                  placeholder="最高価格"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
                <span>円</span>
              </div>
            </div>
          </div>

          <div className="controls-row">
            <div className="control-group">
              <span className="control-label">📖 商品の状態</span>
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="excellent">非常に良い</option>
                  <option value="good">良い</option>
                  <option value="fair">普通</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">🛒 販売形式</span>
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={filters.saleType}
                  onChange={(e) => handleFilterChange('saleType', e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="fixed">固定価格</option>
                  <option value="auction">オークション</option>
                  <option value="negotiable">価格交渉可</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ローディング表示 */}
        {loading ? (
          <div className="loading-message">
            <p>読み込み中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <p>検索結果が見つかりませんでした。</p>
          </div>
        ) : (
          <>
            {/* 商品グリッド */}
            <div className="products-grid" id="productsGrid">
              {products.map((product) => (
                <Link to={`/product-detail?id=${product.id}`} key={product.id}>
                  <div className="product-card fade-in">
                    <div className="product-image" style={{ backgroundImage: product.image_url ? `url(${product.image_url})` : 'none' }}>
                      <button
                        className={`favorite-btn ${favorites.has(product.id) ? 'active' : ''}`}
                        title={favorites.has(product.id) ? 'お気に入りから削除' : 'お気に入りに追加'}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(product.id);
                        }}
                      >
                        {favorites.has(product.id) ? '❤️' : '♡'}
                      </button>
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.title}</h3>
                      <p className="product-price">¥{product.price?.toLocaleString()}</p>
                      <div className="product-meta">
                        {product.condition && (
                          <span className="condition-badge">{getConditionLabel(product.condition)}</span>
                        )}
                        <span>{getRelativeTime(product.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  « 前へ
                </button>

                {getPaginationNumbers().map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {totalPages > getPaginationNumbers()[getPaginationNumbers().length - 1] && (
                  <>
                    <span className="pagination-btn disabled">...</span>
                    <button
                      className="pagination-btn"
                      onClick={() => goToPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  次へ »
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default SearchResults;
