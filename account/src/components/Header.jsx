function Header() {
  // 開発モード (localhost:5173) か本番モード (file:/// or サーバー) かを判定
  const isDev = window.location.hostname === 'localhost';
  const baseUrl = isDev ? '../../' : '../../';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <a href={`${baseUrl}index.html`} className="logo">Bibli</a>
          <div className="search-bar">
            <input type="text" placeholder="キーワードで検索..." />
          </div>
        </div>
        <div className="header-right">
          <div className="header-buttons">
            <a href={`${baseUrl}listing_page.html`} className="btn btn-primary">出品</a>
            <a href="#/login" className="btn btn-secondary">ログイン/登録</a>
            <button className="hamburger-menu" id="hamburger-menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <div className="hamburger-dropdown" id="hamburger-dropdown">
            <a href={`${baseUrl}profile_page.html`} className="dropdown-item">
              <span className="dropdown-icon">👤</span>
              <span className="dropdown-text">プロフィール</span>
            </a>
            <a href={`${baseUrl}news_page.html`} className="dropdown-item">
              <span className="dropdown-icon">🔔</span>
              <span className="dropdown-text">お知らせ</span>
            </a>
            <a href={`${baseUrl}forum.html`} className="dropdown-item">
              <span className="dropdown-icon">💬</span>
              <span className="dropdown-text">掲示板</span>
            </a>
            <a href={`${baseUrl}listing_page.html`} className="dropdown-item">
              <span className="dropdown-icon">📦</span>
              <span className="dropdown-text">出品</span>
            </a>
            <a href={`${baseUrl}settings.html`} className="dropdown-item">
              <span className="dropdown-icon">⚙️</span>
              <span className="dropdown-text">設定</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
