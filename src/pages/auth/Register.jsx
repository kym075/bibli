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
    name: '',
    nameKana: '',
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

  const isValidKana = (kana) => {
    // ひらがなとカタカナのみ
    const kanaRegex = /^[ぁ-んァ-ヶー]+$/;
    return kanaRegex.test(kana);
  };

  // 簡易バリデーション
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'ユーザーIDを入力してください';
    }

    if (!formData.name.trim()) {
      newErrors.name = '氏名を入力してください';
    }

    if (!formData.nameKana.trim()) {
      newErrors.nameKana = 'フリガナを入力してください';
    } else if (!isValidKana(formData.nameKana.trim())) {
      newErrors.nameKana = 'ひらがなまたはカタカナで入力してください';
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      console.log('Firebase登録成功:', user.uid);

      // バックエンドにユーザー情報を送信
      const response = await fetch('http://localhost:5000/api/auth/firebase/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: formData.email,
          name: formData.name,
          nameKana: formData.nameKana,
          userId: formData.userId,
          phone: formData.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'バックエンド登録に失敗しました');
      }

      const data = await response.json();
      console.log('バックエンド登録成功:', data);

      alert("アカウントを作成しました！");
      navigate("/login");

    } catch (error) {
      console.error("Register error:", error);

      let msg = "登録中にエラーが発生しました";

      if (error.code === "auth/email-already-in-use") {
        msg = "このメールアドレスはすでに使われています";
      } else if (error.message) {
        msg = error.message;
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

              {/* 氏名 */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  氏名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="山田 太郎"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ borderColor: errors.name ? '#e74c3c' : '#e0e0e0' }}
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              {/* フリガナ */}
              <div className="form-group">
                <label htmlFor="nameKana" className="form-label">
                  フリガナ <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nameKana"
                  name="nameKana"
                  className="form-input"
                  placeholder="ヤマダ タロウ"
                  value={formData.nameKana}
                  onChange={handleChange}
                  required
                  style={{ borderColor: errors.nameKana ? '#e74c3c' : '#e0e0e0' }}
                />
                <div className="help-text">ひらがなまたはカタカナで入力してください</div>
                {errors.nameKana && <div className="error-message">{errors.nameKana}</div>}
              </div>

              {/* メール */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  メールアドレス <span className="required">*</span>
                </label>
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
