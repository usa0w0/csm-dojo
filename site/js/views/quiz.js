import { h, mount } from "../dom.js";
import { CATEGORIES, shuffle } from "../questions.js";
import { questionView } from "./question.js";

// #/quiz/<分野を + でつないだもの>
export function renderQuiz(root, { questions, params }) {
  const ids = (params[0] ?? "").split("+");
  const selected = CATEGORIES.filter((c) => ids.includes(c.id)).map((c) => c.id);
  const pool = shuffle(questions.filter((q) => selected.includes(q.category)));
  if (pool.length === 0) {
    mount(root, h("h1", {}, "出題できる問題がない"), h("a", { class: "btn", href: "#/" }, "ホームに戻る"));
    return;
  }
  runQuiz(root, pool, { onRetry: () => renderQuiz(root, { questions, params }) });
}

// pool を順に1問ずつ出す。答えるたびに onAnswer(問題, 正解したか) を呼ぶ
export function runQuiz(root, pool, { onAnswer, onRetry }) {
  let index = 0;
  let correctCount = 0;

  const show = (order, picked) => {
    const q = pool[index];
    const answered = picked != null;
    const last = index === pool.length - 1;
    mount(
      root,
      h("p", { class: "progress" }, `${index + 1} / ${pool.length}問目`, answered || index > 0 ? `（正解 ${correctCount}）` : ""),
      questionView(q, {
        order,
        picked,
        reveal: answered,
        onPick: (i) => {
          const correct = i === q.answer;
          if (correct) correctCount++;
          onAnswer?.(q, correct);
          show(order, i);
        },
      }),
      answered && h("button", { class: "btn btn-primary", onClick: () => (last ? finish() : next()) }, last ? "結果を見る" : "次の問題"),
      h("a", { class: "btn btn-quiet", href: "#/" }, "やめてホームに戻る"),
    );
    if (answered) root.querySelector(".result")?.scrollIntoView({ block: "nearest" });
  };

  const next = () => {
    index++;
    show(shuffle([0, 1, 2, 3]), null);
  };

  const finish = () => {
    mount(
      root,
      h("h1", {}, "おつかれさまでした"),
      h("p", { class: "score" }, `${pool.length}問中 ${correctCount}問 正解（${Math.round((correctCount / pool.length) * 100)}%）`),
      onRetry && h("button", { class: "btn btn-primary", onClick: onRetry }, "同じ条件でもう一度"),
      h("a", { class: "btn", href: "#/" }, "ホームに戻る"),
    );
  };

  show(shuffle([0, 1, 2, 3]), null);
}
