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
    // 画像アップロード処理
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    let uploadedImages = [];

    // クリックでファイル選択
    imageUploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // ドラッグ&ドロップ処理
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('dragover');
    });

    imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.classList.remove('dragover');
    });

    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handleImageFiles(files);
    });

    // ファイル選択時の処理
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleImageFiles(files);
    });

    // 画像ファイル処理
    function handleImageFiles(files) {
        files.forEach(file => {
            if (uploadedImages.length >= 10) {
                showMessage('画像は最大10枚まで登録できます。', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showMessage('ファイルサイズは5MB以下にしてください。', 'error');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showMessage('画像ファイルのみアップロード可能です。', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImages.push(e.target.result);
                updateImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }

    // 画像プレビューの更新
    function updateImagePreviews() {
        imagePreviewContainer.innerHTML = '';
        uploadedImages.forEach((image, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `
                <img src="${image}" alt="プレビュー ${index + 1}">
                <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
                ${index === 0 ? '<span class="main-image-badge">メイン</span>' : ''}
            `;
            imagePreviewContainer.appendChild(previewItem);
        });

        // 削除ボタンのイベント
        document.querySelectorAll('.remove-image-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                uploadedImages.splice(index, 1);
                updateImagePreviews();
            });
        });
    }

    // 価格計算機能
    const priceInput = document.getElementById('price');
    const salePriceEl = document.getElementById('salePrice');
    const feeEl = document.getElementById('fee');
    const profitEl = document.getElementById('profit');

    if (priceInput) {
        priceInput.addEventListener('input', updatePriceCalculator);
    }

    function updatePriceCalculator() {
        const price = parseInt(priceInput.value) || 0;
        const fee = Math.floor(price * 0.1);
        const profit = price - fee;

        if (salePriceEl) salePriceEl.textContent = `¥${price.toLocaleString()}`;
        if (feeEl) feeEl.textContent = `-¥${fee.toLocaleString()}`;
        if (profitEl) profitEl.textContent = `¥${profit.toLocaleString()}`;
    }

    // 販売形式のラジオボタン
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            radioOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });

    // タグ入力機能
    const tagInput = document.getElementById('tagInput');
    const tagsContainer = document.getElementById('tagsContainer');
    let tags = [];

    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = this.value.trim();
                if (tag && !tags.includes(tag) && tags.length < 10) {
                    tags.push(tag);
                    updateTagsDisplay();
                    this.value = '';
                }
            }
        });
    }

    function updateTagsDisplay() {
        if (!tagsContainer) return;
        tagsContainer.innerHTML = '';
        tags.forEach((tag, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-item';
            tagEl.innerHTML = `${tag} <button type="button" class="remove-tag" data-index="${index}">&times;</button>`;
            tagsContainer.appendChild(tagEl);
        });

        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                tags.splice(index, 1);
                updateTagsDisplay();
            });
        });
    }

    // フォーム送信処理
    const listingForm = document.getElementById('listingForm');
    if (listingForm) {
        listingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // バリデーション
            const bookTitle = document.getElementById('bookTitle').value.trim();
            const category = document.getElementById('category').value;
            const condition = document.getElementById('condition').value;
            const description = document.getElementById('description').value.trim();
            const price = document.getElementById('price').value;
            const shipping = document.getElementById('shipping').value;

            if (!bookTitle || !category || !condition || !description || !price || !shipping) {
                showMessage('必須項目を入力してください。', 'error');
                return;
            }

            if (uploadedImages.length === 0) {
                showMessage('商品画像を1枚以上アップロードしてください。', 'error');
                return;
            }

            // 出品データを作成
            const listingData = {
                id: 'listing_' + Date.now(),
                title: bookTitle,
                category: category,
                condition: condition,
                description: description,
                passion: document.getElementById('passion').value.trim(),
                tags: tags,
                price: parseInt(price),
                shipping: shipping,
                images: uploadedImages,
                createdAt: new Date().toISOString()
            };

            // ローカルストレージに保存（デモ用）
            saveListingToStorage(listingData);

            // 通知を送信
            sendListingCompleteNotification(bookTitle, listingData.id);

            // 成功メッセージを表示
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth' });
            }

            // 出品完了ページにリダイレクト
            setTimeout(() => {
                window.location.href = 'listing_complete.html';
            }, 1500);
        });
    }

    // 出品データをローカルストレージに保存
    function saveListingToStorage(listingData) {
        try {
            const listings = JSON.parse(localStorage.getItem('bibli_listings') || '[]');
            listings.push(listingData);
            localStorage.setItem('bibli_listings', JSON.stringify(listings));

            // 最新の出品情報を保存（完了ページで使用）
            localStorage.setItem('bibli_latest_listing', JSON.stringify(listingData));
        } catch (e) {
            console.error('Failed to save listing:', e);
        }
    }

    // 出品完了通知を送信
    function sendListingCompleteNotification(productName, productId) {
        // 通知サービスが利用可能な場合
        if (typeof getNotificationService === 'function') {
            const notificationService = getNotificationService();
            notificationService.notifyListingComplete(productName, productId);
        } else {
            // 通知サービスがない場合はローカルストレージに直接保存
            const notification = {
                id: 'notif_' + Date.now(),
                type: 'listing_complete',
                title: '出品が完了しました',
                message: `「${productName}」の出品が完了しました。審査後に公開されます。`,
                icon: '🎉',
                isRead: false,
                createdAt: new Date().toISOString(),
                link: `product_detail.html?id=${productId}`,
                data: { productId, productName }
            };

            try {
                const notifications = JSON.parse(localStorage.getItem('bibli_notifications') || '[]');
                notifications.unshift(notification);
                localStorage.setItem('bibli_notifications', JSON.stringify(notifications));
            } catch (e) {
                console.error('Failed to save notification:', e);
            }
        }
    }
});
