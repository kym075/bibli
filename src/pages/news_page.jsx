import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/news_page.css";

export default function NewsPage() {
    const markup = `
        <div class="page-title">
            <h1>📢 お知らせ</h1>
            <p>重要な情報やアップデート情報をお届けします</p>
        </div>

        <div class="tabs-container">
            <div class="tabs-header">
                <button class="tab-btn active" data-tab="news">📋 運営からのお知らせ</button>
                <button class="tab-btn" data-tab="notifications">🔔 あなたへの通知 <span id="unreadCount" style="background: #ff6b6b; color: white; border-radius: 50%; padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-left: 0.5rem;">3</span></button>
            </div>

            <div class="tab-content">
                <div class="tab-panel active" id="news-panel">
                    <div class="news-list">
                        <div class="news-item important">
                            <div class="new-badge">NEW</div>
                            <div class="news-header">
                                <span class="news-date">2025/07/14</span>
                                <span class="news-category category-important">重要</span>
                            </div>
                            <h3 class="news-title">メンテナンスのお知らせ</h3>
                            <p class="news-preview">2025年7月16日（火）2:00〜6:00の間、システムメンテナンスを実施いたします。メンテナンス中はサービスをご利用いただけません...</p>
                            <div class="news-actions">
                                <a href="news_detail.html" class="read-more">詳細を見る →</a>
                                <span class="news-status">📌 固定</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-panel" id="notifications-panel">
                    <div class="news-list">
                        <div class="notification-item unread">
                            <div class="unread-indicator"></div>
                            <div class="notification-header">
                                <div class="notification-icon">💰</div>
                                <div class="notification-content">
                                    <div class="notification-title">商品が売れました！</div>
                                    <div class="notification-message">出品していた「夏目漱石作品集」が購入されました。購入者とのやり取りを開始してください。</div>
                                    <div class="notification-time">2時間前</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return (
        <>
            <Header />
            <main className="main-content" dangerouslySetInnerHTML={{ __html: markup }} />
            <Footer />
        </>
    );
}
