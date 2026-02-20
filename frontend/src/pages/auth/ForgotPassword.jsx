import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../css/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('メールアドレスを入力してください');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }
    if (cooldownSec > 0) {
      setError(`再送信は${cooldownSec}秒後に可能です`);
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setMessage('パスワード再設定メールを送信しました。メールをご確認ください。');
      setCooldownSec(30);
    } catch (err) {
      console.error('Forgot password error:', err);
      let msg = 'メール送信に失敗しました';
      if (err.code === 'auth/user-not-found') msg = 'このメールアドレスのユーザーは見つかりません';
      if (err.code === 'auth/invalid-email') msg = 'メールアドレスの形式が不正です';
      if (err.code === 'auth/too-many-requests') msg = 'リクエストが多すぎます。しばらくしてから再度お試しください';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (cooldownSec <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setCooldownSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSec]);

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="login-container">
          <div className="login-box">
            <h1 className="login-title">パスワード再設定</h1>
            <p className="login-subtitle">登録済みメールアドレスに再設定リンクを送信します</p>

            {error && <div className="page-message error visible">{error}</div>}
            {message && <div className="page-message success visible">{message}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting
                  ? '送信中...'
                  : (cooldownSec > 0 ? `再送信まで ${cooldownSec}s` : '再設定メールを送信')}
              </button>
            </form>

            <div className="divider"><span>または</span></div>
            <div className="register-link">
              <Link to="/login" className="register-btn">ログイン画面に戻る</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ForgotPassword;
