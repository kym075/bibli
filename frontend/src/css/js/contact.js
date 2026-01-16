// お問い合わせフォームの処理

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const categorySelect = document.getElementById('category');
    const subjectInput = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');
    const attachmentInput = document.getElementById('attachment');

    // フォーム送信処理
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // バリデーション
        if (!validateForm()) {
            return;
        }

        // フォームデータの取得
        const formData = new FormData();
        formData.append('name', nameInput.value.trim());
        formData.append('email', emailInput.value.trim());
        formData.append('category', categorySelect.value);
        formData.append('subject', subjectInput.value.trim());
        formData.append('message', messageTextarea.value.trim());

        if (attachmentInput.files.length > 0) {
            formData.append('attachment', attachmentInput.files[0]);
        }

        // お問い合わせ送信のシミュレーション
        console.log('お問い合わせ送信:', {
            name: formData.get('name'),
            email: formData.get('email'),
            category: formData.get('category'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            hasAttachment: attachmentInput.files.length > 0
        });

        // 実際のアプリケーションではここでAPIリクエストを送信
        // 例: fetch('/api/contact', { method: 'POST', body: formData })

        // シミュレーション: ローディング表示
        showLoading();

        // シミュレーション: 2秒後に成功メッセージ
        setTimeout(() => {
            hideLoading();
            showSuccessMessage();
            contactForm.reset();
        }, 2000);
    });

    // バリデーション関数
    function validateForm() {
        let isValid = true;

        // お名前のバリデーション
        if (!nameInput.value.trim()) {
            showError(nameInput, 'お名前を入力してください');
            isValid = false;
        } else {
            clearError(nameInput);
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

        // お問い合わせ種別のバリデーション
        if (!categorySelect.value) {
            showError(categorySelect, 'お問い合わせ種別を選択してください');
            isValid = false;
        } else {
            clearError(categorySelect);
        }

        // 件名のバリデーション
        if (!subjectInput.value.trim()) {
            showError(subjectInput, '件名を入力してください');
            isValid = false;
        } else {
            clearError(subjectInput);
        }

        // お問い合わせ内容のバリデーション
        if (!messageTextarea.value.trim()) {
            showError(messageTextarea, 'お問い合わせ内容を入力してください');
            isValid = false;
        } else if (messageTextarea.value.trim().length < 10) {
            showError(messageTextarea, 'お問い合わせ内容は10文字以上で入力してください');
            isValid = false;
        } else {
            clearError(messageTextarea);
        }

        // 添付ファイルのバリデーション
        if (attachmentInput.files.length > 0) {
            const file = attachmentInput.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file.size > maxSize) {
                showError(attachmentInput, 'ファイルサイズは5MB以下にしてください');
                isValid = false;
            } else {
                clearError(attachmentInput);
            }
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
            errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin-top: 0.4rem;';
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
    nameInput.addEventListener('blur', function() {
        if (!nameInput.value.trim()) {
            showError(nameInput, 'お名前を入力してください');
        }
    });

    nameInput.addEventListener('input', function() {
        if (nameInput.parentElement.querySelector('.error-message')) {
            clearError(nameInput);
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

    categorySelect.addEventListener('change', function() {
        if (categorySelect.parentElement.querySelector('.error-message')) {
            clearError(categorySelect);
        }
    });

    subjectInput.addEventListener('input', function() {
        if (subjectInput.parentElement.querySelector('.error-message')) {
            clearError(subjectInput);
        }
    });

    messageTextarea.addEventListener('input', function() {
        if (messageTextarea.parentElement.querySelector('.error-message')) {
            clearError(messageTextarea);
        }
    });

    attachmentInput.addEventListener('change', function() {
        if (attachmentInput.files.length > 0) {
            const file = attachmentInput.files[0];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file.size > maxSize) {
                showError(attachmentInput, 'ファイルサイズは5MB以下にしてください');
            } else {
                clearError(attachmentInput);
                console.log('添付ファイル:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            }
        }
    });

    // ローディング表示
    function showLoading() {
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';
        submitBtn.style.opacity = '0.6';
    }

    // ローディング非表示
    function hideLoading() {
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
        submitBtn.style.opacity = '1';
    }

    // 成功メッセージ表示
    function showSuccessMessage() {
        // 成功メッセージ要素を作成
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            background: #27ae60;
            color: white;
            padding: 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;
            font-weight: 600;
            animation: slideDown 0.3s ease;
        `;
        successMessage.textContent = 'お問い合わせを受け付けました。ご返信までしばらくお待ちください。';

        // アニメーションスタイルを追加
        if (!document.querySelector('#success-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'success-animation-styles';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // フォームの前に挿入
        contactForm.parentElement.insertBefore(successMessage, contactForm);

        // 5秒後にメッセージを削除
        setTimeout(() => {
            successMessage.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                successMessage.remove();
            }, 300);
        }, 5000);

        // ページトップにスクロール
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
