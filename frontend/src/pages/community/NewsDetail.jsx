import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/news_detail.css';

const CATEGORY_LABELS = {
  important: '重要なお知らせ',
  update: 'アップデート',
  general: '一般'
};

function NewsDetail() {
  const [searchParams] = useSearchParams();
  const newsId = searchParams.get('id');
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!newsId) {
        setError('お知らせIDが指定されていません');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:5000/api/news/${newsId}`);
        const data = await response.json();
        if (response.ok) {
          setNews(data);
        } else {
          setError(data.error || 'お知らせの取得に失敗しました');
        }
      } catch (err) {
        console.error('News detail fetch error:', err);
        setError('お知らせの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [newsId]);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('ja-JP');
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <nav className="breadcrumb">
          <Link to="/">ホーム</Link>
          <span>&gt;</span>
          <Link to="/news">お知らせ</Link>
          <span>&gt;</span>
          <span>{news?.title || '詳細'}</span>
        </nav>

        <article className="article-container">
          {loading ? (
            <div className="content-section">
              <p>読み込み中...</p>
            </div>
          ) : error || !news ? (
            <div className="content-section">
              <p>{error || 'お知らせが見つかりません'}</p>
            </div>
          ) : (
            <>
              <header className="article-header">
                <div className="category-badge">{CATEGORY_LABELS[news.category] || CATEGORY_LABELS.general}</div>
                <h1 className="article-title">{news.title}</h1>
                <div className="article-meta">
                  <div className="meta-item">
                    <span className="meta-icon">DATE</span>
                    <span>{formatDate(news.created_at)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">TEAM</span>
                    <span>{news.author_email || 'Bibli運営'}</span>
                  </div>
                </div>
              </header>

              <section className="article-content">
                <div className="content-section">
                  {(news.content || '').split('\n').map((line, idx) => (
                    <p key={idx}>{line || ' '}</p>
                  ))}
                </div>
              </section>
            </>
          )}

          <nav className="article-navigation">
            <Link to="/news" className="back-btn">お知らせ一覧へ戻る</Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}

export default NewsDetail;
