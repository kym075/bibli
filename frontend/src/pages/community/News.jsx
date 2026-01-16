import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/news_page.css';

function News() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('news');

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-title">
          <h1>📢 お知らせ</h1>
          <p>重要な情報やアップデート情報をお届けします</p>
        </div>

        <div className="tabs-container">
          {/* タブヘッダー */}
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
              data-tab="news"
              onClick={() => setActiveTab('news')}
            >
              📋 運営からのお知らせ
            </button>
            <button
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              data-tab="notifications"
              onClick={() => setActiveTab('notifications')}
            >
              🔔 あなたへの通知 <span id="unreadCount" style={{background: '#ff6b6b', color: 'white', borderRadius: '50%', padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.5rem'}}>3</span>
            </button>
          </div>

          {/* タブコンテンツ */}
          <div className="tab-content">
            {/* 運営からのお知らせ */}
            <div className={`tab-panel ${activeTab === 'news' ? 'active' : ''}`} id="news-panel">
              <div className="news-list">
                {/* 重要なお知らせ */}
                <div className="news-item important">
                  <div className="new-badge">NEW</div>
                  <div className="news-header">
                    <span className="news-date">2025/07/14</span>
                    <span className="news-category category-important">重要</span>
                  </div>
                  <h3 className="news-title">メンテナンスのお知らせ</h3>
                  <p className="news-preview">
                    2025年7月16日（火）2:00〜6:00の間、システムメンテナンスを実施いたします。メンテナンス中はサービスをご利用いただけません...
                  </p>
                  <div className="news-actions">
                    <Link to="/news/1" className="read-more">詳細を見る →</Link>
                    <span className="news-status">📌 固定</span>
                  </div>
                </div>

                {/* 機能追加のお知らせ */}
                <div className="news-item update">
                  <div className="news-header">
                    <span className="news-date">2025/07/10</span>
                    <span className="news-category category-update">アップデート</span>
                  </div>
                  <h3 className="news-title">新機能「オークション」を追加しました</h3>
                  <p className="news-preview">
                    ご要望の多かったオークション機能を追加いたしました。希少本や人気書籍をオークション形式で出品できるようになります...
                  </p>
                  <div className="news-actions">
                    <a href="#" className="read-more">詳細を見る →</a>
                    <span className="news-status">⭐ 人気</span>
                  </div>
                </div>

                {/* 一般のお知らせ */}
                <div className="news-item general">
                  <div className="news-header">
                    <span className="news-date">2025/07/01</span>
                    <span className="news-category category-general">一般</span>
                  </div>
                  <h3 className="news-title">サービス開始のお知らせ</h3>
                  <p className="news-preview">
                    本日、Bibliサービスを正式に開始いたしました。本を愛する皆様にとって、より良い読書体験を提供できるよう努めてまいります...
                  </p>
                  <div className="news-actions">
                    <a href="#" className="read-more">詳細を見る →</a>
                    <span className="news-status">🎉 開始</span>
                  </div>
                </div>

                {/* 追加のお知らせ */}
                <div className="news-item update">
                  <div className="news-header">
                    <span className="news-date">2025/06/28</span>
                    <span className="news-category category-update">アップデート</span>
                  </div>
                  <h3 className="news-title">検索機能の向上について</h3>
                  <p className="news-preview">
                    検索精度の向上とフィルタリング機能の強化を行いました。より効率的に欲しい本を見つけることができます...
                  </p>
                  <div className="news-actions">
                    <a href="#" className="read-more">詳細を見る →</a>
                    <span className="news-status">🔍 改善</span>
                  </div>
                </div>

                <div className="news-item general">
                  <div className="news-header">
                    <span className="news-date">2025/06/25</span>
                    <span className="news-category category-general">一般</span>
                  </div>
                  <h3 className="news-title">夏の読書キャンペーン開始</h3>
                  <p className="news-preview">
                    夏の読書をより楽しんでいただくため、特別キャンペーンを開始いたします。期間中の出品・購入で特典をプレゼント...
                  </p>
                  <div className="news-actions">
                    <a href="#" className="read-more">詳細を見る →</a>
                    <span className="news-status">🎁 キャンペーン</span>
                  </div>
                </div>
              </div>
            </div>

            {/* あなたへの通知 */}
            <div className={`tab-panel ${activeTab === 'notifications' ? 'active' : ''}`} id="notifications-panel">
              <div className="news-list">
                {/* 未読通知 */}
                <div className="notification-item unread">
                  <div className="unread-indicator"></div>
                  <div className="notification-header">
                    <div className="notification-icon">💰</div>
                    <div className="notification-content">
                      <div className="notification-title">商品が売れました！</div>
                      <div className="notification-message">
                        出品していた「夏目漱石作品集」が購入されました。購入者とのやり取りを開始してください。
                      </div>
                      <div className="notification-time">2時間前</div>
                    </div>
                  </div>
                </div>

                <div className="notification-item unread">
                  <div className="unread-indicator"></div>
                  <div className="notification-header">
                    <div className="notification-icon">💬</div>
                    <div className="notification-content">
                      <div className="notification-title">新しいメッセージ</div>
                      <div className="notification-message">
                        「JavaScript完全ガイド」について質問があります。商品の状態についてお聞きしたいことが...
                      </div>
                      <div className="notification-time">5時間前</div>
                    </div>
                  </div>
                </div>

                <div className="notification-item unread">
                  <div className="unread-indicator"></div>
                  <div className="notification-header">
                    <div className="notification-icon">✅</div>
                    <div className="notification-content">
                      <div className="notification-title">商品審査完了</div>
                      <div className="notification-message">
                        出品していた「村上春樹 ノルウェイの森」の審査が完了し、公開されました。
                      </div>
                      <div className="notification-time">1日前</div>
                    </div>
                  </div>
                </div>

                {/* 既読通知 */}
                <div className="notification-item">
                  <div className="notification-header">
                    <div className="notification-icon">🎉</div>
                    <div className="notification-content">
                      <div className="notification-title">出品完了</div>
                      <div className="notification-message">
                        「東野圭吾 白夜行」の出品が完了しました。審査後に公開されます。
                      </div>
                      <div className="notification-time">2日前</div>
                    </div>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-header">
                    <div className="notification-icon">⭐</div>
                    <div className="notification-content">
                      <div className="notification-title">評価を受けました</div>
                      <div className="notification-message">
                        取引相手から評価「★★★★★」をいただきました。ありがとうございました！
                      </div>
                      <div className="notification-time">3日前</div>
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