import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";

export default function TestLinks() {
    const markup = `
        <h1>Bibli リンクテストページ</h1>

        <div class="status">
            <p><strong>現在のページ:</strong> test_links.html</p>
            <p><strong>目的:</strong> index.htmlからのリンクが正しく動作するか確認</p>
        </div>

        <h2>主要ページへのリンク</h2>
        <div class="link-list">
            <a href="index.html">トップページ (index.html)</a>
            <a href="login.html">ログイン画面 (login.html)</a>
            <a href="register.html">新規登録画面 (register.html)</a>
            <a href="listing_page.html">出品画面 (listing_page.html)</a>
            <a href="product_detail.html">商品詳細 (product_detail.html)</a>
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
