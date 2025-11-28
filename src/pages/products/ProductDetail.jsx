import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function ProductDetail() {
  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="product-container">
          {/* 左カラム: 商品画像エリア */}
          <div className="product-images">
            <div className="main-image" id="mainImage"></div>
            <div className="thumbnail-list">
              <div className="thumbnail active" data-image="1">📖</div>
              <div className="thumbnail" data-image="2">📚</div>
              <div className="thumbnail" data-image="3">📝</div>
              <div className="thumbnail" data-image="4">📄</div>
            </div>
          </div>

          {/* 右カラム: 商品情報・購入エリア */}
          <div className="product-info">
            <h1 className="product-title">夏目漱石作品集</h1>
            
            <div className="product-meta">
              <span>📚 著者: 夏目漱石</span>
              <span>📂 カテゴリ: 小説</span>
            </div>

            <div className="condition-badge">
              ✨ 良好な状態
            </div>

            <div className="price">¥1,200</div>

            <div className="action-buttons">
              <Link to="/checkout">
                <div className="btn-large btn-purchase">
                  🛒 今すぐ購入
                </div>
              </Link>
              <button className="btn-large btn-cart">
                💼 カートに入れる
              </button>
            </div>

            <div className="secondary-actions">
              <button className="btn-large btn-outline">
                💰 値下げ依頼
              </button>
              <button className="btn-large btn-outline">
                ❤️ お気に入り
              </button>
            </div>

            <div className="seller-info">
              <div className="seller-profile">
                <div className="seller-avatar">📚</div>
                <div className="seller-details">
                  <h4>本好きユーザー</h4>
                  <div className="rating">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span>(4.8)</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary btn-small">👤 フォロー</button>
            </div>

            <div className="communication-actions">
              <button className="btn btn-primary btn-small">💬 チャットで質問</button>
              <button className="btn btn-outline btn-small">🔗 シェア</button>
              <button className="btn btn-outline btn-small">⚠️ 通報</button>
            </div>
          </div>
        </div>

        {/* 商品説明エリア */}
        <div className="product-description">
          <div className="description-section">
            <h3>📖 商品の説明</h3>
            <div className="description-text">
              <p>夏目漱石の代表作品を収録した貴重な作品集です。「こころ」「坊っちゃん」「吾輩は猫である」などの名作が収録されています。</p>
              <p>状態は非常に良好で、書き込みや汚れはほとんどありません。本棚で大切に保管されていた一冊です。</p>
              <p>文学好きの方、夏目漱石ファンの方におすすめの一冊です。</p>
            </div>
          </div>

          <div className="description-section">
            <h3>💝 本への想い</h3>
            <div className="book-passion">
              <h4>出品者からのメッセージ</h4>
              <p>この作品集は私の文学への扉を開いてくれた大切な本でした。多くの人に夏目漱石の素晴らしさを知ってもらいたく、出品いたします。きっと新しい読者の方にも愛されることでしょう。</p>
            </div>
          </div>

          <div className="description-section">
            <h3>🏷️ 付けられているタグ</h3>
            <div className="tags">
              <span className="tag">日本文学</span>
              <span className="tag">古典</span>
              <span className="tag">名作</span>
              <span className="tag">全集</span>
              <span className="tag">読書</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetail;
