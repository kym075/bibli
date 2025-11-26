import React, { useState, useEffect, useRef } from 'react';

const ListingComplete = () => {
  const [message, setMessage] = useState('');
  const [animatedStats, setAnimatedStats] = useState({
    hours: 0,
    approval: 0,
    days: 0
  });
  const confettiRef = useRef(null);
  const messageRef = useRef(null);

  // 紙吹雪エフェクト
  useEffect(() => {
    createConfetti();

    // タイピングエフェクト
    const fullMessage = `ありがとうございます！<br>
あなたの大切な本の出品が正常に完了しました。<br>
<strong>運営による審査後</strong>、商品が公開されます。`;

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullMessage.length) {
        setMessage(fullMessage.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, []);

  // 紙吹雪を作成
  const createConfetti = () => {
    if (!confettiRef.current) return;

    // 50個の紙吹雪を作成
    for (let i = 0; i < 50; i++) {
      const confettiPiece = document.createElement('div');
      confettiPiece.className = 'confetti-piece';
      confettiPiece.style.left = Math.random() * 100 + '%';
      confettiPiece.style.animationDelay = Math.random() * 3 + 's';
      confettiPiece.style.animationDuration = (Math.random() * 2 + 2) + 's';

      // ランダムな色
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6c5ce7', '#fd79a8'];
      confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      confettiRef.current.appendChild(confettiPiece);
    }

    // 5秒後に紙吹雪を削除
    setTimeout(() => {
      if (confettiRef.current) {
        confettiRef.current.innerHTML = '';
      }
    }, 5000);
  };

  // 統計カードのアニメーション
  useEffect(() => {
    const stats = [
      { key: 'hours', target: 24, duration: 1000 },
      { key: 'approval', target: 95, duration: 1500 },
      { key: 'days', target: 3, duration: 800 }
    ];

    stats.forEach(({ key, target, duration }) => {
      let start = 0;
      const increment = target / (duration / 50);

      const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
          setAnimatedStats(prev => ({ ...prev, [key]: target }));
          clearInterval(interval);
        } else {
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(start) }));
        }
      }, 50);
    });
  }, []);

  // ボタンクリックハンドラー
  const handleCheckClick = (e) => {
    e.preventDefault();
    console.log('出品商品確認ページへ移動');
    // React Routerを使う場合: navigate('/profile');
    alert('マイページの出品商品一覧に移動します');
  };

  const handleContinueClick = (e) => {
    e.preventDefault();
    console.log('出品ページへ移動');
    // React Routerを使う場合: navigate('/listing');
    alert('新規出品ページに移動します');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    console.log('トップページへ移動');
    // React Routerを使う場合: navigate('/');
    alert('トップページに移動します');
  };

  return (
    <div className="listing-complete-page">
      {/* 紙吹雪エフェクト */}
      <div className="confetti" ref={confettiRef}></div>

      {/* ヘッダー */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <a href="/index.html" className="logo">Bibli</a>
            <div className="search-bar">
              <input type="text" placeholder="キーワードで検索..." />
            </div>
          </div>
          <div className="header-right">
            <div className="header-buttons">
              <a href="/listing_page.html" className="btn btn-primary">出品</a>
              <a href="/login.html" className="btn btn-secondary">ログイン/登録</a>
              <button className="hamburger-menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h1 className="success-title">出品が完了しました！</h1>
            <p
              className="success-message"
              ref={messageRef}
              dangerouslySetInnerHTML={{ __html: message }}
            />

            <div className="action-buttons">
              <a
                href="#"
                className="action-btn btn-check"
                onClick={handleCheckClick}
              >
                📋 出品した商品を確認する
              </a>
              <a
                href="#"
                className="action-btn btn-continue"
                onClick={handleContinueClick}
              >
                ➕ 続けて別の本を出品する
              </a>
              <a
                href="#"
                className="action-btn btn-home"
                onClick={handleHomeClick}
              >
                🏠 トップページへ戻る
              </a>
            </div>

            <div className="additional-info">
              <div className="info-title">
                📋 今後の流れについて
              </div>
              <ul className="info-list">
                <li>運営チームが商品情報を確認します（通常24時間以内）</li>
                <li>審査完了後、商品が自動的に公開されます</li>
                <li>購入者が現れると、メッセージでお知らせします</li>
                <li>取引開始後は、購入者と直接やり取りできます</li>
                <li>商品発送後、評価を行って取引完了です</li>
              </ul>
            </div>

            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-number">{animatedStats.hours}</div>
                <div className="stat-label">時間以内</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{animatedStats.approval}%</div>
                <div className="stat-label">審査通過率</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{animatedStats.days}日</div>
                <div className="stat-label">平均売却期間</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="footer">
        <div className="footer-content">
          <a href="/commercial.html" className="footer-link">特定商取引法に基づく表記</a>
          <a href="/terms.html" className="footer-link">利用規約</a>
          <a href="/privacy.html" className="footer-link">プライバシーポリシー</a>
          <a href="/contact.html" className="footer-link">お問い合わせ</a>
        </div>
      </footer>

      {/* 紙吹雪用のスタイル（インラインまたは別CSSファイル） */}
      <style jsx>{`
        .confetti {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: fall linear forwards;
          opacity: 0.8;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .action-btn {
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .stat-card {
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }

        .stat-card:nth-child(1) {
          animation-delay: 0.2s;
        }

        .stat-card:nth-child(2) {
          animation-delay: 0.4s;
        }

        .stat-card:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ListingComplete;
