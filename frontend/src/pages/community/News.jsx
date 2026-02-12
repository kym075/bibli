import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
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

function News() {
  const [activeTab, setActiveTab] = useState('news');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <div style={{ marginTop: '0.8rem' }}>
            <Link to="/news-create" className="btn btn-primary">お知らせ作成</Link>
          </div>
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
              <span id="unreadCount" style={{ background: 'var(--accent-warm)', color: 'white', borderRadius: '50%', padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>3</span>
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
              <div className="news-list">
                <div className="notification-item unread">
                  <div className="unread-indicator"></div>
                  <div className="notification-header">
                    <div className="notification-icon">S</div>
                    <div className="notification-content">
                      <div className="notification-title">商品が売れました！</div>
                      <div className="notification-message">
                        出品していた商品が購入されました。購入者とのやり取りを開始してください。
                      </div>
                      <div className="notification-time">2時間前</div>
                    </div>
                  </div>
                </div>

                <div className="notification-item unread">
                  <div className="unread-indicator"></div>
                  <div className="notification-header">
                    <div className="notification-icon">M</div>
                    <div className="notification-content">
                      <div className="notification-title">新しいメッセージ</div>
                      <div className="notification-message">
                        商品に関する質問メッセージが届いています。
                      </div>
                      <div className="notification-time">5時間前</div>
                    </div>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-header">
                    <div className="notification-icon">P</div>
                    <div className="notification-content">
                      <div className="notification-title">出品完了</div>
                      <div className="notification-message">
                        商品の出品が完了しました。審査後に公開されます。
                      </div>
                      <div className="notification-time">2日前</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default News;
