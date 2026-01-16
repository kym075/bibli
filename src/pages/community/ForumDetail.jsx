import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../../css/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/forum_detail.css';

function ForumDetail() {
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const resolvedThreadId = threadId || searchParams.get('id');
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLikedThread, setHasLikedThread] = useState(false);
  const [likedComments, setLikedComments] = useState({});

  const getThreadLikeKey = (id) => `forum-thread-like-${id}`;
  const getCommentLikeKey = (id) => `forum-comment-like-${id}`;

  const readThreadLike = (id) => {
    try {
      return localStorage.getItem(getThreadLikeKey(id)) === '1';
    } catch (err) {
      console.error('Thread like read error:', err);
      return false;
    }
  };

  const readCommentLikes = (items) => {
    const map = {};
    if (!Array.isArray(items)) return map;
    items.forEach((comment) => {
      try {
        if (localStorage.getItem(getCommentLikeKey(comment.id)) === '1') {
          map[comment.id] = true;
        }
      } catch (err) {
        console.error('Comment like read error:', err);
      }
    });
    return map;
  };

  const fetchThread = async () => {
    if (!resolvedThreadId) {
      setError('スレッドが見つかりません');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/forum/threads/${resolvedThreadId}`);
      const data = await response.json();
      if (response.ok) {
        const threadData = data.thread;
        const commentData = data.comments || [];
        setThread(threadData);
        setComments(commentData);
        setHasLikedThread(readThreadLike(threadData.id));
        setLikedComments(readCommentLikes(commentData));
      } else {
        setError(data.error || 'スレッドの取得に失敗しました');
      }
    } catch (err) {
      console.error('Forum detail fetch error:', err);
      setError('スレッドの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [resolvedThreadId]);

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

  const handleLike = async () => {
    if (!thread || hasLikedThread) return;
    setIsLiking(true);
    try {
      const response = await fetch(`http://localhost:5000/api/forum/threads/${thread.id}/like`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setThread(prev => ({ ...prev, like_count: data.like_count }));
        setHasLikedThread(true);
        try {
          localStorage.setItem(getThreadLikeKey(thread.id), '1');
        } catch (err) {
          console.error('Thread like write error:', err);
        }
      }
    } catch (err) {
      console.error('Thread like error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !thread) return;

    const currentUser = auth.currentUser;
    const authorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'ゲスト';
    const authorEmail = currentUser?.email || '';

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/forum/threads/${thread.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: commentInput.trim(),
          author_name: authorName,
          author_email: authorEmail
        })
      });
      const data = await response.json();
      if (response.ok) {
        setComments(prev => [...prev, data.comment]);
        setThread(prev => ({ ...prev, comment_count: (prev.comment_count || 0) + 1 }));
        setLikedComments(prev => ({ ...prev, [data.comment.id]: false }));
        setCommentInput('');
      } else {
        setError(data.error || 'コメントの投稿に失敗しました');
      }
    } catch (err) {
      console.error('Comment submit error:', err);
      setError('コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (likedComments[commentId]) return;
    try {
      const response = await fetch(`http://localhost:5000/api/forum/comments/${commentId}/like`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId ? { ...comment, like_count: data.like_count } : comment
          )
        );
        setLikedComments(prev => ({ ...prev, [commentId]: true }));
        try {
          localStorage.setItem(getCommentLikeKey(commentId), '1');
        } catch (err) {
          console.error('Comment like write error:', err);
        }
      }
    } catch (err) {
      console.error('Comment like error:', err);
    }
  };

  if (loading) {
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

  if (error || !thread) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>{error || 'スレッドが見つかりません'}</p>
          <Link to="/forum" className="back-btn">掲示板一覧へ戻る</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="breadcrumb">
          <Link to="/forum" className="back-btn">掲示板一覧へ戻る</Link>
        </div>

        <div className="thread-container">
          <div className="thread-header">
            <div className="thread-category">{thread.category_label}</div>
            <h1 className="thread-title">{thread.title}</h1>
            <div className="thread-meta">
              <div className="meta-item">
                <span>投稿日:</span>
                <span>{new Date(thread.created_at).toLocaleString('ja-JP')}</span>
              </div>
              <div className="meta-item">
                <span>投稿者:</span>
                <span>{thread.author_name}</span>
              </div>
            </div>
            <div className="thread-stats">
              <div className="stat-item">
                <span>{thread.comment_count || 0} コメント</span>
              </div>
              <div className="stat-item">
                <span>{thread.view_count || 0} 閲覧</span>
              </div>
              <div className="stat-item">
                <span>{thread.like_count || 0} いいね</span>
              </div>
            </div>
          </div>

          <div className="original-post">
            <div className="post-author">
              <div className="author-avatar">??</div>
              <div className="author-info">
                <div className="author-name">{thread.author_name}</div>
                <div className="author-badge">投稿者</div>
              </div>
              <div className="post-time">{getRelativeTime(thread.created_at)}</div>
            </div>

            <div className="post-content">
              {thread.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            <div className="post-actions">
              <button className="action-btn" onClick={handleLike} disabled={isLiking || hasLikedThread}>
                <span>{hasLikedThread ? 'いいね済み' : 'いいね'} ({thread.like_count || 0})</span>
              </button>
              <button className="action-btn">
                <span>シェア</span>
              </button>
              <button className="action-btn">
                <span>報告</span>
              </button>
            </div>
          </div>
        </div>

        <div className="comments-section thread-container">
          <div className="comments-header">コメント ({comments.length}件)</div>

          {comments.map((comment) => (
            <div className="comment-item fade-in" key={comment.id}>
              <div className="comment-header">
                <div className="comment-avatar">??</div>
                <div className="comment-author">
                  <div className="comment-author-name">{comment.author_name}</div>
                  <div className="comment-time">{getRelativeTime(comment.created_at)}</div>
                </div>
              </div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-actions">
                <button
                  className="comment-action"
                  onClick={() => handleCommentLike(comment.id)}
                  disabled={likedComments[comment.id]}
                >
                  <span>いいね {comment.like_count || 0}</span>
                </button>
              </div>
            </div>
          ))}

          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="form-title">コメントを投稿する</div>
            <textarea
              className="comment-input"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              maxLength="2000"
              placeholder="コメント内容を入力してください"
              required
            />
            <div className="form-actions">
              <div className="char-count">{commentInput.length}/2000文字</div>
              <button type="submit" className="submit-btn" disabled={isSubmitting || !commentInput.trim()}>
                {isSubmitting ? '投稿中...' : 'コメントする'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ForumDetail;
