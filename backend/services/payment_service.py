import random
import time

class PaymentService:
    """決済処理サービス（モック実装）"""

    @staticmethod
    def process_payment(payment_data):
        """
        決済処理を実行（モック）

        Args:
            payment_data (dict): 決済データ
                - amount (int): 支払い金額
                - payment_method (str): 支払い方法
                - card_last4 (str): カード下4桁（オプション）

        Returns:
            dict: 決済結果
                - success (bool): 成功/失敗
                - transaction_id (str): トランザクションID
                - message (str): メッセージ
        """

        # 決済処理をシミュレート（0.5秒待機）
        time.sleep(0.5)

        # 95%の確率で成功
        success = random.random() > 0.05

        if success:
            transaction_id = f"TXN-{random.randint(100000000, 999999999)}"
            return {
                'success': True,
                'transaction_id': transaction_id,
                'message': '決済が正常に完了しました'
            }
        else:
            return {
                'success': False,
                'transaction_id': None,
                'message': '決済に失敗しました。カード情報を確認してください。'
            }

    @staticmethod
    def refund_payment(transaction_id, amount):
        """
        払い戻し処理（モック）

        Args:
            transaction_id (str): トランザクションID
            amount (int): 払い戻し金額

        Returns:
            dict: 払い戻し結果
        """
        time.sleep(0.3)

        return {
            'success': True,
            'refund_id': f"RFD-{random.randint(100000000, 999999999)}",
            'message': '払い戻しが正常に完了しました'
        }

    @staticmethod
    def validate_payment_method(payment_method, card_last4=None):
        """
        支払い方法のバリデーション

        Args:
            payment_method (str): 支払い方法
            card_last4 (str): カード下4桁

        Returns:
            bool: 有効な場合True
        """
        valid_methods = ['credit_card', 'bank_transfer', 'convenience_store', 'carrier_billing']

        if payment_method not in valid_methods:
            return False

        if payment_method == 'credit_card' and not card_last4:
            return False

        return True
