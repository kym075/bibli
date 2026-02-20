import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../css/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/settings.css';

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeFollowTab, setActiveFollowTab] = useState('following');
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState('');
  const [actionTargetEmail, setActionTargetEmail] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    push_notification: true,
    email_notification: true,
    message_notification: true,
    campaign_notification: false
  });
  const [notificationSaving, setNotificationSaving] = useState('');
  const [notificationError, setNotificationError] = useState('');

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    const trimmed = String(imageUrl).replace(/\\/g, '/').replace(/^\/+/, '');
    return `http://localhost:5000/${trimmed}`;
  };

  const fetchFollowRelatedLists = async (email) => {
    if (!email) {
      setFollowingUsers([]);
      setFollowerUsers([]);
      setBlockedUsers([]);
      return;
    }

    setFollowLoading(true);
    setFollowError('');
    try {
      const [followingRes, followersRes, blockedRes] = await Promise.all([
        fetch(`http://localhost:5000/api/follow/list?email=${encodeURIComponent(email)}&type=following`),
        fetch(`http://localhost:5000/api/follow/list?email=${encodeURIComponent(email)}&type=followers`),
        fetch(`http://localhost:5000/api/block/list?email=${encodeURIComponent(email)}`)
      ]);

      const [followingData, followersData, blockedData] = await Promise.all([
        followingRes.json(),
        followersRes.json(),
        blockedRes.json()
      ]);

      if (!followingRes.ok || !followersRes.ok || !blockedRes.ok) {
        throw new Error(
          followingData.error ||
          followersData.error ||
          blockedData.error ||
          'フォロー一覧の取得に失敗しました'
        );
      }

      setFollowingUsers(followingData.users || []);
      setFollowerUsers(followersData.users || []);
      setBlockedUsers(blockedData.users || []);
    } catch (err) {
      console.error('Follow list fetch error:', err);
      setFollowError(err.message || 'フォロー一覧の取得に失敗しました');
      setFollowingUsers([]);
      setFollowerUsers([]);
      setBlockedUsers([]);
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchNotificationSettings = async (email) => {
    if (!email) return;
    try {
      const response = await fetch(`http://localhost:5000/api/notification-settings?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '通知設定の取得に失敗しました');
      }
      setNotificationSettings({
        push_notification: Boolean(data.push_notification),
        email_notification: Boolean(data.email_notification),
        message_notification: Boolean(data.message_notification),
        campaign_notification: Boolean(data.campaign_notification)
      });
    } catch (err) {
      console.error('Notification setting fetch error:', err);
      setNotificationError(err.message || '通知設定の取得に失敗しました');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/profile/${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          await fetchFollowRelatedLists(data.email || user.email);
          await fetchNotificationSettings(data.email || user.email);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Settings profile fetch error:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleNotificationToggle = async (key, value) => {
    if (!profile?.email) return;
    const previous = { ...notificationSettings };
    const next = { ...notificationSettings, [key]: value };
    setNotificationSettings(next);
    setNotificationError('');
    setNotificationSaving(key);

    try {
      const response = await fetch('http://localhost:5000/api/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: profile.email,
          ...next
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '通知設定の更新に失敗しました');
      }
    } catch (err) {
      console.error('Notification setting update error:', err);
      setNotificationSettings(previous);
      setNotificationError(err.message || '通知設定の更新に失敗しました');
    } finally {
      setNotificationSaving('');
    }
  };

  const handleUnfollow = async (targetEmail) => {
    if (!profile?.email || !targetEmail) return;
    setActionTargetEmail(targetEmail);
    setFollowError('');
    try {
      const response = await fetch('http://localhost:5000/api/unfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_email: profile.email,
          followee_email: targetEmail
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'フォロー解除に失敗しました');
      }
      await fetchFollowRelatedLists(profile.email);
    } catch (err) {
      console.error('Unfollow error:', err);
      setFollowError(err.message || 'フォロー解除に失敗しました');
    } finally {
      setActionTargetEmail('');
    }
  };

  const handleUnblock = async (targetEmail) => {
    if (!profile?.email || !targetEmail) return;
    setActionTargetEmail(targetEmail);
    setFollowError('');
    try {
      const response = await fetch('http://localhost:5000/api/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocker_email: profile.email,
          blocked_email: targetEmail
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ブロック解除に失敗しました');
      }
      await fetchFollowRelatedLists(profile.email);
    } catch (err) {
      console.error('Unblock error:', err);
      setFollowError(err.message || 'ブロック解除に失敗しました');
    } finally {
      setActionTargetEmail('');
    }
  };

  const renderUserRows = (users, mode) => {
    if (users.length === 0) {
      return <div className="follow-empty">対象ユーザーはいません。</div>;
    }

    return users.map((user) => (
      <div className="follow-row" key={`${mode}-${user.email}`}>
        <Link to={`/profile/${user.user_id}`} className="follow-user-link">
          <div className="follow-user-avatar">
            {user.profile_image ? (
              <img src={getImageUrl(user.profile_image)} alt={user.user_name} />
            ) : (
              'U'
            )}
          </div>
          <div className="follow-user-meta">
            <div className="follow-user-name">{user.user_name || 'ユーザー'}</div>
            <div className="follow-user-id">@{user.user_id || user.email}</div>
          </div>
        </Link>

        {mode === 'following' && (
          <button
            type="button"
            className="follow-action-btn"
            onClick={() => handleUnfollow(user.email)}
            disabled={actionTargetEmail === user.email}
          >
            {actionTargetEmail === user.email ? '処理中...' : 'フォロー解除'}
          </button>
        )}

        {mode === 'blocked' && (
          <button
            type="button"
            className="follow-action-btn warning"
            onClick={() => handleUnblock(user.email)}
            disabled={actionTargetEmail === user.email}
          >
            {actionTargetEmail === user.email ? '処理中...' : 'ブロック解除'}
          </button>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="main-content">
          <div className="settings-container">
            <p>読み込み中...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="main-content">
          <div className="settings-container">
            <p>設定を確認するにはログインが必要です。</p>
            <Link to="/login" className="settings-item">ログインへ</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="settings-container">
          <h1 className="page-title">設定</h1>

          {/* アカウント設定 */}
          <section className="settings-section">
            <h2 className="section-title">アカウント</h2>
            <div className="settings-list">
              <Link to="/user-settings" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">U</span>
                  <span className="item-text">ユーザー設定</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <div className="settings-item no-pointer">
                <div className="item-left">
                  <span className="item-icon">M</span>
                  <span className="item-text">メールアドレス</span>
                </div>
                <span className="item-value">{profile.email || '-'}</span>
              </div>
              <div className="settings-item no-pointer">
                <div className="item-left">
                  <span className="item-icon">T</span>
                  <span className="item-text">電話番号</span>
                </div>
                <span className="item-value">{profile.phone_number || '-'}</span>
              </div>
              <Link to="/user-settings" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">P</span>
                  <span className="item-text">パスワード変更</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
            </div>
          </section>

          <section className="settings-section">
            <h2 className="section-title">フォロー管理</h2>
            <div className="settings-list follow-management-list">
              <div className="follow-tab-row">
                <button
                  type="button"
                  className={`follow-tab-btn ${activeFollowTab === 'following' ? 'active' : ''}`}
                  onClick={() => setActiveFollowTab('following')}
                >
                  フォロー中 ({followingUsers.length})
                </button>
                <button
                  type="button"
                  className={`follow-tab-btn ${activeFollowTab === 'followers' ? 'active' : ''}`}
                  onClick={() => setActiveFollowTab('followers')}
                >
                  フォロワー ({followerUsers.length})
                </button>
                <button
                  type="button"
                  className={`follow-tab-btn ${activeFollowTab === 'blocked' ? 'active' : ''}`}
                  onClick={() => setActiveFollowTab('blocked')}
                >
                  ブロック中 ({blockedUsers.length})
                </button>
              </div>

              {followError && <div className="follow-error">{followError}</div>}
              {followLoading ? (
                <div className="follow-empty">読み込み中...</div>
              ) : (
                <div className="follow-list-body">
                  {activeFollowTab === 'following' && renderUserRows(followingUsers, 'following')}
                  {activeFollowTab === 'followers' && renderUserRows(followerUsers, 'followers')}
                  {activeFollowTab === 'blocked' && renderUserRows(blockedUsers, 'blocked')}
                </div>
              )}
            </div>
          </section>

          {/* 支払い設定 */}
          <section className="settings-section">
            <h2 className="section-title">支払い</h2>
            <div className="settings-list">
              <a href="#" className="settings-item" data-modal="payment">
                <div className="item-left">
                  <span className="item-icon">C</span>
                  <span className="item-text">クレジットカード</span>
                </div>
                <span className="item-arrow">›</span>
              </a>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">B</span>
                  <span className="item-text">振込先口座</span>
                </div>
                <span className="item-arrow">›</span>
              </a>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">S</span>
                  <span className="item-text">売上金・ポイント</span>
                </div>
                <span className="item-value">¥0</span>
                <span className="item-arrow">›</span>
              </a>
            </div>
          </section>

          {/* 通知設定 */}
          <section className="settings-section">
            <h2 className="section-title">通知</h2>
            <div className="settings-list">
              {notificationError && <div className="follow-error">{notificationError}</div>}
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">N</span>
                  <span className="item-text">プッシュ通知</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="pushNotification"
                    checked={notificationSettings.push_notification}
                    onChange={(e) => handleNotificationToggle('push_notification', e.target.checked)}
                    disabled={notificationSaving === 'push_notification'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">E</span>
                  <span className="item-text">メール通知</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="emailNotification"
                    checked={notificationSettings.email_notification}
                    onChange={(e) => handleNotificationToggle('email_notification', e.target.checked)}
                    disabled={notificationSaving === 'email_notification'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">M</span>
                  <span className="item-text">メッセージ通知</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="messageNotification"
                    checked={notificationSettings.message_notification}
                    onChange={(e) => handleNotificationToggle('message_notification', e.target.checked)}
                    disabled={notificationSaving === 'message_notification'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item toggle-item">
                <div className="item-left">
                  <span className="item-icon">C</span>
                  <span className="item-text">お知らせ・キャンペーン</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="campaignNotification"
                    checked={notificationSettings.campaign_notification}
                    onChange={(e) => handleNotificationToggle('campaign_notification', e.target.checked)}
                    disabled={notificationSaving === 'campaign_notification'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* その他 */}
          <section className="settings-section">
            <h2 className="section-title">その他</h2>
            <div className="settings-list">
              <Link to="/contact" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">C</span>
                  <span className="item-text">お問い合わせ</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <Link to="/terms" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">T</span>
                  <span className="item-text">利用規約</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <Link to="/privacy" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">P</span>
                  <span className="item-text">プライバシーポリシー</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <Link to="/commercial" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">L</span>
                  <span className="item-text">特定商取引法に基づく表記</span>
                </div>
                <span className="item-arrow">›</span>
              </Link>
              <a href="#" className="settings-item">
                <div className="item-left">
                  <span className="item-icon">V</span>
                  <span className="item-text">アプリバージョン</span>
                </div>
                <span className="item-value">v1.0.0</span>
              </a>
            </div>
          </section>

          {/* ログアウト */}
          <section className="settings-section">
            <div className="settings-list">
              <button type="button" className="settings-item danger-item settings-button-item" id="logoutBtn" onClick={handleLogout}>
                <div className="item-left">
                  <span className="item-icon">O</span>
                  <span className="item-text">ログアウト</span>
                </div>
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Settings;
