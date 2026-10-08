import { h, mount } from "../dom.js";
import { CATEGORIES, shuffle } from "../questions.js";
import { finishExam, load, saveExamProgress } from "../store.js";
import { questionView } from "./question.js";

// 本番の形式
const EXAM_SIZE = 50;
const EXAM_MINUTES = 60;
const PASS_RATE = 0.74; // 50問なら37問

export const passLine = (total) => Math.ceil(total * PASS_RATE);

// 各分野の問題数の比で size 問を割り振って選ぶ。端数は、端数の大きい分野から1問ずつ足す
export function pickExamQuestions(questions, size = EXAM_SIZE) {
  size = Math.min(size, questions.length);
  const groups = CATEGORIES.map((c) => {
    const items = questions.filter((q) => q.category === c.id);
    const exact = (items.length * size) / questions.length;
    return { items, take: Math.floor(exact), rest: exact - Math.floor(exact) };
  });
  let left = size - groups.reduce((n, g) => n + g.take, 0);
  for (const g of [...groups].sort((a, b) => b.rest - a.rest)) {
    if (left === 0) break;
    g.take++;
    left--;
  }
  return shuffle(groups.flatMap((g) => shuffle(g.items).slice(0, g.take)));
}

function startProgress(questions) {
  const picked = pickExamQuestions(questions);
  return {
    ids: picked.map((q) => q.id),
    orders: picked.map(() => shuffle([0, 1, 2, 3])),
    picks: picked.map(() => null),
    index: 0,
    endsAt: new Date(Date.now() + EXAM_MINUTES * 60 * 1000).toISOString(),
  };
}

export function renderExam(root, { questions }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const saved = load().examInProgress;
  // 問題が差し替わって見つからない時は、途中の状態を捨てる
  if (saved && saved.ids.every((id) => byId.has(id))) return runExam(root, saved, byId);

  const total = Math.min(EXAM_SIZE, questions.length);
  mount(
    root,
    h("h1", {}, "模擬試験"),
    h(
      "ul",
      {},
      h("li", {}, `${total}問、${EXAM_MINUTES}分。${passLine(total)}問以上の正解で合格`),
      h("li", {}, "途中では正誤が出ない。前の問題に戻って答えを変えられる"),
      h("li", {}, "時間が切れると、その時点の解答で採点する"),
      h("li", {}, "途中で閉じても、開き直せば続きから再開できる。時計は止まらない"),
    ),
    h("button", { class: "btn btn-primary", onClick: () => {
      const progress = startProgress(questions);
      saveExamProgress(progress);
      stop = runExam(root, progress, byId);
    } }, "始める"),
    h("a", { class: "btn", href: "#/" }, "ホームに戻る"),
  );
  let stop = null;
  return () => stop?.();
}

// 試験を進める。戻り値は、画面を離れる時に呼ぶ後片付け
function runExam(root, progress, byId) {
  const total = progress.ids.length;
  const endsAt = new Date(progress.endsAt).getTime();
  const clock = h("span", { class: "clock" });
  let timer = null;

  const remaining = () => Math.max(0, Math.round((endsAt - Date.now()) / 1000));
  const tick = () => {
    const sec = remaining();
    clock.textContent = `残り ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    clock.classList.toggle("is-low", sec <= 300);
    if (sec === 0) finish(true);
  };
  const stop = () => clearInterval(timer);
  const unanswered = () => progress.picks.filter((p) => p == null).length;

  const go = (index) => {
    progress.index = index;
    saveExamProgress(progress);
    show();
  };

  const show = () => {
    const i = progress.index;
    const q = byId.get(progress.ids[i]);
    mount(
      root,
      h("div", { class: "exam-bar" }, h("span", {}, `${i + 1} / ${total}問目`), clock),
      questionView(q, {
        order: progress.orders[i],
        picked: progress.picks[i],
        onPick: (choice) => {
          progress.picks[i] = choice;
          saveExamProgress(progress);
          show();
        },
      }),
      h(
        "div",
        { class: "row" },
        h("button", { class: "btn", disabled: i === 0, onClick: () => go(i - 1) }, "前の問題"),
        h("button", { class: "btn btn-primary", disabled: i === total - 1, onClick: () => go(i + 1) }, "次の問題"),
      ),
      h(
        "details",
        { class: "card" },
        h("summary", {}, `問題の一覧（未解答 ${unanswered()}問）`),
        h(
          "div",
          { class: "grid" },
          progress.ids.map((_, n) =>
            h("button", { class: `cell ${progress.picks[n] != null ? "is-done" : ""} ${n === i ? "is-current" : ""}`, onClick: () => go(n) }, String(n + 1)),
          ),
        ),
      ),
      h("button", { class: "btn", onClick: () => {
        const n = unanswered();
        if (confirm(n > 0 ? `未解答が${n}問あります。提出して採点しますか。` : "提出して採点しますか。")) finish(false);
      } }, "提出して採点する"),
      h("button", { class: "btn btn-quiet", onClick: () => {
        if (confirm("模擬試験をやめます。ここまでの解答は残りません。")) {
          stop();
          saveExamProgress(null);
          location.hash = "#/";
        }
      } }, "やめる"),
    );
  };

  const finish = (timeUp) => {
    stop();
    const rows = progress.ids.map((id, n) => {
      const q = byId.get(id);
      return { q, order: progress.orders[n], picked: progress.picks[n], correct: progress.picks[n] === q.answer };
    });
    const score = rows.filter((r) => r.correct).length;
    const byCategory = {};
    for (const r of rows) {
      const c = (byCategory[r.q.category] ??= [0, 0]);
      if (r.correct) c[0]++;
      c[1]++;
    }
    const result = { finishedAt: new Date().toISOString(), score, total, passed: score >= passLine(total), timeUp, byCategory };
    finishExam(result, rows.filter((r) => r.picked != null).map((r) => ({ id: r.q.id, correct: r.correct })));
    showResult(root, result, rows);
  };

  if (remaining() === 0) {
    finish(true);
  } else {
    show();
    tick();
    timer = setInterval(tick, 1000);
  }
  return stop;
}

function showResult(root, result, rows) {
  mount(
    root,
    h("h1", {}, "模擬試験の結果"),
    h(
      "div",
      { class: `card result ${result.passed ? "is-correct" : "is-wrong"}` },
      h("p", { class: "result-title" }, result.passed ? "合格" : "不合格"),
      h("p", { class: "score" }, `${result.total}問中 ${result.score}問 正解（${Math.round((result.score / result.total) * 100)}%）`),
      h("p", { class: "muted" }, `合格ラインは${passLine(result.total)}問。`, result.timeUp ? "時間切れで終了した。" : ""),
    ),
    h("h2", {}, "分野別"),
    h(
      "ul",
      { class: "list card" },
      CATEGORIES.filter((c) => result.byCategory[c.id]).map((c) =>
        h("li", {}, h("span", {}, c.name), h("span", {}, `${result.byCategory[c.id][0]} / ${result.byCategory[c.id][1]}`)),
      ),
    ),
    h("h2", {}, "問題ごとの正誤と解説"),
    rows.map((r, n) =>
      h(
        "details",
        { class: "card review" },
        h(
          "summary",
          {},
          h("span", { class: r.correct ? "mark is-correct" : "mark is-wrong" }, r.correct ? "○" : "×"),
          `${n + 1}. ${r.q.question}`,
        ),
        questionView(r.q, { order: r.order, picked: r.picked, reveal: true }),
      ),
    ),
    h("a", { class: "btn btn-primary", href: "#/" }, "ホームに戻る"),
    h("a", { class: "btn", href: "#/stats" }, "成績を見る"),
  );
}
