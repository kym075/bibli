import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { auth } from '../../css/firebase';
import '../../css/news_page.css';

const CATEGORY_LABELS = {
  important: '重要',
  update: 'アップデート',
  general: '一般'
};

const CATEGORY_CLASS = {
  important: 'category-important',
  update: 'category-update',
  general: 'category-general'
};

const NOTIFICATION_ICON = {
  listing: '出',
  follow_listing: '新',
  purchase: '買',
  sold: '売',
  chat: '話',
  general: '通'
};

function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'たった今';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}時間前`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}日前`;
  return date.toLocaleDateString('ja-JP');
}

function News() {
  const [activeTab, setActiveTab] = useState('news');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/news');
        const data = await response.json();
        if (response.ok) {
          setNewsList(data.news || []);
        } else {
          setNewsList([]);
        }
      } catch (err) {
        console.error('News fetch error:', err);
        setNewsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentEmail(user?.email || '');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentEmail) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setNotificationsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/notifications?email=${encodeURIComponent(currentEmail)}`);
        const data = await response.json();
        if (response.ok) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unread_count || 0);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (err) {
        console.error('Notification fetch error:', err);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [currentEmail]);

  useEffect(() => {
    const markAllRead = async () => {
      if (activeTab !== 'notifications' || !currentEmail || unreadCount === 0) {
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/notifications/read-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentEmail })
        });

        if (response.ok) {
          setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
          setUnreadCount(0);
        }
      } catch (err) {
        console.error('Notification read-all error:', err);
      }
    };

    markAllRead();
  }, [activeTab, currentEmail, unreadCount]);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-title">
          <h1>お知らせ</h1>
          <p>重要な情報やアップデート情報をお届けします</p>
        </div>

        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
              data-tab="news"
              onClick={() => setActiveTab('news')}
            >
              運営からのお知らせ
            </button>
            <button
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              data-tab="notifications"
              onClick={() => setActiveTab('notifications')}
            >
              あなたへの通知
              {unreadCount > 0 && (
                <span
                  id="unreadCount"
                  style={{ background: 'var(--accent-warm)', color: 'white', borderRadius: '50%', padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="tab-content">
            <div className={`tab-panel ${activeTab === 'news' ? 'active' : ''}`} id="news-panel">
              {loading ? (
                <div className="empty-state">
                  <div className="empty-message">読み込み中...</div>
                </div>
              ) : newsList.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">N</div>
                  <div className="empty-message">お知らせはまだありません</div>
                </div>
              ) : (
                <div className="news-list">
                  {newsList.map((item, index) => {
                    const category = item.category || 'general';
                    const dateText = formatDate(item.created_at);
                    return (
                      <div className={`news-item ${category === 'important' ? 'important' : category === 'update' ? 'update' : 'general'}`} key={item.id}>
                        {index === 0 && <div className="new-badge">NEW</div>}
                        <div className="news-header">
                          <span className="news-date">{dateText}</span>
                          <span className={`news-category ${CATEGORY_CLASS[category] || CATEGORY_CLASS.general}`}>
                            {CATEGORY_LABELS[category] || CATEGORY_LABELS.general}
                          </span>
                        </div>
                        <h3 className="news-title">{item.title}</h3>
                        <p className="news-preview">
                          {(item.content || '').length > 90 ? `${item.content.slice(0, 90)}...` : (item.content || '')}
                        </p>
                        <div className="news-actions">
                          <Link to={`/news-detail?id=${item.id}`} className="read-more">詳細を見る →</Link>
                          <span className="news-status">公開中</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`tab-panel ${activeTab === 'notifications' ? 'active' : ''}`} id="notifications-panel">
              {!currentEmail ? (
                <div className="empty-state">
                  <div className="empty-icon">!</div>
                  <div className="empty-message">ログインすると通知を確認できます</div>
                </div>
              ) : notificationsLoading ? (
                <div className="empty-state">
                  <div className="empty-message">読み込み中...</div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">N</div>
                  <div className="empty-message">通知はまだありません</div>
                </div>
              ) : (
                <div className="news-list">
                  {notifications.map((item) => (
                    <div className={`notification-item ${item.is_read ? '' : 'unread'}`} key={item.id}>
                      {!item.is_read && <div className="unread-indicator"></div>}
                      <div className="notification-header">
                        <div className="notification-icon">{NOTIFICATION_ICON[item.notification_type] || '通'}</div>
                        <div className="notification-content">
                          <div className="notification-title">{item.title}</div>
                          <div className="notification-message">{item.message}</div>
                          <div className="notification-time">{formatRelativeTime(item.created_at)}</div>
                        </div>
                      </div>
                      {item.related_product_id && (
                        <div className="news-actions">
                          <Link to={`/product-detail?id=${item.related_product_id}`} className="read-more">商品を見る →</Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default News;


