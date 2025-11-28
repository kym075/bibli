import "../assets/css/common.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <a href="/commercial" className="footer-link">特定商取引法に基づく表記</a>
                <a href="/terms" className="footer-link">利用規約</a>
                <a href="/privacy" className="footer-link">プライバシーポリシー</a>
                <a href="/contact" className="footer-link">お問い合わせ</a>
            </div>
        </footer>
    );
}
