import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../css/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/index.css';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  const trimmed = String(imageUrl).replace(/\\/g, '/').replace(/^\/+/, '');
  return `http://localhost:5000/${trimmed}`;
};

function Home() {
  const [products, setProducts] = useState([]);
  const [recommendProducts, setRecommendProducts] = useState([]);
  const [followProducts, setFollowProducts] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const renderProductGrid = (items) => (
    <div className="book-grid">
      {items.length > 0 ? (
        items.map((product) => (
          <Link key={product.id} to={`/product-detail?id=${product.id}`} className="book-card-link">
            <div className="book-card">
              <div className="book-image">
                {product.image_url ? (
                  <img src={getImageUrl(product.image_url)} alt={product.title} />
                ) : (
                  'NO IMAGE'
                )}
                {product.status !== 1 && <span className="sold-badge">Sold out</span>}
                <span className="book-price-badge">¥{product.price?.toLocaleString()}</span>
              </div>
              <div className="book-title">{product.title}</div>
            </div>
          </Link>
        ))
      ) : (
        <p>商品がありません。</p>
      )}
    </div>
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserEmail(user?.email || '');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      limit: '8',
      include_sold: '1'
    });
    if (currentUserEmail) {
      params.set('viewer_email', currentUserEmail);
    }

    fetch(`http://localhost:5000/api/products?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      })
      .catch(error => console.error('Products API呼び出しエラー:', error));
  }, [currentUserEmail]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setRecommendLoading(true);
      try {
        const params = new URLSearchParams({ limit: '8' });
        if (currentUserEmail) {
          params.set('email', currentUserEmail);
        }
        const response = await fetch(`http://localhost:5000/api/recommendations?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setRecommendProducts(data.recommendations || []);
        } else {
          setRecommendProducts([]);
        }
      } catch (error) {
        console.error('Recommendations API呼び出しエラー:', error);
        setRecommendProducts([]);
      } finally {
        setRecommendLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUserEmail]);

  useEffect(() => {
    if (!currentUserEmail) {
      setFollowProducts([]);
      return;
    }

    const fetchFollowFeed = async () => {
      setFollowLoading(true);
      try {
        const params = new URLSearchParams({
          email: currentUserEmail,
          limit: '8'
        });
        const response = await fetch(`http://localhost:5000/api/follow/feed?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setFollowProducts(data.products || []);
        } else {
          setFollowProducts([]);
        }
      } catch (error) {
        console.error('Follow feed API呼び出しエラー:', error);
        setFollowProducts([]);
      } finally {
        setFollowLoading(false);
      }
    };

    fetchFollowFeed();
  }, [currentUserEmail]);

  return (
    <>
      <Header />

      <main className="main-content" style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
        {/* ピックアップエリア */}
        <div className="pickup-area">
          <h2>本好きのためのマーケットプレイス</h2>
          <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        {/* カテゴリから探す */}
        <section className="section">
          <h2 className="section-title">カテゴリから探す</h2>
          <div className="categories">
            <Link to="/search?q=小説"><button className="category-btn">小説</button></Link>
            <Link to="/search?q=漫画"><button className="category-btn">漫画</button></Link>
            <Link to="/search?q=専門書"><button className="category-btn">専門書</button></Link>
            <Link to="/search?q=絵本"><button className="category-btn">絵本</button></Link>
            <Link to="/search?q=雑誌"><button className="category-btn">雑誌</button></Link>
            <Link to="/search?q=洋書"><button className="category-btn">洋書</button></Link>
            <Link to="/search?q=自己啓発"><button className="category-btn">自己啓発</button></Link>
            <Link to="/search?q=その他"><button className="category-btn">その他</button></Link>
          </div>
        </section>

        {/* ジャンルから探す */}
        <section className="section">
          <h2 className="section-title">ジャンルから探す</h2>
          <div className="genres">
            <Link to="/search?q=ファンタジー"><button className="genre-btn">ファンタジー</button></Link>
            <Link to="/search?q=純文学"><button className="genre-btn">純文学</button></Link>
            <Link to="/search?q=ホラー"><button className="genre-btn">ホラー</button></Link>
            <Link to="/search?q=歴史"><button className="genre-btn">歴史</button></Link>
            <Link to="/search?q=童話"><button className="genre-btn">童話</button></Link>
            <Link to="/search?q=恋愛"><button className="genre-btn">恋愛</button></Link>
            <Link to="/search?q=ビジネス書"><button className="genre-btn">ビジネス書</button></Link>
            <Link to="/search?q=自己啓発"><button className="genre-btn">自己啓発</button></Link>
            <Link to="/search?q=その他"><button className="genre-btn">その他</button></Link>
          </div>
        </section>

        {/* 新着の本 */}
        <section className="section">
          <h2 className="section-title">新着の本</h2>
          {products.length > 0 ? renderProductGrid(products.slice(0, 4)) : <p>Loading products...</p>}
        </section>

        {/* おすすめ */}
        <section className="section">
          <h2 className="section-title">おすすめ商品</h2>
          {recommendLoading ? <p>おすすめを読み込み中...</p> : renderProductGrid(recommendProducts.slice(0, 4))}
        </section>

        {currentUserEmail && (
          <section className="section">
            <h2 className="section-title">フォロー中ユーザーの新着</h2>
            {followLoading ? <p>フォロー中の新着を読み込み中...</p> : (
              followProducts.length > 0 ? renderProductGrid(followProducts.slice(0, 4)) : <p>フォロー中ユーザーの出品はまだありません。</p>
            )}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Home;



