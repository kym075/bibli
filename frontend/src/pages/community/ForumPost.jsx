import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/forum_post.css';

function ForumPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: ''
  });
  const [titleCount, setTitleCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const authorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'ゲスト';
    const authorEmail = currentUser?.email || '';

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/forum/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: formData.category,
          title: formData.title.trim(),
          content: formData.content.trim(),
          author_name: authorName,
          author_email: authorEmail
        })
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/forum/${data.thread_id}`);
      } else {
        setError(data.error || '投稿に失敗しました');
      }
    } catch (err) {
      console.error('Forum post error:', err);
      setError('投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'title') {
      setTitleCount(value.length);
    } else if (id === 'content') {
      setContentCount(value.length);
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
        <div className="page-header">
          <h1 className="page-title">新しいトピックを投稿する</h1>
          <p className="page-description">本について語り合い、コミュニティを盛り上げましょう</p>
        </div>

        <div className="breadcrumb">
          <Link to="/forum" className="back-btn" id="backToForum">掲示板一覧へ戻る</Link>
        </div>

        <div className="form-container">
          <div className="success-message" id="successMessage">
            投稿が完了しました！掲示板一覧で確認できます。
          </div>
          {error && <div className="error-message">{error}</div>}

          <form id="postForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                カテゴリ<span className="required">*</span>
              </label>
              <select
                id="category"
                className="form-select"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">カテゴリを選択してください</option>
                <option value="chat">雑談</option>
                <option value="question">質問</option>
                <option value="discussion">考察</option>
                <option value="recruitment">募集</option>
                <option value="recommendation">おすすめ</option>
                <option value="review">感想・レビュー</option>
              </select>
              <div className="help-text">投稿内容に最も適したカテゴリを選択してください。</div>
            </div>

            <div className="category-descriptions">
              <h4>カテゴリの説明</h4>
              <div className="category-list">
                <div className="category-desc">
                  <div className="category-icon category-chat">雑談</div>
                  <div className="category-info">
                    <div className="category-name">雑談</div>
                    <div className="category-description">本に関する気軽な話題や日常的な会話</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-question">質問</div>
                  <div className="category-info">
                    <div className="category-name">質問</div>
                    <div className="category-description">本探し、読書に関する疑問や相談</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-discussion">考察</div>
                  <div className="category-info">
                    <div className="category-name">考察</div>
                    <div className="category-description">作品の深い分析や議論、文学的な考察</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-recruitment">募集</div>
                  <div className="category-info">
                    <div className="category-name">募集</div>
                    <div className="category-description">読書会やイベントのメンバー募集</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-recommendation">おすすめ</div>
                  <div className="category-info">
                    <div className="category-name">おすすめ</div>
                    <div className="category-description">本の推薦や紹介</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-review">感想</div>
                  <div className="category-info">
                    <div className="category-name">感想・レビュー</div>
                    <div className="category-description">読了後の感想や書評</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                タイトル<span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                placeholder="例：確か主人公が猫で...うろ覚えの本を探しています"
                maxLength="100"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <div className="char-count">
                <div className="help-text">投稿内容が分かりやすいタイトルを付けてください。</div>
                <div className="count-info">
                  <span id="titleCount">{titleCount}</span>/100文字
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                本文<span className="required">*</span>
              </label>
              <textarea
                id="content"
                className="form-textarea"
                placeholder="投稿内容を詳しく書いてください...&#10;&#10;例：&#10;子供の頃に読んだ本なのですが、どうしてもタイトルが思い出せません。&#10;記憶にあるのは以下の内容です：&#10;&#10;? 主人公が猫（確か黒い猫だったような...）&#10;? 飼い主の家で起こる日常を描いた小説&#10;? 猫の視点から人間の世界を観察する内容&#10;? 確か有名な作家さんの作品だったと思います&#10;&#10;何か心当たりがある方はいらっしゃいませんか？"
                maxLength="2000"
                value={formData.content}
                onChange={handleInputChange}
                required
              ></textarea>
              <div className="char-count">
                <div className="help-text">詳細な情報を提供することで、より良い回答を得られます。</div>
                <div className="count-info">
                  <span id="contentCount">{contentCount}</span>/2000文字
                </div>
              </div>
            </div>

            <div className="submit-section">
              <button
                type="submit"
                className="submit-btn"
                id="submitBtn"
                disabled={!formData.category || !formData.title || !formData.content || isSubmitting}
              >
                {isSubmitting ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ForumPost;
