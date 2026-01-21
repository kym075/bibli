// ハンバーガーメニューの開閉機能
const hamburgerMenu = document.getElementById('hamburger-menu');
const hamburgerDropdown = document.getElementById('hamburger-dropdown');

if (hamburgerMenu && hamburgerDropdown) {
    hamburgerMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburgerMenu.classList.toggle('active');
        hamburgerDropdown.classList.toggle('show');
    });

    // メニュー外をクリックした時にメニューを閉じる
    document.addEventListener('click', function(e) {
        if (!hamburgerMenu.contains(e.target) && !hamburgerDropdown.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            hamburgerDropdown.classList.remove('show');
        }
    });

    // ドロップダウンアイテムのクリック効果
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            console.log('メニュー選択:', this.textContent);
            // メニューを閉じる
            hamburgerMenu.classList.remove('active');
            hamburgerDropdown.classList.remove('show');
        });
    });
}

// ヘッダーに通知ボタンを追加
function initHeaderNotification() {
    const headerButtons = document.querySelector('.header-buttons');
    if (!headerButtons) return;

    // 既に追加されている場合はスキップ
    if (document.getElementById('header-notification-btn')) return;

    // 通知ボタンを作成
    const notificationBtn = document.createElement('button');
    notificationBtn.id = 'header-notification-btn';
    notificationBtn.className = 'header-notification-btn';
    notificationBtn.innerHTML = `
        🔔
        <span id="notification-badge" class="notification-badge hidden">0</span>
    `;
    notificationBtn.title = 'お知らせ';

    // クリックでお知らせページへ遷移
    notificationBtn.addEventListener('click', function() {
        window.location.href = 'news_page.html';
    });

    // ヘッダーボタンの先頭に追加
    const firstBtn = headerButtons.querySelector('.btn');
    if (firstBtn) {
        headerButtons.insertBefore(notificationBtn, firstBtn);
    } else {
        headerButtons.appendChild(notificationBtn);
    }

    // 通知バッジを更新
    updateNotificationBadge();
}

// 通知バッジを更新
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    let unreadCount = 0;

    // 通知サービスが利用可能な場合
    if (typeof getNotificationService === 'function') {
        const notificationService = getNotificationService();
        unreadCount = notificationService.getUnreadCount();
    } else {
        // ローカルストレージから未読数を取得
        try {
            const notifications = JSON.parse(localStorage.getItem('bibli_notifications') || '[]');
            unreadCount = notifications.filter(n => !n.isRead).length;
        } catch (e) {
            console.error('Failed to get notification count:', e);
        }
    }

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ドロップダウンのお知らせアイテムにバッジを追加
function updateDropdownNotificationBadge() {
    const newsDropdownItem = document.querySelector('.dropdown-item[href="news_page.html"]');
    if (!newsDropdownItem) return;

    // 既にバッジがある場合は削除
    const existingBadge = newsDropdownItem.querySelector('.dropdown-notification-badge');
    if (existingBadge) {
        existingBadge.remove();
    }

    let unreadCount = 0;

    // 通知サービスが利用可能な場合
    if (typeof getNotificationService === 'function') {
        const notificationService = getNotificationService();
        unreadCount = notificationService.getUnreadCount();
    } else {
        // ローカルストレージから未読数を取得
        try {
            const notifications = JSON.parse(localStorage.getItem('bibli_notifications') || '[]');
            unreadCount = notifications.filter(n => !n.isRead).length;
        } catch (e) {
            console.error('Failed to get notification count:', e);
        }
    }

    if (unreadCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'dropdown-notification-badge';
        badge.style.cssText = `
            background: #ff6b6b;
            color: white;
            font-size: 11px;
            font-weight: bold;
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 5px;
            margin-left: auto;
        `;
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        newsDropdownItem.appendChild(badge);
    }
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', function() {
    initHeaderNotification();
    updateDropdownNotificationBadge();

    // 通知サービスが利用可能な場合、リスナーを追加
    if (typeof getNotificationService === 'function') {
        const notificationService = getNotificationService();
        notificationService.addListener(function() {
            updateNotificationBadge();
            updateDropdownNotificationBadge();
        });
    }

    // 定期的にバッジを更新（ローカルストレージの変更を検出）
    setInterval(function() {
        updateNotificationBadge();
        updateDropdownNotificationBadge();
    }, 5000);
});

// ページがフォーカスを取得した時にバッジを更新
window.addEventListener('focus', function() {
    updateNotificationBadge();
    updateDropdownNotificationBadge();
});
