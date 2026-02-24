import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../css/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/index.css';

const VISIBLE_FORUM_ITEMS = 5;
const FORUM_ROTATE_MS = 3000;

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  const trimmed = String(imageUrl).replace(/\\/g, '/').replace(/^\/+/, '');
  return `http://localhost:5000/${trimmed}`;
};

const categories = ['文芸', '漫画', '参考書', '洋書', '雑誌', '絵本', '自己啓発', 'その他'];
const genres = ['ファンタジー', '科学', 'ホラー', '恋愛', '歴史', '詩集', 'ビジネス書', '自己啓発', 'その他'];

function Home() {
  const [products, setProducts] = useState([]);
  const [weeklyPopularThreads, setWeeklyPopularThreads] = useState([]);
  const [recommendProducts, setRecommendProducts] = useState([]);
  const [followProducts, setFollowProducts] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [weeklyPopularLoading, setWeeklyPopularLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [forumSlideIndex, setForumSlideIndex] = useState(0);

  const renderProductGrid = (items) => (
    <div className="book-grid home-listing-grid">
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
        <p>投稿がありません。</p>
      )}
    </div>
  );

  const renderForumCarousel = (items) => {
    if (items.length === 0) {
      return <p>1週間以内の掲示板投稿がありません。</p>;
    }

    const slideWidthPercent = 100 / VISIBLE_FORUM_ITEMS;

    return (
      <div
        className="forum-carousel-track"
        style={{ transform: `translateX(-${forumSlideIndex * slideWidthPercent}%)` }}
      >
        {items.map((thread) => (
          <Link key={thread.id} to={`/forum/${thread.id}`} className="forum-carousel-item-link">
            <article className="forum-carousel-item">
              <p className="forum-carousel-title">{thread.title}</p>
              <div className="forum-carousel-meta">
                <span>{thread.category_label || '掲示板'}</span>
                <span>閲覧 {thread.view_count || 0}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    );
  };

  const renderForumTopSection = () => (
    <div className="forum-carousel-window">
      <h2 className="section-title">人気の掲示板投稿</h2>
      {weeklyPopularLoading ? (
        <p>読み込み中...</p>
      ) : (
        renderForumCarousel(weeklyPopularThreads)
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
      .then((response) => response.json())
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((error) => {
        console.error('Products API error:', error);
        setProducts([]);
      });
  }, [currentUserEmail]);

  useEffect(() => {
    const fetchWeeklyPopular = async () => {
      setWeeklyPopularLoading(true);
      try {
        const params = new URLSearchParams({
          sort: 'newest',
          limit: '120'
        });
        const response = await fetch(`http://localhost:5000/api/forum/threads?${params.toString()}`);
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.threads)) {
          setWeeklyPopularThreads([]);
          return;
        }

        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const weeklyThreads = data.threads
          .filter((thread) => {
            if (!thread?.created_at) return false;
            const createdAtMs = new Date(thread.created_at).getTime();
            return Number.isFinite(createdAtMs) && createdAtMs >= oneWeekAgo;
          })
          .sort((a, b) => {
            const viewDiff = (b.view_count || 0) - (a.view_count || 0);
            if (viewDiff !== 0) return viewDiff;
            return (b.comment_count || 0) - (a.comment_count || 0);
          })
          .slice(0, 10);

        setWeeklyPopularThreads(weeklyThreads);
      } catch (error) {
        console.error('Weekly popular forum API error:', error);
        setWeeklyPopularThreads([]);
      } finally {
        setWeeklyPopularLoading(false);
      }
    };

    fetchWeeklyPopular();
  }, []);

  useEffect(() => {
    setForumSlideIndex(0);
  }, [weeklyPopularThreads.length]);

  useEffect(() => {
    const maxSlide = Math.max(weeklyPopularThreads.length - VISIBLE_FORUM_ITEMS, 0);
    if (maxSlide <= 0) return undefined;

    const timer = setInterval(() => {
      setForumSlideIndex((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, FORUM_ROTATE_MS);

    return () => clearInterval(timer);
  }, [weeklyPopularThreads.length]);

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
          const recommendations = Array.isArray(data.recommendations)
            ? data.recommendations.filter((item) => Number(item.status) === 1)
            : [];
          setRecommendProducts(recommendations);
        } else {
          setRecommendProducts([]);
        }
      } catch (error) {
        console.error('Recommendations API error:', error);
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
        console.error('Follow feed API error:', error);
        setFollowProducts([]);
      } finally {
        setFollowLoading(false);
      }
    };

    fetchFollowFeed();
  }, [currentUserEmail]);

  const hasMoreNewBooks = products.length > 4;
  const hasMoreRecommendBooks = recommendProducts.length > 4;

  return (
    <>
      <Header />

      <main className="main-content" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="pickup-area">
          <h2>本好きのためのマーケットプレイス</h2>
          <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        <section className="section home-forum-top-section">
          {renderForumTopSection()}
        </section>

        <div className="home-market-layout">
          <aside className="home-market-sidebar">
            <section className="section home-side-block">
              <h3 className="home-side-title">カテゴリから探す</h3>
              <div className="categories home-side-list">
                {categories.map((category) => (
                  <Link key={category} to={`/search?q=${encodeURIComponent(category)}`}>
                    <button className="category-btn">{category}</button>
                  </Link>
                ))}
              </div>
            </section>

            <section className="section home-side-block">
              <h3 className="home-side-title">ジャンルで探す</h3>
              <div className="genres home-side-list">
                {genres.map((genre) => (
                  <Link key={genre} to={`/search?q=${encodeURIComponent(genre)}`}>
                    <button className="genre-btn">{genre}</button>
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          <div className="home-market-main">
            <section className="section home-product-block">
              <div className="home-block-head">
                <div className="home-title-group">
                  <h2 className="section-title">新着の商品</h2>
                  <Link to="/search" className="home-more-btn">もっと見る</Link>
                </div>
              </div>
              {products.length > 0 ? renderProductGrid(products.slice(0, 8)) : <p>Loading products...</p>}
            </section>

            <section className="section home-product-block">
              <div className="home-block-head">
                <div className="home-title-group">
                  <h2 className="section-title">おすすめの商品</h2>
                  <Link to="/search" className="home-more-btn">もっと見る</Link>
                </div>
              </div>
              {recommendLoading ? <p>おすすめを読み込み中...</p> : renderProductGrid(recommendProducts.slice(0, 8))}
            </section>

            <section className="section home-product-block">
              <div className="home-block-head">
                <div className="home-title-group">
                  <h2 className="section-title">フォロー中の出品</h2>
                  <Link to={currentUserEmail ? '/search' : '/login'} className="home-more-btn">もっと見る</Link>
                </div>
              </div>
              {currentUserEmail ? (
                followLoading ? <p>フォロー中の新着を読み込み中...</p> : (
                  followProducts.length > 0 ? renderProductGrid(followProducts.slice(0, 8)) : <p>フォロー中ユーザーの出品はまだありません。</p>
                )
              ) : (
                <p>ログインするとフォロー中の出品を表示できます。</p>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Home;
