import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/listing_complete.css';
import { auth } from '../../css/firebase';
import { resolveProfilePathByEmail } from '../../utils/userProfile';

function ListingComplete() {
  const [profilePath, setProfilePath] = useState('/settings');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setProfilePath('/login');
        return;
      }
      try {
        const nextPath = await resolveProfilePathByEmail(user.email, '/settings');
        setProfilePath(nextPath);
      } catch (err) {
        console.error('ListingComplete profile path resolve error:', err);
        setProfilePath('/settings');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* 紙吹雪エフェクト */}
      <div className="confetti" id="confetti"></div>

      <Header />
      <main className="main-content">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">OK</div>
            <h1 className="success-title">出品が完了しました！</h1>
            <p className="success-message">
              ありがとうございます！<br />
              あなたの大切な本の出品が正常に完了しました。<br />
              <strong>運営による審査後</strong>、商品が公開されます。
            </p>

            <div className="action-buttons">
              <Link to={profilePath} className="action-btn btn-check" id="checkBtn">
                出品した商品を確認する
              </Link>
              <Link to="/products/listing" className="action-btn btn-continue" id="continueBtn">
                続けて別の本を出品する
              </Link>
              <Link to="/" className="action-btn btn-home" id="homeBtn">
                トップページへ戻る
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ListingComplete;
