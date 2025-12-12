import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/register.css';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../css/firebase"; // ←あなたの firebase.js のパスに合わせて修正

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});

  // 入力変更
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

  // 簡易バリデーション
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'ユーザーIDを入力してください';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上必要です';
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'パスワードが一致しません';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '利用規約に同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Firebase Auth で新規登録
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      alert("アカウントを作成しました！");
      navigate("/login");

    } catch (error) {
      console.error("Register error:", error);

      let msg = "登録中にエラーが発生しました";

      if (error.code === "auth/email-already-in-use") {
        msg = "このメールアドレスはすでに使われています";
      }

      setErrors({ general: msg });
    }
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="register-container">
          <div className="register-box">
            <h1 className="register-title">新規登録</h1>
            <p className="register-subtitle">Bibliのアカウントを作成</p>

            {errors.general && <div className="error-message">{errors.general}</div>}

            <form onSubmit={handleSubmit} className="register-form">
              {/* ユーザーID */}
              <div className="form-group">
                <label htmlFor="userId" className="form-label">ユーザーID *</label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  className="form-input"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                />
                {errors.userId && <div className="error-message">{errors.userId}</div>}
              </div>

              {/* メール */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">メールアドレス *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              {/* 電話番号（今回は登録には使わない） */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">電話番号 *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              {/* パスワード */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">パスワード *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              {/* パスワード確認 */}
              <div className="form-group">
                <label htmlFor="passwordConfirm" className="form-label">パスワード確認 *</label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  className="form-input"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                />
                {errors.passwordConfirm && <div className="error-message">{errors.passwordConfirm}</div>}
              </div>

              {/* 同意チェック */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    <Link to="/terms" className="link">利用規約</Link> と
                    <Link to="/privacy" className="link">プライバシーポリシー</Link> に同意する
                  </span>
                </label>
              </div>

              <button type="submit" className="register-btn">アカウントを作成</button>
            </form>

            <div className="divider"><span>または</span></div>

            <div className="login-link">
              <p>すでにアカウントをお持ちの方</p>
              <Link to="/login" className="login-link-btn">ログインはこちら</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Register;
