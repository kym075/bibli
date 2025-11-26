import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/profile_page.css";

export default function ProfilePage() {
    const markup = `
        <section class="profile-header">
            <div class="profile-main">
                <div class="profile-avatar">📚</div>
                <div class="profile-info">
                    <div class="profile-name-section">
                        <div class="profile-name">本好きユーザー<div class="verified-badge">認証済み</div></div>
                    </div>
                    <p class="profile-bio">本を愛する20代です。小説から専門書まで幅広く読んでいます。</p>
                </div>
            </div>
        </section>

        <section class="user-details">
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-icon">📅</div>
                    <div class="detail-content"><div class="detail-label">登録日</div><div class="detail-value">2023年4月15日</div></div>
                </div>
            </div>
        </section>
    `;

    return (
        <>
            <Header />
            <main className="main-content" dangerouslySetInnerHTML={{ __html: markup }} />
            <Footer />
        </>
    );
}
