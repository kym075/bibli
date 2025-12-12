import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../css/firebase";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'メールアドレスを入力してください';
    else if (!isValidEmail(formData.email.trim())) newErrors.email = '有効なメールアドレスを入力してください';

    if (!formData.password) newErrors.password = 'パスワードを入力してください';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // バックエンドのログインAPIを呼び出してJWTトークンを取得
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.email,
          password: formData.password
        })
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.error || 'ログインに失敗しました');
      }

      const loginData = await loginResponse.json();
      const token = loginData.access_token;

      // JWTトークンを保存
      localStorage.setItem('token', token);

      // Firebase Auth ログイン（オプション）
      try {
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      } catch (firebaseError) {
        console.warn("Firebase ログインに失敗しましたが、バックエンド認証は成功しています", firebaseError);
      }

      navigate("/profile");

    } catch (error) {
      console.error("Login Error:", error);
      let message = error.message || 'ログインに失敗しました';

      setErrors({ general: message });
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

            {errors.general && <div className="error-message">{errors.general}</div>}

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
                  onBlur={() => {
                    if (formData.email && !isValidEmail(formData.email))
                      setErrors(prev => ({ ...prev, email: '有効なメールアドレスを入力してください' }));
                  }}
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
              </div>

              <button type="submit" className="login-btn">ログイン</button>
            </form>

            <div className="divider"><span>または</span></div>

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
