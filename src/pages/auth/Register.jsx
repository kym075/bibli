import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/register.css';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // パスワード確認のリアルタイムチェック
    if (name === 'password' || name === 'passwordConfirm') {
      if (name === 'password' && formData.passwordConfirm && value === formData.passwordConfirm) {
        setErrors(prev => ({ ...prev, passwordConfirm: '' }));
      } else if (name === 'passwordConfirm' && formData.password && value === formData.password) {
        setErrors(prev => ({ ...prev, passwordConfirm: '' }));
      } else if (name === 'passwordConfirm' && formData.password && value !== formData.password) {
        setErrors(prev => ({ ...prev, passwordConfirm: 'パスワードが一致しません' }));
      }
    }
  };

  const isValidUserId = (userId) => {
    const userIdRegex = /^[a-zA-Z0-9_]+$/;
    return userIdRegex.test(userId);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const isValidPassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'ユーザーIDを入力してください';
    } else if (formData.userId.trim().length < 4) {
      newErrors.userId = 'ユーザーIDは4文字以上で入力してください';
    } else if (!isValidUserId(formData.userId.trim())) {
      newErrors.userId = '半角英数字とアンダースコア(_)のみ使用できます';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号を入力してください';
    } else if (!isValidPhone(formData.phone.trim())) {
      newErrors.phone = '10桁または11桁の数字で入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'パスワードは英字と数字を含める必要があります';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'パスワード確認を入力してください';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'パスワードが一致しません';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '利用規約とプライバシーポリシーに同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      if (errors.agreeTerms) {
        alert(errors.agreeTerms);
      }
      return;
    }

    console.log('アカウント登録試行:', formData);

    // 実際のアプリケーションではここでAPIリクエストを送信
    alert('アカウント登録が完了しました！');

    // ログインページへリダイレクト
    navigate('/login');
  };

  const handleUserIdBlur = () => {
    if (formData.userId.trim()) {
      if (formData.userId.trim().length < 4) {
        setErrors(prev => ({ ...prev, userId: 'ユーザーIDは4文字以上で入力してください' }));
      } else if (!isValidUserId(formData.userId.trim())) {
        setErrors(prev => ({ ...prev, userId: '半角英数字とアンダースコア(_)のみ使用できます' }));
      }
    }
  };

  const handleEmailBlur = () => {
    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      setErrors(prev => ({ ...prev, email: '有効なメールアドレスを入力してください' }));
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phone.trim() && !isValidPhone(formData.phone.trim())) {
      setErrors(prev => ({ ...prev, phone: '10桁または11桁の数字で入力してください' }));
    }
  };

  const handlePasswordBlur = () => {
    if (formData.password) {
      if (formData.password.length < 8) {
        setErrors(prev => ({ ...prev, password: 'パスワードは8文字以上で入力してください' }));
      } else if (!isValidPassword(formData.password)) {
        setErrors(prev => ({ ...prev, password: 'パスワードは英字と数字を含める必要があります' }));
      }
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

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="userId" className="form-label">
                  ユーザーID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  className="form-input"
                  placeholder="半角英数字4文字以上"
                  value={formData.userId}
                  onChange={handleChange}
                  onBlur={handleUserIdBlur}
                  required
                  minLength="4"
                  style={{ borderColor: errors.userId ? '#e74c3c' : '#e0e0e0' }}
                />
                <div className="help-text">半角英数字とアンダースコア(_)が使用できます</div>
                {errors.userId && <div className="error-message">{errors.userId}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  メールアドレス <span className="required">*</span>
                </label>
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
                <label htmlFor="phone" className="form-label">
                  電話番号 <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  placeholder="09012345678"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  required
                  pattern="[0-9]{10,11}"
                  style={{ borderColor: errors.phone ? '#e74c3c' : '#e0e0e0' }}
                />
                <div className="help-text">ハイフンなしで入力してください</div>
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  パスワード <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="8文字以上のパスワード"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handlePasswordBlur}
                  required
                  minLength="8"
                  style={{ borderColor: errors.password ? '#e74c3c' : '#e0e0e0' }}
                />
                <div className="help-text">8文字以上、英字と数字を含めてください</div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="passwordConfirm" className="form-label">
                  パスワード確認 <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  className="form-input"
                  placeholder="パスワードを再入力"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  minLength="8"
                  style={{ borderColor: errors.passwordConfirm ? '#e74c3c' : '#e0e0e0' }}
                />
                {errors.passwordConfirm && <div className="error-message" id="passwordError">{errors.passwordConfirm}</div>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    <Link to="/terms" className="link">利用規約</Link>と
                    <Link to="/privacy" className="link">プライバシーポリシー</Link>に同意する
                  </span>
                </label>
              </div>

              <button type="submit" className="register-btn">アカウントを作成</button>
            </form>

            <div className="divider">
              <span>または</span>
            </div>

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