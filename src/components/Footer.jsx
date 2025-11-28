import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link to="/commercial" className="footer-link">特定商取引法に基づく表記</Link>
        <Link to="/terms" className="footer-link">利用規約</Link>
        <Link to="/privacy" className="footer-link">プライバシーポリシー</Link>
        <Link to="/contact" className="footer-link">お問い合わせ</Link>
      </div>
    </footer>
  );
}

export default Footer;