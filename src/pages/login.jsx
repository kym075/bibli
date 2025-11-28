import { useState } from 'react';
import "../assets/css/login.css";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login attempt:', { email, password });
        // Redirect or handle success
    };

    return (
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">パスワード</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="パスワードを入力"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" id="rememberMe" />
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
                        <a href="/register" className="register-btn">新規登録はこちら</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
