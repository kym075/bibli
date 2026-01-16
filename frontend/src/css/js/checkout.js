document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const purchaseBtn = document.getElementById('purchaseBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const btnText = document.getElementById('btnText');
    const successMessage = document.getElementById('successMessage');

    // 購入ボタンの処理
    purchaseBtn.addEventListener('click', function() {
        // 確認ダイアログ
        if (!confirm('購入を確定してもよろしいですか？\n\n・商品：夏目漱石作品集\n・金額：¥1,550\n・お届け先：東京都渋谷区神南1-23-45\n\n※ご注文後のキャンセルはできません。')) {
            return;
        }

        // ボタンを無効化
        this.disabled = true;
        
        // ローディング表示
        loadingIndicator.style.display = 'flex';
        btnText.textContent = '';

        // 決済処理のシミュレーション
        setTimeout(() => {
            // 成功メッセージ表示
            successMessage.style.display = 'flex';
            
            // プログレスバーの更新
            updateProgressBar();
            
            // ページトップにスクロール
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // ボタンの状態を変更
            loadingIndicator.style.display = 'none';
            btnText.textContent = '購入完了';
            this.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            // 実際のアプリでは購入完了ページにリダイレクト
            setTimeout(() => {
                alert('購入完了ページに移動します');
                console.log('購入完了ページへリダイレクト');
                window.location.href = 'purchase_complete.html';
            }, 2000);
            
        }, 3000); // 3秒の処理時間をシミュレート
    });

    // プログレスバーの更新
    function updateProgressBar() {
        const steps = document.querySelectorAll('.progress-step');
        const dividers = document.querySelectorAll('.progress-divider');
        
        // ステップ2を完了状態に
        steps[1].classList.remove('active');
        steps[1].classList.add('completed');
        
        // ステップ3をアクティブに
        steps[2].classList.add('active');
        
        // 2番目の区切り線を完了状態に
        if (dividers[1]) {
            dividers[1].classList.add('completed');
        }
    }

    // 住所変更ボタンの処理
    document.getElementById('changeAddressBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        // 簡単な住所変更のシミュレーション
        const newAddress = prompt('新しい住所を入力してください（現在: 東京都渋谷区神南1-23-45）', '東京都渋谷区神南1-23-45');
        
        if (newAddress && newAddress.trim() !== '') {
            const addressLine = document.querySelector('.address-line');
            addressLine.textContent = newAddress;
            alert('お届け先を変更しました');
        }
    });

    // 支払い方法変更ボタンの処理
    document.getElementById('changePaymentBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        const paymentMethods = [
            'クレジットカード（VISA **** 1234）',
            'クレジットカード（MasterCard **** 5678）',
            'PayPay',
            '銀行振込',
            'コンビニ決済'
        ];
        
        const selectedMethod = prompt('支払い方法を選択してください\n\n' + paymentMethods.join('\n') + '\n\n番号を入力してください（行番号）:', '1');
        
        if (selectedMethod && selectedMethod >= 1 && selectedMethod <= 5) {
            const methodInfo = document.querySelector('.payment-method');
            const cardInfo = document.querySelector('.card-info');
            
            methodInfo.textContent = paymentMethods[selectedMethod - 1].split('（')[0];
            
            if (selectedMethod <= 2) {
                cardInfo.textContent = paymentMethods[selectedMethod - 1].split('（')[1].replace('）', '');
            } else {
                cardInfo.textContent = '選択済み';
            }
            
            alert('支払い方法を変更しました');
        }
    });

    // ページ離脱時の確認（購入処理中の場合）
    window.addEventListener('beforeunload', function(e) {
        if (purchaseBtn.disabled && btnText.textContent === '') {
            e.preventDefault();
            e.returnValue = '購入処理中です。ページを離れてもよろしいですか？';
        }
    });

    // セキュリティ情報の表示
    const securityInfo = document.querySelector('.security-info');
    securityInfo.addEventListener('click', function() {
        alert('SSL暗号化通信について\n\nお客様の個人情報や決済情報は、SSL（Secure Socket Layer）暗号化技術により保護されています。第三者による不正な傍受や改ざんから安全に守られているため、安心してお買い物をお楽しみください。');
    });

    // 商品画像のホバー効果
    const productImage = document.querySelector('.product-image');
    productImage.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    productImage.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });

    // 価格行のアニメーション
    const priceRows = document.querySelectorAll('.price-row');
    priceRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 200 + 500);
    });
});