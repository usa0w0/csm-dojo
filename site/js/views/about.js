import { h, mount } from "../dom.js";

const link = (href, text) => h("a", { href, target: "_blank", rel: "noopener" }, text);

export function renderAbout(root) {
  mount(
    root,
    h("h1", {}, "このサイトについて"),
    h("p", {}, "認定スクラムマスター（CSM）試験に向けて、模擬問題を繰り返し解くための非公式のサイト。Scrum Alliance とは関係がない。"),
    h("p", {}, "問題と解説は、公開されている下の2つの資料を元に、このサイトのために書いたもの。本番の試験問題ではない。誤りを見つけたら、根拠に示した原文を正としてほしい。"),
    h("h2", {}, "出典"),
    h(
      "div",
      { class: "card" },
      h("p", {}, link("https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-Japanese.pdf", "スクラムガイド（2020年11月版）日本語訳")),
      h("p", { class: "muted" }, "© 2020 Ken Schwaber and Jeff Sutherland。翻訳: 角征典、荒本実、和田圭介。"),
      h("p", { class: "muted" }, link("https://creativecommons.org/licenses/by-sa/4.0/deed.ja", "CC BY-SA 4.0"), " で公開されている。このサイトは、根拠として原文を引用している。問題、選択肢、解説は原文にはなく、このサイトで作ったもの。"),
    ),
    h(
      "div",
      { class: "card" },
      h("p", {}, link("https://agilemanifesto.org/iso/ja/manifesto.html", "アジャイルソフトウェア開発宣言"), "、", link("https://agilemanifesto.org/iso/ja/principles.html", "アジャイル宣言の背後にある原則")),
      h("p", { class: "muted" }, "© 2001, 宣言の著者たち。日本語訳: Kenji Hiranabe。根拠として、一部を引用している。"),
    ),
    h("h2", {}, "ライセンス"),
    h("p", {}, "このサイトの問題と解説は、スクラムガイドと同じ ", link("https://creativecommons.org/licenses/by-sa/4.0/deed.ja", "CC BY-SA 4.0"), " で公開する。"),
    h("h2", {}, "履歴の保存"),
    h("p", {}, "解答の履歴は、このブラウザーの中にだけ保存する。サーバーには送らない。別の端末やブラウザーには引き継がれない。プライベートブラウズでは、閉じると消える。"),
    h("p", {}, link("https://github.com/usa0w0/csm-dojo", "ソースコード（GitHub）")),
    h("a", { class: "btn", href: "#/" }, "ホームに戻る"),
  );
}
