import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/forum_post.css";

export default function ForumPost() {
    const markup = `
        <!-- ページヘッダー -->
        <div class="page-header">
            <h1 class="page-title">✏️ 新しいトピックを投稿する</h1>
            <p class="page-description">本について語り合い、コミュニティを盛り上げましょう</p>
        </div>

        <!-- ブレッドクラム -->
        <div class="breadcrumb">
            <a href="#" class="back-btn" id="backToForum">掲示板一覧へ戻る</a>
        </div>

        <!-- フォームコンテナ -->
        <div class="form-container">
            <div class="success-message" id="successMessage">
                投稿が完了しました！掲示板一覧で確認できます。
            </div>

            <form id="postForm">
                <!-- カテゴリ選択 -->
                <div class="form-group">
                    <label for="category" class="form-label">
                        カテゴリ<span class="required">*</span>
                    </label>
                    <select id="category" class="form-select" required>
                        <option value="">カテゴリを選択してください</option>
                        <option value="chat">雑談</option>
                        <option value="question">質問</option>
                        <option value="discussion">考察</option>
                        <option value="recruitment">募集</option>
                        <option value="recommendation">おすすめ</option>
                        <option value="review">感想・レビュー</option>
                    </select>
                </div>

                <!-- タイトル入力 -->
                <div class="form-group">
                    <label for="title" class="form-label">
                        タイトル<span class="required">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="title" 
                        class="form-input" 
                        placeholder="例：確か主人公が猫で...うろ覚えの本を探しています"
                        maxlength="100"
                        required
                    >
                </div>

                <!-- 本文入力 -->
                <div class="form-group">
                    <label for="content" class="form-label">
                        本文<span class="required">*</span>
                    </label>
                    <textarea 
                        id="content" 
                        class="form-textarea" 
                        placeholder="投稿内容を詳しく書いてください..." 
                        maxlength="2000"
                        required
                    ></textarea>
                </div>

                <div class="submit-section">
                    <button type="submit" class="submit-btn">投稿する</button>
                </div>
            </form>
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
