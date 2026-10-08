// 履歴を localStorage の1つのキーに JSON で保存する
const KEY = "csm-dojo:v1";

const empty = () => ({ answers: {}, exams: [], examInProgress: null });

export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && typeof data.answers === "object" && data.answers && Array.isArray(data.exams)) {
      return { ...empty(), ...data };
    }
  } catch {
    // 読めない時は空の履歴として扱う
  }
  return empty();
}

function update(change) {
  const data = load();
  change(data);
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    // プライベートブラウズや容量切れで保存できなくても、出題は続ける
    console.warn("履歴を保存できなかった", e);
  }
}

function applyAnswer(data, id, correct) {
  const a = data.answers[id] ?? { tries: 0, correct: 0 };
  data.answers[id] = {
    tries: a.tries + 1,
    correct: a.correct + (correct ? 1 : 0),
    lastCorrect: correct,
    lastAt: new Date().toISOString(),
  };
}

export function recordAnswer(id, correct) {
  update((data) => applyAnswer(data, id, correct));
}

// 模擬試験の途中の状態。null で消す
export function saveExamProgress(progress) {
  update((data) => { data.examInProgress = progress; });
}

// 模擬試験の結果を残し、答えた問題を履歴に反映して、途中の状態を消す
export function finishExam(result, answered) {
  update((data) => {
    data.exams.push(result);
    for (const { id, correct } of answered) applyAnswer(data, id, correct);
    data.examInProgress = null;
  });
}

export function clearAll() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    console.warn("履歴を消せなかった", e);
  }
}

// 最後に答えた時に不正解だった問題
export function wrongQuestions(questions, answers = load().answers) {
  return questions.filter((q) => answers[q.id]?.lastCorrect === false);
}

// 問題の集まりについて、解いた問題数、解答数、正解数を数える
export function summarize(questions, answers = load().answers) {
  const s = { total: questions.length, answered: 0, tries: 0, correct: 0 };
  for (const q of questions) {
    const a = answers[q.id];
    if (!a) continue;
    s.answered++;
    s.tries += a.tries;
    s.correct += a.correct;
  }
  return s;
}

export function rateText({ tries, correct }) {
  return tries === 0 ? "―" : `${Math.round((correct / tries) * 100)}%`;
}
