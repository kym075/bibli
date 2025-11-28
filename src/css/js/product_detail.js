document.addEventListener('DOMContentLoaded', function() {
    // サムネイル画像の切り替え
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // アクティブクラスの切り替え
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // メイン画像の変更（実際の実装では画像URLを変更）
            mainImage.style.background = `linear-gradient(45deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`;
            
            console.log('画像切り替え:', this.dataset.image);
        });
    });

    // ボタンクリック処理
    document.querySelector('.btn-cart').addEventListener('click', function() {
        alert('カートに追加されました');
    });

    document.querySelector('.btn-outline').addEventListener('click', function() {
        alert('値下げ依頼を送信しました');
    });

    // お気に入りボタンの処理
    const favoriteBtn = document.querySelectorAll('.btn-outline')[1];
    let isFavorite = false;
    
    favoriteBtn.addEventListener('click', function() {
        isFavorite = !isFavorite;
        if (isFavorite) {
            this.style.background = '#ff6b6b';
            this.style.color = 'white';
            this.style.borderColor = '#ff6b6b';
            alert('お気に入りに追加されました');
        } else {
            this.style.background = 'white';
            this.style.color = '#667eea';
            this.style.borderColor = '#667eea';
            alert('お気に入りから削除されました');
        }
    });

    // チャットボタンの処理
    document.querySelector('.communication-actions .btn-primary').addEventListener('click', function() {
        alert('チャット画面を開きます');
    });

    // フォローボタンの処理
    const followBtn = document.querySelector('.seller-info .btn-secondary');
    let isFollowing = false;
    
    followBtn.addEventListener('click', function() {
        isFollowing = !isFollowing;
        if (isFollowing) {
            this.textContent = '✅ フォロー中';
            this.style.background = '#2ecc71';
            this.style.borderColor = '#2ecc71';
        } else {
            this.textContent = '👤 フォロー';
            this.style.background = 'rgba(255,255,255,0.2)';
            this.style.borderColor = 'rgba(255,255,255,0.3)';
        }
    });

    // 検索バーの処理
    document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('検索:', this.value);
        }
    });
});