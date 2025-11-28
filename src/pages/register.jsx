import { useState } from 'react';
import "../assets/css/register.css";

export default function Register() {
    const [formData, setFormData] = useState({
        userId: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirm: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.passwordConfirm) {
            setError('パスワードが一致しません');
            return;
        }
        // Handle register logic
        console.log('Register attempt:', formData);
        setError('');
        // Register and redirect
    };

    return (
        <main className="main-content">
            <div className="register-container">
                <div className="register-box">
                    <h1 className="register-title">新規登録</h1>
                    <p className="register-subtitle">Bibliのアカウントを作成</p>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="userId" className="form-label">ユーザーID <span className="required">*</span></label>
                            <input
                                type="text"
                                id="userId"
                                name="userId"
                                className="form-input"
                                placeholder="半角英数字4文字以上"
                                value={formData.userId}
                                onChange={handleChange}
                                required
                                minLength="4"
                            />
                            <div className="help-text">半角英数字とアンダースコア(_)が使用できます</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">メールアドレス <span className="required">*</span></label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">電話番号 <span className="required">*</span></label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="form-input"
                                placeholder="09012345678"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10,11}"
                            />
                            <div className="help-text">ハイフンなしで入力してください</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">パスワード <span className="required">*</span></label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="8文字以上のパスワード"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                            />
                            <div className="help-text">8文字以上、英字と数字を含めてください</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="passwordConfirm" className="form-label">パスワード確認 <span className="required">*</span></label>
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
                            />
                            {error && <div className="error-message">{error}</div>}
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input type="checkbox" id="agreeTerms" required />
                                <span><a href="#" className="link">利用規約</a>と<a href="#" className="link">プライバシーポリシー</a>に同意する</span>
                            </label>
                        </div>

                        <button type="submit" className="register-btn">アカウントを作成</button>
                    </form>

                    <div className="divider">
                        <span>または</span>
                    </div>

                    <div className="login-link">
                        <p>すでにアカウントをお持ちの方</p>
                        <a href="/login" className="login-link-btn">ログインはこちら</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
