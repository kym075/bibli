import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/inquiry.css";

export default function Terms() {
    const markup = `
        <div class="document-container">
            <h1 class="page-title">利用規約</h1>
            <p class="update-date">最終更新日: 2024年1月1日</p>

            <div class="document-content">
                <section class="document-section">
                    <h2 class="document-heading">第1条（適用）</h2>
                    <ol class="document-list">
                        <li>本規約は、本サービスの提供条件及び本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とします。</li>
                    </ol>
                </section>
            </div>

            <div class="back-link">
                <a href="contact.html" class="btn-back">お問い合わせページに戻る</a>
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
