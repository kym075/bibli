import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/forum_detail.css";

export default function ForumDetail() {
    const markup = `
        <!-- ブレッドクラム -->
        <div class="breadcrumb">
            <a href="forum.html" class="back-btn">掲示板一覧へ戻る</a>
        </div>

        <!-- スレッドコンテナ -->
        <div class="thread-container">
            <!-- スレッドヘッダー -->
            <div class="thread-header">
                <div class="thread-category">質問</div>
                <h1 class="thread-title">確か主人公が猫で...うろ覚えの本を探しています</h1>
                <div class="thread-meta">
                    <div class="meta-item">
                        <span>📅</span>
                        <span>2025年7月14日 13:30</span>
                    </div>
                    <div class="meta-item">
                        <span>👤</span>
                        <span>読書初心者さん</span>
                    </div>
                    <div class="meta-item">
                        <span>🏷️</span>
                        <span>本探し・質問</span>
                    </div>
                </div>
            </div>

            <!-- 元の投稿 -->
            <div class="original-post">
                <div class="post-author">
                    <div class="author-avatar">🤔</div>
                    <div class="author-info">
                        <div class="author-name">読書初心者</div>
                        <div class="author-badge">質問者</div>
                    </div>
                    <div class="post-time">1時間前</div>
                </div>

                <div class="post-content">
                    <p>いつもお世話になっています。</p>
                    <p>子供の頃に読んだ本なのですが、どうしてもタイトルが思い出せません。記憶にあるのは以下の内容です：</p>
                    <p>• 主人公が猫（確か黒い猫だったような...）<br>
                    • 飼い主の家で起こる日常を描いた小説<br>
                    • 猫の視点から人間の世界を観察する内容<br>
                    • 確か有名な作家さんの作品だったと思います</p>
                    <p>うろ覚えで申し訳ないのですが、何か心当たりがある方はいらっしゃいませんか？もう一度読み返したくて、ずっと探しています。</p>
                    <p>よろしくお願いいたします。</p>
                </div>

                <div class="post-actions">
                    <button class="action-btn" id="likeBtn">
                        <span>👍</span>
                        <span>いいね (8)</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- コメントセクション -->
        <div class="comments-section thread-container">
            <div class="comments-header">コメント (1件)</div>

            <!-- コメント1 -->
            <div class="comment-item fade-in">
                <div class="comment-header">
                    <div class="comment-avatar">📚</div>
                    <div class="comment-author">
                        <div class="comment-author-name">本の虫</div>
                        <div class="comment-time">55分前</div>
                    </div>
                </div>
                <div class="comment-content">
                    もしかして夏目漱石の「吾輩は猫である」ではないでしょうか？主人公は確か名前のない猫で、中学校の英語教師の家で起こる出来事を描いた作品です。明治時代の代表的な小説の一つですね。
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
