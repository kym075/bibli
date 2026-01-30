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
    // ブレッドクラムのお知らせリンク
    document.getElementById('newsListLink').addEventListener('click', function(e) {
        e.preventDefault();
        console.log('お知らせ一覧ページへ移動');
        showMessage('お知らせ一覧ページに移動します', 'info');
    });

    // 関連記事のクリック処理
    document.querySelectorAll('.related-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const title = this.querySelector('.related-title-text').textContent;
            console.log('関連記事へ移動:', title);
            showMessage(`「${title}」の詳細ページに移動します`, 'info');
        });
    });

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

    // コンテンツセクションにアニメーションを適用
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // 印刷機能（Ctrl+P）
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });

    // ページ読み込み完了時のアニメーション
    setTimeout(() => {
        document.querySelectorAll('.content-section').forEach((section, index) => {
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 300);

    // テーブルの行にホバー効果を追加
    document.querySelectorAll('.schedule-table tr').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        row.addEventListener('mouseleave', function() {
            if (!this.querySelector('th')) {
                this.style.backgroundColor = '';
            }
        });
    });
});
