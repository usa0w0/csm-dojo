import { h, mount } from "../dom.js";
import { CATEGORIES } from "../questions.js";
import { load, rateText, summarize, wrongQuestions } from "../store.js";

export function renderHome(root, { questions }) {
  const { answers, examInProgress } = load();
  const all = summarize(questions, answers);
  const wrongCount = wrongQuestions(questions, answers).length;
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
    h("p", { class: "muted" }, `解いた問題 ${all.answered} / ${all.total}問、正答率 ${rateText(all)}`),
    h("h2", {}, "分野を選んで出題"),
    h(
      "div",
      { class: "card" },
      CATEGORIES.map((c, i) =>
        h("label", { class: "check" }, boxes[i], h("span", { class: "check-name" }, c.name), h("span", { class: "muted" }, `${count(c.id)}問`)),
      ),
    ),
    start,
    h("h2", {}, "模擬試験"),
    h("a", { class: "btn", href: "#/exam" }, examInProgress ? "模擬試験の続きから再開する" : "模擬試験を受ける"),
    h("h2", {}, "復習"),
    wrongCount > 0
      ? h("a", { class: "btn", href: "#/quiz/wrong" }, `間違えた問題だけ出題する（${wrongCount}問）`)
      : h("p", { class: "muted" }, "間違えた問題はない。"),
  );
}
