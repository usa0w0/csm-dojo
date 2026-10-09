import { h, mount } from "../dom.js";
import { CATEGORIES } from "../questions.js";
import { clearAll, load, rateText, summarize } from "../store.js";

const RECENT = 30;

export function renderStats(root, ctx) {
  const { questions } = ctx;
  const { answers, exams } = load();
  const all = summarize(questions, answers);
  const row = (name, s) =>
    h("tr", {}, h("th", { scope: "row" }, name), h("td", {}, rateText(s)), h("td", {}, `${s.correct} / ${s.tries}`), h("td", {}, `${s.answered} / ${s.total}`));
  const recent = questions
    .filter((q) => answers[q.id])
    .sort((a, b) => answers[b.id].lastAt.localeCompare(answers[a.id].lastAt))
    .slice(0, RECENT);

  mount(
    root,
    h("h1", {}, "成績"),
    h("h2", {}, "分野別の正答率"),
    h(
      "div",
      { class: "card" },
      h(
        "table",
        { class: "stats" },
        h("thead", {}, h("tr", {}, h("th", {}, "分野"), h("th", {}, "正答率"), h("th", {}, "正解 / 解答"), h("th", {}, "解いた問題"))),
        h("tbody", {}, CATEGORIES.map((c) => row(c.name, summarize(questions.filter((q) => q.category === c.id), answers))), row("全体", all)),
      ),
    ),
    h("h2", {}, "模擬試験の結果"),
    exams.length === 0
      ? h("p", { class: "muted" }, "まだ受けていない。")
      : h(
          "ul",
          { class: "list card" },
          [...exams].reverse().map((e) =>
            h(
              "li",
              {},
              h("span", { class: "muted" }, new Date(e.finishedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })),
              h("span", {}, `${e.score} / ${e.total}問`),
              h("span", { class: e.passed ? "mark-text is-correct" : "mark-text is-wrong" }, e.passed ? "合格" : "不合格"),
            ),
          ),
        ),
    h("h2", {}, `最近の解答（${RECENT}問まで）`),
    recent.length === 0
      ? h("p", { class: "muted" }, "まだ解いていない。")
      : h(
          "ul",
          { class: "list card" },
          recent.map((q) => {
            const a = answers[q.id];
            return h(
              "li",
              {},
              h("span", { class: a.lastCorrect ? "mark is-correct" : "mark is-wrong" }, a.lastCorrect ? "○" : "×"),
              h("span", { class: "history-text" }, q.question),
              h("span", { class: "muted" }, `${a.correct}/${a.tries}`),
            );
          }),
        ),
    h("button", { class: "btn btn-danger", onClick: () => {
      if (confirm("解答の履歴をすべて消します。元に戻せません。")) {
        clearAll();
        renderStats(root, ctx);
      }
    } }, "履歴を消す"),
    h("a", { class: "btn", href: "#/" }, "ホームに戻る"),
  );
}
