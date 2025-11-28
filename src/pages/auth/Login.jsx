import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('ログイン試行:', formData);

    // 実際のアプリケーションではここでAPIリクエストを送信
    alert('ログインに成功しました！');

    // プロフィールページへリダイレクト
    navigate('/profile');
  };

  const handleEmailBlur = () => {
    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      setErrors(prev => ({ ...prev, email: '有効なメールアドレスを入力してください' }));
    }
  };

  return (
    <>
      <Header />

      <main className="main-content">
        <div className="login-container">
          <div className="login-box">
            <h1 className="login-title">ログイン</h1>
            <p className="login-subtitle">Bibliへようこそ</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  required
                  style={{ borderColor: errors.email ? '#e74c3c' : '#e0e0e0' }}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">パスワード</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="パスワードを入力"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ borderColor: errors.password ? '#e74c3c' : '#e0e0e0' }}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>ログイン状態を保持する</span>
                </label>
                <a href="#" className="forgot-password">パスワードをお忘れの方</a>
              </div>

              <button type="submit" className="login-btn">ログイン</button>
            </form>

            <div className="divider">
              <span>または</span>
            </div>

            <div className="register-link">
              <p>アカウントをお持ちでない方</p>
              <Link to="/register" className="register-btn">新規登録はこちら</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Login;