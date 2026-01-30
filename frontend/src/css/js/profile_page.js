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
            // === TAB SWITCHING FUNCTIONALITY ===
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
                    
                    console.log('タブ切り替え:', targetTab);
                });
            });

            // === PRODUCT SORT FUNCTIONALITY ===
            const sortButtons = document.querySelectorAll('.sort-btn');
            const productCards = document.querySelectorAll('.product-card');

            sortButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const targetStatus = this.dataset.status;
                    
                    // アクティブなソートボタンを変更
                    sortButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 商品カードを表示/非表示
                    productCards.forEach(card => {
                        const cardStatus = card.dataset.status;
                        
                        if (targetStatus === 'all' || cardStatus === targetStatus) {
                            card.classList.remove('hidden');
                        } else {
                            card.classList.add('hidden');
                        }
                    });
                    
                    console.log('商品フィルター:', targetStatus);
                });
            });

            // === FOLLOW BUTTON FUNCTIONALITY ===
            const followBtn = document.getElementById('followBtn');
            let isFollowing = false;
            
            followBtn.addEventListener('click', function() {
                isFollowing = !isFollowing;
                
                if (isFollowing) {
                    this.classList.add('following');
                    this.innerHTML = 'フォロー中';
                    
                    // フォロワー数を増やす
                    const followerCount = document.querySelector('.stat-item:last-child .stat-number');
                    const currentCount = parseInt(followerCount.textContent.replace(',', ''));
                    followerCount.textContent = (currentCount + 1).toLocaleString();
                    
                    // アニメーション効果
                    this.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 200);
                    
                } else {
                    this.classList.remove('following');
                    this.innerHTML = 'フォローする';
                    
                    // フォロワー数を減らす
                    const followerCount = document.querySelector('.stat-item:last-child .stat-number');
                    const currentCount = parseInt(followerCount.textContent.replace(',', ''));
                    followerCount.textContent = (currentCount - 1).toLocaleString();
                }
            });

            // === MESSAGE BUTTON FUNCTIONALITY ===
            document.querySelector('.btn-message').addEventListener('click', function() {
                console.log('メッセージ画面を開く');
                showMessage('メッセージ画面を開きます', 'info');
            });

            // === PRODUCT CARD CLICK FUNCTIONALITY ===
            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', function() {
                    const title = this.querySelector('.product-title').textContent;
                    console.log('商品詳細ページへ移動:', title);
                    showMessage(`「${title}」の詳細ページに移動します`, 'info');
                });
            });

            // === PURCHASE ITEM CLICK FUNCTIONALITY ===
            document.querySelectorAll('.purchase-item').forEach(item => {
                item.addEventListener('click', function() {
                    const title = this.querySelector('.purchase-title').textContent;
                    console.log('購入履歴詳細:', title);
                    showMessage(`「${title}」の購入履歴詳細を表示します`, 'info');
                });
            });

            // === SEARCH FUNCTIONALITY ===
            document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log('検索:', this.value);
                }
            });

            // === PROFILE AVATAR CLICK FUNCTIONALITY ===
            document.querySelector('.profile-avatar').addEventListener('click', function() {
                // プロフィール画像の拡大表示
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 300);
            });

            // === SMOOTH SCROLL EFFECTS ===
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

            // 商品カードにオブザーバーを適用
            document.querySelectorAll('.product-card').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    observer.observe(card);
                }, index * 100);
            });

            // === STATISTICS ANIMATION ===
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const finalValue = stat.textContent;
                const isCommaValue = finalValue.includes(',');
                const isDecimal = finalValue.includes('.');
                
                if (isDecimal) {
                    // 評価の場合（例：4.9）
                    const numValue = parseFloat(finalValue);
                    let currentValue = 0;
                    const increment = numValue / 50;
                    
                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= numValue) {
                            stat.textContent = finalValue;
                            clearInterval(timer);
                        } else {
                            stat.textContent = currentValue.toFixed(1);
                        }
                    }, 30);
                } else {
                    // 整数の場合
                    const numValue = parseInt(finalValue.replace(',', ''));
                    let currentValue = 0;
                    const increment = numValue / 50;
                    
                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= numValue) {
                            stat.textContent = isCommaValue ? numValue.toLocaleString() : finalValue;
                            clearInterval(timer);
                        } else {
                            const displayValue = Math.floor(currentValue);
                            stat.textContent = isCommaValue ? displayValue.toLocaleString() : displayValue;
                        }
                    }, 30);
                }
            });

            // === REVIEW ITEM HOVER EFFECTS ===
            document.querySelectorAll('.review-item').forEach(review => {
                review.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(5px)';
                    this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                });
                
                review.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateX(0)';
                    this.style.boxShadow = 'none';
                });
            });

            // === PURCHASE ITEM HOVER EFFECTS ===
            document.querySelectorAll('.purchase-card').forEach(purchase => {
                purchase.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                });
                
                purchase.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                });
            });

            // === DETAIL ITEM CLICK FUNCTIONALITY ===
            document.querySelectorAll('.detail-item').forEach(item => {
                item.addEventListener('click', function() {
                    const label = this.querySelector('.detail-label').textContent;
                    const value = this.querySelector('.detail-value').textContent;
                    console.log(`詳細情報: ${label} - ${value}`);
                });
            });

            // === REVIEW RATING CLICK FUNCTIONALITY ===
            document.querySelectorAll('.review-rating').forEach(rating => {
                rating.addEventListener('click', function() {
                    const stars = this.textContent;
                    console.log('評価をクリック:', stars);
                    showMessage(`この評価について詳細を表示します: ${stars}`, 'info');
                });
            });

            // === KEYBOARD NAVIGATION ===
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    const focusableElements = document.querySelectorAll('button, a, input, [tabindex]');
                    focusableElements.forEach(el => {
                        el.addEventListener('focus', function() {
                            this.style.outline = '2px solid #667eea';
                            this.style.outlineOffset = '2px';
                        });
                        el.addEventListener('blur', function() {
                            this.style.outline = 'none';
                        });
                    });
                }
            });

            // === HEADER SCROLL FUNCTIONALITY ===
            let lastScrollTop = 0;
            window.addEventListener('scroll', function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const header = document.querySelector('.header');
                
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // 下にスクロール
                    header.style.transform = 'translateY(-100%)';
                } else {
                    // 上にスクロール
                    header.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
            });

            // === PAGE LOAD COMPLETION ===
            window.addEventListener('load', function() {
                console.log('プロフィールページの読み込みが完了しました');
                
                // パフォーマンス測定（開発時のみ）
                if (window.performance) {
                    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                    console.log(`ページ読み込み時間: ${loadTime}ms`);
                }
            });
});
