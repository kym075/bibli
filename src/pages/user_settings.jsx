import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/user_settings.css";

export default function UserSettings() {
    const markup = `
        <h1 class="settings-title">ユーザー設定</h1>
        <form class="user-settings-form">
            <div class="form-group">
                <label for="userid">ユーザーID:</label>
                <input type="text" id="userid" name="userid" placeholder="新しいユーザーIDを入力">
            </div>
            <div class="form-group">
                <label for="username">ユーザー名:</label>
                <input type="text" id="username" name="username" placeholder="新しいユーザー名を入力">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-save">保存</button>
            </div>
        </form>
    `;

    return (
        <>
            <Header />
            <main className="main-content" dangerouslySetInnerHTML={{ __html: markup }} />
            <Footer />
        </>
    );
}
