import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/user_settings.css';

function UserSettings() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    {/* フォーム送信処理をここに追加 */}
    {/* 保存後、適切なページに遷移 */}
  };

  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        <h1 className="settings-title">ユーザー設定</h1>
        <form className="user-settings-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userid">ユーザーID:</label>
            <input type="text" id="userid" name="userid" placeholder="新しいユーザーIDを入力" />
          </div>
          <div className="form-group">
            <label htmlFor="username">ユーザー名:</label>
            <input type="text" id="username" name="username" placeholder="新しいユーザー名を入力" />
          </div>
          <div className="form-group">
            <label htmlFor="profile-pic">プロフィール画像:</label>
            <input type="file" id="profile-pic" name="profile-pic" accept="image/*" />
          </div>
          <div className="form-group">
            <label htmlFor="bio">自己紹介:</label>
            <textarea id="bio" name="bio" rows="4" placeholder="新しい自己紹介を入力"></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="email">メールアドレス:</label>
            <input type="email" id="email" name="email" placeholder="新しいメールアドレスを入力" />
          </div>
          <div className="form-group">
            <label htmlFor="address">住所:</label>
            <input type="text" id="address" name="address" placeholder="新しい住所を入力" />
          </div>
          <div className="form-group">
            <label htmlFor="phone">電話番号:</label>
            <input type="tel" id="phone" name="phone" placeholder="新しい電話番号を入力" />
          </div>
          <div className="form-group">
            <label htmlFor="password">パスワード:</label>
            <input type="password" id="password" name="password" placeholder="新しいパスワードを入力" />
          </div>
          <div className="form-group">
            <label htmlFor="password-conf">パスワード(確認):</label>
            <input type="password" id="password-conf" name="password-conf" placeholder="新しいパスワードを入力" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-save">保存</button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default UserSettings;
