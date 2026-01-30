import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/inquiry.css';

function Contact() {
  const [formMessage, setFormMessage] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic
    setFormMessage('お問い合わせを送信しました');
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="inquiry-container">
          <h1 className="page-title">お問い合わせ</h1>
          <p className="page-subtitle">サービスに関するご質問・ご要望をお寄せください</p>
          {formMessage && <div className="page-message success visible">{formMessage}</div>}

          <section className="faq-section">
            <h2 className="section-title">よくある質問</h2>
            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">Q</span>
                  <span className="faq-text">商品の発送はいつまでに行えば良いですか？</span>
                </div>
                <div className="faq-answer">
                  <span className="faq-icon">A</span>
                  <span className="faq-text">購入後、原則として1〜2日以内の発送をお願いしています。発送が遅れる場合は購入者への連絡をお願いします。</span>
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">Q</span>
                  <span className="faq-text">販売手数料はいくらですか？</span>
                </div>
                <div className="faq-answer">
                  <span className="faq-icon">A</span>
                  <span className="faq-text">販売手数料は販売価格の10%です。出品時に自動で計算されます。</span>
                </div>
              </div>
            </div>
          </section>

          <section className="contact-form-section">
            <h2 className="section-title">お問い合わせフォーム</h2>
            <p className="form-description">お問い合わせ内容を入力してください。通常、1〜3営業日以内にご返信いたします。</p>

            <form id="contactForm" className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">お名前 <span className="required">*</span></label>
                <input type="text" id="name" name="name" className="form-input" placeholder="山田 太郎" required />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">メールアドレス <span className="required">*</span></label>
                <input type="email" id="email" name="email" className="form-input" placeholder="example@email.com" required />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">お問い合わせ種別 <span className="required">*</span></label>
                <select id="category" name="category" className="form-input form-select" required>
                  <option value="">選択してください</option>
                  <option value="account">アカウント・ログインについて</option>
                  <option value="purchase">購入について</option>
                  <option value="selling">出品・販売について</option>
                  <option value="payment">支払い・振込について</option>
                  <option value="shipping">配送について</option>
                  <option value="trouble">トラブル・違反報告</option>
                  <option value="technical">技術的な問題</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">件名 <span className="required">*</span></label>
                <input type="text" id="subject" name="subject" className="form-input" placeholder="お問い合わせの件名を入力" required />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">お問い合わせ内容 <span className="required">*</span></label>
                <textarea id="message" name="message" className="form-input form-textarea" rows="8" placeholder="詳しい内容をご記入ください" required></textarea>
                <div className="help-text">できるだけ詳しく状況をお知らせください</div>
              </div>

              <div className="form-group">
                <label htmlFor="attachment" className="form-label">添付ファイル（任意）</label>
                <input type="file" id="attachment" name="attachment" className="form-input" accept="image/*,.pdf" />
                <div className="help-text">スクリーンショットなどを添付できます（最大5MB）</div>
              </div>

              <button type="submit" className="submit-btn">送信する</button>
            </form>
          </section>

          <section className="support-info">
            <h2 className="section-title">その他のサポート</h2>
            <div className="support-cards">
              <Link to="/terms" className="support-card">
                <div className="support-icon">T</div>
                <div className="support-title">利用規約</div>
                <div className="support-description">サービス利用時のルールをご確認いただけます</div>
              </Link>
              <Link to="/privacy" className="support-card">
                <div className="support-icon">P</div>
                <div className="support-title">プライバシーポリシー</div>
                <div className="support-description">個人情報の取り扱いについて</div>
              </Link>
              <Link to="/commercial" className="support-card">
                <div className="support-icon">L</div>
                <div className="support-title">特定商取引法に基づく表記</div>
                <div className="support-description">事業者情報と取引条件</div>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Contact;
