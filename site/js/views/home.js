import { h, mount } from "../dom.js";
import { CATEGORIES } from "../questions.js";

export function renderHome(root, { questions }) {
  mount(
    root,
    h("h1", {}, "認定スクラムマスター試験の模擬問題"),
    h("p", { class: "muted" }, `全${questions.length}問。本番は50問、60分、37問正解で合格。`),
    h("h2", {}, "分野"),
    h(
      "ul",
      { class: "list card" },
      CATEGORIES.map((c) =>
        h("li", {}, h("span", {}, c.name), h("span", { class: "muted" }, `${questions.filter((q) => q.category === c.id).length}問`)),
      ),
    ),
  );
}
