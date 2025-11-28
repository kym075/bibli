import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/listing_page.css";

export default function ListingPage() {
    const markup = `
        <div class="page-title">
            <h1>📚 商品を出品する</h1>
            <p>あなたの大切な本を新しい読者に届けませんか？</p>
        </div>

        <div class="form-container fade-in">
            <form id="listingForm">
                <div class="success-message" id="successMessage">
                    ✅ 出品が完了しました！商品は審査後に公開されます。
                </div>

                <!-- 商品情報の入力 -->
                <div class="form-section">
                    <h2 class="section-title">商品情報の入力</h2>

                    <div class="form-group">
                        <label class="form-label">出品画像<span class="required">*</span></label>
                        <div class="help-text">最大10枚まで登録できます。1枚目の画像がメイン画像として表示されます。</div>
                        
                        <div class="image-upload-area" id="imageUploadArea">
                            <span class="upload-icon">📷</span>
                            <div class="upload-text">ファイルを選択またはドラッグ＆ドロップ</div>
                            <div class="upload-subtext">JPG, PNG, GIF (最大5MB)</div>
                            <input type="file" class="file-input" id="imageInput" multiple accept="image/*">
                        </div>

                        <div class="image-preview-container" id="imagePreviewContainer"></div>
                    </div>

                    <div class="form-group">
                        <label for="bookTitle" class="form-label">書籍タイトル<span class="required">*</span></label>
                        <input type="text" id="bookTitle" class="form-input" placeholder="例: 夏目漱石作品集" required>
                        <div class="help-text">正確なタイトルを入力してください。</div>
                    </div>

                    <div class="form-group">
                        <label for="category" class="form-label">カテゴリ<span class="required">*</span></label>
                        <select id="category" class="form-input form-select" required>
                            <option value="">カテゴリを選択してください</option>
                            <option value="novel">小説</option>
                            <option value="manga">漫画</option>
                            <option value="specialist">専門書</option>
                            <option value="picture">絵本</option>
                            <option value="magazine">雑誌</option>
                            <option value="foreign">洋書</option>
                            <option value="business">ビジネス書</option>
                            <option value="self-help">自己啓発</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                </div>

                <a href="/listing_complete">
                    <div class="submit-section">
                        <button type="submit" class="submit-btn">📤 出品する</button>
                        <div class="help-text" style="margin-top: 1rem;">
                            出品後、運営による審査を経て公開されます。審査は通常24時間以内に完了します。
                        </div>
                    </div>
                </a>
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
