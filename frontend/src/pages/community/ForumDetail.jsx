import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/forum_detail.css';

const IconBase = ({ children, className = 'icon' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="18"
    height="18"
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

const ShareIcon = (props) => (
  <IconBase {...props}>
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <path d="M16 6l-4-4-4 4" />
    <path d="M12 2v14" />
  </IconBase>
);

const FlagIcon = (props) => (
  <IconBase {...props}>
    <path d="M5 3v18" />
    <path d="M5 4h12l-2 4 2 4H5" />
  </IconBase>
);

function ForumDetail() {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [searchParams] = useSearchParams();
  const resolvedThreadId = threadId || searchParams.get('id');
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLikedThread, setHasLikedThread] = useState(false);
  const [likedComments, setLikedComments] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

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
    if (!currentUser) return;
    fetchThread();
  }, [resolvedThreadId, currentUser]);

  useEffect(() => {
    const followerEmail = currentUser?.email;
    const followeeEmail = thread?.author_email;

    if (!followerEmail || !followeeEmail || followerEmail === followeeEmail) {
      setIsFollowing(false);
      return;
    }

    const fetchFollowStatus = async () => {
      setIsFollowLoading(true);
      try {
        const params = new URLSearchParams({
          follower_email: followerEmail,
          followee_email: followeeEmail
        });
        const response = await fetch(`http://localhost:5000/api/forum/follow/status?${params}`);
        const data = await response.json();
        if (response.ok) {
          setIsFollowing(Boolean(data.following));
        }
      } catch (err) {
        console.error('Follow status error:', err);
      } finally {
        setIsFollowLoading(false);
      }
    };

    fetchFollowStatus();
  }, [currentUser, thread]);

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
    if (!thread) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const nextLiked = !hasLikedThread;
    setIsLiking(true);
    try {
      const action = nextLiked ? 'like' : 'unlike';
      const response = await fetch(`http://localhost:5000/api/forum/threads/${thread.id}/${action}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setThread(prev => ({ ...prev, like_count: data.like_count }));
        setHasLikedThread(nextLiked);
        try {
          if (nextLiked) {
            localStorage.setItem(getThreadLikeKey(thread.id), '1');
          } else {
            localStorage.removeItem(getThreadLikeKey(thread.id));
          }
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
    if (!currentUser) {
      navigate('/login');
      return;
    }
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
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const nextLiked = !likedComments[commentId];
    try {
      const action = nextLiked ? 'like' : 'unlike';
      const response = await fetch(`http://localhost:5000/api/forum/comments/${commentId}/${action}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId ? { ...comment, like_count: data.like_count } : comment
          )
        );
        setLikedComments(prev => ({ ...prev, [commentId]: nextLiked }));
        try {
          if (nextLiked) {
            localStorage.setItem(getCommentLikeKey(commentId), '1');
          } else {
            localStorage.removeItem(getCommentLikeKey(commentId));
          }
        } catch (err) {
          console.error('Comment like write error:', err);
        }
      }
    } catch (err) {
      console.error('Comment like error:', err);
    }
  };

  const handleFollowToggle = async () => {
    const followerEmail = currentUser?.email;
    const followeeEmail = thread?.author_email;

    if (!followeeEmail) return;
    if (!followerEmail) {
      navigate('/login');
      return;
    }
    if (followerEmail === followeeEmail) return;

    setIsFollowLoading(true);
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`http://localhost:5000/api/forum/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          follower_email: followerEmail,
          followee_email: followeeEmail
        })
      });
      if (response.ok) {
        setIsFollowing(prev => !prev);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (!authChecked || loading) {
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

  const canFollow = Boolean(thread.author_email) && currentUser?.email !== thread.author_email;
  const followLabel = currentUser ? (isFollowing ? 'フォロー中' : 'フォロー') : 'ログインでフォロー';

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
            <div className="thread-meta-row">
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
                  <span className="stat-icon"><CommentIcon /></span>
                  <span>{thread.comment_count || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon"><EyeIcon /></span>
                  <span>{thread.view_count || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon"><ThumbIcon /></span>
                  <span>{thread.like_count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="original-post">
            <div className="post-author">
              <div className="author-avatar">USER</div>
              <div className="author-info">
                <div className="author-name">{thread.author_name}</div>
                <div className="author-badge">投稿者</div>
              </div>
              <div className="post-meta">
                <div className="post-time">{getRelativeTime(thread.created_at)}</div>
                {canFollow && (
                  <button
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                  >
                    {followLabel}
                  </button>
                )}
              </div>
            </div>

            <div className="post-content">
              {thread.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            <div className="post-actions">
              <button
                className={`action-btn ${hasLikedThread ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                <ThumbIcon /><span>{thread.like_count || 0}</span>
              </button>
              <button className="action-btn">
                <ShareIcon /><span>シェア</span>
              </button>
              <Link to="/contact" className="action-btn">
                <FlagIcon /><span>報告</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="comments-section thread-container">
          <div className="comments-header">コメント ({comments.length}件)</div>

          {comments.map((comment) => (
            <div className="comment-item fade-in" key={comment.id}>
              <div className="comment-header">
                <div className="comment-avatar">USER</div>
                <div className="comment-author">
                  <div className="comment-author-name">{comment.author_name}</div>
                  <div className="comment-time">{getRelativeTime(comment.created_at)}</div>
                </div>
              </div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-actions">
                <button
                  className={`comment-action ${likedComments[comment.id] ? 'liked' : ''}`}
                  onClick={() => handleCommentLike(comment.id)}
                >
                  <ThumbIcon /><span>{comment.like_count || 0}</span>
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



