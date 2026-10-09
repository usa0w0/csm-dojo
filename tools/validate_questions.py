#!/usr/bin/env python3
"""問題データ（site/data/questions/*.json）を検査する。

使い方: python3 tools/validate_questions.py [--min 200]
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUESTIONS_DIR = ROOT / "site" / "data" / "questions"
GUIDE = ROOT / "tools" / "scrum-guide-2020-ja.txt"
MANIFESTO = ROOT / "tools" / "agile-manifesto-ja.txt"
CATEGORIES = ["theory", "team", "events", "artifacts", "scrum-master"]
MIN_QUOTE = 8  # 引用の最低の長さ（空白を除いた文字数）

# スクラムガイドの節。本文に出てくる順に、(本文の見出し, 問題データでの節の名前)
GUIDE_SECTIONS = [
    ("スクラムガイドの目的", "スクラムガイドの目的"),
    ("スクラムの定義", "スクラムの定義"),
    ("スクラムの理論", "スクラムの理論"),
    ("透明性", "スクラムの理論 > 透明性"),
    ("検査", "スクラムの理論 > 検査"),
    ("適応", "スクラムの理論 > 適応"),
    ("スクラムの価値基準", "スクラムの価値基準"),
    ("スクラムチーム", "スクラムチーム"),
    ("開発者", "スクラムチーム > 開発者"),
    ("プロダクトオーナー", "スクラムチーム > プロダクトオーナー"),
    ("スクラムマスター", "スクラムチーム > スクラムマスター"),
    ("スクラムイベント", "スクラムイベント"),
    ("スプリント", "スクラムイベント > スプリント"),
    ("スプリントプランニング", "スクラムイベント > スプリントプランニング"),
    ("デイリースクラム", "スクラムイベント > デイリースクラム"),
    ("スプリントレビュー", "スクラムイベント > スプリントレビュー"),
    ("スプリントレトロスペクティブ", "スクラムイベント > スプリントレトロスペクティブ"),
    ("スクラムの作成物", "スクラムの作成物"),
    ("プロダクトバックログ", "スクラムの作成物 > プロダクトバックログ"),
    ("確約（コミットメント）：プロダクトゴール", "スクラムの作成物 > 確約（コミットメント）：プロダクトゴール"),
    ("スプリントバックログ", "スクラムの作成物 > スプリントバックログ"),
    ("確約（コミットメント）：スプリントゴール", "スクラムの作成物 > 確約（コミットメント）：スプリントゴール"),
    ("インクリメント", "スクラムの作成物 > インクリメント"),
    ("確約（コミットメント）：完成の定義", "スクラムの作成物 > 確約（コミットメント）：完成の定義"),
    ("最後に", "最後に"),
    ("謝辞", None),  # ここから後ろ（謝辞、翻訳、変更点）は出題の根拠にしない
]


def squash(text):
    """表記の揺れ（全角と半角、空白、改行）をならす。"""
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", text))


def load_guide():
    """スクラムガイドの本文を、節の名前 → ならした本文 の辞書にして返す。"""
    sections = {}
    pending = list(GUIDE_SECTIONS)
    current = None
    for line in GUIDE.read_text(encoding="utf-8").splitlines():
        if line.startswith("#"):
            continue
        if pending and squash(line) == squash(pending[0][0]):
            current = pending.pop(0)[1]
            continue
        if current:
            sections[current] = sections.get(current, "") + squash(line)
    if pending:
        sys.exit(f"スクラムガイドの本文に見出しが見つからない: {pending[0][0]}")
    return sections


def load_manifesto():
    sections = {}
    current = None
    for line in MANIFESTO.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            current = line[3:].strip()
        elif current and not line.startswith("#"):
            sections[current] = sections.get(current, "") + squash(line)
    return sections


def check_question(q, category, docs, seen_ids):
    errors = []
    for key in ["id", "category", "question", "choices", "answer", "explanation", "source"]:
        if key not in q:
            return [f"{key} がない"]
    if not re.fullmatch(rf"{re.escape(category)}-\d{{3}}", str(q["id"])):
        errors.append("id が <分野>-<3桁の数字> の形でない")
    if q["id"] in seen_ids:
        errors.append("id が重複している")
    seen_ids.add(q["id"])
    if q["question"] in seen_ids:
        errors.append("同じ問題文がすでにある")
    seen_ids.add(q["question"])
    if q["category"] != category:
        errors.append("category がファイル名と合わない")
    choices = q["choices"]
    if not (isinstance(choices, list) and len(choices) == 4 and all(isinstance(c, str) and c.strip() for c in choices)):
        errors.append("choices が空でない文字列4つでない")
    elif len(set(choices)) != 4:
        errors.append("choices に重複がある")
    if not (isinstance(q["answer"], int) and not isinstance(q["answer"], bool) and 0 <= q["answer"] <= 3):
        errors.append("answer が 0〜3 の整数でない")
    for key in ["question", "explanation"]:
        if not (isinstance(q[key], str) and q[key].strip()):
            errors.append(f"{key} が空")
    source = q["source"]
    if not isinstance(source, dict) or any(not str(source.get(k, "")).strip() for k in ["doc", "section", "quote"]):
        errors.append("source に doc、section、quote がそろっていない")
    elif source["doc"] not in docs:
        errors.append(f"source.doc が {sorted(docs)} のどれでもない")
    elif source["section"] not in docs[source["doc"]]:
        errors.append(f"source.section が資料の節の名前でない: {source['section']}")
    else:
        # 引用は「…」で途中を省ける。省いた前後のそれぞれが、その節の本文にあることを確かめる
        body = docs[source["doc"]][source["section"]]
        parts = [squash(part) for part in re.split(r"…+", source["quote"])]
        if sum(len(part) for part in parts) < MIN_QUOTE:
            errors.append("quote が短すぎる")
        for part in parts:
            if part and part not in body:
                errors.append(f"quote が「{source['section']}」の本文にない: {part}")
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--min", type=int, default=200, help="問題数の下限")
    args = parser.parse_args()

    docs = {"scrum-guide-2020": load_guide(), "agile-manifesto": load_manifesto()}
    seen_ids = set()
    total = 0
    failed = False
    for category in CATEGORIES:
        path = QUESTIONS_DIR / f"{category}.json"
        try:
            questions = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as e:
            print(f"{path.name}: 読めない: {e}")
            failed = True
            continue
        for i, q in enumerate(questions):
            for error in check_question(q, category, docs, seen_ids):
                print(f"{path.name}: {q.get('id', f'{i + 1}番目')}: {error}")
                failed = True
        print(f"{category}: {len(questions)}問")
        total += len(questions)
    extra = {p.stem for p in QUESTIONS_DIR.glob("*.json")} - set(CATEGORIES)
    if extra:
        print(f"分野にないファイルがある: {sorted(extra)}")
        failed = True
    print(f"合計: {total}問")
    if total < args.min:
        print(f"問題数が下限（{args.min}問）に足りない")
        failed = True
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
