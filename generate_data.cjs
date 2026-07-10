const fs = require('fs');

const csvPath = 'e:/coding/Simile-based Audio XAI UI/public/audio/lungausc_v3/similes/top_10_class_specific_samples_local_concept_scores.csv';
const outPath = 'e:/coding/Simile-based Audio XAI UI/src/app/data_v3.ts';

const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.trim().split('\n');

function parseCSVRow(str) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"') {
      if (inQuotes && str[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function cleanSimileText(text) {
  let s = text.trim();
  if (s.startsWith("Like ")) {
    s = s.substring(5);
  }
  s = s.toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, '_');
  s = s.replace(/_$/, ''); 
  s = s.replace(/^_/, ''); 
  return s;
}

const headers = parseCSVRow(lines[0].trim());

const data = [];

for (let i = 1; i < lines.length; i++) {
  const lineStr = lines[i].trim();
  if (!lineStr) continue;
  
  const row = parseCSVRow(lineStr);
  const samplePath = row[0];
  const trueLabel = row[1];
  const predictedLabel = row[2];
  
  const basename = samplePath.split('/').pop().replace('.wav', '');
  
  const similes = [];
  for (let j = 4; j < headers.length; j++) {
    const simileText = headers[j];
    const scoreStr = row[j];
    if (simileText && scoreStr) {
      const score = parseFloat(scoreStr);
      const cleanName = cleanSimileText(simileText);
      similes.push({
        id: `s${j - 3}-${basename}`,
        text: simileText,
        category: trueLabel,
        relatedFeatures: 'Nature',
        confidence: score,
        withinClassAudioUrl: `/audio/lungausc_v3/similes/audio/${basename}/${cleanName}.wav`
      });
    }
  }
  
  const sample = {
    id: basename,
    name: basename,
    type: trueLabel,
    predictedType: predictedLabel,
    pathology: trueLabel.toLowerCase().replace(/ /g, '_'),
    description: '',
    originalAudioUrl: `/audio/lungausc_v3/original/${basename}.wav`,
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {},
    examples: [],
    similes: similes.sort((a, b) => b.confidence - a.confidence) // Sort by score descending
  };
  
  data.push(sample);
}

const tsContent = `// Generated from top_10_class_specific_samples_local_concept_scores.csv
export interface LungSoundV3 {
  id: string;
  name: string;
  type: string;
  predictedType: string;
  pathology: string;
  description: string;
  originalAudioUrl: string;
  features: {
    pitch: string;
    loudness: string;
    duration: string;
    continuity: string;
  };
  CFcomparison: Record<string, any>;
  examples: Array<any>;
  similes: Array<{
    id: string;
    text: string;
    category: string;
    relatedFeatures: string;
    confidence: number;
    withinClassAudioUrl?: string;
    visqolMosLqo?: number | null;
    visqolVnsim?: number | null;
    genToOrig?: number | null;
  }>;
}

export const LUNG_SOUND_DATA_V3: LungSoundV3[] = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync(outPath, tsContent, 'utf8');
console.log('Successfully created data_v3.ts from local concept scores');
