export const CATEGORIES = [
  { id: "theory", name: "スクラムの理論と価値基準" },
  { id: "team", name: "スクラムチーム" },
  { id: "events", name: "スクラムイベント" },
  { id: "artifacts", name: "作成物と確約" },
  { id: "scrum-master", name: "スクラムマスター" },
];

export const SOURCE_DOCS = {
  "scrum-guide-2020": "スクラムガイド（2020年11月版）",
  "agile-manifesto": "アジャイルソフトウェア開発宣言",
};

let cache = null;

// すべての分野の問題を読む。2回目からは読んだものを返す
export function loadQuestions() {
  if (!cache) {
    cache = Promise.all(
      CATEGORIES.map(async ({ id }) => {
        const res = await fetch(`data/questions/${id}.json`);
        if (!res.ok) throw new Error(`${id}.json を読めなかった（${res.status}）`);
        return res.json();
      }),
    ).then((lists) => lists.flat());
    // 失敗した時は、次の呼び出しで読み直す
    cache.catch(() => { cache = null; });
  }
  return cache;
}

export function categoryName(id) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
