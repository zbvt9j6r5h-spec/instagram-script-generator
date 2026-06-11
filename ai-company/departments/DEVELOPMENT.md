# DEVELOPMENT部門

## 担当領域
- InstaScript AI（アプリ）の開発・改善
- 自動化ツールの構築
- インフラ・デプロイ管理
- 受講生向けツールの新機能企画

---

## 現行プロダクト

### InstaScript AI
- URL：https://instagram-script-generator-tau.vercel.app
- スタック：Next.js 16.2.7 / Supabase / Anthropic Claude API / Vercel
- 主な機能：
  - 台本自動生成（ジャンル・ターゲット・テーマから台本を生成）
  - ベンチマーク動画分析（動画URLから競合の構成を分析）
  - アカウント分析（強み・弱み・1ヶ月戦略を出力）
  - 生成履歴の保存・サイドバー表示
  - 月3回の無料枠管理（LINE連携でリセット可）

---

## 環境・インフラ

| 項目 | 状況 |
|------|------|
| Vercel デプロイ | 本番稼働中 |
| Supabase | 本番DB稼働中 |
| LINE Messaging API Webhook | 実装済み・本番設定未完了 |
| `last_reset_at` カラム | Supabase側で手動追加が必要 |
| Vercel環境変数（LINE系） | 未設定 |

### 未完了の設定タスク
```sql
-- Supabaseで実行が必要
ALTER TABLE line_users ADD COLUMN IF NOT EXISTS last_reset_at timestamp with time zone;
```
- Vercelに `LINE_CHANNEL_SECRET` `LINE_CHANNEL_ACCESS_TOKEN` を追加
- LINE DevelopersのWebhook URLを `https://instagram-script-generator-tau.vercel.app/api/line-webhook` に設定

---

## 開発バックログ

### 優先度：高
- [ ] Supabase/Vercel/LINE の設定を完了してwebhookを本番稼働させる
- [ ] LINE登録者を `line_users` テーブルに自動登録するフロー（現状手動）

### 優先度：中
- [ ] 台本の「お気に入り保存」機能
- [ ] 生成結果をコピー/シェアするボタン
- [ ] 管理画面の改善（ユーザー一覧・利用統計）

### 優先度：低
- [ ] 台本生成のパラメータ拡張（競合URL入力 → 自動解析してテーマ提案）
- [ ] 受講生向けの専用ダッシュボード（進捗・課題提出）

---

## 技術メモ

- `lib/supabase-admin.ts`：サービスロールクライアント（管理操作用）
- `lib/usage.ts`：月次利用回数の管理ロジック（FREE_LIMIT=3）
- `app/api/line-webhook/route.ts`：LINE Webhookエンドポイント（署名検証・月1回リセット）
- `components/LineContactButton.tsx`：現在は全ページから削除済み（ファイルは残存）
