import { Link } from 'react-router-dom';
import { useEffect } from 'react';

function Header() {
  useEffect(() => {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');

    const toggleDropdown = () => {
      hamburgerDropdown.classList.toggle('show');
      hamburgerMenu.classList.toggle('active');
    };

    const closeDropdown = (e) => {
      if (!hamburgerMenu.contains(e.target) && !hamburgerDropdown.contains(e.target)) {
        hamburgerDropdown.classList.remove('show');
        hamburgerMenu.classList.remove('active');
      }
    };

    if (hamburgerMenu) {
      hamburgerMenu.addEventListener('click', toggleDropdown);
    }

    document.addEventListener('click', closeDropdown);

    return () => {
      if (hamburgerMenu) {
        hamburgerMenu.removeEventListener('click', toggleDropdown);
      }
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">Bibli</Link>
          <div className="search-bar">
            <input type="text" placeholder="キーワードで検索..." />
          </div>
        </div>
        <div className="header-right">
          <div className="header-buttons">
            <Link to="/listing" className="btn btn-primary">出品</Link>
            <Link to="/login" className="btn btn-secondary">ログイン/登録</Link>
            <button className="hamburger-menu" id="hamburger-menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <div className="hamburger-dropdown" id="hamburger-dropdown">
            <Link to="/profile" className="dropdown-item">
              <span className="dropdown-text">プロフィール</span>
            </Link>
            <Link to="/news" className="dropdown-item">
              <span className="dropdown-text">お知らせ</span>
            </Link>
            <Link to="/forum" className="dropdown-item">
              <span className="dropdown-text">掲示板</span>
            </Link>
            <Link to="/listing" className="dropdown-item">
              <span className="dropdown-text">出品</span>
            </Link>
            <Link to="/settings" className="dropdown-item">
              <span className="dropdown-text">設定</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;