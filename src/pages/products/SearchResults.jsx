import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/search_results.css';

function SearchResults() {
  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        {/* 検索結果ヘッダー */}
        <div className="search-header">
          <h1 className="search-results-title">🔍 検索結果</h1>
          <p className="search-info">
            「<span className="search-keyword">小説</span>」の検索結果：<span className="results-count">127</span>件
          </p>
        </div>

        {/* 絞り込み・ソートエリア */}
        <div className="filter-sort-area">
          <div className="controls-row">
            <div className="control-group">
              <span className="control-label">📊 ソート機能</span>
              <div className="select-wrapper">
                <select className="custom-select" id="sortSelect">
                  <option value="price_asc">価格順（安い順）</option>
                  <option value="price_desc">価格順（高い順）</option>
                  <option value="popular">人気順</option>
                  <option value="newest" selected>新着順</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">💰 価格帯</span>
              <div className="price-range">
                <input type="number" className="price-input" placeholder="最低価格" id="minPrice" />
                <span>〜</span>
                <input type="number" className="price-input" placeholder="最高価格" id="maxPrice" />
                <span>円</span>
              </div>
            </div>
          </div>

          <div className="controls-row">
            <div className="control-group">
              <span className="control-label">📖 商品の状態</span>
              <div className="select-wrapper">
                <select className="custom-select" id="conditionSelect">
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
                <select className="custom-select" id="saleTypeSelect">
                  <option value="">すべて</option>
                  <option value="fixed">固定価格</option>
                  <option value="auction">オークション</option>
                  <option value="negotiable">価格交渉可</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 商品グリッド */}
        <div className="products-grid" id="productsGrid">
          {/* 商品カード 1 */}
          <Link to="/product-detail">
            <div className="product-card fade-in">
              <div className="product-image">
                <button className="favorite-btn" title="お気に入りに追加">♡</button>
              </div>
              <div className="product-info">
                <h3 className="product-title">夏目漱石作品集</h3>
                <p className="product-price">¥1,200</p>
                <div className="product-meta">
                  <span className="condition-badge">良好</span>
                  <span>2時間前</span>
                </div>
              </div>
            </div>
          </Link>

          {/* 商品カード 2 */}
          <div className="product-card fade-in">
            <div className="product-image">
              <button className="favorite-btn" title="お気に入りに追加">♡</button>
            </div>
            <div className="product-info">
              <h3 className="product-title">村上春樹 ノルウェイの森</h3>
              <p className="product-price">¥800</p>
              <div className="product-meta">
                <span className="condition-badge">非常に良い</span>
                <span>5時間前</span>
              </div>
            </div>
          </div>

          {/* 商品カード 3 */}
          <div className="product-card fade-in">
            <div className="product-image">
              <button className="favorite-btn active" title="お気に入りから削除">❤️</button>
            </div>
            <div className="product-info">
              <h3 className="product-title">東野圭吾 白夜行</h3>
              <p className="product-price">¥950</p>
              <div className="product-meta">
                <span className="condition-badge">良好</span>
                <span>1日前</span>
              </div>
            </div>
          </div>

          {/* 商品カード 4-8 */}
          <div className="product-card fade-in">
            <div className="product-image">
              <button className="favorite-btn" title="お気に入りに追加">♡</button>
            </div>
            <div className="product-info">
              <h3 className="product-title">宮沢賢治 銀河鉄道の夜</h3>
              <p className="product-price">¥650</p>
              <div className="product-meta">
                <span className="condition-badge">普通</span>
                <span>2日前</span>
              </div>
            </div>
          </div>

          <div className="product-card fade-in">
            <div className="product-image">
              <button className="favorite-btn" title="お気に入りに追加">♡</button>
            </div>
            <div className="product-info">
              <h3 className="product-title">芥川龍之介 羅生門・蜘蛛の糸</h3>
              <p className="product-price">¥450</p>
              <div className="product-meta">
                <span className="condition-badge">良好</span>
                <span>3日前</span>
              </div>
            </div>
          </div>

          <div className="product-card fade-in">
            <div className="product-image">
              <button className="favorite-btn" title="お気に入りに追加">♡</button>
            </div>
            <div className="product-info">
              <h3 className="product-title">太宰治 人間失格</h3>
              <p className="product-price">¥720</p>
              <div className="product-meta">
                <span className="condition-badge">非常に良い</span>
                <span>4日前</span>
              </div>
            </div>
          </div>

          <div className="product-card fade-in">
            <div className="product-image">
              <button className="favorite-btn" title="お気に入りに追加">♡</button>
            </div>
            <div className="product-info">
              <h3 className="product-title">三島由紀夫 金閣寺</h3>
              <p className="product-price">¥1,100</p>
              <div className="product-meta">
                <span className="condition-badge">良好</span>
                <span>5日前</span>
              </div>
            </div>
          </div>

          <div className="product-card fade-in">
            <div className="product-image">
              <button className="favorite-btn" title="お気に入りに追加">♡</button>
            </div>
            <div className="product-info">
              <h3 className="product-title">川端康成 雪国</h3>
              <p className="product-price">¥850</p>
              <div className="product-meta">
                <span className="condition-badge">非常に良い</span>
                <span>1週間前</span>
              </div>
            </div>
          </div>
        </div>

        {/* ページネーション */}
        <div className="pagination">
          <a href="#" className="pagination-btn disabled">« 前へ</a>
          <a href="#" className="pagination-btn active">1</a>
          <a href="#" className="pagination-btn">2</a>
          <a href="#" className="pagination-btn">3</a>
          <a href="#" className="pagination-btn">4</a>
          <a href="#" className="pagination-btn">5</a>
          <span className="pagination-btn disabled">...</span>
          <a href="#" className="pagination-btn">16</a>
          <a href="#" className="pagination-btn">次へ »</a>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default SearchResults;
