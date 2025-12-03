import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/settings.css';

function Settings() {
  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="settings-container">
          <h1 className="page-title">設定</h1>

          {/* アカウント設定 */}
          <section className="settings-section">
            <h2 className="section-title">アカウント</h2>
            <div className="settings-list">
              <Link to="/user-settings" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">👤</span>
                  <span className="item-text">ユーザー設定</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">✉️</span>
                  <span className="item-text">メールアドレス</span>
                </div>
                <span className="item-value">example@email.com</span>
              </a>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">📱</span>
                  <span className="item-text">電話番号</span>
                </div>
                <span className="item-value">090-****-5678</span>
              </a>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">🔒</span>
                  <span className="item-text">パスワード変更</span>
                </div>
                <span className="item-arrow">›</span>
              </a>
            </div>
          </section>

          {/* 支払い設定 */}
          <section className="settings-section">
            <h2 className="section-title">支払い</h2>
            <div className="settings-list">
              <a href="#" className="settings-item" data-modal="payment">
                <div className="item-left">
                  <span className="item-icon">💳</span>
                  <span className="item-text">クレジットカード</span>
                </div>
                <span className="item-arrow">›</span>
              </a>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">🏦</span>
                  <span className="item-text">振込先口座</span>
                </div>
                <span className="item-arrow">›</span>
              </a>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">💰</span>
                  <span className="item-text">売上金・ポイント</span>
                </div>
                <span className="item-value">¥0</span>
                <span className="item-arrow">›</span>
              </a>
            </div>
          </section>

          {/* 通知設定 */}
          <section className="settings-section">
            <h2 className="section-title">通知</h2>
            <div className="settings-list">
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">🔔</span>
                  <span className="item-text">プッシュ通知</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" id="pushNotification" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">📧</span>
                  <span className="item-text">メール通知</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" id="emailNotification" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">💬</span>
                  <span className="item-text">メッセージ通知</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" id="messageNotification" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">🛍️</span>
                  <span className="item-text">お知らせ・キャンペーン</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" id="campaignNotification" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* プライバシー設定 */}
          <section className="settings-section">
            <h2 className="section-title">プライバシー</h2>
            <div className="settings-list">
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">🔐</span>
                  <span className="item-text">プロフィールを非公開</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" id="privateProfile" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">🚫</span>
                  <span className="item-text">ブロックリスト</span>
                </div>
                <span className="item-arrow">›</span>
              </a>
            </div>
          </section>

          {/* その他 */}
          <section className="settings-section">
            <h2 className="section-title">その他</h2>
            <div className="settings-list">
              <Link to="/contact" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">📞</span>
                  <span className="item-text">お問い合わせ</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <Link to="/terms" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">📄</span>
                  <span className="item-text">利用規約</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <Link to="/privacy" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">🔏</span>
                  <span className="item-text">プライバシーポリシー</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <Link to="/commercial" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">⚖️</span>
                  <span className="item-text">特定商取引法に基づく表記</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">ℹ️</span>
                  <span className="item-text">アプリバージョン</span>
                </div>
                <span className="item-value">v1.0.0</span>
              </a>
            </div>
          </section>

          {/* ログアウト */}
          <section className="settings-section">
            <div className="settings-list">
              <a href="#" className="settings-item danger-item" id="logoutBtn">
                <div className="item-left">
                  <span className="item-icon">🚪</span>
                  <span className="item-text">ログアウト</span>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Settings;
