import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/inquiry.css';

function Privacy() {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="document-container">
          <h1 className="page-title">プライバシーポリシー</h1>
          <p className="update-date">最終更新日: 2026年2月24日</p>

          <div className="document-content">
            <section className="document-section">
              <p>Bibli運営事務局（以下「当社」といいます。）は、当社の提供するサービス（以下「本サービス」といいます。）における、ユーザーについての個人情報を含む利用者情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">1. 収集する情報</h2>
              <p>当社は、本サービスの提供にあたり、以下の情報を取得します。</p>
              <h3 className="document-subheading">(1) ユーザーから提供される情報</h3>
              <ul className="document-list">
                <li>ユーザー名、メールアドレス、電話番号、住所、生年月日等の登録情報</li>
                <li>メールアドレス、電話番号、住所等の連絡先情報</li>
                <li>プロフィール画像、自己紹介文等のプロフィール情報</li>
                <li>出品情報（商品情報、画像、説明、タグ、配送情報）</li>
                <li>チャット、掲示板投稿、コメント、評価等の投稿データ</li>
              </ul>

              <h3 className="document-subheading">(2) ユーザーが本サービスを利用するにあたって取得される情報</h3>
              <ul className="document-list">
                <li>端末情報（端末の種類、OS、ブラウザの種類等）</li>
                <li>ログ情報（アクセス日時、IPアドレス、リファラ情報等）</li>
                <li>Cookie及び匿名ID</li>
                <li>閲覧履歴、検索履歴、購入履歴、通知設定等の利用履歴</li>
                <li>決済に関連する取引情報（セッションID、決済ステータス等）</li>
              </ul>
              <p className="note">※クレジットカード番号等のセンシティブな決済情報は、決済事業者（Stripe）側で管理され、当社サーバーでは保持しません。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">2. 利用目的</h2>
              <p>当社は、収集した情報を以下の目的で利用します。</p>
              <ol className="document-list">
                <li>本サービスの提供、維持、保護及び改善のため</li>
                <li>ユーザー認証、アカウント管理のため</li>
                <li>本サービスに関する案内、お問い合わせ等への対応のため</li>
                <li>売買、取引チャット、取引評価、掲示板機能の提供のため</li>
                <li>本サービスに関する規約、ポリシー等（以下「規約等」といいます。）に違反する行為に対する対応のため</li>
                <li>本サービスに関する規約等の変更などを通知するため</li>
                <li>本サービスの利用状況を分析し、本サービスの改善に役立てるため</li>
                <li>不正利用の検知およびセキュリティ対応のため</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">3. 第三者提供・外部サービス連携</h2>
              <p>当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。なお、サービス提供のため以下の外部サービスを利用する場合があります。</p>
              <ul className="document-list">
                <li>Firebase（認証基盤）</li>
                <li>Stripe（決済処理）</li>
              </ul>
              <p>これらの外部サービスは、各社の規約・ポリシーに従って情報を取り扱います。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">4. 個人情報の開示・訂正・削除</h2>
              <ol className="document-list">
                <li>ユーザーは、法令の範囲内で、自己情報の開示、訂正、削除等を請求できます。</li>
                <li>請求時には本人確認を行う場合があります。</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">5. Cookieその他の技術の利用</h2>
              <p>本サービスは、Cookie及びこれに類する技術を利用することがあります。これらの技術は、当社による本サービスの利用状況等の把握に役立ち、サービス向上に資するものです。Cookieを無効化されたいユーザーは、ウェブブラウザの設定を変更することによりCookieを無効化することができます。但し、Cookieを無効化すると、本サービスの一部の機能をご利用いただけなくなる場合があります。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">6. お問い合わせ窓口</h2>
              <p>本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。</p>
              <div className="contact-info">
                <p>お問い合わせフォーム: <Link to="/contact">こちら</Link></p>
              </div>
            </section>

            <section className="document-section">
              <h2 className="document-heading">7. プライバシーポリシーの変更手続</h2>
              <p>当社は、必要に応じて本ポリシーを変更することがあります。重要な変更を行う場合は、本サービス内で告知します。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">8. 安全管理措置</h2>
              <p>当社は、個人情報の漏えい・改ざん・不正アクセス等を防止するため、アクセス制御、ログ監視、委託先管理など必要かつ適切な安全管理措置を講じます。</p>
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

export default Privacy;
