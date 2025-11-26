import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/inquiry.css";

export default function Privacy() {
    const markup = `
        <div class="document-container">
            <h1 class="page-title">プライバシーポリシー</h1>
            <p class="update-date">最終更新日: 2024年1月1日</p>

            <div class="document-content">
                <section class="document-section">
                    <p>Bibli運営事務局（以下「当社」といいます。）は、当社の提供するサービスにおける、ユーザーについての個人情報を含む利用者情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。</p>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">1. 収集する情報</h2>
                    <p>当社は、本サービスの提供にあたり、以下の情報を取得します。</p>
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
