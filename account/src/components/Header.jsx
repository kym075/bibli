function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <a href="../index.html" className="logo">Bibli</a>
          <div className="search-bar">
            <input type="text" placeholder="キーワードで検索..." />
          </div>
        </div>
        <div className="header-right">
          <div className="header-buttons">
            <a href="../listing_page.html" className="btn btn-primary">出品</a>
            <a href="#/login" className="btn btn-secondary">ログイン/登録</a>
            <button className="hamburger-menu" id="hamburger-menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <div className="hamburger-dropdown" id="hamburger-dropdown">
            <a href="../profile_page.html" className="dropdown-item">
              <span className="dropdown-icon">👤</span>
              <span className="dropdown-text">プロフィール</span>
            </a>
            <a href="../news_page.html" className="dropdown-item">
              <span className="dropdown-icon">🔔</span>
              <span className="dropdown-text">お知らせ</span>
            </a>
            <a href="../forum.html" className="dropdown-item">
              <span className="dropdown-icon">💬</span>
              <span className="dropdown-text">掲示板</span>
            </a>
            <a href="../listing_page.html" className="dropdown-item">
              <span className="dropdown-icon">📦</span>
              <span className="dropdown-text">出品</span>
            </a>
            <a href="../settings.html" className="dropdown-item">
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
