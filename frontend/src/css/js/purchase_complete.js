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
                
                for (let i = 0; i < 100; i++) {
                    const confettiPiece = document.createElement('div');
                    confettiPiece.className = 'confetti-piece';
                    confettiPiece.style.left = Math.random() * 100 + '%';
                    confettiPiece.style.animationDelay = Math.random() * 3 + 's';
                    confettiPiece.style.animationDuration = (Math.random() * 2 + 2) + 's';
                    confettiContainer.appendChild(confettiPiece);
                }

                // 7秒後に紙吹雪を削除
                setTimeout(() => {
                    confettiContainer.innerHTML = '';
                }, 7000);
            }

            // ページ読み込み時に紙吹雪を表示
            createConfetti();

            // ボタンのクリックイベント
            document.getElementById('homeBtn').addEventListener('click', function(e) {
                e.preventDefault();
                console.log('トップページへ移動');
                showMessage('トップページに移動します', 'info');
                window.location.href = 'index.html';
            });

            document.getElementById('historyBtn').addEventListener('click', function(e) {
                e.preventDefault();
                console.log('購入履歴ページへ移動');
                showMessage('マイページの購入履歴に移動します', 'info');
            });

            document.getElementById('contactBtn').addEventListener('click', function(e) {
                e.preventDefault();
                console.log('出品者とのメッセージ画面へ');
                showMessage('出品者とのメッセージ画面を開きます', 'info');
            });

            document.getElementById('supportBtn').addEventListener('click', function(e) {
                e.preventDefault();
                console.log('サポート問い合わせ');
                showMessage('サポート問い合わせフォームを開きます', 'info');
            });

            document.getElementById('shareBtn').addEventListener('click', function(e) {
                e.preventDefault();
                if (navigator.share) {
                    navigator.share({
                        title: 'Bibli で本を購入しました！',
                        text: '夏目漱石作品集を購入しました',
                        url: window.location.href
                    });
                } else {
                    // フォールバック
                    const text = 'Bibli で夏目漱石作品集を購入しました！';
                    navigator.clipboard.writeText(text).then(() => {
                        showMessage('シェアテキストをクリップボードにコピーしました', 'success');
                    });
                }
            });

            // カウントダウン機能
            function startCountdown() {
                const countdownElement = document.getElementById('countdown');
                let hours = 48;
                
                function updateCountdown() {
                    if (hours > 0) {
                        countdownElement.textContent = `発送まで最大 ${hours}時間 お待ちください`;
                        hours--;
                        setTimeout(updateCountdown, 3600000); // 1時間ごとに更新
                    } else {
                        countdownElement.textContent = '発送予定時刻を過ぎました。出品者にお問い合わせください。';
                        countdownElement.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
                    }
                }
                
                // デモ用に5秒ごとに1時間減らす
                function demoCountdown() {
                    if (hours > 0) {
                        countdownElement.textContent = `発送まで最大 ${hours}時間 お待ちください`;
                        hours--;
                        setTimeout(demoCountdown, 5000);
                    } else {
                        countdownElement.textContent = '出品者が発送準備中です';
                        countdownElement.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                    }
                }
                
                // デモ版のカウントダウンを開始
                setTimeout(demoCountdown, 5000);
            }

            startCountdown();

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

            // 成功アイコンの追加アニメーション
            const successIcon = document.querySelector('.success-icon');
            setTimeout(() => {
                successIcon.style.animation = 'bounce 1.5s ease-out, rotate 2s ease-in-out 2s infinite';
            }, 2000);

            // ページ表示から一定時間後にメッセージ表示
            setTimeout(() => {
                if (confirm('購入完了メールが届かない場合は、迷惑メールフォルダもご確認ください。\n\nサポートにお問い合わせしますか？')) {
                    document.getElementById('supportBtn').click();
                }
            }, 30000); // 30秒後

            // 注文詳細の動的更新（デモ用）
            setTimeout(() => {
                const orderRows = document.querySelectorAll('.order-row');
                orderRows[3].querySelector('.order-value').textContent = '出品者が確認中...';
                orderRows[3].querySelector('.order-value').style.color = '#f39c12';
            }, 10000);

            // ページ離脱前の確認（オプション）
            let hasInteracted = false;
            document.addEventListener('click', () => hasInteracted = true);
            
            window.addEventListener('beforeunload', function(e) {
                if (!hasInteracted) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            });
        });
