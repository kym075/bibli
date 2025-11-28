import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/inquiry.css";

export default function Commercial() {
    const markup = `
        <div class="document-container">
            <h1 class="page-title">特定商取引法に基づく表記</h1>
            <p class="update-date">最終更新日: 2024年1月1日</p>

            <div class="document-content">
                <section class="document-section">
                    <p>特定商取引法に基づき、以下の事項を表記いたします。</p>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">事業者の名称</h2>
                    <p>Bibli運営事務局</p>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">運営統括責任者</h2>
                    <p>山田 太郎</p>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">所在地</h2>
                    <p>〒150-0001<br>
                    東京都渋谷区神宮前1-2-3 Bibliビル5F</p>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">連絡先</h2>
                    <p>メールアドレス: support@bibli.com<br>
                    電話番号: 03-1234-5678（受付時間: 平日10:00〜18:00）<br>
                    お問い合わせフォーム: <a href="/contact">こちら</a></p>
                    <p class="note">※商品に関するお問い合わせは、出品者に直接お問い合わせください。</p>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">販売価格</h2>
                    <p>各商品ページに表示された価格</p>
                    <p class="note">※消費税込みの価格を表示しています。</p>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">商品代金以外の必要料金</h2>
                    <ul class="document-list">
                        <li>配送料: 各商品ページに記載（購入者負担）</li>
                        <li>販売手数料: 販売価格の10%（出品者負担）</li>
                        <li>決済手数料: 無料</li>
                        <li>振込手数料: 売上金の振込時に200円（振込金額が1万円未満の場合）</li>
                    </ul>
                </section>

                <section class="document-section">
                    <h2 class="document-heading">支払方法</h2>
                    <ul class="document-list">
                        <li>クレジットカード決済（VISA、MasterCard、JCB、American Express、Diners Club）</li>
                        <li>コンビニ払い</li>
                        <li>銀行振込</li>
                        <li>キャリア決済（docomo、au、SoftBank）</li>
                        <li>Bibli売上金</li>
                        <li>Bibliポイント</li>
                    </ul>
                </section>
            </div>

            <div class="back-link">
                <a href="/contact" class="btn-back">お問い合わせページに戻る</a>
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
