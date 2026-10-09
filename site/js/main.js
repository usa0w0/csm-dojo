import { h, mount } from "./dom.js";
import { loadQuestions } from "./questions.js";
import { renderHome } from "./views/home.js";
import { renderQuiz } from "./views/quiz.js";
import { renderExam } from "./views/exam.js";
import { renderStats } from "./views/stats.js";
import { renderPlaceholder } from "./views/placeholder.js";

// ハッシュの先頭（#/quiz なら "quiz"）で画面を決める
const routes = {
  "": renderHome,
  quiz: renderQuiz,
  exam: renderExam,
  stats: renderStats,
  about: renderPlaceholder("このサイトについて"),
};

const root = document.getElementById("app");
// 画面が返した後片付け（タイマーの停止など）。次の画面を出す前に呼ぶ
let cleanup = null;

async function render() {
  const [name = "", ...params] = location.hash.replace(/^#\/?/, "").split("/");
  const view = routes[name] ?? routes[""];
  cleanup?.();
  cleanup = null;
  try {
    const questions = await loadQuestions();
    cleanup = view(root, { questions, params }) ?? null;
  } catch (e) {
    console.error(e);
    mount(
      root,
      h("h1", {}, "問題を読み込めなかった"),
      h("p", { class: "muted" }, "通信の状態を確かめて、もう一度試してください。"),
      h("button", { class: "btn btn-primary", onClick: render }, "もう一度読み込む"),
    );
  }
}

window.addEventListener("hashchange", render);
render();
