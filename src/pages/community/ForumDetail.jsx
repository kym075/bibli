import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/forum_detail.css';

function ForumDetail() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="main-content">
        {/* ブレッドクラム */}
        <div className="breadcrumb">
          <Link to="/forum" className="back-btn">掲示板一覧へ戻る</Link>
        </div>

        {/* スレッドコンテナ */}
        <div className="thread-container">
          {/* スレッドヘッダー */}
          <div className="thread-header">
            <div className="thread-category">質問</div>
            <h1 className="thread-title">確か主人公が猫で...うろ覚えの本を探しています</h1>
            <div className="thread-meta">
              <div className="meta-item">
                <span>📅</span>
                <span>2025年7月14日 13:30</span>
              </div>
              <div className="meta-item">
                <span>👤</span>
                <span>読書初心者さん</span>
              </div>
              <div className="meta-item">
                <span>🏷️</span>
                <span>本探し・質問</span>
              </div>
            </div>
            <div className="thread-stats">
              <div className="stat-item">
                <span>💬</span>
                <span>1 コメント</span>
              </div>
              <div className="stat-item">
                <span>👁️</span>
                <span>45 閲覧</span>
              </div>
              <div className="stat-item">
                <span>👍</span>
                <span>8 いいね</span>
              </div>
            </div>
          </div>

          {/* 元の投稿 */}
          <div className="original-post">
            <div className="post-author">
              <div className="author-avatar">🤔</div>
              <div className="author-info">
                <div className="author-name">読書初心者</div>
                <div className="author-badge">質問者</div>
              </div>
              <div className="post-time">1時間前</div>
            </div>

            <div className="post-content">
              <p>いつもお世話になっています。</p>
              <p>子供の頃に読んだ本なのですが、どうしてもタイトルが思い出せません。記憶にあるのは以下の内容です：</p>
              <p>• 主人公が猫（確か黒い猫だったような...）<br />
              • 飼い主の家で起こる日常を描いた小説<br />
              • 猫の視点から人間の世界を観察する内容<br />
              • 確か有名な作家さんの作品だったと思います</p>
              <p>うろ覚えで申し訳ないのですが、何か心当たりがある方はいらっしゃいませんか？もう一度読み返したくて、ずっと探しています。</p>
              <p>よろしくお願いいたします。</p>
            </div>

            <div className="post-actions">
              <button className="action-btn" id="likeBtn">
                <span>👍</span>
                <span>いいね (8)</span>
              </button>
              <button className="action-btn">
                <span>📤</span>
                <span>シェア</span>
              </button>
              <button className="action-btn">
                <span>🚩</span>
                <span>報告</span>
              </button>
            </div>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="comments-section thread-container">
          <div className="comments-header">コメント (1件)</div>

          {/* コメント1 */}
          <div className="comment-item fade-in">
            <div className="comment-header">
              <div className="comment-avatar">📚</div>
              <div className="comment-author">
                <div className="comment-author-name">本の虫</div>
                <div className="comment-time">55分前</div>
              </div>
            </div>
            <div className="comment-content">
              もしかして夏目漱石の「吾輩は猫である」ではないでしょうか？主人公は確か名前のない猫で、中学校の英語教師の家で起こる出来事を描いた作品です。明治時代の代表的な小説の一つですね。
            </div>
            <div className="comment-actions">
              <button className="comment-action">
                <span>👍</span>
                <span>5</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ForumDetail;