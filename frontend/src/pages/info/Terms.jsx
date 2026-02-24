import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../css/inquiry.css';

function Terms() {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="document-container">
          <h1 className="page-title">利用規約</h1>
          <p className="update-date">最終更新日: 2026年2月24日</p>

          <div className="document-content">
            <section className="document-section">
              <h2 className="document-heading">第1条（適用）</h2>
              <p>本規約は、Bibli（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意のうえ、本サービスを利用するものとします。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第2条（定義）</h2>
              <p>本サービスは、ユーザー間で本の出品・購入・コミュニケーションを行うためのWebサービスです。主な機能は以下のとおりです。</p>
              <ol className="document-list">
                <li>ユーザー登録・ログイン</li>
                <li>商品の出品、検索、購入</li>
                <li>取引チャット、取引ステータス管理、評価投稿</li>
                <li>掲示板投稿・コメント機能</li>
                <li>フォロー、ブロック、通知機能</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第3条（登録）</h2>
              <ol className="document-list">
                <li>登録情報は正確かつ最新の内容を入力してください。</li>
                <li>アカウントの管理責任はユーザー本人にあります。</li>
                <li>不正利用が疑われる場合、運営はアカウント利用を制限することがあります。</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第4条（ユーザーIDおよびパスワードの管理）</h2>
              <ol className="document-list">
                <li>ユーザーは、自己の責任でログイン情報を管理し、第三者へ共有しないものとします。</li>
                <li>不正アクセス等により生じた損害について、運営は重大な過失がない限り責任を負いません。</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第5条（禁止事項）</h2>
              <p>ユーザーは、以下の行為を行ってはなりません。</p>
              <ol className="document-list">
                <li>法令・公序良俗に反する行為</li>
                <li>虚偽情報での出品、詐欺、なりすまし行為</li>
                <li>他ユーザーへの誹謗中傷、脅迫、迷惑行為</li>
                <li>本サービスの運営妨害、不正アクセス、脆弱性の悪用</li>
                <li>無断での営業行為、データ収集、スクレイピング行為</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第6条（出品・購入・決済）</h2>
              <ol className="document-list">
                <li>本サービスはユーザー間取引の場を提供するもので、売買契約は当事者間で成立します。</li>
                <li>購入決済はStripeを利用したクレジットカード決済のみ対応しています（2026年2月時点）。</li>
                <li>カード情報は決済事業者側で管理され、運営はカード番号等を保持しません。</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第7条（チャット・掲示板・評価機能）</h2>
              <ol className="document-list">
                <li>取引チャット、掲示板、評価への投稿内容はユーザー自身の責任で管理してください。</li>
                <li>運営は、違反または不適切と判断した投稿を削除し、必要に応じて利用制限を行うことがあります。</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第8条（本サービスの停止等）</h2>
              <ol className="document-list">
                <li>メンテナンス、障害、外部サービス停止等により、サービスを一時停止することがあります。</li>
                <li>運営は、サービス品質向上のため機能変更・追加・終了を行うことがあります。</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第9条（免責）</h2>
              <ol className="document-list">
                <li>運営は、ユーザー間取引やユーザー間トラブルについて、当事者間解決を基本とします。</li>
                <li>運営は、故意または重大な過失がある場合を除き、本サービス利用に起因する損害について責任を負いません。</li>
              </ol>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第10条（利用規約の変更）</h2>
              <p>運営は、必要に応じて本規約を変更できます。重要な変更がある場合は、サービス内表示等の方法で告知します。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">第11条（準拠法及び管轄）</h2>
              <ol className="document-list">
                <li>本規約及びサービス利用契約の準拠法は日本法とします。</li>
                <li>本サービスに関する紛争は、運営者所在地を管轄する裁判所を第一審の合意管轄裁判所とします。</li>
              </ol>
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

export default Terms;
