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
        showMessage('カートに追加されました', 'success');
    });

    document.querySelector('.btn-outline').addEventListener('click', function() {
        showMessage('値下げ依頼を送信しました', 'success');
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
            showMessage('お気に入りに追加されました', 'success');
        } else {
            this.style.background = 'white';
            this.style.color = '#667eea';
            this.style.borderColor = '#667eea';
            showMessage('お気に入りから削除されました', 'info');
        }
    });

    // チャットボタンの処理
    document.querySelector('.communication-actions .btn-primary').addEventListener('click', function() {
        showMessage('チャット画面を開きます', 'info');
    });

    // フォローボタンの処理
    const followBtn = document.querySelector('.seller-info .btn-secondary');
    let isFollowing = false;
    
    followBtn.addEventListener('click', function() {
        isFollowing = !isFollowing;
        if (isFollowing) {
            this.textContent = 'フォロー中';
            this.style.background = '#2ecc71';
            this.style.borderColor = '#2ecc71';
        } else {
            this.textContent = 'フォロー';
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
