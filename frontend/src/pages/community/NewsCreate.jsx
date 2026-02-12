import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/news_create.css';

function NewsCreate() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.email) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          content: formData.content.trim(),
          author_email: currentUser.email
        })
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/news');
      } else {
        setError(data.error || 'お知らせ作成に失敗しました');
      }
    } catch (err) {
      console.error('News create error:', err);
      setError('お知らせ作成に失敗しました');
    } finally {
      setIsSubmitting(false);
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
      <main className="main-content news-create-page">
        <div className="news-create-card">
          <h1>お知らせ作成</h1>
          <p className="news-create-desc">運営向けのお知らせを作成します。</p>

          {error && <div className="news-create-error">{error}</div>}

          <form onSubmit={handleSubmit} className="news-create-form">
            <label htmlFor="title">タイトル</label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={120}
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label htmlFor="category">カテゴリ</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="important">重要</option>
              <option value="update">アップデート</option>
              <option value="general">一般</option>
            </select>

            <label htmlFor="content">本文</label>
            <textarea
              id="content"
              name="content"
              rows="8"
              maxLength={3000}
              value={formData.content}
              onChange={handleChange}
              required
            />
            <div className="char-count">{formData.content.length}/3000</div>

            <div className="news-create-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/news')}>キャンセル</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? '作成中...' : '作成する'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default NewsCreate;
