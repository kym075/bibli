import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/forum.css';

const IconBase = ({ children, className = 'stat-icon' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="16"
    height="16"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const CommentIcon = (props) => (
  <IconBase {...props}>
    <path d="M21 12a8 8 0 0 1-8 8H7l-4 4V8a4 4 0 0 1 4-4h6a8 8 0 0 1 8 8Z" />
    <path d="M8 9h8M8 13h5" />
  </IconBase>
);

const EyeIcon = (props) => (
  <IconBase {...props}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
);

const ThumbIcon = (props) => (
  <IconBase {...props}>
    <path d="M7 11v8a2 2 0 0 0 2 2h6a2 2 0 0 0 1.9-1.37l2.1-6A2 2 0 0 0 17 10h-5l.6-3a2 2 0 0 0-3.92-.8L7 11Z" />
    <path d="M7 11H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3" />
  </IconBase>
);

const CATEGORY_LABELS = {
  all: 'すべて',
  chat: '雑談',
  question: '質問',
  discussion: '考察',
  recruitment: '募集',
  recommendation: 'おすすめ',
  review: '感想・レビュー'
};

const CATEGORY_ORDER = ['all', 'chat', 'question', 'discussion', 'recruitment', 'recommendation', 'review'];

function Forum() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchThreads = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      if (sort) {
        params.append('sort', sort);
      }
      params.append('page', currentPage);
      params.append('limit', 10);

      const response = await fetch(`http://localhost:5000/api/forum/threads?${params}`);
      const data = await response.json();
      if (response.ok) {
        setThreads(data.threads || []);
        setTotalPages(data.total_pages || 1);
      } else {
        setThreads([]);
        setError(data.error || '掲示板の取得に失敗しました');
      }
    } catch (err) {
      console.error('Forum fetch error:', err);
      setThreads([]);
      setError('掲示板の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    fetchThreads();
  }, [currentUser, category, sort, currentPage]);

  const handleCategoryChange = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setCurrentPage(1);
  };

  const getPreviewText = (content) => {
    if (!content) return '';
    const trimmed = content.replace(/\s+/g, ' ').trim();
    if (trimmed.length <= 120) return trimmed;
    return `${trimmed.slice(0, 120)}...`;
  };

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

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!authChecked) {
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

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-header fade-in">
          <h1 className="page-title">掲示板</h1>
          <p className="page-subtitle">「本好きの熱量で繋がる」コミュニティ</p>
          <p className="page-description">本について語り合い、新しい発見や出会いを見つけましょう</p>
        </div>

        <div className="post-action">
          <Link to="/forum-post">
            <button className="new-post-btn" id="newPostBtn">新しいトピックを投稿する</button>
          </Link>
        </div>

        <div className="forum-container fade-in">
          <div className="category-filter">
            <div className="filter-title">カテゴリで絞り込み</div>
            <div className="sort-controls">
              <label htmlFor="forumSort" className="sort-label">並び替え</label>
              <select
                id="forumSort"
                className="sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="popular">いいね順</option>
              </select>
            </div>
            <div className="category-tags">
              {CATEGORY_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`category-tag ${category === key ? 'active' : ''}`}
                  data-category={key}
                  onClick={() => handleCategoryChange(key)}
                >
                  {CATEGORY_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="thread-list">
            {loading && <p>読み込み中...</p>}
            {!loading && error && <p>{error}</p>}
            {!loading && !error && threads.length === 0 && (
              <p>投稿がまだありません。最初のトピックを投稿してみましょう。</p>
            )}
            {!loading && !error && threads.map((thread) => (
              <Link to={`/forum/${thread.id}`} key={thread.id} className="thread-link">
                <div className={`thread-item ${thread.category}`}>
                  <div className="thread-header">
                    <span className={`thread-category category-${thread.category}`}>
                      {thread.category_label || CATEGORY_LABELS[thread.category]}
                    </span>
                    <span className="thread-author">{thread.author_name}</span>
                    <span className="thread-time">{getRelativeTime(thread.created_at)}</span>
                  </div>
                  <h3 className="thread-title">{thread.title}</h3>
                  <p className="thread-preview">{getPreviewText(thread.content)}</p>
                  <div className="thread-stats">
                    <span className="stat-item comments-stat"><CommentIcon /><span>{thread.comment_count || 0}</span></span>
                    <span className="stat-item likes-stat"><ThumbIcon /><span>{thread.like_count || 0}</span></span>
                    <span className="stat-item views-stat"><EyeIcon /><span>{thread.view_count || 0}</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ≪ 前へ
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                次へ ≫
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Forum;
