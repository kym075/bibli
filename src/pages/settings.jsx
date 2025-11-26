import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/settings.css";

export default function Settings() {
    const markup = `
        <div class="settings-container">
            <h1 class="page-title">設定</h1>

            <section class="settings-section">
                <h2 class="section-title">アカウント</h2>
                <div class="settings-list">
                    <a href="user_settings.html" class="settings-item">
                        <div class="item-left"><span class="item-icon">👤</span><span class="item-text">ユーザー設定</span></div>
                        <span class="item-arrow">›</span>
                    </a>
                </div>
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
