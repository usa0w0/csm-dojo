import { h, mount } from "../dom.js";
import { CATEGORIES } from "../questions.js";

export function renderHome(root, { questions }) {
  const count = (id) => questions.filter((q) => q.category === id).length;
  const boxes = CATEGORIES.map((c) => h("input", { type: "checkbox", value: c.id, checked: true }));
  const start = h("button", { class: "btn btn-primary", onClick: () => {
    location.hash = `#/quiz/${boxes.filter((b) => b.checked).map((b) => b.value).join("+")}`;
  } }, "出題する");
  const update = () => { start.disabled = !boxes.some((b) => b.checked); };
  boxes.forEach((b) => b.addEventListener("change", update));

  mount(
    root,
    h("h1", {}, "認定スクラムマスター試験の模擬問題"),
    h("p", { class: "muted" }, `全${questions.length}問。本番は50問、60分、37問正解で合格。`),
    h("h2", {}, "分野を選んで出題"),
    h(
      "div",
      { class: "card" },
      CATEGORIES.map((c, i) =>
        h("label", { class: "check" }, boxes[i], h("span", { class: "check-name" }, c.name), h("span", { class: "muted" }, `${count(c.id)}問`)),
      ),
    ),
    start,
  );
}
