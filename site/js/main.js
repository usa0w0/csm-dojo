import { h, mount } from "./dom.js";
import { loadQuestions } from "./questions.js";
import { renderHome } from "./views/home.js";
import { renderQuiz } from "./views/quiz.js";
import { renderStats } from "./views/stats.js";
import { renderPlaceholder } from "./views/placeholder.js";

// ハッシュの先頭（#/quiz なら "quiz"）で画面を決める
const routes = {
  "": renderHome,
  quiz: renderQuiz,
  stats: renderStats,
  about: renderPlaceholder("このサイトについて"),
};

const root = document.getElementById("app");

async function render() {
  const [name = "", ...params] = location.hash.replace(/^#\/?/, "").split("/");
  const view = routes[name] ?? routes[""];
  try {
    const questions = await loadQuestions();
    view(root, { questions, params });
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
