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
    realNameKana: '',
    birthDate: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const normalizedValue = (name === 'phone' || name === 'postalCode')
      ? value.replace(/\D/g, '')
      : value;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : normalizedValue
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const isKatakana = (text) => /^[ァ-ヶー\\s]+$/.test(text);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = 'ユーザー名を入力してください';
    if (!formData.realName.trim()) newErrors.realName = '氏名（漢字）を入力してください';
    if (!formData.realNameKana.trim()) {
      newErrors.realNameKana = '氏名（フリガナ）を入力してください';
    } else if (!isKatakana(formData.realNameKana.trim())) {
      newErrors.realNameKana = 'フリガナはカタカナで入力してください';
    }
    if (!formData.birthDate) newErrors.birthDate = '生年月日を入力してください';
    if (!formData.address.trim()) newErrors.address = '住所を入力してください';
    if (!formData.phone.trim()) newErrors.phone = '電話番号を入力してください';
    else if (!/^\d{10,11}$/.test(formData.phone.trim()))
      newErrors.phone = '電話番号は10桁または11桁の数字で入力してください';
    if (!formData.postalCode.trim()) newErrors.postalCode = '郵便番号を入力してください';
    else if (!/^\d{7}$/.test(formData.postalCode.trim()))
      newErrors.postalCode = '郵便番号は7桁の数字で入力してください';
    if (!formData.email.trim()) newErrors.email = 'メールアドレスを入力してください';
    if (!formData.password) newErrors.password = 'パスワードを入力してください';
    else if (formData.password.length < 8)
      newErrors.password = 'パスワードは8文字以上必要です';
    if (formData.password !== formData.passwordConfirm)
      newErrors.passwordConfirm = 'パスワードが一致しません';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleAddressLookup = async () => {
    const code = formData.postalCode.trim();
    if (!/^\d{7}$/.test(code)) {
      setErrors(prev => ({ ...prev, postalCode: '郵便番号は7桁の数字で入力してください' }));
      return;
    }
    setIsFetchingAddress(true);
    try {
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
      const data = await response.json();
      if (data.status !== 200 || !data.results || data.results.length === 0) {
        setErrors(prev => ({ ...prev, postalCode: '住所が見つかりませんでした' }));
        return;
      }
      const result = data.results[0];
      const address = `${result.address1}${result.address2}${result.address3}`;
      setFormData(prev => ({ ...prev, address }));
      setErrors(prev => ({ ...prev, postalCode: '', address: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, postalCode: '住所の取得に失敗しました' }));
    } finally {
      setIsFetchingAddress(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      // Firebase アカウント作成
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // MySQL API にユーザー情報を保存（不要項目を送らない）
      const formattedPostalCode = formData.postalCode.length === 7
        ? `${formData.postalCode.slice(0, 3)}-${formData.postalCode.slice(3)}`
        : formData.postalCode;
      const fullAddress = formattedPostalCode
        ? `〒${formattedPostalCode} ${formData.address}`
        : formData.address;
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: formData.userName,
          email: formData.email,
          password: formData.password,
          address: fullAddress,
          phone_number: formData.phone,
          status: 1,
          real_name: formData.realName,
          name_kana: formData.realNameKana,
          postal_code: formData.postalCode,
          birth_date: formData.birthDate
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'データベースへの登録に失敗しました');
      }
      setSuccessMessage('アカウントの作成が完了しました');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (error) {
      console.error("Register error:", error);
      let msg = "登録中にエラーが発生しました";
      if (error.code === "auth/email-already-in-use") {
        msg = "このメールアドレスはすでに使われています";
      } else if (error.message) {
        msg = error.message;
      }
      setErrors({ general: msg });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {successMessage && <div className="page-message success visible">{successMessage}</div>}
            {errors.general && <div className="error-message">{errors.general}</div>}
            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* ユーザー名 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">ユーザー名 *</span>
                  {errors.userName && <span className="form-error-inline">{errors.userName}</span>}
                </label>
                <input type="text" name="userName" className="form-input"
                  value={formData.userName} onChange={handleChange} required />
              </div>
              {/* 氏名 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">氏名（漢字） *</span>
                  {errors.realName && <span className="form-error-inline">{errors.realName}</span>}
                </label>
                <input type="text" name="realName" className="form-input" placeholder="山田 太郎"
                  value={formData.realName} onChange={handleChange} required />
              </div>
              {/* 氏名（フリガナ） */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">氏名（フリガナ） *</span>
                  {errors.realNameKana && <span className="form-error-inline">{errors.realNameKana}</span>}
                </label>
                <input type="text" name="realNameKana" className="form-input" placeholder="ヤマダ タロウ"
                  value={formData.realNameKana} onChange={handleChange} required />
              </div>
              {/* 生年月日 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">生年月日 *</span>
                  {errors.birthDate && <span className="form-error-inline">{errors.birthDate}</span>}
                </label>
                <input type="date" name="birthDate" className="form-input"
                  value={formData.birthDate} onChange={handleChange} required />
              </div>
              {/* メール */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">メールアドレス *</span>
                  {errors.email && <span className="form-error-inline">{errors.email}</span>}
                </label>
                <input type="email" name="email" className="form-input"
                  value={formData.email} onChange={handleChange} required />
              </div>
              {/* 電話番号 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">電話番号 *</span>
                  {errors.phone && <span className="form-error-inline">{errors.phone}</span>}
                </label>
                <input type="tel" name="phone" className="form-input" inputMode="numeric" pattern="[0-9]*" maxLength={11} placeholder="09012345678"
                  value={formData.phone} onChange={handleChange} required />
              </div>
              {/* 郵便番号 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">郵便番号 *</span>
                  {errors.postalCode && <span className="form-error-inline">{errors.postalCode}</span>}
                </label>
                <div className="input-row">
                  <input type="text" name="postalCode" className="form-input" inputMode="numeric" pattern="[0-9]*" maxLength={7} placeholder="1234567"
                    value={formData.postalCode} onChange={handleChange} required />
                  <button type="button" className="input-btn" onClick={handleAddressLookup} disabled={isFetchingAddress || formData.postalCode.length !== 7}>
                    {isFetchingAddress ? '取得中' : '住所検索'}
                  </button>
                </div>
              </div>
              {/* 住所 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">住所 *</span>
                  {errors.address && <span className="form-error-inline">{errors.address}</span>}
                </label>
                <input type="text" name="address" className="form-input"
                  value={formData.address} onChange={handleChange} required />
              </div>
              {/* パスワード */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">パスワード *</span>
                  {errors.password && <span className="form-error-inline">{errors.password}</span>}
                </label>
                <input type="password" name="password" className="form-input"
                  value={formData.password} onChange={handleChange} required />
              </div>
              {/* パスワード確認 */}
              <div className="form-group">
                <label className="form-label form-label-row">
                  <span className="label-text">パスワード確認 *</span>
                  {errors.passwordConfirm && <span className="form-error-inline">{errors.passwordConfirm}</span>}
                </label>
                <input type="password" name="passwordConfirm" className="form-input"
                  value={formData.passwordConfirm} onChange={handleChange} required />
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
