import { h } from "../dom.js";
import { SOURCE_DOCS, categoryName } from "../questions.js";

// 1問分の表示。order は選択肢の並び（choices の位置の配列）。
// picked が null なら解答前。reveal が true なら正誤、解説、根拠を出す
export function questionView(q, { order, picked = null, reveal = false, onPick }) {
  return h(
    "div",
    {},
    h("p", { class: "muted" }, categoryName(q.category)),
    h("p", { class: "question" }, q.question),
    order.map((i) => {
      const state = reveal
        ? i === q.answer ? "is-correct" : i === picked ? "is-wrong" : "is-dim"
        : i === picked ? "is-picked" : "";
      return h("button", { class: `btn choice ${state}`, disabled: reveal, onClick: () => onPick?.(i) }, q.choices[i]);
    }),
    reveal && explanationView(q, picked),
  );
}

function explanationView(q, picked) {
  const correct = picked === q.answer;
  return h(
    "div",
    { class: `card result ${correct ? "is-correct" : "is-wrong"}` },
    h("p", { class: "result-title" }, correct ? "正解" : picked == null ? "未解答" : "不正解"),
    !correct && h("p", {}, `正解: ${q.choices[q.answer]}`),
    h("h2", {}, "解説"),
    h("p", {}, q.explanation),
    h("h2", {}, "根拠"),
    h("p", { class: "muted" }, `${SOURCE_DOCS[q.source.doc] ?? q.source.doc}「${q.source.section}」`),
    h("blockquote", {}, q.source.quote),
  );
}
