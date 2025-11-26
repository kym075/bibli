import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/news_detail.css";

export default function NewsDetail() {
    const markup = `
        <nav class="breadcrumb">
            <a href="#">ホーム</a>
            <span>></span>
            <a href="#" id="newsListLink">お知らせ</a>
            <span>></span>
            <span>メンテナンスのお知らせ</span>
        </nav>

        <article class="article-container">
            <header class="article-header">
                <div class="category-badge">重要なお知らせ</div>
                <h1 class="article-title">メンテナンスのお知らせ</h1>
                <div class="article-meta">
                    <div class="meta-item"><span class="meta-icon">📅</span><span>2025年7月14日</span></div>
                    <div class="meta-item"><span class="meta-icon">👤</span><span>Bibli運営チーム</span></div>
                </div>
            </header>

            <section class="article-content">
                <div class="content-section">
                    <p>いつもBibliをご利用いただき、誠にありがとうございます。</p>
                    <p>この度、サービスの安定性向上およびセキュリティ強化を目的として、システムメンテナンスを実施いたします。</p>
                </div>

                <div class="info-box">
                    <h4>メンテナンス期間中はサービスをご利用いただけません</h4>
                    <p>ご不便をおかけいたしますが、ご理解とご協力をお願いいたします。</p>
                </div>

                <div class="content-section">
                    <h2>📋 メンテナンス詳細</h2>
                    <table class="schedule-table">
                        <thead>
                            <tr><th>項目</th><th>詳細</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><strong>実施日時</strong></td><td>2025年7月16日（火）2:00〜6:00（予定）</td></tr>
                            <tr><td><strong>影響範囲</strong></td><td>Bibli全サービス（ウェブサイト・モバイルアプリ）</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="related-articles">
                <h3 class="related-title">📖 関連するお知らせ</h3>
                <div class="related-list">
                    <a href="#" class="related-item"><span class="related-date">2025/07/10</span><span class="related-title-text">新機能「オークション」を追加しました</span></a>
                </div>
            </section>

            <nav class="article-navigation">
                <a href="news_page.html" class="back-btn" id="backToList">お知らせ一覧へ戻る</a>
            </nav>
        </article>
    `;

    return (
        <>
            <Header />
            <main className="main-content" dangerouslySetInnerHTML={{ __html: markup }} />
            <Footer />
        </>
    );
}
