# csm-dojo

認定スクラムマスター（CSM）試験の模擬問題サイト。

## 仕様

- 元の issue は usa0w0/workbench#10。読み方: `gh issue view 10 -R usa0w0/workbench --comments`
- 仕様の正は `docs/spec.md`。元の issue は引き継ぎ時点の記録として残す
- 調査結果は `docs/research.md`、設計は `docs/design.md`
- 進捗はこのリポジトリの issue で管理する。workbench の issue には進捗を書かない

## 仕様を変える時

`docs/spec.md` を PR で変更する。完了条件を変える場合は、PR に変更前後と理由を書き、マージ後に同じ内容を元の issue（usa0w0/workbench#10）にコメントする。

## リリース時

`docs/spec.md` の完了条件を1つずつ実際に確かめる。元の issue 本文の完了条件を `docs/spec.md` の内容に合わせたうえで、満たしているものにチェックを付け、確認方法をコメントする。満たしていないものがあれば、チェックを付けずにその旨をコメントする。close と shipped はユーザーが行う。

## ブランチ運用

- `main` と feature ブランチだけの GitHub flow
- `main` から `feature/<内容を表す短い英語>` を切り、PR を `main` に向ける。`main` に直接コミット・push しない
- 1つの issue につき1つの PR。マージはユーザーが GitHub 上で行う
- `main` にマージされると、GitHub Actions が `site/` を GitHub Pages に公開する

## 開発

- ビルドはない。`site/` をそのまま配信する。手元では `python3 -m http.server -d site 8000` で開く
- 問題データを変えたら `python3 tools/validate_questions.py` を通す（CI でも走る）
- 問題と解説は `docs/research.md` の「問題の出典」に挙げた資料だけを元に書く。講座で配られた資料は使わない
