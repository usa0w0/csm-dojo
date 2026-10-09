# 設計

期限（10/10 中にスマホの実機で使える）に合わせ、作るものを `docs/spec.md` の完了条件の範囲に絞る。

## 構成

- ビルドのない静的サイト。HTML、CSS、JavaScript（ES modules）だけで書き、ライブラリーは使わない
- 1ページ構成。画面の切り替えは URL のハッシュ（`#/quiz` など）で行う
- 問題は JSON の作り置き。開いた時に `fetch` で読む
- 履歴は localStorage に保存する

```
site/                     GitHub Pages に公開する範囲
  index.html
  css/style.css
  js/
    main.js               ハッシュによる画面の切り替え
    questions.js          問題の読み込み、絞り込み、シャッフル
    store.js              localStorage の読み書き
    views/                画面ごとの描画（home、quiz、exam、stats、about）
  data/questions/
    theory.json           分野ごとに1ファイル
    team.json
    events.json
    artifacts.json
    scrum-master.json
tools/validate_questions.py   問題データの検査
.github/workflows/pages.yml   検査と公開
docs/                     仕様、調査、設計
```

## 画面

| 画面 | 内容 |
| --- | --- |
| ホーム | 出題の始め方を選ぶ（分野を選んで出題、間違えた問題だけ、模擬試験）。全体の正答率を出す |
| 出題 | 四択を1問ずつ出す。答えるとその場で、正誤、解説、根拠（節の名前と引用）を出す。「次へ」で進む |
| 模擬試験 | 50問、60分。残り時間と何問目かを出す。途中では正誤を出さない。前の問題に戻って答えを変えられる。終了（全問に答えて提出、または時間切れ）で、得点、合否（37問以上で合格）、分野別の正答数、問題ごとの正誤と解説を出す |
| 成績 | 分野別の正答率、解いた問題数、模擬試験の結果の一覧、履歴を消すボタン |
| このサイトについて | 出典とライセンスの表示 |

- 画面の幅はスマホを基準にする。選択肢は指で押しやすい大きさにする
- 選択肢の並びは、出すたびにシャッフルする
- 分野は `docs/research.md` の5つ。複数選べる
- 「間違えた問題」は、最後に答えた時に不正解だった問題。次に正解すると外れる
- 模擬試験の50問は、各分野の問題数の比で割り振って無作為に選ぶ（公式の出題比率が公開されていないため）
- 模擬試験の途中でページを閉じても、開き直せば続きから再開できる。残り時間は終了時刻から計算する

## 問題データ

```json
{
  "id": "events-012",
  "category": "events",
  "question": "スプリントが1か月の場合、スプリントレビューのタイムボックスは最大で何時間か。",
  "choices": ["4時間", "3時間", "8時間", "2時間"],
  "answer": 0,
  "explanation": "スプリントレビューは最大4時間。8時間はスプリントプランニング、3時間はスプリントレトロスペクティブの上限。",
  "source": {
    "doc": "scrum-guide-2020",
    "section": "スクラムイベント > スプリントレビュー",
    "quote": "スプリントが1か月の場合、タイムボックスは最大4時間である。"
  }
}
```

- `answer` は `choices` の中の正解の位置（0 始まり）
- `source.doc` は `scrum-guide-2020` か `agile-manifesto`
- `id` は変えない。履歴が `id` で問題と結び付くため
- 問題数の目安は、理論と価値基準 35、スクラムチーム 40、スクラムイベント 50、作成物と確約 40、スクラムマスター 45 の計 210 問

`tools/validate_questions.py` で次を検査する。

- 必須の項目がある、選択肢が4つで重複がない、`answer` が 0〜3、`id` と問題文が全体で重複しない、`category` がファイル名と合う
- `source.section` が、資料の節の名前である（スクラムガイドは「スクラムイベント > デイリースクラム」の形、アジャイルソフトウェア開発宣言は「4つの価値」か「12の原則」）
- `source.quote` が、その節の本文に一字一句ある。全角と半角、空白、改行の違いはならして比べる。途中を省く時は「…」でつなぐ。比べる相手は、`tools/` に置いた本文の写し
- 合計が200問以上（問題作りの途中は、下限を引数で下げられる）

機械で確かめられるのは、引用が実在することと、節の名前が合っていることまで。正解と解説が引用と合っているかは、問題を書く時に本文と突き合わせて確かめる。

## 履歴の保存

localStorage の1つのキー `csm-dojo:v1` に JSON で保存する。

```json
{
  "answers": { "events-012": { "tries": 3, "correct": 2, "lastCorrect": true, "lastAt": "2026-10-10T09:00:00Z" } },
  "exams": [ { "finishedAt": "...", "score": 39, "passed": true, "byCategory": { "events": [10, 12] } } ],
  "examInProgress": null
}
```

- 模擬試験で答えた問題も `answers` に反映する
- 読めない形だった時は、空の履歴として扱う

## 公開

- GitHub Actions で `site/` を GitHub Pages に公開する（`actions/upload-pages-artifact` と `actions/deploy-pages`）。`main` への push で走る
- 同じワークフローで、公開の前に `tools/validate_questions.py` を走らせる。PR でも検査だけ走らせる
- URL は `https://usa0w0.github.io/csm-dojo/`
- リポジトリの Settings > Pages で、Source を「GitHub Actions」にする必要がある。ユーザーに頼む

## ブランチ戦略

`main` と feature ブランチだけの GitHub flow（`AGENTS.md` に書いた）。

## テスト

- 問題データは `tools/validate_questions.py` で検査する（CI）
- 画面は、手元のブラウザーと、公開後のスマホの実機で、完了条件を1つずつ確かめる
- 自動の画面テストは作らない。期限を優先する

## ライセンス

- スクラムガイドを引用するため、問題と解説（`site/data/`）は CC BY-SA 4.0 で公開する
- サイトの「このサイトについて」と README に、スクラムガイドの著者、版、翻訳者、ライセンス、原文との違い（問題と解説は独自に作ったもの）を書く
