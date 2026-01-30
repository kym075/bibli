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
    // 紙吹雪エフェクト
    function createConfetti() {
        const confettiContainer = document.getElementById('confetti');
        
        // 50個の紙吹雪を作成
        for (let i = 0; i < 50; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = 'confetti-piece';
            confettiPiece.style.left = Math.random() * 100 + '%';
            confettiPiece.style.animationDelay = Math.random() * 3 + 's';
            confettiPiece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confettiContainer.appendChild(confettiPiece);
        }

        // 5秒後に紙吹雪を削除
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 5000);
    }

    // ページ読み込み時に紙吹雪を表示
    createConfetti();

    // ボタンのクリックイベント
    document.getElementById('checkBtn').addEventListener('click', function(e) {
        e.preventDefault();
        // マイページの出品商品一覧へ移動
        console.log('出品商品確認ページへ移動');
        showMessage('マイページの出品商品一覧に移動します', 'info');
    });

    document.getElementById('continueBtn').addEventListener('click', function(e) {
        e.preventDefault();
        // 出品ページへ移動
        console.log('出品ページへ移動');
        showMessage('新規出品ページに移動します', 'info');
    });

    document.getElementById('homeBtn').addEventListener('click', function(e) {
        e.preventDefault();
        // トップページへ移動
        console.log('トップページへ移動');
        showMessage('トップページに移動します', 'info');
    });

    // 検索機能
    document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('検索:', this.value);
        }
    });

    // ホバーエフェクトの強化
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-3px) scale(1)';
        });
    });

    // 統計カードのアニメーション
    const statCards = document.querySelectorAll('.stat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const number = entry.target.querySelector('.stat-number');
                const finalValue = parseInt(number.textContent);
                let currentValue = 0;
                
                const increment = finalValue / 30;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        number.textContent = finalValue + (number.textContent.includes('%') ? '%' : '');
                        clearInterval(timer);
                    } else {
                        number.textContent = Math.floor(currentValue) + (number.textContent.includes('%') ? '%' : '');
                    }
                }, 50);
            }
        });
    });

    statCards.forEach(card => {
        observer.observe(card);
    });

    // ページ離脱時の確認（開発時は無効化）
    // window.addEventListener('beforeunload', function(e) {
    //     const message = 'このページを離れますか？';
    //     e.returnValue = message;
    //     return message;
    // });

    // 成功メッセージのタイピング効果
    const messageElement = document.querySelector('.success-message');
    const originalText = messageElement.innerHTML;
    messageElement.innerHTML = '';
    
    let index = 0;
    function typeMessage() {
        if (index < originalText.length) {
            messageElement.innerHTML = originalText.substring(0, index + 1);
            index++;
            setTimeout(typeMessage, 30);
        }
    }
    
    // 1秒後にタイピング開始
    setTimeout(typeMessage, 1000);
});
