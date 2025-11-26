import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/login.css";

export default function Login() {
    const markup = `
        <div class="login-container">
            <div class="login-box">
                <h1 class="login-title">ログイン</h1>
                <p class="login-subtitle">Bibliへようこそ</p>

                <form id="loginForm" class="login-form">
                    <div class="form-group">
                        <label for="email" class="form-label">メールアドレス</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            class="form-input"
                            placeholder="example@email.com"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">パスワード</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            class="form-input"
                            placeholder="パスワードを入力"
                            required
                        >
                    </div>

                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="rememberMe">
                            <span>ログイン状態を保持する</span>
                        </label>
                        <a href="#" class="forgot-password">パスワードをお忘れの方</a>
                    </div>

                    <button type="submit" class="login-btn">ログイン</button>
                </form>

                <div class="divider">
                    <span>または</span>
                </div>

                <div class="register-link">
                    <p>アカウントをお持ちでない方</p>
                    <a href="register.html" class="register-btn">新規登録はこちら</a>
                </div>
            </div>
        </div>
    `;

    return (
        <>
            <Header />
            <main className="main-content" dangerouslySetInnerHTML={{ __html: markup }} />
            <Footer />
        </>
    );
}
