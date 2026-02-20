# Bibli APIエンドポイント一覧

`backend/app.py` の実装を基準に整理しています。

## 1. ヘルスチェック・認証・ユーザー

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/hello` | ヘルスチェック | なし | `message` |
| POST | `/api/register` | ユーザー登録 | `user_name,email,password,address,phone_number,real_name,name_kana,birth_date` | 作成ユーザー情報 |
| POST | `/api/login` | メール/パスワード認証 | `email,password` | `token,user` |
| GET | `/api/user/<email>` | ユーザー基本情報取得 | path: `email` | `id,user_id,user_name,email,profile_image` |
| GET | `/api/profile/<email>` | プロフィール取得（メール） | path: `email` | プロフィール詳細 + フォロー数 |
| GET | `/api/profile/id/<user_id>` | プロフィール取得（公開ID） | path: `user_id` | プロフィール概要 + フォロー数 |
| PUT | `/api/profile/<email>` | プロフィール更新 | path: `email`, body: `user_name,bio,address,real_name,name_kana,password,...` | 更新結果 |
| POST | `/api/profile/<email>/image` | プロフィール画像更新 | path: `email`, multipart: `image` | `profile_image` |
| GET | `/uploads/<path:filename>` | アップロード画像配信 | path: `filename` | 画像ファイル |

## 2. 商品・出品・取引

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/products` | 商品一覧・検索・絞り込み・並び替え | query: `q,min_price,max_price,condition,seller_id,sort,page,limit,include_sold,viewer_email` | `products,total,page,total_pages` |
| GET | `/api/products/<int:product_id>` | 商品詳細取得 | path: `product_id` | 商品詳細 + 画像配列 + タグ + 出品者 |
| POST | `/api/products` | 商品作成（出品） | multipart/json: `title,description,price,condition,seller_id,category,tags,images` | `product_id` |
| POST | `/api/seed-products` | テスト商品投入（開発用） | なし | 作成件数 |
| POST | `/api/cleanup-blob-urls` | `blob:` URL 清掃（開発用） | なし | 更新件数 |
| POST | `/api/products/<int:product_id>/cancel` | 出品取り消し | path: `product_id`, body: `seller_email` | 取り消し結果 |
| GET | `/api/products/<int:product_id>/purchase-status` | 取引ステータス取得 | path: `product_id`, query: `email` | `purchase,role,next_status_options` |
| POST | `/api/purchases/<int:purchase_id>/status` | 取引ステータス更新 | path: `purchase_id`, body: `actor_email,status` | 更新後ステータス |

## 3. 商品チャット

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/products/<int:product_id>/chat/messages` | 商品チャット取得 | path: `product_id`, query: `email,with_user` | `participants,messages,chat_scope` |
| POST | `/api/products/<int:product_id>/chat/messages` | 商品チャット送信 | path: `product_id`, body: `sender_email,receiver_email,message` | 送信メッセージ |

## 4. お気に入り・レコメンド

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/favorites` | 自分のお気に入り一覧 | query: `email` | `favorites` |
| GET | `/api/favorites/status` | お気に入り済み判定 | query: `email,product_id` | `is_favorite` |
| POST | `/api/favorites` | お気に入り追加 | body: `email,product_id` | 追加結果 |
| DELETE | `/api/favorites` | お気に入り解除 | body/query: `email,product_id` | 解除結果 |
| GET | `/api/profile/<user_id>/favorites` | 指定ユーザーのお気に入り一覧 | path: `user_id` | `favorites` |
| GET | `/api/profile/<user_id>/purchases` | 指定ユーザーの購入履歴 | path: `user_id` | `purchases` |
| GET | `/api/recommendations` | おすすめ商品 | query: `email,limit` | `recommendations` |
| GET | `/api/follow/feed` | フォロー中ユーザー新着商品 | query: `email,limit` | `products` |

## 5. 通知・お知らせ

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/notifications` | 通知一覧取得 | query: `email` | `notifications,unread_count` |
| POST | `/api/notifications/read-all` | 全通知を既読化 | body: `email` | 更新件数 |
| GET | `/api/notification-settings` | 通知設定取得 | query: `email` | 通知設定 |
| PUT | `/api/notification-settings` | 通知設定更新 | body: `email,push_notification,email_notification,message_notification,campaign_notification` | 更新後設定 |
| GET | `/api/news` | 運営お知らせ一覧（固定データ） | なし | `news` |
| GET | `/api/news/<int:news_id>` | お知らせ詳細 | path: `news_id` | お知らせ詳細 |

## 6. 掲示板

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/forum/threads` | スレッド一覧 | query: `category,sort,page,limit` | `threads,total,total_pages` |
| POST | `/api/forum/threads` | スレッド投稿 | body: `category,title,content,author_name,author_email` | `thread_id` |
| GET | `/api/forum/threads/<int:thread_id>` | スレッド詳細 + コメント | path: `thread_id` | `thread,comments` |
| POST | `/api/forum/threads/<int:thread_id>/comments` | コメント投稿 | path: `thread_id`, body: `content,author_name,author_email` | `comment` |
| POST | `/api/forum/threads/<int:thread_id>/like` | スレッドいいね | path: `thread_id` | `like_count` |
| POST | `/api/forum/threads/<int:thread_id>/unlike` | スレッドいいね解除 | path: `thread_id` | `like_count` |
| POST | `/api/forum/comments/<int:comment_id>/like` | コメントいいね | path: `comment_id` | `like_count` |
| POST | `/api/forum/comments/<int:comment_id>/unlike` | コメントいいね解除 | path: `comment_id` | `like_count` |

## 7. フォロー・ブロック

### 掲示板名前空間

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/forum/follow/status` | フォロー状態取得 | query: `follower_email,followee_email` | `following,blocked_by_me,blocked_me,is_blocked` |
| POST | `/api/forum/follow` | フォロー | body: `follower_email,followee_email` | 実行結果 |
| POST | `/api/forum/unfollow` | フォロー解除 | body: `follower_email,followee_email` | 実行結果 |

### 汎用名前空間

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| GET | `/api/follow/status` | フォロー状態取得 | query: `follower_email,followee_email` | `following,blocked_by_me,blocked_me,is_blocked` |
| POST | `/api/follow` | フォロー | body: `follower_email,followee_email` | 実行結果 |
| POST | `/api/unfollow` | フォロー解除 | body: `follower_email,followee_email` | 実行結果 |
| GET | `/api/follow/list` | フォロー/フォロワー一覧 | query: `email,type` (`following`/`followers`) | `users` |
| GET | `/api/block/status` | ブロック関係取得 | query: `requester_email,target_email` | `blocked_by_me,blocked_me,is_blocked` |
| GET | `/api/block/list` | ブロック中一覧 | query: `email` | `users` |
| POST | `/api/block` | ブロック | body: `blocker_email,blocked_email` | 実行結果 |
| POST | `/api/unblock` | ブロック解除 | body: `blocker_email,blocked_email` | 実行結果 |

## 8. Stripe 決済

| Method | Path | 概要 | 主な入力 | 主な返却 |
|---|---|---|---|---|
| POST | `/api/stripe/create-checkout-session` | Stripe Checkoutセッション作成 | body: `product_id,origin,customer_email` | `id,url` |
| POST | `/api/stripe/webhook` | Stripe Webhook受信 | ヘッダ: `Stripe-Signature`, body: Stripe event | `status` |
| GET | `/api/purchases/session/<session_id>` | セッションから購入情報取得/確定 | path: `session_id` | `purchase,product` もしくは `status` |

## 9. 補足

- 一部APIは同一機能の重複エンドポイントがあります（例: `/api/forum/follow` と `/api/follow`）。
- 多くのAPIが `email` をクライアントから直接受け取る設計です。
- フロント側の呼び出しは `http://localhost:5000` 直書きが中心です（`VITE_API_BASE_URL` 未統一）。
