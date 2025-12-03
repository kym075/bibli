import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/forum.css';

function Forum() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="main-content">
        {/* ページヘッダー */}
        <div className="page-header fade-in">
          <h1 className="page-title">📖 掲示板</h1>
          <p className="page-subtitle">「本好きの熱量で繋がる」コミュニティ</p>
          <p className="page-description">本について語り合い、新しい発見や出会いを見つけましょう</p>
        </div>

        {/* オンラインユーザー */}
        <div className="online-users fade-in">
          <div className="online-title">現在オンライン (24人)</div>
          <div className="user-avatars">
            <div className="user-avatar" data-name="本の虫">📚</div>
            <div className="user-avatar" data-name="読書家A">🐱</div>
            <div className="user-avatar" data-name="ミステリー好き">🔍</div>
            <div className="user-avatar" data-name="古典愛好者">📜</div>
            <div className="user-avatar" data-name="SF読者">🚀</div>
            <div className="user-avatar" data-name="詩集コレクター">🌸</div>
            <div className="user-avatar" data-name="ビジネス書読み">💼</div>
            <div className="user-avatar" data-name="漫画オタク">🎨</div>
            <div className="user-avatar" data-name="哲学者">🤔</div>
            <div className="user-avatar" data-name="+15人">+15</div>
          </div>
        </div>

        {/* 新規投稿ボタン */}
        <div className="post-action">
          <Link to="/community/forum-post">
            <button className="new-post-btn" id="newPostBtn">新しいトピックを投稿する</button>
          </Link>
        </div>

        {/* フォーラムコンテナ */}
        <div className="forum-container fade-in">
          {/* カテゴリフィルター */}
          <div className="category-filter">
            <div className="filter-title">📂 カテゴリで絞り込み</div>
            <div className="category-tags">
              <div className="category-tag active" data-category="all">すべて</div>
              <div className="category-tag" data-category="chat">雑談</div>
              <div className="category-tag" data-category="question">質問</div>
              <div className="category-tag" data-category="discussion">考察</div>
              <div className="category-tag" data-category="recruitment">募集</div>
              <div className="category-tag" data-category="recommendation">おすすめ</div>
              <div className="category-tag" data-category="review">感想・レビュー</div>
            </div>
          </div>

          {/* スレッド一覧 */}
          <div className="thread-list">
            {/* 人気スレッド */}
            <div className="thread-item chat">
              <div className="hot-badge">HOT</div>
              <div className="thread-header">
                <span className="thread-category category-chat">雑談</span>
                <span className="thread-author">👤 本の虫さん</span>
                <span className="thread-time">5分前</span>
              </div>
              <h3 className="thread-title">○○先生の新作、読んだ人いる？</h3>
              <p className="thread-preview">今日発売された○○先生の最新作を早速読み終えました！感想を語り合いませんか？ネタバレ注意でお願いします...</p>
              <div className="thread-stats">
                <span className="stat-item comments-stat">15 コメント</span>
                <span className="stat-item likes-stat">23 いいね</span>
                <span className="stat-item views-stat">127 閲覧</span>
              </div>
            </div>

            {/* 質問スレッド */}
            <Link to="/community/forum-detail">
              <div className="thread-item question">
                <div className="thread-header">
                  <span className="thread-category category-question">質問</span>
                  <span className="thread-author">👤 読書初心者さん</span>
                  <span className="thread-time">1時間前</span>
                </div>
                <h3 className="thread-title">確か主人公が猫で...うろ覚えの本を探しています</h3>
                <p className="thread-preview">昔読んだ本を探しているのですが、タイトルが思い出せません。主人公が猫で、飼い主の家で起こる出来事を描いた小説だったと思います...</p>
                <div className="thread-stats">
                  <span className="stat-item comments-stat">1 コメント</span>
                  <span className="stat-item likes-stat">8 いいね</span>
                  <span className="stat-item views-stat">45 閲覧</span>
                </div>
              </div>
            </Link>

            {/* 考察スレッド */}
            <div className="thread-item discussion">
              <div className="thread-header">
                <span className="thread-category category-discussion">考察</span>
                <span className="thread-author">👤 ミステリー好きさん</span>
                <span className="thread-time">3時間前</span>
              </div>
              <h3 className="thread-title">あのミステリーの伏線について語りたい</h3>
              <p className="thread-preview">「××の事件」シリーズの最新作を読み返していて、第1作目に仕込まれていた伏線に気づきました。皆さんはどう思いますか？...</p>
              <div className="thread-stats">
                <span className="stat-item comments-stat">42 コメント</span>
                <span className="stat-item likes-stat">67 いいね</span>
                <span className="stat-item views-stat">234 閲覧</span>
              </div>
            </div>

            {/* 募集スレッド */}
            <div className="thread-item recruitment">
              <div className="new-badge">NEW</div>
              <div className="thread-header">
                <span className="thread-category category-recruitment">募集</span>
                <span className="thread-author">👤 読書会主催者さん</span>
                <span className="thread-time">1日前</span>
              </div>
              <h3 className="thread-title">一緒に読書会しませんか？</h3>
              <p className="thread-preview">来月、都内で読書会を開催予定です。テーマは「現代文学」で、参加者同士で本を紹介し合う予定です。興味のある方はぜひ...</p>
              <div className="thread-stats">
                <span className="stat-item comments-stat">8 コメント</span>
                <span className="stat-item likes-stat">15 いいね</span>
                <span className="stat-item views-stat">89 閲覧</span>
              </div>
            </div>

            {/* 追加のスレッド */}
            <div className="thread-item chat">
              <div className="thread-header">
                <span className="thread-category category-chat">雑談</span>
                <span className="thread-author">👤 古典愛好者さん</span>
                <span className="thread-time">2日前</span>
              </div>
              <h3 className="thread-title">今読んでいる本を教えて！</h3>
              <p className="thread-preview">皆さんが今読んでいる本を教えてください。私は夏目漱石の「こころ」を読み返しているところです...</p>
              <div className="thread-stats">
                <span className="stat-item comments-stat">28 コメント</span>
                <span className="stat-item likes-stat">34 いいね</span>
                <span className="stat-item views-stat">156 閲覧</span>
              </div>
            </div>

            <div className="thread-item question">
              <div className="thread-header">
                <span className="thread-category category-question">質問</span>
                <span className="thread-author">👤 SF読者さん</span>
                <span className="thread-time">3日前</span>
              </div>
              <h3 className="thread-title">SFの名作を教えてください</h3>
              <p className="thread-preview">最近SFに興味を持ち始めました。初心者におすすめの名作があれば教えてください。どんなジャンルでも構いません...</p>
              <div className="thread-stats">
                <span className="stat-item comments-stat">19 コメント</span>
                <span className="stat-item likes-stat">22 いいね</span>
                <span className="stat-item views-stat">98 閲覧</span>
              </div>
            </div>

            <div className="thread-item discussion">
              <div className="thread-header">
                <span className="thread-category category-discussion">考察</span>
                <span className="thread-author">👤 哲学者さん</span>
                <span className="thread-time">4日前</span>
              </div>
              <h3 className="thread-title">村上春樹作品の共通テーマについて</h3>
              <p className="thread-preview">村上春樹の作品を読み返していて、共通するテーマがいくつかあることに気づきました。皆さんはどう感じますか？...</p>
              <div className="thread-stats">
                <span className="stat-item comments-stat">35 コメント</span>
                <span className="stat-item likes-stat">48 いいね</span>
                <span className="stat-item views-stat">201 閲覧</span>
              </div>
            </div>

            <div className="thread-item recruitment">
              <div className="thread-header">
                <span className="thread-category category-recruitment">募集</span>
                <span className="thread-author">👤 ビジネス書読みさん</span>
                <span className="thread-time">5日前</span>
              </div>
              <h3 className="thread-title">ビジネス書の読書会メンバー募集</h3>
              <p className="thread-preview">月1回、ビジネス書について語り合う読書会のメンバーを募集しています。オンライン開催予定です...</p>
              <div className="thread-stats">
                <span className="stat-item comments-stat">12 コメント</span>
                <span className="stat-item likes-stat">18 いいね</span>
                <span className="stat-item views-stat">76 閲覧</span>
              </div>
            </div>
          </div>

          {/* ページネーション */}
          <div className="pagination">
            <a href="#" className="pagination-btn disabled">« 前へ</a>
            <a href="#" className="pagination-btn active">1</a>
            <a href="#" className="pagination-btn">2</a>
            <a href="#" className="pagination-btn">3</a>
            <a href="#" className="pagination-btn">4</a>
            <a href="#" className="pagination-btn">5</a>
            <span className="pagination-btn disabled">...</span>
            <a href="#" className="pagination-btn">12</a>
            <a href="#" className="pagination-btn">次へ »</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Forum;