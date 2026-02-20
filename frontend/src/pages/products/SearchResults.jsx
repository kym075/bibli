import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../css/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/search_results.css';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentEmail, setCurrentEmail] = useState('');

  const [filters, setFilters] = useState({
    keyword: searchParams.get('q') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    condition: searchParams.get('condition') || ''
  });

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    const trimmed = String(imageUrl).replace(/\\/g, '/').replace(/^\/+/, '');
    return `http://localhost:5000/${trimmed}`;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('q', filters.keyword);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.condition) params.append('condition', filters.condition);
      params.append('include_sold', '1');
      if (currentEmail) params.append('viewer_email', currentEmail);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentEmail(user?.email || '');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const keyword = searchParams.get('q') || '';
    setFilters(prev => ({ ...prev, keyword }));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage, currentEmail]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

      <main className="main-content">
        <div className="search-header">
          <h1 className="search-results-title">検索結果</h1>
          <p className="search-info">
            {filters.keyword && (
              <>
                「<span className="search-keyword">{filters.keyword}</span>」の検索結果：
              </>
            )}
            <span className="results-count">{totalCount}</span>件
          </p>
        </div>

        <div className="filter-sort-area">
          <div className="controls-row">
            <div className="control-group">
              <span className="control-label">ソート機能</span>
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
              <span className="control-label">価格帯</span>
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
              <span className="control-label">商品の状態</span>
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="new_unused">新品、未使用</option>
                  <option value="nearly_unused">未使用に近い</option>
                  <option value="no_visible_damage">目立った傷や汚れなし</option>
                  <option value="slight_damage">やや傷や汚れあり</option>
                  <option value="damaged">傷や汚れあり</option>
                  <option value="poor_condition">全体的に状態が悪い</option>
                </select>
              </div>
            </div>
          </div>
        </div>

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
            <div className="book-grid" id="productsGrid">
              {products.map((product) => {
                const imageSource = product.image_url || (Array.isArray(product.image_urls) ? product.image_urls[0] : '');
                return (
                  <Link to={`/product-detail?id=${product.id}`} key={product.id} className="book-card-link">
                    <div className="book-card">
                      <div className="book-image">
                        {imageSource ? (
                          <img src={getImageUrl(imageSource)} alt={product.title} />
                        ) : (
                          'NO IMAGE'
                        )}
                        {product.status !== 1 && <span className="sold-badge">Sold out</span>}
                        <span className="book-price-badge">¥{product.price?.toLocaleString()}</span>
                      </div>
                      <div className="book-title">{product.title}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

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

