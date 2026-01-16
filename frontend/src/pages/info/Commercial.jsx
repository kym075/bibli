import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function Commercial() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="document-container">
          <h1 className="page-title">特定商取引法に基づく表記</h1>
          <p className="update-date">最終更新日: 2024年1月1日</p>

          <div className="document-content">
            <section className="document-section">
              <p>特定商取引法に基づき、以下の事項を表記いたします。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">事業者の名称</h2>
              <p>Bibli運営事務局</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">運営統括責任者</h2>
              <p>山田 太郎</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">所在地</h2>
              <p>〒150-0001<br />
              東京都渋谷区神宮前1-2-3 Bibliビル5F</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">連絡先</h2>
              <p>メールアドレス: support@bibli.com<br />
              電話番号: 03-1234-5678（受付時間: 平日10:00〜18:00）<br />
              お問い合わせフォーム: <Link to="/contact">こちら</Link></p>
              <p className="note">※商品に関するお問い合わせは、出品者に直接お問い合わせください。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">販売価格</h2>
              <p>各商品ページに表示された価格</p>
              <p className="note">※消費税込みの価格を表示しています。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">商品代金以外の必要料金</h2>
              <ul className="document-list">
                <li>配送料: 各商品ページに記載（購入者負担）</li>
                <li>販売手数料: 販売価格の10%（出品者負担）</li>
                <li>決済手数料: 無料</li>
                <li>振込手数料: 売上金の振込時に200円（振込金額が1万円未満の場合）</li>
              </ul>
            </section>

            <section className="document-section">
              <h2 className="document-heading">支払方法</h2>
              <ul className="document-list">
                <li>クレジットカード決済（VISA、MasterCard、JCB、American Express、Diners Club）</li>
                <li>コンビニ払い</li>
                <li>銀行振込</li>
                <li>キャリア決済（docomo、au、SoftBank）</li>
                <li>Bibli売上金</li>
                <li>Bibliポイント</li>
              </ul>
            </section>

            <section className="document-section">
              <h2 className="document-heading">支払時期</h2>
              <p><strong>クレジットカード決済の場合:</strong><br />
              購入確定時に決済処理が行われます。実際の引き落とし日は、各カード会社の規定に基づきます。</p>

              <p><strong>コンビニ払いの場合:</strong><br />
              購入後、3日以内にコンビニエンスストアでお支払いください。</p>

              <p><strong>銀行振込の場合:</strong><br />
              購入後、3日以内に指定の口座へお振込みください。</p>

              <p><strong>キャリア決済の場合:</strong><br />
              購入確定時に決済処理が行われます。実際の引き落とし日は、各キャリアの規定に基づきます。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">商品の引渡時期</h2>
              <p>出品者による発送予定日は、各商品ページに記載されています。通常、入金確認後1〜3日以内に発送されます。</p>
              <p className="note">※配送業者や配送地域により、到着までの日数は異なります。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">返品・交換・キャンセルについて</h2>
              <h3 className="document-subheading">返品・交換について</h3>
              <p>本サービスは個人間取引を仲介するプラットフォームであり、商品は一点物の中古品が中心となります。以下の場合に限り、返品・交換が可能です。</p>
              <ul className="document-list">
                <li>商品説明と著しく異なる商品が届いた場合</li>
                <li>配送中の破損などにより、商品に欠陥があった場合</li>
                <li>誤った商品が届いた場合</li>
              </ul>
              <p>返品・交換をご希望される場合は、商品到着後3日以内に出品者にご連絡ください。</p>

              <h3 className="document-subheading">キャンセルについて</h3>
              <p><strong>購入前のキャンセル:</strong><br />
              購入確定前であれば、いつでもキャンセル可能です。</p>

              <p><strong>購入後のキャンセル:</strong><br />
              購入確定後は、原則としてキャンセルできません。ただし、以下の場合は例外とします。</p>
              <ul className="document-list">
                <li>出品者の同意が得られた場合</li>
                <li>出品者が発送期限を過ぎても発送しない場合</li>
                <li>明らかに商品説明と異なる商品が届いた場合</li>
              </ul>

              <h3 className="document-subheading">返品送料について</h3>
              <p>出品者の責めに帰すべき事由による返品の場合、返送料は出品者が負担します。それ以外の場合は、購入者が負担するものとします。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">不良品・破損品について</h2>
              <p>商品が不良品・破損品であった場合、商品到着後3日以内に出品者にご連絡ください。出品者と協議の上、返品・返金または交換の対応をさせていただきます。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">資格・免許</h2>
              <p>古物商許可証<br />
              許可番号: 第123456789号<br />
              東京都公安委員会</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">個人情報の取り扱いについて</h2>
              <p>お客様の個人情報は、<Link to="/info/privacy">プライバシーポリシー</Link>に基づき適切に管理いたします。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">お支払方法の詳細</h2>
              <h3 className="document-subheading">クレジットカード決済</h3>
              <p>ご利用可能なクレジットカード: VISA、MasterCard、JCB、American Express、Diners Club<br />
              決済は、当社が提携する決済代行会社を通じて行われます。カード情報は当社では保持せず、PCI DSS準拠の決済代行会社にて安全に管理されます。</p>

              <h3 className="document-subheading">コンビニ払い</h3>
              <p>ご利用可能なコンビニエンスストア: セブン-イレブン、ファミリーマート、ローソン、ミニストップ、デイリーヤマザキ、セイコーマート<br />
              購入後に発行される払込票番号を、コンビニ店頭のレジまたは専用端末にてお支払いください。</p>

              <h3 className="document-subheading">銀行振込</h3>
              <p>購入後に表示される指定口座へお振込みください。振込手数料はお客様負担となります。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">トラブル時の対応</h2>
              <p>取引に関してトラブルが発生した場合は、まず取引相手（出品者または購入者）と話し合いによる解決を試みてください。話し合いで解決できない場合は、お問い合わせフォームより当社までご連絡ください。当社にて状況を確認し、必要に応じて仲介いたします。</p>
            </section>

            <section className="document-section">
              <h2 className="document-heading">免責事項</h2>
              <p>当社は、本サービスを通じて行われる個人間取引について仲介の役割を果たすものであり、商品の品質、安全性、適法性等について一切の保証をするものではありません。取引に関する最終的な責任は、取引当事者間にあります。</p>
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