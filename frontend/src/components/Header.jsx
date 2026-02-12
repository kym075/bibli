import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../css/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Header() {
  const [user, setUser] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');

    const toggleDropdown = () => {
      hamburgerDropdown?.classList.toggle('show');
      hamburgerMenu?.classList.toggle('active');
    };

    const closeDropdown = (e) => {
      if (
        !hamburgerMenu?.contains(e.target) &&
        !hamburgerDropdown?.contains(e.target)
      ) {
        hamburgerDropdown?.classList.remove('show');
        hamburgerMenu?.classList.remove('active');
      }
    };

    hamburgerMenu?.addEventListener('click', toggleDropdown);
    document.addEventListener('click', closeDropdown);

    return () => {
      hamburgerMenu?.removeEventListener('click', toggleDropdown);
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">Bibli</Link>
          <div className="search-bar">
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="header-right">
          <div className="header-buttons">
            {user && (
              <Link to="/products/listing" className="btn btn-primary">出品</Link>
            )}

            {!user ? (
              <Link to="/login" className="btn btn-secondary">ログイン/登録</Link>
            ) : (
              <Link to="/profile" className="user-icon-link" aria-label="プロフィール">
                <span className="user-circle-icon">U</span>
              </Link>
            )}

            <button className="hamburger-menu" id="hamburger-menu" type="button" aria-label="メニュー">
              <span></span><span></span><span></span>
            </button>
          </div>

          <div className="hamburger-dropdown" id="hamburger-dropdown">
            {user ? (
              <>
                <Link to="/profile" className="dropdown-item">
                  <span className="dropdown-icon">P</span>
                  <span className="dropdown-text">プロフィール</span>
                </Link>
                <Link to="/news" className="dropdown-item">
                  <span className="dropdown-icon">N</span>
                  <span className="dropdown-text">お知らせ</span>
                </Link>
                <Link to="/forum" className="dropdown-item">
                  <span className="dropdown-icon">B</span>
                  <span className="dropdown-text">掲示板</span>
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <span className="dropdown-icon">S</span>
                  <span className="dropdown-text">設定</span>
                </Link>
                <button type="button" className="dropdown-item dropdown-item-button" onClick={handleLogout}>
                  <span className="dropdown-icon">O</span>
                  <span className="dropdown-text">ログアウト</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="dropdown-item">
                  <span className="dropdown-icon">L</span>
                  <span className="dropdown-text">ログイン</span>
                </Link>
                <Link to="/register" className="dropdown-item">
                  <span className="dropdown-icon">R</span>
                  <span className="dropdown-text">新規登録</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
