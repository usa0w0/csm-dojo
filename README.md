# CSM 道場

認定スクラムマスター（CSM）試験に向けて、模擬問題をスマホで繰り返し解くための非公式のサイト。Scrum Alliance とは関係がない。

https://usa0w0.github.io/csm-dojo/

- 分野を選んで、四択の問題を1問ずつ解く。答えた直後に、正誤、解説、根拠が出る
- 間違えた問題だけを解き直す
- 本番と同じ形式（50問、60分、37問正解で合格）の模擬試験を受ける
- 解答の履歴と分野別の正答率を見る。履歴はブラウザーの中にだけ保存する

## 開発

ビルドはない。`site/` をそのまま配信する。

```sh
python3 -m http.server -d site 8000   # http://localhost:8000/ で開く
python3 tools/validate_questions.py   # 問題データの検査
```

仕様は [docs/spec.md](docs/spec.md)、調査は [docs/research.md](docs/research.md)、設計は [docs/design.md](docs/design.md)。

## 出典とライセンス

問題と解説は、次の2つの資料を元に、このサイトのために書いた。本番の試験問題ではない。

- [スクラムガイド（2020年11月版）日本語訳](https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-Japanese.pdf)。© 2020 Ken Schwaber and Jeff Sutherland。翻訳: 角征典、荒本実、和田圭介。[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.ja)
- [アジャイルソフトウェア開発宣言](https://agilemanifesto.org/iso/ja/manifesto.html)と[アジャイル宣言の背後にある原則](https://agilemanifesto.org/iso/ja/principles.html)。© 2001, 宣言の著者たち。日本語訳: Kenji Hiranabe

問題と解説（`site/data/`）は、スクラムガイドを引用しているため、同じ [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.ja) で公開する。根拠として引用した文のほかは、原文にはない独自の記述である。

`tools/` にある2つの資料の本文の写しは、引用を検査するためのもので、それぞれの出典とライセンスを先頭に書いてある。
