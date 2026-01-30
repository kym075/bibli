// 設定ページの処理

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
    // トグルスイッチの処理
    const toggleSwitches = document.querySelectorAll('.toggle-switch input[type="checkbox"]');

    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingName = this.id;
            const isEnabled = this.checked;

            // 設定変更のシミュレーション
            console.log(`設定変更: ${settingName} = ${isEnabled}`);

            // 実際のアプリケーションではここでAPIリクエストを送信
            // 例: updateSetting(settingName, isEnabled)

            // フィードバック表示
            showNotification(`${getSettingDisplayName(settingName)}を${isEnabled ? '有効' : '無効'}にしました`);
        });
    });

    // 設定項目のクリック処理
    const settingsItems = document.querySelectorAll('.settings-item[data-modal]');

    settingsItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const modalType = this.getAttribute('data-modal');

            console.log(`設定画面を開く: ${modalType}`);

            // 実際のアプリケーションではここでモーダルを表示
            // 簡易的なアラートで代用
            handleSettingClick(modalType);
        });
    });

    // ログアウトボタンの処理
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('ログアウトしますか？')) {
                console.log('ログアウト処理を実行');

                // 実際のアプリケーションではここでログアウト処理を実行
                // 例: logout()

                showMessage('ログアウトしました', 'success');
                window.location.href = 'index.html';
            }
        });
    }

    // 設定表示名を取得
    function getSettingDisplayName(settingId) {
        const displayNames = {
            'pushNotification': 'プッシュ通知',
            'emailNotification': 'メール通知',
            'messageNotification': 'メッセージ通知',
            'campaignNotification': 'お知らせ・キャンペーン',
            'privateProfile': 'プロフィール非公開'
        };
        return displayNames[settingId] || settingId;
    }

    // 通知表示（簡易版）
    function showNotification(message) {
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2c3e50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // スタイルアニメーションを追加
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
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
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 3秒後に自動で消去
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // ページ読み込み時に設定を読み込む（シミュレーション）
    loadSettings();

    function loadSettings() {
        // LocalStorageから設定を読み込む（実際のアプリではAPIから取得）
        const savedSettings = {
            pushNotification: localStorage.getItem('pushNotification') !== 'false',
            emailNotification: localStorage.getItem('emailNotification') !== 'false',
            messageNotification: localStorage.getItem('messageNotification') !== 'false',
            campaignNotification: localStorage.getItem('campaignNotification') === 'true',
            privateProfile: localStorage.getItem('privateProfile') === 'true'
        };

        // 設定を反映
        Object.keys(savedSettings).forEach(key => {
            const toggle = document.getElementById(key);
            if (toggle) {
                toggle.checked = savedSettings[key];
            }
        });
    }

    // 設定を保存（トグル変更時）
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
        });
    });
});
