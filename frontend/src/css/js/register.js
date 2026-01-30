// アカウント登録フォームの処理
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
    const registerForm = document.getElementById('registerForm');
    const userIdInput = document.getElementById('userId');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const passwordError = document.getElementById('passwordError');

    // フォーム送信処理
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // バリデーション
        if (!validateForm()) {
            return;
        }

        // フォームデータの取得
        const formData = {
            userId: userIdInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value,
            agreeTerms: agreeTermsCheckbox.checked
        };

        // 登録処理のシミュレーション
        console.log('アカウント登録試行:', formData);

        // 実際のアプリケーションではここでAPIリクエストを送信
        // 例: fetch('/api/register', { method: 'POST', body: JSON.stringify(formData) })

        // シミュレーション: 成功メッセージとリダイレクト
        showMessage('アカウント登録が完了しました', 'success');

        // ログインページへリダイレクト
        window.location.href = 'login.html';
    });

    // バリデーション関数
    function validateForm() {
        let isValid = true;

        // ユーザーIDのバリデーション
        if (!userIdInput.value.trim()) {
            showError(userIdInput, 'ユーザーIDを入力してください');
            isValid = false;
        } else if (userIdInput.value.trim().length < 4) {
            showError(userIdInput, 'ユーザーIDは4文字以上で入力してください');
            isValid = false;
        } else if (!isValidUserId(userIdInput.value.trim())) {
            showError(userIdInput, '半角英数字とアンダースコア(_)のみ使用できます');
            isValid = false;
        } else {
            clearError(userIdInput);
        }

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

        // 電話番号のバリデーション
        if (!phoneInput.value.trim()) {
            showError(phoneInput, '電話番号を入力してください');
            isValid = false;
        } else if (!isValidPhone(phoneInput.value.trim())) {
            showError(phoneInput, '10桁または11桁の数字で入力してください');
            isValid = false;
        } else {
            clearError(phoneInput);
        }

        // パスワードのバリデーション
        if (!passwordInput.value) {
            showError(passwordInput, 'パスワードを入力してください');
            isValid = false;
        } else if (passwordInput.value.length < 8) {
            showError(passwordInput, 'パスワードは8文字以上で入力してください');
            isValid = false;
        } else if (!isValidPassword(passwordInput.value)) {
            showError(passwordInput, 'パスワードは英字と数字を含める必要があります');
            isValid = false;
        } else {
            clearError(passwordInput);
        }

        // パスワード確認のバリデーション
        if (!passwordConfirmInput.value) {
            passwordError.textContent = 'パスワード確認を入力してください';
            passwordConfirmInput.classList.add('error');
            isValid = false;
        } else if (passwordInput.value !== passwordConfirmInput.value) {
            passwordError.textContent = 'パスワードが一致しません';
            passwordConfirmInput.classList.add('error');
            isValid = false;
        } else {
            passwordError.textContent = '';
            passwordConfirmInput.classList.remove('error');
        }

        // 利用規約同意のバリデーション
        if (!agreeTermsCheckbox.checked) {
            showMessage('利用規約とプライバシーポリシーに同意してください', 'error');
            isValid = false;
        }

        return isValid;
    }

    // ユーザーIDの形式チェック
    function isValidUserId(userId) {
        const userIdRegex = /^[a-zA-Z0-9_]+$/;
        return userIdRegex.test(userId);
    }

    // メールアドレスの形式チェック
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 電話番号の形式チェック
    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10,11}$/;
        return phoneRegex.test(phone);
    }

    // パスワードの形式チェック（英字と数字を含む）
    function isValidPassword(password) {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasLetter && hasNumber;
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
        if (errorDiv && errorDiv.id !== 'passwordError') {
            errorDiv.remove();
        }
    }

    // リアルタイムバリデーション
    userIdInput.addEventListener('blur', function() {
        if (userIdInput.value.trim()) {
            if (userIdInput.value.trim().length < 4) {
                showError(userIdInput, 'ユーザーIDは4文字以上で入力してください');
            } else if (!isValidUserId(userIdInput.value.trim())) {
                showError(userIdInput, '半角英数字とアンダースコア(_)のみ使用できます');
            }
        }
    });

    userIdInput.addEventListener('input', function() {
        if (userIdInput.parentElement.querySelector('.error-message')) {
            clearError(userIdInput);
        }
    });

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

    phoneInput.addEventListener('blur', function() {
        if (phoneInput.value.trim() && !isValidPhone(phoneInput.value.trim())) {
            showError(phoneInput, '10桁または11桁の数字で入力してください');
        }
    });

    phoneInput.addEventListener('input', function() {
        if (phoneInput.parentElement.querySelector('.error-message')) {
            clearError(phoneInput);
        }
    });

    passwordInput.addEventListener('blur', function() {
        if (passwordInput.value) {
            if (passwordInput.value.length < 8) {
                showError(passwordInput, 'パスワードは8文字以上で入力してください');
            } else if (!isValidPassword(passwordInput.value)) {
                showError(passwordInput, 'パスワードは英字と数字を含める必要があります');
            }
        }
    });

    passwordInput.addEventListener('input', function() {
        if (passwordInput.parentElement.querySelector('.error-message')) {
            clearError(passwordInput);
        }
        // パスワード確認のチェックもリセット
        if (passwordConfirmInput.value && passwordInput.value === passwordConfirmInput.value) {
            passwordError.textContent = '';
            passwordConfirmInput.classList.remove('error');
        }
    });

    // パスワード確認のリアルタイムバリデーション
    passwordConfirmInput.addEventListener('input', function() {
        if (passwordInput.value && passwordConfirmInput.value) {
            if (passwordInput.value === passwordConfirmInput.value) {
                passwordError.textContent = '';
                passwordConfirmInput.classList.remove('error');
            } else {
                passwordError.textContent = 'パスワードが一致しません';
                passwordConfirmInput.classList.add('error');
            }
        }
    });
});
