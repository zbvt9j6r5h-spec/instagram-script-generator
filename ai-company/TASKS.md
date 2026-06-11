# タスクボード

> ステータス：🔴 未着手　🟡 進行中　✅ 完了　⏸ 保留

---

## 🔴 最優先（今すぐやる）

| # | タスク | 部門 | 詳細 |
|---|--------|------|------|
| 1 | Supabaseに `last_reset_at` カラムを追加 | DEVELOPMENT | `ALTER TABLE line_users ADD COLUMN IF NOT EXISTS last_reset_at timestamp with time zone;` をSupabase SQLエディタで実行 |
| 2 | VercelにLINE環境変数を設定 | DEVELOPMENT | `LINE_CHANNEL_SECRET` と `LINE_CHANNEL_ACCESS_TOKEN` を Vercel の環境変数に追加 |
| 3 | LINE DevelopersにWebhook URLを登録 | DEVELOPMENT | `https://instagram-script-generator-tau.vercel.app/api/line-webhook` を設定・検証 |

---

## 🟡 今週中

| # | タスク | 部門 | 詳細 |
|---|--------|------|------|
| 4 | LINEステップ配信の原稿を書く | SALES | 登録直後〜10日目の7通分。SALES.mdのシナリオ参照 |
| 5 | LINE登録者の自動登録フローを設計する | DEVELOPMENT | 現状は手動 → `line_users` テーブルへの自動INSERT処理が必要 |
| 6 | Instagram月次レポートの運用を開始する | ANALYSIS | ANALYSIS.mdのフォーマットで今月分から記録開始 |

---

## 📋 今月中

| # | タスク | 部門 | 詳細 |
|---|--------|------|------|
| 7 | 無料オファー（特典）を作る | SALES | 台本テンプレートPDF or チェックシート。LINE登録の動機になるもの |
| 8 | リールのネタを10本ストックする | SNS | SNS.mdのカテゴリ別ネタ例を参考に台本まで作っておく |
| 9 | 受講生向け課題提出フォームを用意する | COURSE | COURSE.mdのSTEP別課題に合わせたフォーム設計 |
| 10 | 台本の「コピー」ボタンをアプリに追加する | DEVELOPMENT | 生成結果をワンタップでコピーできるUI |
| 11 | ベンチマーク分析の結果を台本生成に連携する | DEVELOPMENT | 分析結果からジャンル・テーマを自動セットしてダッシュボードに遷移 |

---

## 💡 アイデア（いつかやる）

| # | タスク | 部門 | 詳細 |
|---|--------|------|------|
| 12 | X（Twitter）の運用を開始する | SNS | Instagram が安定してから。月50フォロワー増が基準 |
| 13 | 受講生専用ダッシュボードを作る | DEVELOPMENT | 進捗・課題提出・フィードバックを一元管理 |
| 14 | 台本生成のパラメータに「競合URL入力」を追加 | DEVELOPMENT | URLを入れると自動解析してテーマを提案する機能 |
| 15 | 紹介プログラムを設計する | SALES | 受講生が紹介すると特典がある仕組み |

---

## ✅ 完了済み

| 完了日 | タスク | 部門 |
|--------|--------|------|
| 2026-06-11 | ダッシュボードを2カラムレイアウトに変更（履歴サイドバー） | DEVELOPMENT |
| 2026-06-11 | 全ページのフローティングLINEボタンを削除 | DEVELOPMENT |
| 2026-06-11 | フィードバックモーダルを実装（3回生成ごとに表示） | DEVELOPMENT |
| 2026-06-11 | LINEリセットWebhookを実装（月1回制限） | DEVELOPMENT |
| 2026-06-11 | ダークテーマUIに全ページ統一 | DEVELOPMENT |
| 2026-06-11 | 利用制限カードをLINE誘導付きデザインに改善 | DEVELOPMENT |
| 2026-06-11 | ai-company ファイル構造を作成・全部門ファイルを記述 | - |

---

## 更新ルール

- タスクが完了したら「完了済み」に移動して日付を入れる
- 新しいタスクはりっきーかセクレが追加する
- 優先度が変わったらセクションを移動する
