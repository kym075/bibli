document.addEventListener('DOMContentLoaded', function() {
    // フォーム要素の取得
    const form = document.getElementById('postForm');
    const categorySelect = document.getElementById('category');
    const titleInput = document.getElementById('title');
    const contentTextarea = document.getElementById('content');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    // カウンター要素
    const titleCount = document.getElementById('titleCount');
    const contentCount = document.getElementById('contentCount');
    
    // プレビュー要素
    const previewContainer = document.getElementById('previewContainer');
    const previewCategory = document.getElementById('previewCategory');
    const previewTitle = document.getElementById('previewTitle');
    const previewContent = document.getElementById('previewContent');

    // カテゴリ設定
    const categorySettings = {
        chat: { name: '雑談', color: '#2ecc71' },
        question: { name: '質問', color: '#f39c12' },
        discussion: { name: '考察', color: '#e74c3c' },
        recruitment: { name: '募集', color: '#9b59b6' },
        recommendation: { name: 'おすすめ', color: '#3498db' },
        review: { name: '感想・レビュー', color: '#1abc9c' }
    };

    // 戻るボタンの処理
    document.getElementById('backToForum').addEventListener('click', function(e) {
        e.preventDefault();
        
        // 未保存の内容がある場合は確認
        if (titleInput.value.trim() || contentTextarea.value.trim()) {
            if (confirm('入力した内容が失われますが、よろしいですか？')) {
                console.log('掲示板一覧ページへ戻る');
                alert('掲示板一覧ページに戻ります');
                window.location.href = 'forum.html';
            }
        } else {
            console.log('掲示板一覧ページへ戻る');
            alert('掲示板一覧ページに戻ります');
            window.location.href = 'forum.html';
        }
    });

    // 文字数カウント機能
    titleInput.addEventListener('input', function() {
        const length = this.value.length;
        titleCount.textContent = length;
        
        if (length > 80) {
            titleCount.style.color = '#e74c3c';
        } else if (length > 60) {
            titleCount.style.color = '#f39c12';
        } else {
            titleCount.style.color = '#7f8c8d';
        }
        
        updatePreview();
        validateForm();
    });

    contentTextarea.addEventListener('input', function() {
        const length = this.value.length;
        contentCount.textContent = length;
        
        if (length > 1800) {
            contentCount.style.color = '#e74c3c';
        } else if (length > 1500) {
            contentCount.style.color = '#f39c12';
        } else {
            contentCount.style.color = '#7f8c8d';
        }
        
        updatePreview();
        validateForm();
    });

    // カテゴリ変更時の処理
    categorySelect.addEventListener('change', function() {
        updatePreview();
        validateForm();
    });

    // プレビュー更新
    function updatePreview() {
        const category = categorySelect.value;
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();

        if (category || title || content) {
            previewContainer.classList.add('active');
            
            // カテゴリ表示
            if (category && categorySettings[category]) {
                previewCategory.textContent = categorySettings[category].name;
                previewCategory.style.background = categorySettings[category].color;
            } else {
                previewCategory.textContent = 'カテゴリ';
                previewCategory.style.background = '#95a5a6';
            }
            
            // タイトル表示
            previewTitle.textContent = title || 'タイトルをここに入力してください';
            
            // 本文表示
            previewContent.textContent = content || '本文をここに入力してください...';
        } else {
            previewContainer.classList.remove('active');
        }
    }

    // フォームバリデーション
    function validateForm() {
        const category = categorySelect.value;
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        
        // エラーメッセージのクリア
        clearErrors();
        
        let isValid = true;
        
        if (!category) {
            showError(categorySelect, 'カテゴリを選択してください。');
            isValid = false;
        }
        
        if (!title) {
            showError(titleInput, 'タイトルを入力してください。');
            isValid = false;
        } else if (title.length < 5) {
            showError(titleInput, 'タイトルは5文字以上で入力してください。');
            isValid = false;
        }
        
        if (!content) {
            showError(contentTextarea, '本文を入力してください。');
            isValid = false;
        } else if (content.length < 10) {
            showError(contentTextarea, '本文は10文字以上で入力してください。');
            isValid = false;
        }
        
        submitBtn.disabled = !isValid;
        return isValid;
    }

    // エラー表示
    function showError(element, message) {
        element.classList.add('field-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        element.parentNode.appendChild(errorDiv);
    }

    // エラークリア
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.field-error').forEach(field => field.classList.remove('field-error'));
    }

    // フォーム送信処理
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = '投稿中...';
        
        // 実際のアプリでは、ここでAPIにデータを送信
        setTimeout(() => {
            successMessage.style.display = 'flex';
            form.reset();
            previewContainer.classList.remove('active');
            titleCount.textContent = '0';
            contentCount.textContent = '0';
            submitBtn.textContent = '✏️ 投稿する';
            submitBtn.disabled = true;
            
            // ページトップにスクロール
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // 下書きを削除
            localStorage.removeItem('forum_draft');
        }, 2000);
    });

    // 下書き保存機能
    document.getElementById('saveDraftBtn').addEventListener('click', function() {
        const draft = {
            category: categorySelect.value,
            title: titleInput.value,
            content: contentTextarea.value,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('forum_draft', JSON.stringify(draft));
        alert('下書きを保存しました');
    });

    // 下書き読み込み機能
    document.getElementById('loadDraftBtn').addEventListener('click', function() {
        const draft = localStorage.getItem('forum_draft');
        
        if (draft) {
            const draftData = JSON.parse(draft);
            
            if (confirm('保存された下書きを読み込みますか？現在の内容は失われます。')) {
                categorySelect.value = draftData.category || '';
                titleInput.value = draftData.title || '';
                contentTextarea.value = draftData.content || '';
                
                // カウンターとプレビューを更新
                titleCount.textContent = titleInput.value.length;
                contentCount.textContent = contentTextarea.value.length;
                updatePreview();
                validateForm();
                
                alert('下書きを読み込みました');
            }
        } else {
            alert('保存された下書きがありません');
        }
    });

    // 検索機能
    document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('検索:', this.value);
        }
    });

    // ページ離脱時の確認
    window.addEventListener('beforeunload', function(e) {
        if (titleInput.value.trim() || contentTextarea.value.trim()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // 初期状態の設定
    validateForm();
});