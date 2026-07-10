const fs = require('fs');
const path = './src/app/data_v3.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/"originalAudioUrl": "\/audio\/lungausc_v3\/original\/(.+?)\.wav"/g, '"originalAudioUrl": "/audio/lungausc_v3/similes/audio/$1/original.wav"');

fs.writeFileSync(path, content, 'utf8');
console.log('done');
