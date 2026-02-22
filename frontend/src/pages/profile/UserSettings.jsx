import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../../css/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/user_settings.css';

function UserSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    user_id: '',
    user_name: '',
    bio: '',
    address: '',
    phone_number: '',
    birth_date: '',
    real_name: '',
    name_kana: '',
    profile_image: '',
    password: '',
    passwordConf: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    const trimmed = String(imageUrl).replace(/\\/g, '/').replace(/^\/+/, '');
    return `http://localhost:5000/${trimmed}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);
      try {
        const response = await fetch(`http://localhost:5000/api/profile/${currentUser.email}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            user_id: data.user_id || '',
            user_name: data.user_name || '',
            bio: data.bio || '',
            address: data.address || '',
            phone_number: data.phone_number || '',
            birth_date: data.birth_date || '',
            real_name: data.real_name || '',
            name_kana: data.name_kana || '',
            profile_image: data.profile_image || '',
            password: '',
            passwordConf: ''
          });
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'user_id') {
      nextValue = value.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    setImageUploadError('');
    if (!file.type.startsWith('image/')) {
      setImageUploadError('画像ファイルを選択してください');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('画像サイズは5MB以下にしてください');
      return;
    }

    const payload = new FormData();
    payload.append('image', file);

    setIsUploadingImage(true);
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user.email}/image`, {
        method: 'POST',
        body: payload
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'プロフィール画像の更新に失敗しました');
      }
      setFormData((prev) => ({
        ...prev,
        profile_image: data.profile_image || ''
      }));
      setMessage('プロフィール画像を更新しました');
    } catch (err) {
      console.error('Profile image upload error:', err);
      setImageUploadError(err.message || 'プロフィール画像の更新に失敗しました');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!/^[a-z0-9_.-]{3,30}$/.test(formData.user_id)) {
      setError('user IDは3-30文字、a-z 0-9 _ . - で入力してください');
      return;
    }

    if (formData.password && formData.password !== formData.passwordConf) {
      setError('パスワードが一致しません');
      return;
    }

    if (!user) {
      setError('ログインしてください');
      return;
    }

    const updateData = {
      user_id: formData.user_id,
      user_name: formData.user_name,
      bio: formData.bio,
      address: formData.address,
      real_name: formData.real_name,
      name_kana: formData.name_kana,
      profile_image: formData.profile_image
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || '更新に失敗しました');
        return;
      }

      setMessage('プロフィールを更新しました');
      setFormData((prev) => ({
        ...prev,
        user_id: data?.user?.user_id || prev.user_id,
        password: '',
        passwordConf: ''
      }));

      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      console.error('Update error:', err);
      setError('更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="main-content">
          <p>ログインしてください</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <h1 className="settings-title">ユーザー設定</h1>

        {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '20px' }}>{message}</div>}
        {error && <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}

        <form className="user-settings-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>プロフィールアイコン</label>
            <div className="profile-image-setting-row">
              <div className="profile-image-preview">
                {formData.profile_image ? (
                  <img src={getImageUrl(formData.profile_image)} alt="プロフィールアイコン" />
                ) : (
                  'USER'
                )}
              </div>
              <label className="profile-image-upload-btn">
                {isUploadingImage ? 'アップロード中...' : '画像を選択'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  disabled={isUploadingImage}
                  hidden
                />
              </label>
            </div>
            {imageUploadError && <div className="inline-error-message">{imageUploadError}</div>}
            <div className="help-text">JPG / PNG / GIF / WebP、5MB以下</div>
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス（変更不可）</label>
            <input type="email" id="email" name="email" value={user.email} disabled style={{ backgroundColor: '#f0f0f0' }} />
          </div>

          <div className="form-group">
            <label htmlFor="user_id">user ID（公開ID）</label>
            <input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              maxLength={30}
              placeholder="例: yani_123"
              required
            />
            <div className="help-text">他ユーザーと重複不可。3-30文字、a-z 0-9 _ . -</div>
          </div>

          <div className="form-group">
            <label htmlFor="user_name">ユーザー名</label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="ユーザー名を入力"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="real_name">本名（漢字）</label>
            <input
              type="text"
              id="real_name"
              name="real_name"
              value={formData.real_name}
              onChange={handleChange}
              placeholder="本名（漢字）を入力"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name_kana">本名（フリガナ）</label>
            <input
              type="text"
              id="name_kana"
              name="name_kana"
              value={formData.name_kana}
              onChange={handleChange}
              placeholder="フリガナを入力"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">自己紹介</label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              placeholder="自己紹介を入力"
              maxLength={120}
            ></textarea>
            <div className="help-text">{formData.bio.length}/120文字</div>
          </div>

          <div className="form-group">
            <label htmlFor="address">住所</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="住所を入力"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">電話番号（変更不可）</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              readOnly
              inputMode="numeric"
              pattern="[0-9]*"
              style={{ backgroundColor: '#f0f0f0' }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="birth_date">生年月日（変更不可）</label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              readOnly
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">新しいパスワード（変更時のみ）</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="新しいパスワードを入力"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConf">パスワード（確認）</label>
            <input
              type="password"
              id="passwordConf"
              name="passwordConf"
              value={formData.passwordConf}
              onChange={handleChange}
              placeholder="新しいパスワードを再入力"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-save">保存</button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default UserSettings;
