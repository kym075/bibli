document.addEventListener('DOMContentLoaded', function() {
    // 通知サービスを取得
    const notificationService = typeof getNotificationService === 'function'
        ? getNotificationService()
        : null;

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

                // 通知サービスで既読にする
                const notificationId = this.dataset.notificationId;
                if (notificationService && notificationId) {
                    notificationService.markAsRead(notificationId);
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

    // 通知リストを動的に更新する関数
    function renderNotifications(notifications) {
        const notificationsPanel = document.getElementById('notifications-panel');
        const newsList = notificationsPanel.querySelector('.news-list');

        if (!notifications || notifications.length === 0) {
            // サンプル通知がある場合はそのまま表示
            return;
        }

        // 既存の動的に追加された通知をクリア（サンプルは残す）
        const dynamicItems = newsList.querySelectorAll('.notification-item[data-dynamic="true"]');
        dynamicItems.forEach(item => item.remove());

        // 通知を追加
        notifications.forEach(notification => {
            const notificationElement = createNotificationElement(notification);
            // サンプル通知の前に挿入
            const firstSampleItem = newsList.querySelector('.notification-item:not([data-dynamic="true"])');
            if (firstSampleItem) {
                newsList.insertBefore(notificationElement, firstSampleItem);
            } else {
                newsList.appendChild(notificationElement);
            }
        });

        // アニメーションを適用
        applyAnimations();
        updateUnreadCount();
    }

    // 通知要素を作成
    function createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification-item${notification.isRead ? '' : ' unread'}`;
        div.dataset.notificationId = notification.id;
        div.dataset.dynamic = 'true';

        const timeAgo = getTimeAgo(notification.createdAt);

        div.innerHTML = `
            ${!notification.isRead ? '<div class="unread-indicator"></div>' : ''}
            <div class="notification-header">
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            </div>
        `;

        // クリックイベント
        div.addEventListener('click', function() {
            if (this.classList.contains('unread')) {
                this.classList.remove('unread');
                const indicator = this.querySelector('.unread-indicator');
                if (indicator) indicator.remove();

                if (notificationService) {
                    notificationService.markAsRead(notification.id);
                }
                updateUnreadCount();
            }

            // リンクがあれば遷移
            if (notification.link) {
                window.location.href = notification.link;
            }
        });

        return div;
    }

    // 経過時間を計算
    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'たった今';
        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        if (diffDays < 7) return `${diffDays}日前`;

        return date.toLocaleDateString('ja-JP');
    }

    // 検索機能
    document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('検索:', this.value);
        }
    });

    // アニメーションを適用
    function applyAnimations() {
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

        document.querySelectorAll('.news-item, .notification-item').forEach(item => {
            if (item.style.opacity !== '1') {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(item);
            }
        });
    }

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

    // 通知サービスからデータを取得して表示
    if (notificationService) {
        // 初期データを取得
        const notifications = notificationService.getNotifications();
        if (notifications.length > 0) {
            renderNotifications(notifications);
        }

        // リスナーを追加して更新を監視
        notificationService.addListener((data) => {
            renderNotifications(data.notifications);
        });
    }

    // すべて既読にするボタン（オプション）
    const markAllReadBtn = document.createElement('button');
    markAllReadBtn.className = 'mark-all-read-btn';
    markAllReadBtn.textContent = 'すべて既読にする';
    markAllReadBtn.style.cssText = `
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        margin: 20px 0;
        transition: transform 0.2s, box-shadow 0.2s;
    `;
    markAllReadBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
    markAllReadBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
    markAllReadBtn.addEventListener('click', function() {
        // すべての通知を既読にする
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
            const indicator = item.querySelector('.unread-indicator');
            if (indicator) indicator.remove();
        });

        if (notificationService) {
            notificationService.markAllAsRead();
        }

        updateUnreadCount();
    });

    // 通知タブのコンテンツの先頭に追加
    const notificationsPanel = document.getElementById('notifications-panel');
    if (notificationsPanel) {
        const newsList = notificationsPanel.querySelector('.news-list');
        if (newsList) {
            notificationsPanel.insertBefore(markAllReadBtn, newsList);
        }
    }
});
