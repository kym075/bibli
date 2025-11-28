import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function ForumPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: ''
  });
  const [titleCount, setTitleCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/community/forum');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'title') {
      setTitleCount(value.length);
    } else if (id === 'content') {
      setContentCount(value.length);
    }
  };

  return (
    <>
      <Header />
      <main className="main-content">
        {/* ページヘッダー */}
        <div className="page-header">
          <h1 className="page-title">✏️ 新しいトピックを投稿する</h1>
          <p className="page-description">本について語り合い、コミュニティを盛り上げましょう</p>
        </div>

        {/* ブレッドクラム */}
        <div className="breadcrumb">
          <Link to="/community/forum" className="back-btn" id="backToForum">掲示板一覧へ戻る</Link>
        </div>

        {/* フォームコンテナ */}
        <div className="form-container">
          <div className="success-message" id="successMessage">
            投稿が完了しました！掲示板一覧で確認できます。
          </div>

          <form id="postForm" onSubmit={handleSubmit}>
            {/* カテゴリ選択 */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                カテゴリ<span className="required">*</span>
              </label>
              <select
                id="category"
                className="form-select"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">カテゴリを選択してください</option>
                <option value="chat">雑談</option>
                <option value="question">質問</option>
                <option value="discussion">考察</option>
                <option value="recruitment">募集</option>
                <option value="recommendation">おすすめ</option>
                <option value="review">感想・レビュー</option>
              </select>
              <div className="help-text">投稿内容に最も適したカテゴリを選択してください。</div>
            </div>

            {/* カテゴリ説明 */}
            <div className="category-descriptions">
              <h4>カテゴリの説明</h4>
              <div className="category-list">
                <div className="category-desc">
                  <div className="category-icon category-chat">雑談</div>
                  <div className="category-info">
                    <div className="category-name">雑談</div>
                    <div className="category-description">本に関する気軽な話題や日常的な会話</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-question">質問</div>
                  <div className="category-info">
                    <div className="category-name">質問</div>
                    <div className="category-description">本探し、読書に関する疑問や相談</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-discussion">考察</div>
                  <div className="category-info">
                    <div className="category-name">考察</div>
                    <div className="category-description">作品の深い分析や議論、文学的な考察</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-recruitment">募集</div>
                  <div className="category-info">
                    <div className="category-name">募集</div>
                    <div className="category-description">読書会やイベントのメンバー募集</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-recommendation">おすすめ</div>
                  <div className="category-info">
                    <div className="category-name">おすすめ</div>
                    <div className="category-description">本の推薦や紹介</div>
                  </div>
                </div>
                <div className="category-desc">
                  <div className="category-icon category-review">感想</div>
                  <div className="category-info">
                    <div className="category-name">感想・レビュー</div>
                    <div className="category-description">読了後の感想や書評</div>
                  </div>
                </div>
              </div>
            </div>

            {/* タイトル入力 */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                タイトル<span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                placeholder="例：確か主人公が猫で...うろ覚えの本を探しています"
                maxLength="100"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <div className="char-count">
                <div className="help-text">投稿内容が分かりやすいタイトルを付けてください。</div>
                <div className="count-info">
                  <span id="titleCount">{titleCount}</span>/100文字
                </div>
              </div>
            </div>

            {/* 本文入力 */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                本文<span className="required">*</span>
              </label>
              <textarea
                id="content"
                className="form-textarea"
                placeholder="投稿内容を詳しく書いてください...&#10;&#10;例：&#10;子供の頃に読んだ本なのですが、どうしてもタイトルが思い出せません。&#10;記憶にあるのは以下の内容です：&#10;&#10;• 主人公が猫（確か黒い猫だったような...）&#10;• 飼い主の家で起こる日常を描いた小説&#10;• 猫の視点から人間の世界を観察する内容&#10;• 確か有名な作家さんの作品だったと思います&#10;&#10;何か心当たりがある方はいらっしゃいませんか？"
                maxLength="2000"
                value={formData.content}
                onChange={handleInputChange}
                required
              ></textarea>
              <div className="char-count">
                <div className="help-text">詳細な情報を提供することで、より良い回答を得られます。</div>
                <div className="count-info">
                  <span id="contentCount">{contentCount}</span>/2000文字
                </div>
              </div>
            </div>

            {/* プレビューセクション */}
            <div className="preview-section">
              <div className="preview-title">投稿プレビュー</div>
              <div className="preview-container" id="previewContainer">
                <div className="preview-header">
                  <div className="preview-category" id="previewCategory">カテゴリ</div>
                  <div className="preview-author">👤 あなた - 今</div>
                </div>
                <div className="preview-thread-title" id="previewTitle">
                  {formData.title || 'タイトルをここに入力してください'}
                </div>
                <div className="preview-content" id="previewContent">
                  {formData.content || '本文をここに入力してください...'}
                </div>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="submit-section">
              <button
                type="submit"
                className="submit-btn"
                id="submitBtn"
                disabled={!formData.category || !formData.title || !formData.content}
              >
                投稿する
              </button>
              <div className="draft-actions">
                <button type="button" className="draft-btn" id="saveDraftBtn">
                  💾 下書き保存
                </button>
                <button type="button" className="draft-btn" id="loadDraftBtn">
                  📂 下書きを読み込む
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ForumPost;