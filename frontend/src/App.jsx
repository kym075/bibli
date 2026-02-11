import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// CSS imports - グローバルスタイル
import './css/reset.css';
import './css/common.css';


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Pages
import Home from './pages/Home';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Profile pages
import ProfilePage from './pages/profile/ProfilePage';
import Settings from './pages/profile/Settings';
import UserSettings from './pages/profile/UserSettings';

// Product pages
import ProductDetail from './pages/products/ProductDetail';
import SearchResults from './pages/products/SearchResults';
import Listing from './pages/products/Listing';
import ListingComplete from './pages/products/ListingComplete';
import Checkout from './pages/products/Checkout';
import PurchaseComplete from './pages/products/PurchaseComplete';

// Community pages
import Forum from './pages/community/Forum';
import ForumDetail from './pages/community/ForumDetail';
import ForumPost from './pages/community/ForumPost';
import News from './pages/community/News';
import NewsDetail from './pages/community/NewsDetail';

// Info pages
import Contact from './pages/info/Contact';
import Commercial from './pages/info/Commercial';
import Terms from './pages/info/Terms';
import Privacy from './pages/info/Privacy';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Profile */}
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user-settings" element={<UserSettings />} />

        {/* Products */}
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/products/listing" element={<Listing />} />
        <Route path="/products/listing-complete" element={<ListingComplete />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/purchase-complete" element={<PurchaseComplete />} />

        {/* Community */}
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:threadId" element={<ForumDetail />} />
        <Route path="/forum-detail" element={<ForumDetail />} />
        <Route path="/forum-post" element={<ForumPost />} />
        <Route path="/news" element={<News />} />
        <Route path="/news-detail" element={<NewsDetail />} />

        {/* Info */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/commercial" element={<Commercial />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Router>
  );
}

export default App;
