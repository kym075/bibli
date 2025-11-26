import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/forum.css";

export default function Forum() {
    const markup = `
        <!-- ページヘッダー -->
        <div class="page-header fade-in">
            <h1 class="page-title">📖 掲示板</h1>
            <p class="page-subtitle">「本好きの熱量で繋がる」コミュニティ</p>
            <p class="page-description">本について語り合い、新しい発見や出会いを見つけましょう</p>
        </div>

        <!-- オンラインユーザー -->
        <div class="online-users fade-in">
            <div class="online-title">現在オンライン (24人)</div>
            <div class="user-avatars">
                <div class="user-avatar" data-name="本の虫">📚</div>
                <div class="user-avatar" data-name="読書家A">🐱</div>
                <div class="user-avatar" data-name="ミステリー好き">🔍</div>
                <div class="user-avatar" data-name="古典愛好者">📜</div>
                <div class="user-avatar" data-name="SF読者">🚀</div>
                <div class="user-avatar" data-name="詩集コレクター">🌸</div>
                <div class="user-avatar" data-name="ビジネス書読み">💼</div>
                <div class="user-avatar" data-name="漫画オタク">🎨</div>
                <div class="user-avatar" data-name="哲学者">🤔</div>
                <div class="user-avatar" data-name="+15人">+15</div>
            </div>
        </div>

        <!-- 新規投稿ボタン -->
        <a href="forum_post.html">
            <div class="post-action">
                <button class="new-post-btn" id="newPostBtn">新しいトピックを投稿する</button>
            </div>
        </a>

        <!-- フォーラムコンテナ -->
        <div class="forum-container fade-in">
            <!-- カテゴリフィルター -->
            <div class="category-filter">
                <div class="filter-title">📂 カテゴリで絞り込み</div>
                <div class="category-tags">
                    <div class="category-tag active" data-category="all">すべて</div>
                    <div class="category-tag" data-category="chat">雑談</div>
                    <div class="category-tag" data-category="question">質問</div>
                    <div class="category-tag" data-category="discussion">考察</div>
                    <div class="category-tag" data-category="recruitment">募集</div>
                    <div class="category-tag" data-category="recommendation">おすすめ</div>
                    <div class="category-tag" data-category="review">感想・レビュー</div>
                </div>
            </div>

            <!-- スレッド一覧 -->
            <div class="thread-list">
                <!-- 人気スレッド -->
                <div class="thread-item chat">
                    <div class="hot-badge">HOT</div>
                    <div class="thread-header">
                        <span class="thread-category category-chat">雑談</span>
                        <span class="thread-author">👤 本の虫さん</span>
                        <span class="thread-time">5分前</span>
                    </div>
                    <h3 class="thread-title">○○先生の新作、読んだ人いる？</h3>
                    <p class="thread-preview">今日発売された○○先生の最新作を早速読み終えました！感想を語り合いませんか？ネタバレ注意でお願いします...</p>
                    <div class="thread-stats">
                        <span class="stat-item comments-stat">15 コメント</span>
                        <span class="stat-item likes-stat">23 いいね</span>
                        <span class="stat-item views-stat">127 閲覧</span>
                    </div>
                </div>

                <a href="forum_detail.html">
                    <div class="thread-item question">
                        <div class="thread-header">
                            <span class="thread-category category-question">質問</span>
                            <span class="thread-author">👤 読書初心者さん</span>
                            <span class="thread-time">1時間前</span>
                        </div>
                        <h3 class="thread-title">確か主人公が猫で...うろ覚えの本を探しています</h3>
                        <p class="thread-preview">昔読んだ本を探しているのですが、タイトルが思い出せません。主人公が猫で、飼い主の家で起こる出来事を描いた小説だったと思います...</p>
                        <div class="thread-stats">
                            <span class="stat-item comments-stat">1 コメント</span>
                            <span class="stat-item likes-stat">8 いいね</span>
                            <span class="stat-item views-stat">45 閲覧</span>
                        </div>
                    </div>
                </a>

                <!-- 追加のスレッド (省略可能) -->
            </div>

            <!-- ページネーション -->
            <div class="pagination">
                <a href="#" class="pagination-btn disabled">« 前へ</a>
                <a href="#" class="pagination-btn active">1</a>
                <a href="#" class="pagination-btn">2</a>
                <a href="#" class="pagination-btn">3</a>
                <a href="#" class="pagination-btn">次へ »</a>
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
