import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/register.css';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../css/firebase";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    realName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) newErrors.userName = 'ユーザー名を入力してください';
    if (!formData.realName.trim()) newErrors.realName = '氏名を入力してください';
    if (!formData.address.trim()) newErrors.address = '住所を入力してください';
    if (!formData.phone.trim()) newErrors.phone = '電話番号を入力してください';

    if (!formData.email.trim()) newErrors.email = 'メールアドレスを入力してください';
    if (!formData.password) newErrors.password = 'パスワードを入力してください';
    else if (formData.password.length < 8)
      newErrors.password = 'パスワードは8文字以上必要です';

    if (formData.password !== formData.passwordConfirm)
      newErrors.passwordConfirm = 'パスワードが一致しません';

    if (!formData.agreeTerms)
      newErrors.agreeTerms = '利用規約に同意してください';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Firebase アカウント作成
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // MySQL API にユーザー情報を保存（不要項目を送らない）
      await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: formData.userName,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          phone_number: formData.phone,
          status: 1,
          real_name: formData.realName
        })
      });

      alert("アカウントの作成が完了しました！");
      navigate("/");

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

              {/* ユーザー名 */}
              <div className="form-group">
                <label>ユーザー名 *</label>
                <input type="text" name="userName"
                  value={formData.userName} onChange={handleChange} required />
                {errors.userName && <div className="error-message">{errors.userName}</div>}
              </div>

              {/* 氏名 */}
              <div className="form-group">
                <label>氏名（カタカナ） *</label>
                <input type="text" name="realName"
                  value={formData.realName} onChange={handleChange} required />
                {errors.realName && <div className="error-message">{errors.realName}</div>}
              </div>

              {/* メール */}
              <div className="form-group">
                <label>メールアドレス *</label>
                <input type="email" name="email"
                  value={formData.email} onChange={handleChange} required />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              {/* 電話番号 */}
              <div className="form-group">
                <label>電話番号 *</label>
                <input type="tel" name="phone"
                  value={formData.phone} onChange={handleChange} required />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              {/* 住所 */}
              <div className="form-group">
                <label>住所 *</label>
                <input type="text" name="address"
                  value={formData.address} onChange={handleChange} required />
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>

              {/* パスワード */}
              <div className="form-group">
                <label>パスワード *</label>
                <input type="password" name="password"
                  value={formData.password} onChange={handleChange} required />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              {/* パスワード確認 */}
              <div className="form-group">
                <label>パスワード確認 *</label>
                <input type="password" name="passwordConfirm"
                  value={formData.passwordConfirm} onChange={handleChange} required />
                {errors.passwordConfirm && <div className="error-message">{errors.passwordConfirm}</div>}
              </div>

              {/* 規約 */}
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="agreeTerms"
                    checked={formData.agreeTerms} onChange={handleChange} required />
                  利用規約とプライバシーポリシーに同意する
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
