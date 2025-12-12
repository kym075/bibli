import stripe
from config import Config

# Stripe APIキーを設定
stripe.api_key = Config.STRIPE_SECRET_KEY


class StripePaymentService:
    """Stripe決済処理サービス"""

    @staticmethod
    def create_payment_intent(amount, currency='jpy', metadata=None):
        """
        PaymentIntentを作成

        Args:
            amount (int): 支払い金額（円単位）
            currency (str): 通貨コード（デフォルト: jpy）
            metadata (dict): メタデータ

        Returns:
            dict: PaymentIntent情報
                - success (bool): 成功/失敗
                - payment_intent_id (str): PaymentIntent ID
                - client_secret (str): クライアントシークレット
                - message (str): メッセージ
        """
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                }
            )

            return {
                'success': True,
                'payment_intent_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'status': payment_intent.status,
                'message': 'PaymentIntentが正常に作成されました'
            }

        except stripe.error.CardError as e:
            return {
                'success': False,
                'message': f'カードエラー: {e.user_message}'
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'message': f'Stripeエラー: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'エラーが発生しました: {str(e)}'
            }

    @staticmethod
    def confirm_payment(payment_intent_id):
        """
        PaymentIntentを確認

        Args:
            payment_intent_id (str): PaymentIntent ID

        Returns:
            dict: 確認結果
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            return {
                'success': True,
                'payment_intent_id': payment_intent.id,
                'status': payment_intent.status,
                'amount': payment_intent.amount,
                'currency': payment_intent.currency,
                'message': '決済が正常に確認されました'
            }

        except stripe.error.StripeError as e:
            return {
                'success': False,
                'message': f'Stripeエラー: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'エラーが発生しました: {str(e)}'
            }

    @staticmethod
    def create_refund(payment_intent_id, amount=None):
        """
        払い戻しを作成

        Args:
            payment_intent_id (str): PaymentIntent ID
            amount (int): 払い戻し金額（指定しない場合は全額）

        Returns:
            dict: 払い戻し結果
        """
        try:
            refund_params = {'payment_intent': payment_intent_id}
            if amount:
                refund_params['amount'] = amount

            refund = stripe.Refund.create(**refund_params)

            return {
                'success': True,
                'refund_id': refund.id,
                'amount': refund.amount,
                'status': refund.status,
                'message': '払い戻しが正常に完了しました'
            }

        except stripe.error.StripeError as e:
            return {
                'success': False,
                'message': f'Stripeエラー: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'エラーが発生しました: {str(e)}'
            }

    @staticmethod
    def create_customer(email, name=None, metadata=None):
        """
        Stripeカスタマーを作成

        Args:
            email (str): メールアドレス
            name (str): 顧客名
            metadata (dict): メタデータ

        Returns:
            dict: カスタマー情報
        """
        try:
            customer_params = {'email': email}
            if name:
                customer_params['name'] = name
            if metadata:
                customer_params['metadata'] = metadata

            customer = stripe.Customer.create(**customer_params)

            return {
                'success': True,
                'customer_id': customer.id,
                'email': customer.email,
                'message': 'カスタマーが正常に作成されました'
            }

        except stripe.error.StripeError as e:
            return {
                'success': False,
                'message': f'Stripeエラー: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'エラーが発生しました: {str(e)}'
            }

    @staticmethod
    def get_payment_method(payment_method_id):
        """
        PaymentMethodを取得

        Args:
            payment_method_id (str): PaymentMethod ID

        Returns:
            dict: PaymentMethod情報
        """
        try:
            payment_method = stripe.PaymentMethod.retrieve(payment_method_id)

            return {
                'success': True,
                'payment_method_id': payment_method.id,
                'type': payment_method.type,
                'card': {
                    'brand': payment_method.card.brand if payment_method.card else None,
                    'last4': payment_method.card.last4 if payment_method.card else None,
                    'exp_month': payment_method.card.exp_month if payment_method.card else None,
                    'exp_year': payment_method.card.exp_year if payment_method.card else None,
                } if payment_method.card else None,
                'message': 'PaymentMethodが正常に取得されました'
            }

        except stripe.error.StripeError as e:
            return {
                'success': False,
                'message': f'Stripeエラー: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'エラーが発生しました: {str(e)}'
            }

    @staticmethod
    def attach_payment_method_to_customer(payment_method_id, customer_id):
        """
        PaymentMethodをカスタマーに紐付け

        Args:
            payment_method_id (str): PaymentMethod ID
            customer_id (str): Customer ID

        Returns:
            dict: 結果
        """
        try:
            payment_method = stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer_id
            )

            return {
                'success': True,
                'payment_method_id': payment_method.id,
                'customer_id': customer_id,
                'message': 'PaymentMethodが正常に紐付けられました'
            }

        except stripe.error.StripeError as e:
            return {
                'success': False,
                'message': f'Stripeエラー: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'エラーが発生しました: {str(e)}'
            }
