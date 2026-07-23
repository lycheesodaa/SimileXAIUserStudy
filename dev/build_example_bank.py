#!/usr/bin/env python3
"""Build the per-class example bank for the examples (prototype) condition.

For each bundle under public/data_v*/ and each domain, scans every sample's
proto model, collects the distinct training clips it cites as prototypes
grouped by proto_class, and keeps the NUM most representative per class —
ranked by how often the clip is selected as a prototype across samples (a
"central" prototype), then by its best contribution. Writes
<root>/<domain>/example_bank.json, consumed by ExamplesCheatsheet.

Run from the repo root:  python dev/build_example_bank.py
"""
import json
import glob
import collections
import os

NUM = 3  # examples kept per class


def build(sdir: str, outpath: str) -> None:
    files = glob.glob(f"{sdir}/*.json")
    byclass = collections.defaultdict(dict)  # class -> {source: [max_contrib, audio, count]}
    has_proto = False
    for f in files:
        with open(f, encoding="utf-8") as fh:
            proto = json.load(fh)["models"].get("proto")
        if not proto:
            continue
        has_proto = True
        for p in proto.get("prototypes", []):
            cls, src = p["proto_class"], p["source"]
            c = p.get("contribution", 0)
            cur = byclass[cls].get(src)
            if cur is None:
                byclass[cls][src] = [c, p["audio"], 1]
            else:
                cur[0] = max(cur[0], c)
                cur[2] += 1
    if not has_proto:
        return
    out = []
    for cls, d in byclass.items():
        ranked = sorted(d.items(), key=lambda kv: (-kv[1][2], -kv[1][0]))[:NUM]
        out.append({"label": cls, "clips": [{"source": s, "audio": v[1]} for s, v in ranked]})
    with open(outpath, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2)
    print("wrote", outpath, "classes", len(out), "clips/cls", [len(o["clips"]) for o in out])


def main() -> None:
    for root in sorted(glob.glob("public/data_v*")):
        for domain in ("lung", "bird"):
            sdir = f"{root}/{domain}/samples"
            if os.path.isdir(sdir):
                build(sdir, f"{root}/{domain}/example_bank.json")


if __name__ == "__main__":
    main()
