// インタラクティブな機能
document.addEventListener('DOMContentLoaded', function() {
    // 検索バーのフォーカス効果
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('focus', function() {
        this.style.transform = 'scale(1.02)';
    });
    searchInput.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });

    // カテゴリボタンのクリック効果
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 既存のアクティブクラスを削除
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // クリックされたボタンにアクティブクラスを追加
            this.classList.add('active');
            
            // 簡単なフィルタリング効果をシミュレート
            console.log('カテゴリ選択:', this.textContent);
        });
    });

    // 本カードのクリック効果
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        card.addEventListener('click', function() {
            console.log('商品詳細ページへ移動:', this.querySelector('.book-title').textContent);
        });
    });

    // ボタンのクリック効果（リンクがないボタンのみ）
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // リンク（aタグ）の場合は、デフォルト動作を維持
            if (this.tagName === 'A' && this.href) {
                console.log('リンククリック:', this.textContent, '→', this.href);
                // e.preventDefault() を呼ばないことで、リンク遷移を許可
            } else {
                e.preventDefault();
                console.log('ボタンクリック:', this.textContent);
            }
        });
    });
});