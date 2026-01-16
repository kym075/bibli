// ログインフォームの処理

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
        alert('ログインに成功しました！');

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
