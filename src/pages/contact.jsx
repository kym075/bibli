import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/inquiry.css";

export default function Contact() {
    const markup = `
        <div class="inquiry-container">
            <h1 class="page-title">お問い合わせ</h1>
            <p class="page-subtitle">サービスに関するご質問・ご要望をお寄せください</p>

            <!-- よくある質問 -->
            <section class="faq-section">
                <h2 class="section-title">よくある質問</h2>
                <div class="faq-list">
                    <div class="faq-item">
                        <div class="faq-question">
                            <span class="faq-icon">Q</span>
                            <span class="faq-text">商品の発送はいつまでに行えば良いですか？</span>
                        </div>
                        <div class="faq-answer">
                            <span class="faq-icon">A</span>
                            <span class="faq-text">購入後、原則として1〜2日以内の発送をお願いしています。発送が遅れる場合は購入者への連絡をお願いします。</span>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">
                            <span class="faq-icon">Q</span>
                            <span class="faq-text">販売手数料はいくらですか？</span>
                        </div>
                        <div class="faq-answer">
                            <span class="faq-icon">A</span>
                            <span class="faq-text">販売手数料は販売価格の10%です。出品時に自動で計算されます。</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- お問い合わせフォーム -->
            <section class="contact-form-section">
                <h2 class="section-title">お問い合わせフォーム</h2>
                <p class="form-description">お問い合わせ内容を入力してください。通常、1〜3営業日以内にご返信いたします。</p>

                <form id="contactForm" class="contact-form">
                    <div class="form-group">
                        <label for="name" class="form-label">お名前 <span class="required">*</span></label>
                        <input type="text" id="name" name="name" class="form-input" placeholder="山田 太郎" required>
                    </div>

                    <div class="form-group">
                        <label for="email" class="form-label">メールアドレス <span class="required">*</span></label>
                        <input type="email" id="email" name="email" class="form-input" placeholder="example@email.com" required>
                    </div>

                    <div class="form-group">
                        <label for="message" class="form-label">お問い合わせ内容 <span class="required">*</span></label>
                        <textarea id="message" name="message" class="form-input form-textarea" rows="8" placeholder="詳しい内容をご記入ください" required></textarea>
                        <div class="help-text">できるだけ詳しく状況をお知らせください</div>
                    </div>

                    <button type="submit" class="submit-btn">送信する</button>
                </form>
            </section>
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
