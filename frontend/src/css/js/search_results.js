document.addEventListener('DOMContentLoaded', function() {
    // お気に入りボタンの処理
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('favorite-btn')) {
            const btn = e.target;
            const isActive = btn.classList.contains('active');
            
            if (isActive) {
                btn.classList.remove('active');
                btn.innerHTML = 'LIKE';
                btn.title = 'お気に入りに追加';
            } else {
                btn.classList.add('active');
                btn.innerHTML = 'LIKED';
                btn.title = 'お気に入りから削除';
            }
            
            // アニメーション効果
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        }
    });

    // 商品カードのクリック処理
    document.addEventListener('click', function(e) {
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.classList.contains('favorite-btn')) {
            const title = productCard.querySelector('.product-title').textContent;
            console.log('商品詳細ページへ移動:', title);
        }
    });

    // ソート機能
    document.getElementById('sortSelect').addEventListener('change', function() {
        showLoading();
        setTimeout(() => {
            // 実際のアプリでは、ここでAPIを呼び出してソート結果を取得
            console.log('ソート変更:', this.value);
            hideLoading();
            // 商品を再描画（実装例）
            animateProductsRefresh();
        }, 1000);
    });

    // 価格フィルター
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    function applyPriceFilter() {
        const min = minPrice.value;
        const max = maxPrice.value;
        
        if (min || max) {
            showLoading();
            setTimeout(() => {
                console.log('価格フィルター適用:', min, '-', max);
                hideLoading();
                animateProductsRefresh();
            }, 800);
        }
    }

    minPrice.addEventListener('blur', applyPriceFilter);
    maxPrice.addEventListener('blur', applyPriceFilter);

    // 条件フィルター
    document.getElementById('conditionSelect').addEventListener('change', function() {
        if (this.value) {
            showLoading();
            setTimeout(() => {
                console.log('商品状態フィルター:', this.value);
                hideLoading();
                animateProductsRefresh();
            }, 600);
        }
    });

    // 販売形式フィルター
    document.getElementById('saleTypeSelect').addEventListener('change', function() {
        if (this.value) {
            showLoading();
            setTimeout(() => {
                console.log('販売形式フィルター:', this.value);
                hideLoading();
                animateProductsRefresh();
            }, 600);
        }
    });

    // ページネーション
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('pagination-btn') && !e.target.classList.contains('disabled')) {
            e.preventDefault();
            
            // アクティブページの更新
            document.querySelectorAll('.pagination-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            if (!e.target.textContent.includes('前へ') && !e.target.textContent.includes('次へ')) {
                e.target.classList.add('active');
            }
            
            showLoading();
            setTimeout(() => {
                console.log('ページ変更:', e.target.textContent);
                hideLoading();
                animateProductsRefresh();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 800);
        }
    });

    // 検索機能
    document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const keyword = this.value.trim();
            if (keyword) {
                showLoading();
                setTimeout(() => {
                    document.querySelector('.search-keyword').textContent = keyword;
                    document.querySelector('.results-count').textContent = Math.floor(Math.random() * 200) + 1;
                    hideLoading();
                    animateProductsRefresh();
                }, 1000);
            }
        }
    });

    // ローディング表示
    function showLoading() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '<div class="loading">検索中...</div>';
    }

    function hideLoading() {
        // 実際のアプリでは、ここで新しい商品データを描画
    }
});
