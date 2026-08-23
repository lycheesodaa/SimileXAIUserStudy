"""Build consolidated CSV across main test conditions (excluding act/dualview).

Extracts the basic fields plus audio S3 link:
  sample_id, domain, condition, ai_prediction, true_label, audio_url
from dev/loop-and-merge/<version>/test/<domain>/<condition>.tsv

Note: For the 'noxai' condition, ai_prediction is populated from the corresponding
sample's 'similes' condition prediction.
"""

import csv
import json
import os
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent

CONDITIONS = ['similes', 'onomatopoeia', 'rexnet', 'examples', 'noxai']
DOMAINS = ['bird', 'lung']


def get_audio_url(sample_id: str, domain: str, version: str) -> str:
    data_dir_version = version.replace('.', '_')
    sample_json_path = REPO / 'public' / f'data_{data_dir_version}' / domain / 'samples' / f'{sample_id}.json'
    if sample_json_path.exists():
        try:
            with open(sample_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'audio' in data and data['audio']:
                    return data['audio']
        except Exception:
            pass
    # Fallback to standard URL construction
    return f"https://simile-xai-audio.s3.ap-southeast-2.amazonaws.com/data_{data_dir_version}/{domain}/audio/{sample_id}.wav"


def build_test_csv(version: str = 'v8.2', out_path: Path = None):
    data_dir_version = version.replace('.', '_')
    if out_path is None:
        out_path = HERE / f'test_main_conditions_{data_dir_version}.csv'

    # Preload similes predictions: (domain, sample_id) -> ai_prediction
    similes_preds = {}
    for domain in DOMAINS:
        sim_path = HERE / 'loop-and-merge' / version / 'test' / domain / 'similes.tsv'
        if sim_path.exists():
            with open(sim_path, 'r', encoding='utf-8') as f:
                for r in csv.reader(f, delimiter='\t'):
                    if r and len(r) >= 4:
                        similes_preds[(domain, r[0])] = r[3]

    rows = []
    for domain in DOMAINS:
        for cond in CONDITIONS:
            tsv_path = HERE / 'loop-and-merge' / version / 'test' / domain / f'{cond}.tsv'
            if not tsv_path.exists():
                continue
            with open(tsv_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f, delimiter='\t')
                for r in reader:
                    if not r or len(r) < 5:
                        continue
                    sample_id = r[0]
                    ai_pred = r[3]
                    if cond == 'noxai':
                        ai_pred = similes_preds.get((domain, sample_id), ai_pred)
                    audio_url = get_audio_url(sample_id, domain, version)
                    rows.append([
                        sample_id,      # sample_id
                        r[1],           # domain
                        r[2],           # condition
                        ai_pred,        # ai_prediction (borrowed from similes for noxai)
                        r[4],           # true_label
                        audio_url,      # audio_url
                    ])

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['sample_id', 'domain', 'condition', 'ai_prediction', 'true_label', 'audio_url'])
        writer.writerows(rows)

    print(f'Wrote {len(rows)} rows to {out_path}')


if __name__ == '__main__':
    import sys
    target_version = sys.argv[1] if len(sys.argv) > 1 else 'v8.2'
    
    # Generate for requested or default v8.2
    v_clean = target_version.replace('.', '_')
    build_test_csv(target_version, HERE / f'test_main_conditions_{v_clean}.csv')
    if '.' in target_version:
        build_test_csv(target_version, HERE / f'test_main_conditions_{target_version}.csv')
    build_test_csv(target_version, HERE / 'test_main_conditions.csv')
    build_test_csv(target_version, HERE / 'loop-and-merge' / target_version / 'test_main_conditions.csv')
    
    # Also keep v7 and v6 generators
    build_test_csv('v7', HERE / 'test_main_conditions_v7.csv')
    build_test_csv('v6', HERE / 'test_main_conditions_v6.csv')


