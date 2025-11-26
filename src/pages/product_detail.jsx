import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/product_detail.css";

export default function ProductDetail() {
    const markup = `
        <div class="product-container">
            <div class="product-images">
                <div class="main-image" id="mainImage"></div>
                <div class="thumbnail-list">
                    <div class="thumbnail active" data-image="1">📖</div>
                    <div class="thumbnail" data-image="2">📚</div>
                </div>
            </div>

            <div class="product-info">
                <h1 class="product-title">夏目漱石作品集</h1>
                <div class="product-meta">
                    <span>📚 著者: 夏目漱石</span>
                    <span>📂 カテゴリ: 小説</span>
                </div>

                <div class="condition-badge">✨ 良好な状態</div>
                <div class="price">¥1,200</div>

                <div class="action-buttons">
                    <a href="checkout.html"><div class="btn-large btn-purchase">🛒 今すぐ購入</div></a>
                    <button class="btn-large btn-cart">💼 カートに入れる</button>
                </div>
            </div>
        </div>

        <div class="product-description">
            <div class="description-section">
                <h3>📖 商品の説明</h3>
                <div class="description-text">
                    <p>夏目漱石の代表作品を収録した貴重な作品集です。「こころ」「坊っちゃん」「吾輩は猫である」などの名作が収録されています。</p>
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
