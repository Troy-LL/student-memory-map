import json
from pathlib import Path
from typing import Dict, Any, List


ROOT = Path(__file__).resolve().parents[1]
INPUT_PATH = ROOT / "data" / "subjects" / "sample_cs_curriculum.json"
OUTPUT_PATH = INPUT_PATH  # overwrite in place


def compute_layout(graph: Dict[str, Any]) -> Dict[str, Any]:
  semesters: List[Dict[str, Any]] = graph.get("semesters", [])
  subjects: List[Dict[str, Any]] = graph.get("subjects", [])

  # Index subjects by id
  by_id: Dict[str, Dict[str, Any]] = {s["id"]: s for s in subjects}

  height = 800.0
  top = 80.0
  bottom = height - 80.0

  # For each semester column, space subjects vertically
  for sem in semesters:
    ids = sem.get("subjectIds", [])
    count = len(ids) or 1
    if count == 1:
      ys = [height / 2.0]
    else:
      step = (bottom - top) / float(count - 1)
      ys = [top + i * step for i in range(count)]

    for sid, y in zip(ids, ys):
      subj = by_id.get(sid)
      if not subj:
        continue
      pos = subj.setdefault("position", {})
      pos["y"] = y

  # Give each semester an abstract x coordinate; React will map these to real pixels
  for subj in subjects:
    sem_index = subj.get("semesterIndex", 0)
    pos = subj.setdefault("position", {})
    pos["x"] = float(sem_index)

  graph["subjects"] = subjects
  return graph


def main() -> None:
  with INPUT_PATH.open("r", encoding="utf-8") as f:
    data = json.load(f)

  laid_out = compute_layout(data)

  with OUTPUT_PATH.open("w", encoding="utf-8") as f:
    json.dump(laid_out, f, indent=2)

  print(f"Updated layout written to {OUTPUT_PATH}")


if __name__ == "__main__":
  main()

