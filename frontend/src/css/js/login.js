// ログインフォームの処理
const showMessage = (message, type = 'info', options = {}) => {
    if (typeof window.showAppMessage !== 'function') {
        window.showAppMessage = (msg, t = 'info', opts = {}) => {
            const duration = typeof opts.duration === 'number' ? opts.duration : 4000;
            const root = document.querySelector('.main-content') || document.body;
            let banner = document.querySelector('.page-message');

            if (!banner) {
                banner = document.createElement('div');
                banner.className = 'page-message';
                if (root.firstChild) {
                    root.insertBefore(banner, root.firstChild);
                } else {
                    root.appendChild(banner);
                }
            }

            banner.textContent = msg;
            banner.classList.remove('error', 'success', 'info');
            banner.classList.add(t, 'visible');

            if (banner._timer) {
                clearTimeout(banner._timer);
            }

            if (duration > 0) {
                banner._timer = setTimeout(() => {
                    banner.classList.remove('visible');
                }, duration);
            }
        };
    }

    window.showAppMessage(message, type, options);
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // フォーム送信処理
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // バリデーション
        if (!validateForm()) {
            return;
        }

        // フォームデータの取得
        const formData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            rememberMe: rememberMeCheckbox.checked
        };

        // ログイン処理のシミュレーション
        console.log('ログイン試行:', formData);

        // 実際のアプリケーションではここでAPIリクエストを送信
        // 例: fetch('/api/login', { method: 'POST', body: JSON.stringify(formData) })

        // シミュレーション: 成功メッセージとリダイレクト
        showMessage('ログインに成功しました', 'success');

        // プロフィールページへリダイレクト
        window.location.href = 'profile_page.html';
    });

    // バリデーション関数
    function validateForm() {
        let isValid = true;

        // メールアドレスのバリデーション
        if (!emailInput.value.trim()) {
            showError(emailInput, 'メールアドレスを入力してください');
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showError(emailInput, '有効なメールアドレスを入力してください');
            isValid = false;
        } else {
            clearError(emailInput);
        }

        // パスワードのバリデーション
        if (!passwordInput.value) {
            showError(passwordInput, 'パスワードを入力してください');
            isValid = false;
        } else {
            clearError(passwordInput);
        }

        return isValid;
    }

    // メールアドレスの形式チェック
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // エラー表示
    function showError(input, message) {
        input.style.borderColor = '#e74c3c';

        // エラーメッセージの追加（既存のものがなければ）
        let errorDiv = input.parentElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            input.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    // エラークリア
    function clearError(input) {
        input.style.borderColor = '#e0e0e0';

        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // リアルタイムバリデーション
    emailInput.addEventListener('blur', function() {
        if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
            showError(emailInput, '有効なメールアドレスを入力してください');
        }
    });

    emailInput.addEventListener('input', function() {
        if (emailInput.parentElement.querySelector('.error-message')) {
            clearError(emailInput);
        }
    });

    passwordInput.addEventListener('input', function() {
        if (passwordInput.parentElement.querySelector('.error-message')) {
            clearError(passwordInput);
        }
    });
});
