import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/listing_complete.css";

export default function ListingComplete() {
    const markup = `
        <div class="success-container">
            <div class="success-content">
                <div class="success-icon">🎉</div>
                <h1 class="success-title">出品が完了しました！</h1>
                <p class="success-message">
                    ありがとうございます！<br>
                    あなたの大切な本の出品が正常に完了しました。<br>
                    <strong>運営による審査後</strong>、商品が公開されます。
                </p>

                <div class="action-buttons">
                    <a href="#" class="action-btn btn-check" id="checkBtn">
                        📋 出品した商品を確認する
                    </a>
                    <a href="#" class="action-btn btn-continue" id="continueBtn">
                        ➕ 続けて別の本を出品する
                    </a>
                    <a href="#" class="action-btn btn-home" id="homeBtn">
                        🏠 トップページへ戻る
                    </a>
                </div>

                <div class="additional-info">
                    <div class="info-title">
                        📋 今後の流れについて
                    </div>
                    <ul class="info-list">
                        <li>運営チームが商品情報を確認します（通常24時間以内）</li>
                        <li>審査完了後、商品が自動的に公開されます</li>
                        <li>購入者が現れると、メッセージでお知らせします</li>
                        <li>取引開始後は、購入者と直接やり取りできます</li>
                        <li>商品発送後、評価を行って取引完了です</li>
                    </ul>
                </div>

                <div class="stats-section">
                    <div class="stat-card">
                        <div class="stat-number">24</div>
                        <div class="stat-label">時間以内</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">95%</div>
                        <div class="stat-label">審査通過率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">3日</div>
                        <div class="stat-label">平均売却期間</div>
                    </div>
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
