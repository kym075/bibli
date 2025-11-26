import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/register.css";

export default function Register() {
    const markup = `
        <div class="register-container">
            <div class="register-box">
                <h1 class="register-title">新規登録</h1>
                <p class="register-subtitle">Bibliのアカウントを作成</p>

                <form id="registerForm" class="register-form">
                    <div class="form-group">
                        <label for="userId" class="form-label">ユーザーID <span class="required">*</span></label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            class="form-input"
                            placeholder="半角英数字4文字以上"
                            required
                            minlength="4"
                        >
                    </div>

                    <div class="form-group">
                        <label for="email" class="form-label">メールアドレス <span class="required">*</span></label>
                        <input type="email" id="email" name="email" class="form-input" placeholder="example@email.com" required>
                    </div>

                    <button type="submit" class="register-btn">アカウントを作成</button>
                </form>
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
