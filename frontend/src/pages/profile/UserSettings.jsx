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
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageUploadError, setImageUploadError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const scrollToTopOnError = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        const response = await fetch(`http://localhost:5000/api/profile/${encodeURIComponent(currentUser.email)}`);
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

    setFieldErrors((prev) => {
      if (!prev[name] && !(name === 'password' && prev.passwordConf) && !(name === 'passwordConf' && prev.password)) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      if (name === 'password' || name === 'passwordConf') {
        delete next.password;
        delete next.passwordConf;
      }
      return next;
    });
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    setImageUploadError('');
    setFieldErrors((prev) => {
      if (!prev.profile_image) return prev;
      const next = { ...prev };
      delete next.profile_image;
      return next;
    });
    if (!file.type.startsWith('image/')) {
      const msg = '画像ファイルを選択してください';
      setImageUploadError(msg);
      setFieldErrors((prev) => ({ ...prev, profile_image: msg }));
      scrollToTopOnError();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const msg = '画像サイズは5MB以下にしてください';
      setImageUploadError(msg);
      setFieldErrors((prev) => ({ ...prev, profile_image: msg }));
      scrollToTopOnError();
      return;
    }

    const payload = new FormData();
    payload.append('image', file);

    setIsUploadingImage(true);
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${encodeURIComponent(user.email)}/image`, {
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
      const msg = err.message || 'プロフィール画像の更新に失敗しました';
      setImageUploadError(msg);
      setFieldErrors((prev) => ({ ...prev, profile_image: msg }));
      scrollToTopOnError();
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setFieldErrors({});

    const nextErrors = {};
    if (!formData.user_name.trim()) nextErrors.user_name = 'この項目を入力してください。';
    if (!formData.real_name.trim()) nextErrors.real_name = 'この項目を入力してください。';
    if (!formData.name_kana.trim()) nextErrors.name_kana = 'この項目を入力してください。';
    if (!formData.address.trim()) nextErrors.address = 'この項目を入力してください。';

    if (!/^[a-z0-9_.-]{3,30}$/.test(formData.user_id)) {
      nextErrors.user_id = 'user IDは3-30文字、a-z 0-9 _ . - で入力してください';
    }

    if (formData.password && formData.password !== formData.passwordConf) {
      nextErrors.passwordConf = 'パスワードが一致しません';
    }

    if (!user) {
      setError('ログインしてください');
      scrollToTopOnError();
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      scrollToTopOnError();
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
      const response = await fetch(`http://localhost:5000/api/profile/${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data.error || '更新に失敗しました';
        if (msg.toLowerCase().includes('user id') || msg.toLowerCase().includes('user_id') || msg.includes('ユーザーID') || msg.includes('user ID')) {
          setFieldErrors((prev) => ({ ...prev, user_id: msg }));
        } else {
          setError(msg);
        }
        scrollToTopOnError();
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
        const nextUserId = data?.user?.user_id || formData.user_id;
        navigate(`/profile/${nextUserId}`);
      }, 1200);
    } catch (err) {
      console.error('Update error:', err);
      setError('更新に失敗しました');
      scrollToTopOnError();
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

  const renderLabel = (fieldName, labelText) => (
    <label htmlFor={fieldName} className="form-label-row">
      <span>{labelText}</span>
      {fieldErrors[fieldName] && <span className="field-inline-error">*{fieldErrors[fieldName]}</span>}
    </label>
  );

  const hasInlineErrors = Object.keys(fieldErrors).length > 0;

  return (
    <>
      <Header />
      <main className="main-content">
        <h1 className="settings-title">ユーザー設定</h1>

        {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '20px' }}>{message}</div>}
        {error && <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}
        {hasInlineErrors && (
          <div className="top-error-summary">
            入力内容にエラーがあります。各項目のエラー表示を確認してください。
          </div>
        )}

        <form className="user-settings-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label-row">
              <span>プロフィールアイコン</span>
              {fieldErrors.profile_image && <span className="field-inline-error">*{fieldErrors.profile_image}</span>}
            </label>
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
            {imageUploadError && <div className="inline-error-message">*{imageUploadError}</div>}
            <div className="help-text">JPG / PNG / GIF / WebP、5MB以下</div>
          </div>

          <div className="form-group">
            {renderLabel('email', 'メールアドレス（変更不可）')}
            <input type="email" id="email" name="email" value={user.email} disabled style={{ backgroundColor: '#f0f0f0' }} />
          </div>

          <div className="form-group">
            {renderLabel('user_id', 'user ID（公開ID）')}
            <input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              maxLength={30}
              placeholder="例: yani_123"
            />
            <div className="help-text">他ユーザーと重複不可。3-30文字、a-z 0-9 _ . -</div>
          </div>

          <div className="form-group">
            {renderLabel('user_name', 'ユーザー名')}
            <input
              type="text"
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="ユーザー名を入力"
            />
          </div>

          <div className="form-group">
            {renderLabel('real_name', '本名（漢字）')}
            <input
              type="text"
              id="real_name"
              name="real_name"
              value={formData.real_name}
              onChange={handleChange}
              placeholder="本名（漢字）を入力"
            />
          </div>

          <div className="form-group">
            {renderLabel('name_kana', '本名（フリガナ）')}
            <input
              type="text"
              id="name_kana"
              name="name_kana"
              value={formData.name_kana}
              onChange={handleChange}
              placeholder="フリガナを入力"
            />
          </div>

          <div className="form-group">
            {renderLabel('bio', '自己紹介')}
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
            {renderLabel('address', '住所')}
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="住所を入力"
            />
          </div>

          <div className="form-group">
            {renderLabel('phone_number', '電話番号（変更不可）')}
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              readOnly
              inputMode="numeric"
              pattern="[0-9]*"
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>

          <div className="form-group">
            {renderLabel('birth_date', '生年月日（変更不可）')}
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
            {renderLabel('password', '新しいパスワード（変更時のみ）')}
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
            {renderLabel('passwordConf', 'パスワード（確認）')}
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
