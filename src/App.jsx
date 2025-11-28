import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Index from './pages/index';
import Login from './pages/login';
import Register from './pages/register';
import ListingPage from './pages/listing_page';
import Forum from './pages/forum';
import ListingComplete from './pages/listing_complete';
import ForumPost from './pages/forum_post';
import ForumDetail from './pages/forum_detail';
import NewsPage from './pages/news_page';
import NewsDetail from './pages/news_detail';
import ProfilePage from './pages/profile_page';
import ProductDetail from './pages/product_detail';
import Checkout from './pages/checkout';
import Commercial from './pages/commercial';
import Contact from './pages/contact';
import PurchaseComplete from './pages/purchase_complete';
import Privacy from './pages/privacy';
import Terms from './pages/terms';
import Settings from './pages/settings';
import UserSettings from './pages/user_settings';
import SearchResults from './pages/search_results';
import TestLinks from './pages/test_links';
// Add other page imports as needed
// Import other pages as needed
// Add more imports as you convert more pages

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/commercial" element={<Commercial />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forum" element={<><Header /><Forum /><Footer /></>} />
          <Route path="/forum_detail" element={<ForumDetail />} />
          <Route path="/forum_post" element={<ForumPost />} />
          <Route path="/listing_complete" element={<ListingComplete />} />
          <Route path="/listing_page" element={<ListingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/news_detail" element={<NewsDetail />} />
          <Route path="/news_page" element={<NewsPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/product_detail" element={<ProductDetail />} />
          <Route path="/profile_page" element={<ProfilePage />} />
          <Route path="/purchase_complete" element={<PurchaseComplete />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/test_links" element={<TestLinks />} />
          <Route path="/user_settings" element={<UserSettings />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
