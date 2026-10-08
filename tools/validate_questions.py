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
CATEGORIES = ["theory", "team", "events", "artifacts", "scrum-master"]
DOCS = ["scrum-guide-2020", "agile-manifesto"]


def squash(text):
    """表記の揺れ（全角と半角、空白、改行）をならす。"""
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", text))


def load_guide():
    lines = [l for l in GUIDE.read_text(encoding="utf-8").splitlines() if not l.startswith("#")]
    return squash("".join(lines))


def check_question(q, category, guide, seen_ids):
    errors = []
    for key in ["id", "category", "question", "choices", "answer", "explanation", "source"]:
        if key not in q:
            return [f"{key} がない"]
    if not re.fullmatch(rf"{re.escape(category)}-\d{{3}}", str(q["id"])):
        errors.append("id が <分野>-<3桁の数字> の形でない")
    if q["id"] in seen_ids:
        errors.append("id が重複している")
    seen_ids.add(q["id"])
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
    elif source["doc"] not in DOCS:
        errors.append(f"source.doc が {DOCS} のどれでもない")
    elif source["doc"] == "scrum-guide-2020":
        # 引用は「…」で途中を省ける。省いた前後のそれぞれが本文にあることを確かめる
        for part in re.split(r"…+", source["quote"]):
            if squash(part) and squash(part) not in guide:
                errors.append(f"quote がスクラムガイドの本文にない: {part.strip()}")
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--min", type=int, default=200, help="問題数の下限")
    args = parser.parse_args()

    guide = load_guide()
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
            for error in check_question(q, category, guide, seen_ids):
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
