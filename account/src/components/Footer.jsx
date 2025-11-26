function Footer() {
  const isDev = window.location.hostname === 'localhost';
  const baseUrl = isDev ? '../../' : '../../';

  return (
    <footer className="footer">
      <div className="footer-content">
        <a href={`${baseUrl}commercial.html`} className="footer-link">特定商取引法に基づく表記</a>
        <a href={`${baseUrl}terms.html`} className="footer-link">利用規約</a>
        <a href={`${baseUrl}privacy.html`} className="footer-link">プライバシーポリシー</a>
        <a href={`${baseUrl}contact.html`} className="footer-link">お問い合わせ</a>
      </div>
    </footer>
  );
}

export default Footer;
