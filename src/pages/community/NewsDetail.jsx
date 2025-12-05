import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/news_detail.css';

function NewsDetail() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="main-content">
        {/* ブレッドクラム */}
        <nav className="breadcrumb">
          <Link to="/">ホーム</Link>
          <span>&gt;</span>
          <Link to="/news" id="newsListLink">お知らせ</Link>
          <span>&gt;</span>
          <span>メンテナンスのお知らせ</span>
        </nav>

        {/* 記事コンテナ */}
        <article className="article-container">
          {/* 記事ヘッダー */}
          <header className="article-header">
            <div className="category-badge">重要なお知らせ</div>
            <h1 className="article-title">メンテナンスのお知らせ</h1>
            <div className="article-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span>2025年7月14日</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                <span>Bibli運営チーム</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🏷️</span>
                <span>システムメンテナンス</span>
              </div>
            </div>
          </header>

          {/* 記事本文 */}
          <section className="article-content">
            <div className="content-section">
              <p>いつもBibliをご利用いただき、誠にありがとうございます。</p>
              <p>この度、サービスの安定性向上およびセキュリティ強化を目的として、システムメンテナンスを実施いたします。</p>
            </div>

            <div className="info-box">
              <h4>メンテナンス期間中はサービスをご利用いただけません</h4>
              <p>ご不便をおかけいたしますが、ご理解とご協力をお願いいたします。</p>
            </div>

            <div className="content-section">
              <h2>📋 メンテナンス詳細</h2>

              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>詳細</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>実施日時</strong></td>
                    <td>2025年7月16日（火）2:00〜6:00（予定）</td>
                  </tr>
                  <tr>
                    <td><strong>影響範囲</strong></td>
                    <td>Bibli全サービス（ウェブサイト・モバイルアプリ）</td>
                  </tr>
                  <tr>
                    <td><strong>作業内容</strong></td>
                    <td>サーバーインフラの更新・セキュリティパッチ適用</td>
                  </tr>
                  <tr>
                    <td><strong>データ</strong></td>
                    <td>お客様のデータに影響はございません</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="content-section">
              <h2>🚫 メンテナンス中にご利用いただけない機能</h2>
              <ul>
                <li>ウェブサイト・モバイルアプリへのアクセス</li>
                <li>商品の検索・閲覧・購入</li>
                <li>新規出品・商品情報の編集</li>
                <li>メッセージの送受信</li>
                <li>マイページの閲覧・編集</li>
                <li>決済処理</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>✅ メンテナンス完了後の改善点</h2>
              <h3>性能向上</h3>
              <ul>
                <li>ページの読み込み速度が約30%向上</li>
                <li>検索機能のレスポンス時間短縮</li>
                <li>画像の表示速度改善</li>
              </ul>

              <h3>セキュリティ強化</h3>
              <ul>
                <li>最新のセキュリティパッチ適用</li>
                <li>データ暗号化の強化</li>
                <li>不正アクセス対策の向上</li>
              </ul>

              <h3>機能改善</h3>
              <ul>
                <li>通知機能の安定性向上</li>
                <li>メッセージ機能の使いやすさ改善</li>
                <li>出品フォームの操作性向上</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>📞 緊急時のお問い合わせについて</h2>
              <p>メンテナンス期間中に緊急のお問い合わせがございましたら、以下の方法でご連絡ください：</p>
            </div>

            <div className="contact-box">
              <h4>🏃‍♂️ 緊急時連絡先</h4>
              <p>メール：<a href="mailto:emergency@bibli.jp" className="contact-link">emergency@bibli.jp</a></p>
              <p>電話：050-1234-5678（24時間対応）</p>
              <p>※通常のお問い合わせは、メンテナンス完了後にご利用ください</p>
            </div>

            <div className="content-section">
              <h2>🙏 お客様へのお願い</h2>
              <p>メンテナンス開始前に、以下の点にご注意ください：</p>
              <ul>
                <li><strong>取引中の商品</strong>：メンテナンス前に必要な連絡は事前に完了してください</li>
                <li><strong>出品予定の商品</strong>：メンテナンス完了後に出品作業を行ってください</li>
                <li><strong>決済処理</strong>：メンテナンス開始時刻の30分前には決済を完了してください</li>
              </ul>
            </div>

            <div className="content-section">
              <p>今後ともBibliをよろしくお願いいたします。ご質問やご不明な点がございましたら、お気軽にお問い合わせください。</p>
              <p style={{textAlign: 'right', marginTop: '2rem', color: '#7f8c8d'}}>
                <strong>Bibli運営チーム</strong>
              </p>
            </div>
          </section>

          {/* 関連記事 */}
          <section className="related-articles">
            <h3 className="related-title">📖 関連するお知らせ</h3>
            <div className="related-list">
              <a href="#" className="related-item">
                <span className="related-date">2025/07/10</span>
                <span className="related-title-text">新機能「オークション」を追加しました</span>
              </a>
              <a href="#" className="related-item">
                <span className="related-date">2025/06/28</span>
                <span className="related-title-text">検索機能の向上について</span>
              </a>
              <a href="#" className="related-item">
                <span className="related-date">2025/06/25</span>
                <span className="related-title-text">夏の読書キャンペーン開始</span>
              </a>
            </div>
          </section>

          {/* ナビゲーション */}
          <nav className="article-navigation">
            <Link to="/news" className="back-btn" id="backToList">お知らせ一覧へ戻る</Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}

export default NewsDetail;