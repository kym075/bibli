import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/search_results.css";

export default function SearchResults() {
    const markup = `
        <div class="search-header">
            <h1 class="search-results-title">🔍 検索結果</h1>
            <p class="search-info">「<span class="search-keyword">小説</span>」の検索結果：<span class="results-count">127</span>件</p>
        </div>

        <div class="products-grid" id="productsGrid">
            <a href="product_detail.html">
                <div class="product-card fade-in">
                    <div class="product-image"><button class="favorite-btn" title="お気に入りに追加">♡</button></div>
                    <div class="product-info"><h3 class="product-title">夏目漱石作品集</h3><p class="product-price">¥1,200</p></div>
                </div>
            </a>
        </div>

        <div class="pagination">
            <a href="#" class="pagination-btn disabled">« 前へ</a>
            <a href="#" class="pagination-btn active">1</a>
            <a href="#" class="pagination-btn">2</a>
            <a href="#" class="pagination-btn">次へ »</a>
        </div>
    `;

    return (
        <>
            <Header />
            <main className="main-content" dangerouslySetInnerHTML={{ __html: markup }} />
            <Footer />
        </>
    );
}
