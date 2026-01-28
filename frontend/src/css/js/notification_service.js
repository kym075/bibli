/**
 * 通知サービス
 * お知らせ機能の中核となるサービス
 * - 通知の作成・取得・更新
 * - 運営からのお知らせ取得
 * - リアルタイム通知リスナー
 */

// 通知タイプの定義
const NotificationType = {
    LISTING_COMPLETE: 'listing_complete',     // 出品完了
    ITEM_SOLD: 'item_sold',                   // 商品が売れた
    PURCHASE_COMPLETE: 'purchase_complete',   // 購入完了
    NEW_MESSAGE: 'new_message',               // 新しいメッセージ
    REVIEW_RECEIVED: 'review_received',       // 評価を受けた
    SYSTEM: 'system'                          // システム通知
};

// 通知アイコンのマッピング
const NotificationIcons = {
    [NotificationType.LISTING_COMPLETE]: '🎉',
    [NotificationType.ITEM_SOLD]: '💰',
    [NotificationType.PURCHASE_COMPLETE]: '✅',
    [NotificationType.NEW_MESSAGE]: '💬',
    [NotificationType.REVIEW_RECEIVED]: '⭐',
    [NotificationType.SYSTEM]: '📢'
};

// ローカルストレージのキー
const NOTIFICATIONS_KEY = 'bibli_notifications';
const NEWS_KEY = 'bibli_news';

/**
 * 通知サービスクラス
 */
class NotificationService {
    constructor() {
        this.notifications = [];
        this.news = [];
        this.listeners = [];
        this.unreadCount = 0;
        this.init();
    }

    /**
     * 初期化
     */
    init() {
        // ローカルストレージから通知を読み込み
        this.loadNotifications();
        this.loadNews();
        this.updateUnreadCount();

        // Firebaseが利用可能な場合はリアルタイムリスナーを設定
        if (typeof initializeFirebase === 'function') {
            this.setupFirebaseListeners();
        }
    }

    /**
     * Firebaseリスナーの設定
     */
    setupFirebaseListeners() {
        if (typeof firebase !== 'undefined' && db) {
            const userId = getCurrentUserId();

            // 通知のリアルタイムリスナー
            db.collection('notifications')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const notification = {
                                id: change.doc.id,
                                ...change.doc.data()
                            };
                            this.addNotification(notification, false);
                        }
                    });
                    this.notifyListeners();
                });

            // 運営からのお知らせのリアルタイムリスナー
            db.collection('news')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .onSnapshot((snapshot) => {
                    this.news = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.saveNews();
                    this.notifyListeners();
                });
        }
    }

    /**
     * ローカルストレージから通知を読み込み
     */
    loadNotifications() {
        try {
            const stored = localStorage.getItem(NOTIFICATIONS_KEY);
            if (stored) {
                this.notifications = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load notifications:', e);
            this.notifications = [];
        }
    }

    /**
     * ローカルストレージにお知らせを読み込み
     */
    loadNews() {
        try {
            const stored = localStorage.getItem(NEWS_KEY);
            if (stored) {
                this.news = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load news:', e);
            this.news = [];
        }
    }

    /**
     * 通知をローカルストレージに保存
     */
    saveNotifications() {
        try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
        } catch (e) {
            console.error('Failed to save notifications:', e);
        }
    }

    /**
     * お知らせをローカルストレージに保存
     */
    saveNews() {
        try {
            localStorage.setItem(NEWS_KEY, JSON.stringify(this.news));
        } catch (e) {
            console.error('Failed to save news:', e);
        }
    }

    /**
     * 新しい通知を追加
     * @param {Object} notification - 通知オブジェクト
     * @param {boolean} save - ローカルストレージに保存するか
     */
    addNotification(notification, save = true) {
        const newNotification = {
            id: notification.id || this.generateId(),
            type: notification.type || NotificationType.SYSTEM,
            title: notification.title,
            message: notification.message,
            icon: notification.icon || NotificationIcons[notification.type] || '📢',
            isRead: false,
            createdAt: notification.createdAt || new Date().toISOString(),
            link: notification.link || null,
            data: notification.data || {}
        };

        // 重複チェック
        const exists = this.notifications.some(n => n.id === newNotification.id);
        if (!exists) {
            this.notifications.unshift(newNotification);
            this.updateUnreadCount();

            if (save) {
                this.saveNotifications();

                // Firebaseに保存
                this.saveToFirebase(newNotification);
            }

            // トースト通知を表示
            this.showToast(newNotification);

            // リスナーに通知
            this.notifyListeners();
        }
    }

    /**
     * Firebaseに通知を保存
     * @param {Object} notification - 通知オブジェクト
     */
    async saveToFirebase(notification) {
        if (typeof firebase !== 'undefined' && db) {
            try {
                const userId = getCurrentUserId();
                await db.collection('notifications').add({
                    ...notification,
                    userId: userId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                console.error('Failed to save notification to Firebase:', e);
            }
        }
    }

    /**
     * 通知を既読にする
     * @param {string} notificationId - 通知ID
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
            notification.isRead = true;
            this.updateUnreadCount();
            this.saveNotifications();

            // Firebaseを更新
            if (typeof firebase !== 'undefined' && db) {
                db.collection('notifications').doc(notificationId).update({
                    isRead: true
                }).catch(e => console.error('Failed to update notification:', e));
            }

            this.notifyListeners();
        }
    }

    /**
     * すべての通知を既読にする
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.isRead = true);
        this.updateUnreadCount();
        this.saveNotifications();
        this.notifyListeners();
    }

    /**
     * 未読数を更新
     */
    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;

        // ヘッダーのバッジを更新
        this.updateHeaderBadge();
    }

    /**
     * ヘッダーの通知バッジを更新
     */
    updateHeaderBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * 通知一覧を取得
     * @returns {Array} 通知一覧
     */
    getNotifications() {
        return this.notifications;
    }

    /**
     * 未読の通知を取得
     * @returns {Array} 未読通知一覧
     */
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.isRead);
    }

    /**
     * 運営からのお知らせを取得
     * @returns {Array} お知らせ一覧
     */
    getNews() {
        return this.news;
    }

    /**
     * 未読件数を取得
     * @returns {number} 未読件数
     */
    getUnreadCount() {
        return this.unreadCount;
    }

    /**
     * リスナーを追加
     * @param {Function} callback - コールバック関数
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * リスナーを削除
     * @param {Function} callback - コールバック関数
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * リスナーに通知
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback({
                    notifications: this.notifications,
                    news: this.news,
                    unreadCount: this.unreadCount
                });
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    }

    /**
     * トースト通知を表示
     * @param {Object} notification - 通知オブジェクト
     */
    showToast(notification) {
        // 既存のトーストコンテナがなければ作成
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(toastContainer);
        }

        // トースト要素を作成
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            padding: 16px 20px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
            border-left: 4px solid #667eea;
        `;

        toast.innerHTML = `
            <div style="font-size: 24px;">${notification.icon}</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${notification.title}</div>
                <div style="font-size: 14px; color: #666; line-height: 1.4;">${notification.message}</div>
            </div>
            <button style="background: none; border: none; cursor: pointer; color: #999; font-size: 18px;">&times;</button>
        `;

        // クリックで閉じる
        toast.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeToast(toast);
        });

        // トースト本体クリックでお知らせページへ
        toast.addEventListener('click', () => {
            if (notification.link) {
                window.location.href = notification.link;
            } else {
                window.location.href = 'news_page.html';
            }
        });

        toastContainer.appendChild(toast);

        // 5秒後に自動で消える
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    /**
     * トーストを削除
     * @param {HTMLElement} toast - トースト要素
     */
    removeToast(toast) {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * ユニークIDを生成
     * @returns {string} ユニークID
     */
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========== 通知作成ヘルパー関数 ==========

    /**
     * 出品完了通知を作成
     * @param {string} productName - 商品名
     * @param {string} productId - 商品ID
     */
    notifyListingComplete(productName, productId) {
        this.addNotification({
            type: NotificationType.LISTING_COMPLETE,
            title: '出品が完了しました',
            message: `「${productName}」の出品が完了しました。審査後に公開されます。`,
            link: `product_detail.html?id=${productId}`,
            data: { productId, productName }
        });
    }

    /**
     * 商品が売れた通知を作成
     * @param {string} productName - 商品名
     * @param {string} buyerName - 購入者名
     * @param {string} transactionId - 取引ID
     */
    notifyItemSold(productName, buyerName, transactionId) {
        this.addNotification({
            type: NotificationType.ITEM_SOLD,
            title: '商品が売れました！',
            message: `出品していた「${productName}」が${buyerName}さんに購入されました。購入者とのやり取りを開始してください。`,
            link: `transaction.html?id=${transactionId}`,
            data: { productName, buyerName, transactionId }
        });
    }

    /**
     * 購入完了通知を作成
     * @param {string} productName - 商品名
     * @param {number} price - 価格
     * @param {string} transactionId - 取引ID
     */
    notifyPurchaseComplete(productName, price, transactionId) {
        this.addNotification({
            type: NotificationType.PURCHASE_COMPLETE,
            title: '購入が完了しました',
            message: `「${productName}」（¥${price.toLocaleString()}）の購入が完了しました。発送をお待ちください。`,
            link: `transaction.html?id=${transactionId}`,
            data: { productName, price, transactionId }
        });
    }

    /**
     * 新着メッセージ通知を作成
     * @param {string} senderName - 送信者名
     * @param {string} messagePreview - メッセージプレビュー
     * @param {string} chatId - チャットID
     */
    notifyNewMessage(senderName, messagePreview, chatId) {
        this.addNotification({
            type: NotificationType.NEW_MESSAGE,
            title: '新しいメッセージ',
            message: `${senderName}さんからメッセージが届きました: "${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}"`,
            link: `chat.html?id=${chatId}`,
            data: { senderName, messagePreview, chatId }
        });
    }

    /**
     * 評価受信通知を作成
     * @param {string} reviewerName - 評価者名
     * @param {number} rating - 評価（星の数）
     * @param {string} transactionId - 取引ID
     */
    notifyReviewReceived(reviewerName, rating, transactionId) {
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        this.addNotification({
            type: NotificationType.REVIEW_RECEIVED,
            title: '評価を受けました',
            message: `${reviewerName}さんから評価「${stars}」をいただきました。`,
            link: `profile_page.html`,
            data: { reviewerName, rating, transactionId }
        });
    }
}

// シングルトンインスタンス
let notificationServiceInstance = null;

/**
 * 通知サービスのインスタンスを取得
 * @returns {NotificationService} 通知サービスインスタンス
 */
function getNotificationService() {
    if (!notificationServiceInstance) {
        notificationServiceInstance = new NotificationService();
    }
    return notificationServiceInstance;
}

// トーストアニメーション用のスタイルを追加
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification-toast:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(toastStyles);
