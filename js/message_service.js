/**
 * メッセージサービス
 * チャット・メッセージ機能の管理
 * メッセージ受信時に通知を送信
 */

// ローカルストレージのキー
const MESSAGES_KEY = 'bibli_messages';
const CHATS_KEY = 'bibli_chats';

/**
 * メッセージサービスクラス
 */
class MessageService {
    constructor() {
        this.chats = [];
        this.listeners = [];
        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.loadChats();

        // Firebaseが利用可能な場合はリアルタイムリスナーを設定
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined' && db) {
            this.setupFirebaseListeners();
        }
    }

    /**
     * Firebaseリスナーの設定
     */
    setupFirebaseListeners() {
        const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : 'demo_user_001';

        // メッセージのリアルタイムリスナー
        db.collection('messages')
            .where('recipientId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = {
                            id: change.doc.id,
                            ...change.doc.data()
                        };
                        // 新しいメッセージを受信したら通知を送信
                        this.handleNewMessage(message);
                    }
                });
            });
    }

    /**
     * ローカルストレージからチャットを読み込み
     */
    loadChats() {
        try {
            const stored = localStorage.getItem(CHATS_KEY);
            if (stored) {
                this.chats = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load chats:', e);
            this.chats = [];
        }
    }

    /**
     * チャットをローカルストレージに保存
     */
    saveChats() {
        try {
            localStorage.setItem(CHATS_KEY, JSON.stringify(this.chats));
        } catch (e) {
            console.error('Failed to save chats:', e);
        }
    }

    /**
     * 新しいメッセージを処理
     * @param {Object} message - メッセージオブジェクト
     */
    handleNewMessage(message) {
        // チャットリストを更新
        this.updateChatList(message);

        // 通知を送信
        this.sendMessageNotification(message);

        // リスナーに通知
        this.notifyListeners();
    }

    /**
     * チャットリストを更新
     * @param {Object} message - メッセージオブジェクト
     */
    updateChatList(message) {
        const chatIndex = this.chats.findIndex(c => c.id === message.chatId);

        if (chatIndex >= 0) {
            // 既存のチャットを更新
            this.chats[chatIndex].lastMessage = message.content;
            this.chats[chatIndex].lastMessageTime = message.createdAt;
            this.chats[chatIndex].unreadCount = (this.chats[chatIndex].unreadCount || 0) + 1;
            // チャットを先頭に移動
            const chat = this.chats.splice(chatIndex, 1)[0];
            this.chats.unshift(chat);
        } else {
            // 新しいチャットを追加
            this.chats.unshift({
                id: message.chatId,
                participantId: message.senderId,
                participantName: message.senderName,
                lastMessage: message.content,
                lastMessageTime: message.createdAt,
                unreadCount: 1
            });
        }

        this.saveChats();
    }

    /**
     * メッセージ通知を送信
     * @param {Object} message - メッセージオブジェクト
     */
    sendMessageNotification(message) {
        if (typeof getNotificationService === 'function') {
            const notificationService = getNotificationService();
            notificationService.notifyNewMessage(
                message.senderName,
                message.content,
                message.chatId
            );
        } else {
            // 通知サービスがない場合はローカルストレージに直接保存
            const notification = {
                id: 'notif_msg_' + Date.now(),
                type: 'new_message',
                title: '新しいメッセージ',
                message: `${message.senderName}さんからメッセージが届きました: "${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}"`,
                icon: '💬',
                isRead: false,
                createdAt: new Date().toISOString(),
                link: `chat.html?id=${message.chatId}`,
                data: message
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

    /**
     * メッセージを送信
     * @param {string} chatId - チャットID
     * @param {string} recipientId - 受信者ID
     * @param {string} content - メッセージ内容
     */
    async sendMessage(chatId, recipientId, content) {
        const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : 'demo_user_001';
        const userName = localStorage.getItem('bibli_user_name') || 'あなた';

        const message = {
            id: 'msg_' + Date.now(),
            chatId: chatId,
            senderId: userId,
            senderName: userName,
            recipientId: recipientId,
            content: content,
            createdAt: new Date().toISOString(),
            isRead: false
        };

        // ローカルストレージに保存
        this.saveMessageToStorage(message);

        // Firebaseに保存
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined' && db) {
            try {
                await db.collection('messages').add({
                    ...message,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                console.error('Failed to send message to Firebase:', e);
            }
        }

        // デモ用：自分自身に通知を送信（実際のアプリでは相手に送信）
        // this.handleNewMessage(message);

        return message;
    }

    /**
     * メッセージをローカルストレージに保存
     * @param {Object} message - メッセージオブジェクト
     */
    saveMessageToStorage(message) {
        try {
            const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
            messages.push(message);
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        } catch (e) {
            console.error('Failed to save message:', e);
        }
    }

    /**
     * チャットのメッセージを取得
     * @param {string} chatId - チャットID
     * @returns {Array} メッセージ一覧
     */
    getMessages(chatId) {
        try {
            const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
            return messages.filter(m => m.chatId === chatId);
        } catch (e) {
            console.error('Failed to get messages:', e);
            return [];
        }
    }

    /**
     * チャット一覧を取得
     * @returns {Array} チャット一覧
     */
    getChats() {
        return this.chats;
    }

    /**
     * チャットを既読にする
     * @param {string} chatId - チャットID
     */
    markChatAsRead(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.unreadCount = 0;
            this.saveChats();
            this.notifyListeners();
        }
    }

    /**
     * 未読メッセージ数を取得
     * @returns {number} 未読メッセージ数
     */
    getUnreadCount() {
        return this.chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
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
                    chats: this.chats,
                    unreadCount: this.getUnreadCount()
                });
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    }

    /**
     * デモ用：テストメッセージを受信
     * @param {string} senderName - 送信者名
     * @param {string} content - メッセージ内容
     */
    simulateIncomingMessage(senderName, content) {
        const message = {
            id: 'msg_' + Date.now(),
            chatId: 'chat_demo_' + Date.now(),
            senderId: 'demo_sender_001',
            senderName: senderName,
            recipientId: typeof getCurrentUserId === 'function' ? getCurrentUserId() : 'demo_user_001',
            content: content,
            createdAt: new Date().toISOString(),
            isRead: false
        };

        this.handleNewMessage(message);
    }
}

// シングルトンインスタンス
let messageServiceInstance = null;

/**
 * メッセージサービスのインスタンスを取得
 * @returns {MessageService} メッセージサービスインスタンス
 */
function getMessageService() {
    if (!messageServiceInstance) {
        messageServiceInstance = new MessageService();
    }
    return messageServiceInstance;
}
