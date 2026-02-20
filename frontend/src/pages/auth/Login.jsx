import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../css/firebase";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/login.css';
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
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
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
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
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      // Firebase Auth ログイン
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      // ローカル保存（任意）
      if (formData.rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      // alert("ログイン成功！");
      navigate("/profile");
    } catch (error) {
      console.error("Firebase Login Error:", error);
      let message = 'ログインに失敗しました';
      if (error.code === "auth/user-not-found") message = "ユーザーが存在しません";
      if (error.code === "auth/wrong-password") message = "パスワードが間違っています";
      if (error.code === "auth/invalid-email") message = "メールアドレスが不正です";
      setErrors({ general: message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  useEffect(() => {
    const loginMessage = location.state?.message;
    if (loginMessage) {
      setErrors(prev => ({ ...prev, general: loginMessage }));
    }
  }, [location.state]);
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
                <label htmlFor="email" className="form-label form-label-row">
                  <span className="label-text">メールアドレス</span>
                  {errors.email && <span className="form-error-inline">{errors.email}</span>}
                </label>
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
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label form-label-row">
                  <span className="label-text">パスワード</span>
                  {errors.password && <span className="form-error-inline">{errors.password}</span>}
                </label>
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
                <Link to="/forgot-password" className="forgot-password">
                  パスワードを忘れた方
                </Link>
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
