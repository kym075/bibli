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
    user_name: '',
    bio: '',
    address: '',
    phone_number: '',
    birth_date: '',
    real_name: '',
    password: '',
    passwordConf: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // バックエンドから現在のプロフィール情報を取得
        try {
          const response = await fetch(`http://localhost:5000/api/profile/${currentUser.email}`);
          if (response.ok) {
            const data = await response.json();
            setFormData({
              user_name: data.user_name || '',
              bio: data.bio || '',
              address: data.address || '',
              phone_number: data.phone_number || '',
              birth_date: data.birth_date || '',
              real_name: data.real_name || '',
              password: '',
              passwordConf: ''
            });
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // パスワード確認
    if (formData.password && formData.password !== formData.passwordConf) {
      setError('パスワードが一致しません');
      return;
    }

    if (!user) {
      setError('ログインしてください');
      return;
    }

    // 更新データを準備（パスワードが空の場合は含めない）
    const updateData = {
      user_name: formData.user_name,
      bio: formData.bio,
      address: formData.address,
      phone_number: formData.phone_number,
      birth_date: formData.birth_date,
      real_name: formData.real_name
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('プロフィールを更新しました');
        // パスワードフィールドをクリア
        setFormData(prev => ({
          ...prev,
          password: '',
          passwordConf: ''
        }));
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || '更新に失敗しました');
      }
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

      {/* メインコンテンツ */}
      <main className="main-content">
        <h1 className="settings-title">ユーザー設定</h1>

        {message && <div style={{padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '20px'}}>{message}</div>}
        {error && <div style={{padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '20px'}}>{error}</div>}

        <form className="user-settings-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス (変更不可):</label>
            <input type="email" id="email" name="email" value={user.email} disabled style={{backgroundColor: '#f0f0f0'}} />
          </div>
          <div className="form-group">
            <label htmlFor="user_name">ユーザー名:</label>
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
            <label htmlFor="real_name">本名:</label>
            <input
              type="text"
              id="real_name"
              name="real_name"
              value={formData.real_name}
              onChange={handleChange}
              placeholder="本名を入力"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">自己紹介:</label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              placeholder="自己紹介を入力"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="address">住所:</label>
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
            <label htmlFor="phone_number">電話番号:</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="電話番号を入力"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="birth_date">生年月日:</label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">新しいパスワード (変更する場合のみ):</label>
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
            <label htmlFor="passwordConf">パスワード(確認):</label>
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
