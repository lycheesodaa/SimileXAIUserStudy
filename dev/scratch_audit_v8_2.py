import os
import json
import csv
import glob
from pathlib import Path

REPO = Path(r"c:\Users\stucws\Documents\phd stuff\Simile-based-Audio-XAI-UI")
DATA_DIR = REPO / "public" / "data_v8_2"
LM_DIR = REPO / "dev" / "loop-and-merge" / "v8.2"

issues = []
warnings = []
info = []

def report_issue(category, msg):
    issues.append(f"[{category}] ERROR: {msg}")

def report_warning(category, msg):
    warnings.append(f"[{category}] WARNING: {msg}")

def report_info(category, msg):
    info.append(f"[{category}] {msg}")

print("=== Starting Comprehensive v8.2 Audit ===")

# 1. Check public/data_v8_2 structure
if not DATA_DIR.exists():
    report_issue("PUBLIC", f"Data directory does not exist: {DATA_DIR}")
else:
    report_info("PUBLIC", f"Data directory found at {DATA_DIR}")

# Check manifest.json
manifest_path = DATA_DIR / "manifest.json"
if not manifest_path.exists():
    report_issue("MANIFEST", "manifest.json is missing")
else:
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        report_info("MANIFEST", f"schema_version: {manifest.get('schema_version')}, domains: {manifest.get('domains')}")
        if manifest.get('schema_version') != 'v8_2':
            report_warning("MANIFEST", f"schema_version is '{manifest.get('schema_version')}', expected 'v8_2'")
        if set(manifest.get('domains', [])) != {'lung', 'bird'}:
            report_issue("MANIFEST", f"domains in manifest are {manifest.get('domains')}, expected ['lung', 'bird']")
    except Exception as e:
        report_issue("MANIFEST", f"Failed to parse manifest.json: {e}")

# Check metrics.json
metrics_path = DATA_DIR / "metrics.json"
if not metrics_path.exists():
    report_issue("METRICS", "metrics.json is missing")
else:
    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics = json.load(f)
        report_info("METRICS", f"metrics.json contains {len(metrics)} model metric entries")
    except Exception as e:
        report_issue("METRICS", f"Failed to parse metrics.json: {e}")

# Check samples_annotation.csv
ann_path = DATA_DIR / "samples_annotation.csv"
if not ann_path.exists():
    report_issue("ANNOTATIONS", "samples_annotation.csv is missing")
else:
    with open(ann_path, "r", encoding="utf-8") as f:
        ann_rows = list(csv.reader(f))
    report_info("ANNOTATIONS", f"samples_annotation.csv has {len(ann_rows)-1} sample rows")

# Check testing.csv and training.csv
for split_name, expected_count in [("testing.csv", 40), ("training.csv", 10)]:
    split_path = DATA_DIR / split_name
    if not split_path.exists():
        report_issue("SPLIT_CSV", f"{split_name} is missing")
    else:
        with open(split_path, "r", encoding="utf-8") as f:
            rows = list(csv.reader(f))
        data_rows = rows[1:]
        report_info("SPLIT_CSV", f"{split_name} has {len(data_rows)} rows (expected {expected_count})")
        if len(data_rows) != expected_count:
            report_issue("SPLIT_CSV", f"{split_name} row count {len(data_rows)} != {expected_count}")

# Check bird and lung folders
domains = ["lung", "bird"]
expected_classes = {
    "lung": {"Crackle", "Normal", "Rhonchi", "Stridor", "Wheeze"},
    "bird": {"Black-capped Chickadee", "Blue Jay", "Eastern Towhee", "Tufted Titmouse", "Wood Thrush"}
}

domain_samples = {}
domain_core = {}

for domain in domains:
    dom_dir = DATA_DIR / domain
    if not dom_dir.exists():
        report_issue("DOMAIN", f"Domain dir missing: {dom_dir}")
        continue
    
    # core_samples.json
    core_path = dom_dir / "core_samples.json"
    if not core_path.exists():
        report_issue("CORE_SAMPLES", f"{domain}/core_samples.json missing")
    else:
        with open(core_path, "r", encoding="utf-8") as f:
            core_data = json.load(f)
        domain_core[domain] = {s["sample_id"]: s for s in core_data}
        report_info("CORE_SAMPLES", f"{domain}/core_samples.json has {len(core_data)} samples")
        classes_found = {s.get("true_label") for s in core_data}
        if classes_found != expected_classes[domain]:
            report_issue("CORE_SAMPLES", f"{domain} classes in core_samples {classes_found} != {expected_classes[domain]}")

    # concepts
    for cset in ["similes", "onomatopoeia"]:
        cpath = dom_dir / "concepts" / f"{cset}.json"
        if not cpath.exists():
            report_issue("CONCEPTS", f"{domain}/concepts/{cset}.json missing")
        else:
            with open(cpath, "r", encoding="utf-8") as f:
                cdata = json.load(f)
            report_info("CONCEPTS", f"{domain}/concepts/{cset}.json has {len(cdata)} concepts")
            if len(cdata) != 50:
                report_issue("CONCEPTS", f"{domain}/concepts/{cset}.json has {len(cdata)} entries, expected 50 (10 per class)")
            for idx, item in enumerate(cdata):
                if not item.get("concept") or not item.get("category") or not item.get("audio"):
                    report_issue("CONCEPTS", f"{domain}/concepts/{cset}.json item {idx} missing concept/category/audio: {item}")
                if item.get("category") not in expected_classes[domain]:
                    report_issue("CONCEPTS", f"{domain}/concepts/{cset}.json item {idx} invalid category: {item.get('category')}")

    # example_bank.json
    eb_path = dom_dir / "example_bank.json"
    if not eb_path.exists():
        report_warning("EXAMPLE_BANK", f"{domain}/example_bank.json is MISSING (needed for Examples Cheatsheet)")
    else:
        with open(eb_path, "r", encoding="utf-8") as f:
            eb_data = json.load(f)
        report_info("EXAMPLE_BANK", f"{domain}/example_bank.json has {len(eb_data)} class entries")

    # samples
    samples_dir = dom_dir / "samples"
    if not samples_dir.exists():
        report_issue("SAMPLES", f"{domain}/samples dir missing")
        continue
    sample_files = list(samples_dir.glob("*.json"))
    report_info("SAMPLES", f"{domain}/samples has {len(sample_files)} sample files")
    domain_samples[domain] = {}

    for sfile in sample_files:
        sid = sfile.stem
        try:
            with open(sfile, "r", encoding="utf-8") as f:
                sdata = json.load(f)
            domain_samples[domain][sid] = sdata
            
            # Check ID
            if sdata.get("sample_id") != sid:
                report_issue("SAMPLES", f"{domain}/{sfile.name} internal sample_id '{sdata.get('sample_id')}' != filename '{sid}'")
            
            # Check audio
            audio_url = sdata.get("audio", "")
            if not audio_url or not audio_url.startswith("https://"):
                report_issue("SAMPLES", f"{domain}/{sid} invalid audio url: {audio_url}")
            elif "data_v8_2" not in audio_url:
                report_warning("SAMPLES", f"{domain}/{sid} audio url does not contain 'data_v8_2': {audio_url}")

            # Check true_label
            tlabel = sdata.get("true_label")
            if tlabel not in expected_classes[domain]:
                report_issue("SAMPLES", f"{domain}/{sid} invalid true_label '{tlabel}'")

            # Check models
            models = sdata.get("models", {})
            required_models = [
                "lf_cbm_similes_adapted",
                "lf_cbm_similes_adapted_activations",
                "lf_cbm_onomatopoeia_adapted",
                "lf_cbm_onomatopoeia_adapted_activations",
                "rexnet",
                "proto"
            ]
            for rm in required_models:
                if rm not in models:
                    report_issue("SAMPLES", f"{domain}/{sid} missing model '{rm}'")

            # Check rexnet explanation
            rex = models.get("rexnet", {})
            if "explanation_md" not in rex or not rex["explanation_md"]:
                report_issue("SAMPLES", f"{domain}/{sid} rexnet missing explanation_md")

            # Check proto prototypes
            proto = models.get("proto", {})
            prototypes = proto.get("prototypes", [])
            if len(prototypes) < 5:
                report_issue("SAMPLES", f"{domain}/{sid} proto has {len(prototypes)} prototypes (< 5)")
            for p in prototypes:
                if not p.get("audio") or p.get("similarity") is None:
                    report_issue("SAMPLES", f"{domain}/{sid} prototype missing audio or similarity: {p}")

        except Exception as e:
            report_issue("SAMPLES", f"Failed parsing {domain}/{sfile.name}: {e}")

# Check testing.csv and training.csv sample presence and class balance
for split_file, split_name in [("testing.csv", "test"), ("training.csv", "train")]:
    split_path = DATA_DIR / split_file
    if split_path.exists():
        with open(split_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)
            col_dom = header.index("domain") if "domain" in header else 0
            col_id = header.index("sample_id") if "sample_id" in header else 1
            
            by_dom = {"lung": [], "bird": []}
            for row in reader:
                if not row or len(row) < 2: continue
                d, sid = row[col_dom].strip(), row[col_id].strip()
                if d in by_dom:
                    by_dom[d].append(sid)
            
            for d in domains:
                sids = by_dom[d]
                report_info("SPLIT_CHECK", f"{split_file} domain {d} has {len(sids)} samples")
                missing_sids = [sid for sid in sids if sid not in domain_samples.get(d, {})]
                if missing_sids:
                    report_issue("SPLIT_CHECK", f"{split_file} domain {d} has missing sample JSONs: {missing_sids}")
                
                class_counts = {}
                for sid in sids:
                    tl = domain_samples.get(d, {}).get(sid, {}).get("true_label", "UNKNOWN")
                    class_counts[tl] = class_counts.get(tl, 0) + 1
                report_info("SPLIT_CHECK", f"{split_file} {d} class distribution: {class_counts}")

# 2. Check Loop and Merge TSVs in dev/loop-and-merge/v8.2/
if not LM_DIR.exists():
    report_issue("LOOP_AND_MERGE", f"Loop and merge dir missing: {LM_DIR}")
else:
    report_info("LOOP_AND_MERGE", f"Loop and merge dir found at {LM_DIR}")
    
    lm_conditions = [
        'similes', 'similes_actv', 'similes_dualview_approx', 'similes_dualview_actv',
        'onomatopoeia', 'onomatopoeia_actv', 'onomatopoeia_dualview_approx', 'onomatopoeia_dualview_actv',
        'rexnet', 'examples', 'noxai'
    ]

    for split in ["test", "train"]:
        expected_rows = 20 if split == "test" else 5
        split_csv_file = DATA_DIR / ("testing.csv" if split == "test" else "training.csv")
        with open(split_csv_file, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)
            c_dom = header.index("domain") if "domain" in header else 0
            c_id = header.index("sample_id") if "sample_id" in header else 1
            expected_ids = {"lung": [], "bird": []}
            for r in reader:
                if r and len(r) >= 2:
                    dom = r[c_dom].strip()
                    if dom in expected_ids:
                        expected_ids[dom].append(r[c_id].strip())

        for domain in domains:
            split_dom_dir = LM_DIR / split / domain
            if not split_dom_dir.exists():
                report_issue("LOOP_AND_MERGE", f"Missing dir: {split_dom_dir}")
                continue
            
            for cond in lm_conditions:
                tsv_path = split_dom_dir / f"{cond}.tsv"
                if not tsv_path.exists():
                    report_issue("LOOP_AND_MERGE", f"Missing TSV: {split}/{domain}/{cond}.tsv")
                    continue
                
                with open(tsv_path, "r", encoding="utf-8") as f:
                    lines = [l.rstrip('\r\n') for l in f if l.rstrip('\r\n')]
                
                if len(lines) != expected_rows:
                    report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv has {len(lines)} rows, expected {expected_rows}")
                
                for lidx, line in enumerate(lines):
                    parts = line.split("\t")
                    sid = parts[0]
                    exp_sid = expected_ids[domain][lidx] if lidx < len(expected_ids[domain]) else None
                    if sid != exp_sid:
                        report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} sample_id '{sid}' != expected '{exp_sid}'")
                    
                    if parts[1] != domain:
                        report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} domain '{parts[1]}' != '{domain}'")
                    if parts[2] != cond:
                        report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} cond '{parts[2]}' != '{cond}'")
                    
                    sdata = domain_samples.get(domain, {}).get(sid, {})
                    if parts[4] != sdata.get("true_label"):
                        report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} true_label '{parts[4]}' != JSON '{sdata.get('true_label')}'")

                    if cond in ['similes', 'similes_actv', 'similes_dualview_approx', 'similes_dualview_actv',
                                'onomatopoeia', 'onomatopoeia_actv', 'onomatopoeia_dualview_approx', 'onomatopoeia_dualview_actv']:
                        if len(parts) != 10:
                            report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} has {len(parts)} columns, expected 10")
                    elif cond == 'rexnet':
                        if len(parts) != 16:
                            report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} has {len(parts)} columns, expected 16")
                    elif cond == 'examples':
                        if len(parts) != 20:
                            report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} has {len(parts)} columns, expected 20")
                    elif cond == 'noxai':
                        if len(parts) != 10:
                            report_issue("LOOP_AND_MERGE", f"{split}/{domain}/{cond}.tsv row {lidx+1} has {len(parts)} columns, expected 10")

# 3. Check test_main_conditions CSVs
test_main_csvs = [
    REPO / "dev" / "test_main_conditions_v8_2.csv",
    REPO / "dev" / "test_main_conditions_v8.2.csv",
    REPO / "dev" / "loop-and-merge" / "v8.2" / "test_main_conditions.csv",
]

for tm_path in test_main_csvs:
    if not tm_path.exists():
        report_issue("TEST_MAIN_CSV", f"{tm_path.name} is missing at {tm_path}")
    else:
        with open(tm_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)
            rows = list(reader)
        report_info("TEST_MAIN_CSV", f"{tm_path.relative_to(REPO)} has {len(rows)} rows (expected 200)")
        if len(rows) != 200:
            report_issue("TEST_MAIN_CSV", f"{tm_path.name} row count {len(rows)} != 200")
        if header != ['sample_id', 'domain', 'condition', 'ai_prediction', 'true_label', 'audio_url']:
            report_issue("TEST_MAIN_CSV", f"{tm_path.name} invalid header: {header}")
        
        for r_idx, r in enumerate(rows):
            sid, dom, cond, aipred, tlabel, aurl = r
            if not aurl.startswith("https://") or "data_v8_2" not in aurl:
                report_issue("TEST_MAIN_CSV", f"{tm_path.name} row {r_idx+1} audio_url invalid or not v8_2: {aurl}")
            sdata = domain_samples.get(dom, {}).get(sid, {})
            if tlabel != sdata.get("true_label"):
                report_issue("TEST_MAIN_CSV", f"{tm_path.name} row {r_idx+1} true_label '{tlabel}' != '{sdata.get('true_label')}'")

# 4. Check foilOverrides.ts
foil_file = REPO / "src" / "app" / "study" / "foilOverrides.ts"
if not foil_file.exists():
    report_issue("FOIL_OVERRIDES", "foilOverrides.ts missing")
else:
    with open(foil_file, "r", encoding="utf-8") as f:
        foil_code = f.read()
    if "'data_v8_2'" not in foil_code:
        report_issue("FOIL_OVERRIDES", "'data_v8_2' is missing in foilOverrides.ts")

# 5. Check concept loop and merge TSVs
concept_tsvs = list(glob.glob(str(REPO / "dev" / "loop-and-merge-concepts-v8*")))
if not concept_tsvs:
    report_warning("CONCEPT_TSVS", "No loop-and-merge-concepts-v8* files found in dev/")
else:
    report_info("CONCEPT_TSVS", f"Found {len(concept_tsvs)} concept TSV files: {[Path(p).name for p in concept_tsvs]}")

print("\n=== SUMMARY OF FINDINGS ===")
print(f"Total Info items: {len(info)}")
print(f"Total Warnings: {len(warnings)}")
print(f"Total Errors: {len(issues)}")

if warnings:
    print("\n--- WARNINGS ---")
    for w in warnings:
        print(w)

if issues:
    print("\n--- ERRORS / ISSUES ---")
    for iss in issues:
        print(iss)
else:
    print("\n[SUCCESS] ALL TESTS & VALIDATIONS PASSED! ZERO ERRORS FOUND.")
