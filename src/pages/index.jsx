import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/index.css";

export default function Index() {
    const markup = `
        <!-- ピックアップエリア -->
        <div class="pickup-area">
            <h2>📚 本好きのためのマーケットプレイス</h2>
            <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        <!-- カテゴリから探す -->
        <section class="section">
            <h2 class="section-title">カテゴリから探す</h2>
            <div class="categories">
                <a href="search_results.html"><button class="category-btn">小説</button></a>
                <button class="category-btn">漫画</button>
                <button class="category-btn">専門書</button>
                <button class="category-btn">絵本</button>
                <button class="category-btn">雑誌</button>
                <button class="category-btn">洋書</button>
                <button class="category-btn">自己啓発</button>
            </div>
        </section>

        <!-- ジャンルから探す -->
        <section class="section">
            <h2 class="section-title">ジャンルから探す</h2>
            <div class="genres">
                <button class="genre-btn">ファンタジー</button>
                <button class="genre-btn">純文学</button>
                <button class="genre-btn">ホラー</button>
                <button class="genre-btn">歴史</button>
                <button class="genre-btn">童話</button>
                <button class="genre-btn">恋愛</button>
                <button class="genre-btn">ビジネス書</button>
                <button class="genre-btn">自己啓発</button>
            </div>
        </section>

        <!-- 新着の本 -->
        <section class="section">
            <h2 class="section-title">新着の本</h2>
            <div class="book-grid">
                <a href="product_detail.html">
                    <div class="book-card">
                        <div class="book-image"></div>
                        <div class="book-info">
                            <div class="book-title">夏目漱石作品集</div>
                            <div class="book-price">¥1,200</div>
                        </div>
                    </div>
                </a>
                <div class="book-card">
                    <div class="book-image"></div>
                    <div class="book-info">
                        <div class="book-title">JavaScript完全ガイド</div>
                        <div class="book-price">¥2,800</div>
                    </div>
                </div>
                <div class="book-card">
                    <div class="book-image"></div>
                    <div class="book-info">
                        <div class="book-title">人気コミック全巻セット</div>
                        <div class="book-price">¥4,500</div>
                    </div>
                </div>
                <div class="book-card">
                    <div class="book-image"></div>
                    <div class="book-info">
                        <div class="book-title">料理のレシピ本</div>
                        <div class="book-price">¥890</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 注目の本 -->
        <section class="section">
            <h2 class="section-title">注目の本</h2>
            <div class="book-grid">
                <div class="book-card">
                    <div class="book-image"></div>
                    <div class="book-info">
                        <div class="book-title">ベストセラー小説</div>
                        <div class="book-price">¥1,500</div>
                    </div>
                </div>
                <div class="book-card">
                    <div class="book-image"></div>
                    <div class="book-info">
                        <div class="book-title">人気ビジネス書</div>
                        <div class="book-price">¥2,200</div>
                    </div>
                </div>
                <div class="book-card">
                    <div class="book-image"></div>
                    <div class="book-info">
                        <div class="book-title">希少な古書</div>
                        <div class="book-price">¥8,000</div>
                    </div>
                </div>
                <div class="book-card">
                    <div class="book-image"></div>
                    <div class="book-info">
                        <div class="book-title">人気シリーズ最新刊</div>
                        <div class="book-price">¥1,800</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 特集・掲示板への導線 -->
        <section class="section">
            <h2 class="section-title">特集・コミュニティ</h2>
            <div class="special-links">
                <a href="forum.html" class="special-link">📝 本好きが集う掲示板へ</a>
                <a href="#" class="special-link">💎 絶版・希少本特集</a>
                <a href="#" class="special-link">🔥 今月のおすすめ</a>
            </div>
        </section>
    `;

    return (
        <>
            <Header />
            <main className="main-content" dangerouslySetInnerHTML={{ __html: markup }} />
            <Footer />
        </>
    );
}
