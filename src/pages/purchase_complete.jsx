import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/common.css";
import "../assets/css/purchase_complete.css";

export default function PurchaseComplete() {
    return (
        <>
            <Header />

            <main className="main-content">
                <div className="complete-container">
                    <div className="complete-icon">🎉</div>

                    <h1 className="complete-title">購入が完了しました！</h1>
                    <p className="complete-message">
                        ご購入ありがとうございます。<br />
                        出品者が発送手続きを行うまでしばらくお待ちください。
                    </p>

                    <div className="complete-details">
                        <h2 className="detail-title">ご注文情報</h2>

                        <div className="detail-box">
                            <div className="detail-row">
                                <span className="detail-label">注文番号</span>
                                <span className="detail-value">#123456789</span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">商品名</span>
                                <span className="detail-value">夏目漱石作品集</span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">支払い金額</span>
                                <span className="detail-value">¥1,550</span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">発送方法</span>
                                <span className="detail-value">ゆうパケット（匿名配送）</span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">配送予定</span>
                                <span className="detail-value">1〜3日以内に発送予定</span>
                            </div>
                        </div>
                    </div>

                    <div className="complete-buttons">
                        <a href="/" className="btn btn-primary return-home">
                            ホームに戻る
                        </a>

                        <a href="/mypage" className="btn btn-secondary check-status">
                            購入履歴を確認する
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
