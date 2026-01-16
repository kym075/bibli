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
        alert('マイページの出品商品一覧に移動します');
    });

    document.getElementById('continueBtn').addEventListener('click', function(e) {
        e.preventDefault();
        // 出品ページへ移動
        console.log('出品ページへ移動');
        alert('新規出品ページに移動します');
    });

    document.getElementById('homeBtn').addEventListener('click', function(e) {
        e.preventDefault();
        // トップページへ移動
        console.log('トップページへ移動');
        alert('トップページに移動します');
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