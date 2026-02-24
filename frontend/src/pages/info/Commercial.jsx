import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/inquiry.css';

function Commercial() {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="document-container">
          <h1 className="page-title">特定商取引法に基づく表記</h1>
          <p className="update-date">最終更新日: 2026年2月24日</p>

          <div className="document-content">
            <section className="document-section">
              <p>本サービスはユーザー間売買の場を提供するプラットフォームです。特定商取引法に基づき、運営者情報および取引条件を以下に表示します。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">事業者の名称</h2>
              <p>Bibli運営事務局</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">運営統括責任者</h2>
              <p>請求があった場合、遅滞なく開示します。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">所在地</h2>
              <p>請求があった場合、遅滞なく開示します。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">連絡先</h2>
              <p>お問い合わせフォーム: <Link to="/contact">こちら</Link></p>
              <p className="note">※電話番号は請求があった場合、遅滞なく開示します。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">販売価格・商品代金</h2>
              <p>各商品ページに表示された価格</p>
              <p className="note">※消費税込みの価格を表示しています。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">商品代金以外の必要料金</h2>
              <ul className="document-list">
                <li>配送料: 各商品ページに記載（購入者負担）</li>
                <li>インターネット接続に必要な通信料はユーザー負担</li>
              </ul>
            </section>

            <section className="document-section">
              <h2 className="document-heading">支払方法</h2>
              <ul className="document-list">
                <li>クレジットカード決済（Stripe Checkout経由）</li>
              </ul>
            </section>

            <section className="document-section">
              <h2 className="document-heading">支払時期</h2>
              <p>購入確定時に決済が実行されます。実際の引き落とし時期はカード会社の定めによります。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">商品の引渡時期</h2>
              <p>商品の発送は出品者が行います。発送までの目安は商品ページの「発送日の目安」欄に表示されます。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">返品・交換・キャンセル</h2>
              <p>本サービスは個人間取引のため、返品・交換・キャンセルは原則として取引当事者間で協議して対応いただきます。</p>
              <p>トラブル時は取引チャットまたは <Link to="/contact">お問い合わせフォーム</Link> からご連絡ください。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">個人情報の取り扱いについて</h2>
              <p>お客様の個人情報は、<Link to="/privacy">プライバシーポリシー</Link>に基づき管理します。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">補足</h2>
              <p>本ページ記載内容は、現在の実装機能に基づいています。対応機能を変更する場合は、本ページを随時更新します。</p>
            </section>
          </div>

          <div className="back-link">
            <Link to="/contact" className="btn-back">お問い合わせページに戻る</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Commercial;
