import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/index.css';

function Home() {
  return (
    <>
      <Header />

      <main className="main-content" style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
        {/* ピックアップエリア */}
        <div className="pickup-area">
          <h2>📚 本好きのためのマーケットプレイス</h2>
          <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        {/* カテゴリから探す */}
        <section className="section">
          <h2 className="section-title">カテゴリから探す</h2>
          <div className="categories">
            <Link to="/search"><button className="category-btn">小説</button></Link>
            <button className="category-btn">漫画</button>
            <button className="category-btn">専門書</button>
            <button className="category-btn">絵本</button>
            <button className="category-btn">雑誌</button>
            <button className="category-btn">洋書</button>
            <button className="category-btn">自己啓発</button>
          </div>
        </section>

        {/* ジャンルから探す */}
        <section className="section">
          <h2 className="section-title">ジャンルから探す</h2>
          <div className="genres">
            <button className="genre-btn">ファンタジー</button>
            <button className="genre-btn">純文学</button>
            <button className="genre-btn">ホラー</button>
            <button className="genre-btn">歴史</button>
            <button className="genre-btn">童話</button>
            <button className="genre-btn">恋愛</button>
            <button className="genre-btn">ビジネス書</button>
            <button className="genre-btn">自己啓発</button>
          </div>
        </section>

        {/* 新着の本 */}
        <section className="section">
          <h2 className="section-title">新着の本</h2>
          <div className="book-grid">
            <Link to="/product/1">
              <div className="book-card">
                <div className="book-image"></div>
                <div className="book-info">
                  <div className="book-title">夏目漱石作品集</div>
                  <div className="book-price">¥1,200</div>
                </div>
              </div>
            </Link>
            <div className="book-card">
              <div className="book-image"></div>
              <div className="book-info">
                <div className="book-title">JavaScript完全ガイド</div>
                <div className="book-price">¥2,800</div>
              </div>
            </div>
            <div className="book-card">
              <div className="book-image"></div>
              <div className="book-info">
                <div className="book-title">人気コミック全巻セット</div>
                <div className="book-price">¥4,500</div>
              </div>
            </div>
            <div className="book-card">
              <div className="book-image"></div>
              <div className="book-info">
                <div className="book-title">料理のレシピ本</div>
                <div className="book-price">¥890</div>
              </div>
            </div>
          </div>
        </section>

        {/* 注目の本 */}
        <section className="section">
          <h2 className="section-title">注目の本</h2>
          <div className="book-grid">
            <div className="book-card">
              <div className="book-image"></div>
              <div className="book-info">
                <div className="book-title">ベストセラー小説</div>
                <div className="book-price">¥1,500</div>
              </div>
            </div>
            <div className="book-card">
              <div className="book-image"></div>
              <div className="book-info">
                <div className="book-title">人気ビジネス書</div>
                <div className="book-price">¥2,200</div>
              </div>
            </div>
            <div className="book-card">
              <div className="book-image"></div>
              <div className="book-info">
                <div className="book-title">希少な古書</div>
                <div className="book-price">¥8,000</div>
              </div>
            </div>
            <div className="book-card">
              <div className="book-image"></div>
              <div className="book-info">
                <div className="book-title">人気シリーズ最新刊</div>
                <div className="book-price">¥1,800</div>
              </div>
            </div>
          </div>
        </section>

        {/* 特集・掲示板への導線 */}
        <section className="section">
          <h2 className="section-title">特集・コミュニティ</h2>
          <div className="special-links">
            <Link to="/forum" className="special-link">📝 本好きが集う掲示板へ</Link>
            <a href="#" className="special-link">💎 絶版・希少本特集</a>
            <a href="#" className="special-link">🔥 今月のおすすめ</a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;