document.addEventListener('DOMContentLoaded', function() {
    // タブ切り替え機能
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // アクティブなタブボタンを変更
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // アクティブなタブパネルを変更
            tabPanels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(targetTab + '-panel').classList.add('active');
        });
    });

    // お知らせアイテムのクリック処理
    document.querySelectorAll('.news-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.classList.contains('read-more')) {
                const title = this.querySelector('.news-title').textContent;
                console.log('お知らせ詳細ページへ移動:', title);
                // 実際のアプリでは詳細ページにリダイレクト
            }
        });
    });

    // 通知アイテムのクリック処理
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('.notification-title').textContent;
            console.log('通知詳細:', title);
            
            // 未読通知を既読にする
            if (this.classList.contains('unread')) {
                this.classList.remove('unread');
                const indicator = this.querySelector('.unread-indicator');
                if (indicator) {
                    indicator.remove();
                }
                updateUnreadCount();
            }
        });
    });

    // 未読件数の更新
    function updateUnreadCount() {
        const unreadItems = document.querySelectorAll('.notification-item.unread').length;
        const unreadCountElement = document.getElementById('unreadCount');
        
        if (unreadItems > 0) {
            unreadCountElement.textContent = unreadItems;
            unreadCountElement.style.display = 'inline';
        } else {
            unreadCountElement.style.display = 'none';
        }
    }


    // 検索機能
    document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('検索:', this.value);
        }
    });

    // スムーズスクロール効果
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 全てのニュースアイテムと通知アイテムにオブザーバーを適用
    document.querySelectorAll('.news-item, .notification-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    // ページ読み込み時のアニメーション
    setTimeout(() => {
        document.querySelectorAll('.news-item, .notification-item').forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);

    // 初期の未読件数設定
    updateUnreadCount();
});