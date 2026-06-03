export interface LungSound {
  id: string;
  name: string;
  type: string;
  pathology: string;
  description: string;
  originalAudioUrl: string;
  features: {
    pitch: 'High' | 'Medium' | 'Low';
    loudness: 'High' | 'Medium' | 'Low';
    duration: 'Long' | 'Medium' | 'Short';
    continuity: 'Continuous' | 'Discontinuous';
  };
  CFcomparison: Record<string, {
    pitch: 'Higher' | 'Lower' | 'Similar';
    loudness: 'Higher' | 'Lower' | 'Similar';
    duration: 'Longer' | 'Shorter' | 'Similar';
    continuity: 'Higher' | 'Lower' | 'Similar';
  }>;
  examples: Array<{
    id: string;
    rank: number;
    prototypeIdx: number;
    className: string;
    weight: number;
    activeWindow: string;
    audioUrl: string;
  }>;
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

// TODO update rexnetCF/onomatopoeia/examples 
export const LUNG_SOUND_DATA: LungSound[] = [
  {
    id: 'coarse-crackle-9269',
    name: 'Coarse Crackles #9269',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/coarse_crackles/coarse crackle_9269_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-9269',
        text: 'Like mud bubbling in a swamp.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_9269_within_class_top1.wav',
        visqolMosLqo: 4.533869,
        visqolVnsim: 0.735622,
        genToOrig: 0.628856360912323
      },
      {
        id: 's2-9269',
        text: 'Like pouring water out of a narrow-necked bottle (glug-glug).',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_9269_within_class_top2.wav',
        visqolMosLqo: 4.560068,
        visqolVnsim: 0.762162,
        genToOrig: 0.6149548888206482
      },
      {
        id: 's3-9269',
        text: 'Like the sound of a wet sponge being squeezed out.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_9269_within_class_top3.wav',
        visqolMosLqo: 4.572698,
        visqolVnsim: 0.770852,
        genToOrig: 0.5550761222839355
      }
    ],
    examples: [
        {
            id: 'coarse crackle_9269-ex1',
            rank: 1,
            prototypeIdx: 0,
            className: 'Coarse Crackle',
            weight: 1.7872217893600464,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_9269_rank1_proto0_full.wav'
        },
        {
            id: 'coarse crackle_9269-ex2',
            rank: 2,
            prototypeIdx: 6,
            className: 'Coarse Crackle',
            weight: 1.44575297832489,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_9269_rank2_proto6_full.wav'
        },
        {
            id: 'coarse crackle_9269-ex3',
            rank: 3,
            prototypeIdx: 8,
            className: 'Coarse Crackle',
            weight: 0.793138325214386,
            activeWindow: '0.11s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_9269_rank3_proto8_full.wav'
        }
    ]
  },
  {
    id: 'coarse-crackle-10816',
    name: 'Coarse Crackles #10816',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/coarse_crackles/coarse crackle_10816_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-10816',
        text: 'Like mud bubbling in a swamp.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_10816_within_class_top1.wav',
        visqolMosLqo: 4.692875,
        visqolVnsim: 0.928553,
        genToOrig: 0.7614946365356445
      },
      {
        id: 's2-10816',
        text: 'Like pouring water out of a narrow-necked bottle (glug-glug).',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_10816_within_class_top2.wav',
        visqolMosLqo: 4.692335,
        visqolVnsim: 0.92803,
        genToOrig: 0.7553349733352661
      },
      {
        id: 's3-10816',
        text: 'Like ripping a heavy piece of canvas or fabric.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_10816_within_class_top3.wav',
        visqolMosLqo: 4.695777,
        visqolVnsim: 0.931083,
        genToOrig: 0.8184698820114136
      }
    ],
    examples: [
        {
            id: 'coarse crackle_10816-ex1',
            rank: 1,
            prototypeIdx: 0,
            className: 'Coarse Crackle',
            weight: 1.7872217893600464,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_10816_rank1_proto0_full.wav'
        },
        {
            id: 'coarse crackle_10816-ex2',
            rank: 2,
            prototypeIdx: 6,
            className: 'Coarse Crackle',
            weight: 1.44575297832489,
            activeWindow: '0.62s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_10816_rank2_proto6_full.wav'
        },
        {
            id: 'coarse crackle_10816-ex3',
            rank: 3,
            prototypeIdx: 2,
            className: 'Coarse Crackle',
            weight: 0.4769857227802276,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_10816_rank3_proto2_full.wav'
        }
    ]
  },
  {
    id: 'coarse-crackle-13082',
    name: 'Coarse Crackles #13082',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/coarse_crackles/coarse crackle_13082_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-13082',
        text: 'Like mud bubbling in a swamp.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_13082_within_class_top1.wav',
        visqolMosLqo: 4.635435,
        visqolVnsim: 0.836811,
        genToOrig: 0.7733521461486816
      },
      {
        id: 's2-13082',
        text: 'Like pouring water out of a narrow-necked bottle (glug-glug).',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_13082_within_class_top2.wav',
        visqolMosLqo: 4.639141,
        visqolVnsim: 0.841333,
        genToOrig: 0.7252808809280396
      },
      {
        id: 's3-13082',
        text: 'Like the sound of a wet sponge being squeezed out.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_13082_within_class_top3.wav',
        visqolMosLqo: 4.62381,
        visqolVnsim: 0.827645,
        genToOrig: 0.7095796465873718
      }
    ],
    examples: [
        {
            id: 'coarse crackle_13082-ex1',
            rank: 1,
            prototypeIdx: 0,
            className: 'Coarse Crackle',
            weight: 1.7872217893600464,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_13082_rank1_proto0_full.wav'
        },
        {
            id: 'coarse crackle_13082-ex2',
            rank: 2,
            prototypeIdx: 6,
            className: 'Coarse Crackle',
            weight: 1.44575297832489,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_13082_rank2_proto6_full.wav'
        },
        {
            id: 'coarse crackle_13082-ex3',
            rank: 3,
            prototypeIdx: 2,
            className: 'Coarse Crackle',
            weight: 0.4769857227802276,
            activeWindow: '0.11s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_13082_rank3_proto2_full.wav'
        }
    ]
  },
  {
    id: 'coarse-crackle-24076',
    name: 'Coarse Crackles #24076',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/coarse_crackles/coarse crackle_24076_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-24076',
        text: 'Like mud bubbling in a swamp.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_24076_within_class_top1.wav',
        visqolMosLqo: 4.259172,
        visqolVnsim: 0.725343,
        genToOrig: 0.7478048801422119
      },
      {
        id: 's2-24076',
        text: 'Like pouring water out of a narrow-necked bottle (glug-glug).',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_24076_within_class_top2.wav',
        visqolMosLqo: 4.224779,
        visqolVnsim: 0.726125,
        genToOrig: 0.6440987586975098
      },
      {
        id: 's3-24076',
        text: 'Like ripping a heavy piece of canvas or fabric.',
        category: 'Coarse Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/coarse_crackles/coarse crackle_24076_within_class_top3.wav',
        visqolMosLqo: 4.316901,
        visqolVnsim: 0.746845,
        genToOrig: 0.6819342374801636
      }
    ],
    examples: [
        {
            id: 'coarse crackle_24076-ex1',
            rank: 1,
            prototypeIdx: 6,
            className: 'Coarse Crackle',
            weight: 1.44575297832489,
            activeWindow: '0.62s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_24076_rank1_proto6_full.wav'
        },
        {
            id: 'coarse crackle_24076-ex2',
            rank: 2,
            prototypeIdx: 0,
            className: 'Coarse Crackle',
            weight: 1.7872217893600464,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_24076_rank2_proto0_full.wav'
        },
        {
            id: 'coarse crackle_24076-ex3',
            rank: 3,
            prototypeIdx: 8,
            className: 'Coarse Crackle',
            weight: 0.793138325214386,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/coarse_crackles/coarse crackle_24076_rank3_proto8_full.wav'
        }
    ]
  },
  {
    id: 'fine-crackle-9570',
    name: 'Fine Crackles #9570',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/fine_crackles/fine crackle_9570_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-9570',
        text: 'Like the distant sound of fireworks popping.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_9570_within_class_top1.wav',
        visqolMosLqo: 4.635132,
        visqolVnsim: 0.8641,
        genToOrig: 0.8817782998085022
      },
      {
        id: 's2-9570',
        text: 'Like the sound of foam bubbles bursting in a bathtub.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_9570_within_class_top2.wav',
        visqolMosLqo: 4.624065,
        visqolVnsim: 0.843948,
        genToOrig: 0.7728273868560791
      },
      {
        id: 's3-9570',
        text: 'Like radio static on a low volume.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_9570_within_class_top3.wav',
        visqolMosLqo: 4.628612,
        visqolVnsim: 0.858474,
        genToOrig: 0.807163417339325
      }
    ],
    examples: [
        {
            id: 'fine crackle_9570-ex1',
            rank: 1,
            prototypeIdx: 14,
            className: 'Fine Crackle',
            weight: 1.5308672189712524,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_9570_rank1_proto14_full.wav'
        },
        {
            id: 'fine crackle_9570-ex2',
            rank: 2,
            prototypeIdx: 11,
            className: 'Fine Crackle',
            weight: 1.5512956380844116,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_9570_rank2_proto11_full.wav'
        },
        {
            id: 'fine crackle_9570-ex3',
            rank: 3,
            prototypeIdx: 19,
            className: 'Fine Crackle',
            weight: 1.1910855770111084,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_9570_rank3_proto19_full.wav'
        }
    ]
  },
  {
    id: 'fine-crackle-10204',
    name: 'Fine Crackles #10204',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/fine_crackles/fine crackle_10204_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-10204',
        text: 'Like pulling apart a strip of Velcro slowly.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_10204_within_class_top1.wav',
        visqolMosLqo: 4.697664,
        visqolVnsim: 0.939394,
        genToOrig: 0.8231823444366455
      },
      {
        id: 's2-10204',
        text: 'Like the distant sound of fireworks popping.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_10204_within_class_top2.wav',
        visqolMosLqo: 4.688791,
        visqolVnsim: 0.932017,
        genToOrig: 0.7956321239471436
      },
      {
        id: 's3-10204',
        text: 'Like radio static on a low volume.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_10204_within_class_top3.wav',
        visqolMosLqo: 4.678702,
        visqolVnsim: 0.914568,
        genToOrig: 0.8055424094200134
      }
    ],
    examples: [
        {
            id: 'fine crackle_10204-ex1',
            rank: 1,
            prototypeIdx: 14,
            className: 'Fine Crackle',
            weight: 1.5308672189712524,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_10204_rank1_proto14_full.wav'
        },
        {
            id: 'fine crackle_10204-ex2',
            rank: 2,
            prototypeIdx: 11,
            className: 'Fine Crackle',
            weight: 1.5512956380844116,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_10204_rank2_proto11_full.wav'
        },
        {
            id: 'fine crackle_10204-ex3',
            rank: 3,
            prototypeIdx: 19,
            className: 'Fine Crackle',
            weight: 1.1910855770111084,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_10204_rank3_proto19_full.wav'
        }
    ]
  },
  {
    id: 'fine-crackle-11057',
    name: 'Fine Crackles #11057',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/fine_crackles/fine crackle_11057_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-11057',
        text: 'Like the distant sound of fireworks popping.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_11057_within_class_top1.wav',
        visqolMosLqo: 4.668029,
        visqolVnsim: 0.903914,
        genToOrig: 0.7453387975692749
      },
      {
        id: 's2-11057',
        text: 'Like radio static on a low volume.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_11057_within_class_top2.wav',
        visqolMosLqo: 4.644621,
        visqolVnsim: 0.882805,
        genToOrig: 0.733549952507019
      },
      {
        id: 's3-11057',
        text: 'Like pulling apart a strip of Velcro slowly.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_11057_within_class_top3.wav',
        visqolMosLqo: 4.679198,
        visqolVnsim: 0.91908,
        genToOrig: 0.7974982261657715
      }
    ],
    examples: [
        {
            id: 'fine crackle_11057-ex1',
            rank: 1,
            prototypeIdx: 14,
            className: 'Fine Crackle',
            weight: 1.5308672189712524,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_11057_rank1_proto14_full.wav'
        },
        {
            id: 'fine crackle_11057-ex2',
            rank: 2,
            prototypeIdx: 11,
            className: 'Fine Crackle',
            weight: 1.5512956380844116,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_11057_rank2_proto11_full.wav'
        },
        {
            id: 'fine crackle_11057-ex3',
            rank: 3,
            prototypeIdx: 19,
            className: 'Fine Crackle',
            weight: 1.1910855770111084,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_11057_rank3_proto19_full.wav'
        }
    ]
  },
  {
    id: 'fine-crackle-11814',
    name: 'Fine Crackles #11814',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/fine_crackles/fine crackle_11814_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-11814',
        text: 'Like the distant sound of fireworks popping.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_11814_within_class_top1.wav',
        visqolMosLqo: 4.513788,
        visqolVnsim: 0.735819,
        genToOrig: 0.7132967710494995
      },
      {
        id: 's2-11814',
        text: 'Like the sound of foam bubbles bursting in a bathtub.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_11814_within_class_top2.wav',
        visqolMosLqo: 4.467383,
        visqolVnsim: 0.693795,
        genToOrig: 0.5709021091461182
      },
      {
        id: 's3-11814',
        text: 'Like wood popping and snapping in a distant campfire.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_11814_within_class_top3.wav',
        visqolMosLqo: 4.463379,
        visqolVnsim: 0.692059,
        genToOrig: 0.576844334602356
      }
    ],
    examples: [
        {
            id: 'fine crackle_11814-ex1',
            rank: 1,
            prototypeIdx: 14,
            className: 'Fine Crackle',
            weight: 1.5308672189712524,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_11814_rank1_proto14_full.wav'
        },
        {
            id: 'fine crackle_11814-ex2',
            rank: 2,
            prototypeIdx: 11,
            className: 'Fine Crackle',
            weight: 1.5512956380844116,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_11814_rank2_proto11_full.wav'
        },
        {
            id: 'fine crackle_11814-ex3',
            rank: 3,
            prototypeIdx: 19,
            className: 'Fine Crackle',
            weight: 1.1910855770111084,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_11814_rank3_proto19_full.wav'
        }
    ]
  },
  {
    id: 'fine-crackle-13739',
    name: 'Fine Crackles #13739',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/fine_crackles/fine crackle_13739_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-13739',
        text: 'Like the distant sound of fireworks popping.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_13739_within_class_top1.wav',
        visqolMosLqo: 4.678362,
        visqolVnsim: 0.900097,
        genToOrig: 0.8723727464675903
      },
      {
        id: 's2-13739',
        text: 'Like radio static on a low volume.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_13739_within_class_top2.wav',
        visqolMosLqo: 4.667539,
        visqolVnsim: 0.885208,
        genToOrig: 0.7623791694641113
      },
      {
        id: 's3-13739',
        text: 'Like pulling apart a strip of Velcro slowly.',
        category: 'Fine Crackles',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/fine_crackles/fine crackle_13739_within_class_top3.wav',
        visqolMosLqo: 4.658543,
        visqolVnsim: 0.881255,
        genToOrig: 0.7798597812652588
      }
    ],
    examples: [
        {
            id: 'fine crackle_13739-ex1',
            rank: 1,
            prototypeIdx: 14,
            className: 'Fine Crackle',
            weight: 1.5308672189712524,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_13739_rank1_proto14_full.wav'
        },
        {
            id: 'fine crackle_13739-ex2',
            rank: 2,
            prototypeIdx: 19,
            className: 'Fine Crackle',
            weight: 1.1910855770111084,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_13739_rank2_proto19_full.wav'
        },
        {
            id: 'fine crackle_13739-ex3',
            rank: 3,
            prototypeIdx: 11,
            className: 'Fine Crackle',
            weight: 1.5512956380844116,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/fine_crackles/fine crackle_13739_rank3_proto11_full.wav'
        }
    ]
  },
  {
    id: 'normal-594',
    name: 'Normal #594',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/normal/normal_594_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-594',
        text: 'Like a gentle breeze blowing through a quiet room.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 94,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_594_within_class_top1.wav',
        visqolMosLqo: 3.787581,
        visqolVnsim: 0.604536,
        genToOrig: 0.9729912877082825
      },
      {
        id: 's2-594',
        text: 'Like the soft, steady hum of a distant cooling fan.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 94,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_594_within_class_top2.wav',
        visqolMosLqo: 3.78997,
        visqolVnsim: 0.604417,
        genToOrig: 0.9760542511940002
      },
      {
        id: 's3-594',
        text: 'Like a quiet, steady breath during deep sleep.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 94,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_594_within_class_top3.wav',
        visqolMosLqo: 3.625605,
        visqolVnsim: 0.595271,
        genToOrig: 0.9586287140846252
      }
    ],
    examples: [
        {
            id: 'normal_594-ex1',
            rank: 1,
            prototypeIdx: 29,
            className: 'Normal',
            weight: 1.2267987728118896,
            activeWindow: '0.11s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_594_rank1_proto29_full.wav'
        },
        {
            id: 'normal_594-ex2',
            rank: 2,
            prototypeIdx: 27,
            className: 'Normal',
            weight: 1.31160306930542,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_594_rank2_proto27_full.wav'
        },
        {
            id: 'normal_594-ex3',
            rank: 3,
            prototypeIdx: 23,
            className: 'Normal',
            weight: 1.115747332572937,
            activeWindow: '0.00s - 4.51s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_594_rank3_proto23_full.wav'
        }
    ]
  },
  {
    id: 'normal-2644',
    name: 'Normal #2644',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/normal/normal_2644_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-2644',
        text: 'Like a peaceful, undisturbed respiratory cycle.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_2644_within_class_top1.wav',
        visqolMosLqo: 4.331747,
        visqolVnsim: 0.561682,
        genToOrig: 0.6696202754974365
      },
      {
        id: 's2-2644',
        text: 'Like a quiet, steady breath during deep sleep.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_2644_within_class_top2.wav',
        visqolMosLqo: 4.29298,
        visqolVnsim: 0.526118,
        genToOrig: 0.6694017648696899
      },
      {
        id: 's3-2644',
        text: 'Like a gentle breeze blowing through a quiet room.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_2644_within_class_top3.wav',
        visqolMosLqo: 4.293468,
        visqolVnsim: 0.513448,
        genToOrig: 0.5619850158691406
      }
    ],
    examples: [
        {
            id: 'normal_2644-ex1',
            rank: 1,
            prototypeIdx: 27,
            className: 'Normal',
            weight: 1.31160306930542,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_2644_rank1_proto27_full.wav'
        },
        {
            id: 'normal_2644-ex2',
            rank: 2,
            prototypeIdx: 29,
            className: 'Normal',
            weight: 1.2267987728118896,
            activeWindow: '0.11s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_2644_rank2_proto29_full.wav'
        },
        {
            id: 'normal_2644-ex3',
            rank: 3,
            prototypeIdx: 23,
            className: 'Normal',
            weight: 1.115747332572937,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_2644_rank3_proto23_full.wav'
        }
    ]
  },
  {
    id: 'normal-10038',
    name: 'Normal #10038',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/normal/normal_10038_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-10038',
        text: 'Like a gentle breeze blowing through a quiet room.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_10038_within_class_top1.wav',
        visqolMosLqo: 4.559139,
        visqolVnsim: 0.773762,
        genToOrig: 0.6861284971237183
      },
      {
        id: 's2-10038',
        text: 'Like the sound of a calm ocean tide in the distance.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_10038_within_class_top2.wav',
        visqolMosLqo: 4.508098,
        visqolVnsim: 0.730058,
        genToOrig: 0.6472750902175903
      },
      {
        id: 's3-10038',
        text: 'Like a quiet, steady breath during deep sleep.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_10038_within_class_top3.wav',
        visqolMosLqo: 4.573782,
        visqolVnsim: 0.795574,
        genToOrig: 0.693857729434967
      }
    ],
    examples: [
        {
            id: 'normal_10038-ex1',
            rank: 1,
            prototypeIdx: 27,
            className: 'Normal',
            weight: 1.31160306930542,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_10038_rank1_proto27_full.wav'
        },
        {
            id: 'normal_10038-ex2',
            rank: 2,
            prototypeIdx: 29,
            className: 'Normal',
            weight: 1.2267987728118896,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_10038_rank2_proto29_full.wav'
        },
        {
            id: 'normal_10038-ex3',
            rank: 3,
            prototypeIdx: 23,
            className: 'Normal',
            weight: 1.115747332572937,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_10038_rank3_proto23_full.wav'
        }
    ]
  },
  {
    id: 'normal-14537',
    name: 'Normal #14537',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/normal/normal_14537_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-14537',
        text: 'Like a gentle breeze blowing through a quiet room.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_14537_within_class_top1.wav',
        visqolMosLqo: 4.653115,
        visqolVnsim: 0.862889,
        genToOrig: 0.8660215139389038
      },
      {
        id: 's2-14537',
        text: 'Like the sound of a calm ocean tide in the distance.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_14537_within_class_top2.wav',
        visqolMosLqo: 4.642202,
        visqolVnsim: 0.858626,
        genToOrig: 0.7099059224128723
      },
      {
        id: 's3-14537',
        text: 'Like a quiet, steady breath during deep sleep.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_14537_within_class_top3.wav',
        visqolMosLqo: 4.662337,
        visqolVnsim: 0.876074,
        genToOrig: 0.7599949836730957
      }
    ],
    examples: [
        {
            id: 'normal_14537-ex1',
            rank: 1,
            prototypeIdx: 27,
            className: 'Normal',
            weight: 1.31160306930542,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_14537_rank1_proto27_full.wav'
        },
        {
            id: 'normal_14537-ex2',
            rank: 2,
            prototypeIdx: 29,
            className: 'Normal',
            weight: 1.2267987728118896,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_14537_rank2_proto29_full.wav'
        },
        {
            id: 'normal_14537-ex3',
            rank: 3,
            prototypeIdx: 23,
            className: 'Normal',
            weight: 1.115747332572937,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_14537_rank3_proto23_full.wav'
        }
    ]
  },
  {
    id: 'normal-18629',
    name: 'Normal #18629',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/normal/normal_18629_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-18629',
        text: 'Like a gentle breeze blowing through a quiet room.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_18629_within_class_top1.wav',
        visqolMosLqo: 4.615525,
        visqolVnsim: 0.828969,
        genToOrig: 0.832734227180481
      },
      {
        id: 's2-18629',
        text: 'Like the sound of a calm ocean tide in the distance.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_18629_within_class_top2.wav',
        visqolMosLqo: 4.611998,
        visqolVnsim: 0.819381,
        genToOrig: 0.7859771847724915
      },
      {
        id: 's3-18629',
        text: 'Like a quiet, steady breath during deep sleep.',
        category: 'Normal',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/normal/normal_18629_within_class_top3.wav',
        visqolMosLqo: 4.623858,
        visqolVnsim: 0.836036,
        genToOrig: 0.8716719150543213
      }
    ],
    examples: [
        {
            id: 'normal_18629-ex1',
            rank: 1,
            prototypeIdx: 29,
            className: 'Normal',
            weight: 1.2267987728118896,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_18629_rank1_proto29_full.wav'
        },
        {
            id: 'normal_18629-ex2',
            rank: 2,
            prototypeIdx: 27,
            className: 'Normal',
            weight: 1.31160306930542,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_18629_rank2_proto27_full.wav'
        },
        {
            id: 'normal_18629-ex3',
            rank: 3,
            prototypeIdx: 23,
            className: 'Normal',
            weight: 1.115747332572937,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/normal/normal_18629_rank3_proto23_full.wav'
        }
    ]
  },
  {
    id: 'rhonchi-26060',
    name: 'Rhonchi #26060',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v2/original/rhonchi/rhonchi_26060_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-26060',
        text: 'Like the low moaning of a ghost in a movie.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_26060_within_class_top1.wav',
        visqolMosLqo: 3.895633,
        visqolVnsim: 0.832607,
        genToOrig: 0.971419632434845
      },
      {
        id: 's2-26060',
        text: 'Like a distinct "grumbling" of an upset stomach.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_26060_within_class_top2.wav',
        visqolMosLqo: 4.193775,
        visqolVnsim: 0.828538,
        genToOrig: 0.9681625366210938
      },
      {
        id: 's3-26060',
        text: 'Like a low note played on a cello or bassoon.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_26060_within_class_top3.wav',
        visqolMosLqo: 3.902753,
        visqolVnsim: 0.83256,
        genToOrig: 0.9628603458404541
      }
    ],
    examples: [
        {
            id: 'rhonchi_26060-ex1',
            rank: 1,
            prototypeIdx: 32,
            className: 'Rhonchi',
            weight: 1.7904473543167114,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_26060_rank1_proto32_full.wav'
        },
        {
            id: 'rhonchi_26060-ex2',
            rank: 2,
            prototypeIdx: 36,
            className: 'Rhonchi',
            weight: 1.981807231903076,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_26060_rank2_proto36_full.wav'
        },
        {
            id: 'rhonchi_26060-ex3',
            rank: 3,
            prototypeIdx: 31,
            className: 'Rhonchi',
            weight: 1.480868935585022,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_26060_rank3_proto31_full.wav'
        }
    ]
  },
  {
    id: 'rhonchi-28542',
    name: 'Rhonchi #28542',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v2/original/rhonchi/rhonchi_28542_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-28542',
        text: 'Like the low moaning of a ghost in a movie.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_28542_within_class_top1.wav',
        visqolMosLqo: 4.516802,
        visqolVnsim: 0.889152,
        genToOrig: 0.9580005407333374
      },
      {
        id: 's2-28542',
        text: 'Like a distinct "grumbling" of an upset stomach.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_28542_within_class_top2.wav',
        visqolMosLqo: 4.512652,
        visqolVnsim: 0.866873,
        genToOrig: 0.9501843452453613
      },
      {
        id: 's3-28542',
        text: 'Like air bubbling through thick plumbing pipes.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_28542_within_class_top3.wav',
        visqolMosLqo: 4.456461,
        visqolVnsim: 0.875976,
        genToOrig: 0.9214131832122803
      }
    ],
    examples: [
        {
            id: 'rhonchi_28542-ex1',
            rank: 1,
            prototypeIdx: 36,
            className: 'Rhonchi',
            weight: 1.981807231903076,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_28542_rank1_proto36_full.wav'
        },
        {
            id: 'rhonchi_28542-ex2',
            rank: 2,
            prototypeIdx: 32,
            className: 'Rhonchi',
            weight: 1.7904473543167114,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_28542_rank2_proto32_full.wav'
        },
        {
            id: 'rhonchi_28542-ex3',
            rank: 3,
            prototypeIdx: 31,
            className: 'Rhonchi',
            weight: 1.480868935585022,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_28542_rank3_proto31_full.wav'
        }
    ]
  },
  {
    id: 'rhonchi-30751',
    name: 'Rhonchi #30751',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v2/original/rhonchi/rhonchi_30751_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-30751',
        text: 'Like the low moaning of a ghost in a movie.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_30751_within_class_top1.wav',
        visqolMosLqo: 4.247954,
        visqolVnsim: 0.568166,
        genToOrig: 0.924117922782898
      },
      {
        id: 's2-30751',
        text: 'Like a distinct "grumbling" of an upset stomach.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_30751_within_class_top2.wav',
        visqolMosLqo: 4.323122,
        visqolVnsim: 0.651198,
        genToOrig: 0.8903343677520752
      },
      {
        id: 's3-30751',
        text: 'Like a cat purring loudly against your chest.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_30751_within_class_top3.wav',
        visqolMosLqo: 4.376347,
        visqolVnsim: 0.688391,
        genToOrig: 0.893905758857727
      }
    ],
    examples: [
        {
            id: 'rhonchi_30751-ex1',
            rank: 1,
            prototypeIdx: 32,
            className: 'Rhonchi',
            weight: 1.7904473543167114,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_30751_rank1_proto32_full.wav'
        },
        {
            id: 'rhonchi_30751-ex2',
            rank: 2,
            prototypeIdx: 36,
            className: 'Rhonchi',
            weight: 1.981807231903076,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_30751_rank2_proto36_full.wav'
        },
        {
            id: 'rhonchi_30751-ex3',
            rank: 3,
            prototypeIdx: 31,
            className: 'Rhonchi',
            weight: 1.480868935585022,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_30751_rank3_proto31_full.wav'
        }
    ]
  },
  {
    id: 'rhonchi-32609',
    name: 'Rhonchi #32609',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v2/original/rhonchi/rhonchi_32609_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-32609',
        text: 'Like the low moaning of a ghost in a movie.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_32609_within_class_top1.wav',
        visqolMosLqo: 4.326845,
        visqolVnsim: 0.761536,
        genToOrig: 0.9031933546066284
      },
      {
        id: 's2-32609',
        text: 'Like a distinct "grumbling" of an upset stomach.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_32609_within_class_top2.wav',
        visqolMosLqo: 4.13668,
        visqolVnsim: 0.651133,
        genToOrig: 0.8027029037475586
      },
      {
        id: 's3-32609',
        text: 'Like a cat purring loudly against your chest.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 99,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_32609_within_class_top3.wav',
        visqolMosLqo: 4.032165,
        visqolVnsim: 0.704654,
        genToOrig: 0.8821311593055725
      }
    ],
    examples: [
        {
            id: 'rhonchi_32609-ex1',
            rank: 1,
            prototypeIdx: 32,
            className: 'Rhonchi',
            weight: 1.7904473543167114,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_32609_rank1_proto32_full.wav'
        },
        {
            id: 'rhonchi_32609-ex2',
            rank: 2,
            prototypeIdx: 36,
            className: 'Rhonchi',
            weight: 1.981807231903076,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_32609_rank2_proto36_full.wav'
        },
        {
            id: 'rhonchi_32609-ex3',
            rank: 3,
            prototypeIdx: 31,
            className: 'Rhonchi',
            weight: 1.480868935585022,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_32609_rank3_proto31_full.wav'
        }
    ]
  },
  {
    id: 'rhonchi-34529',
    name: 'Rhonchi #34529',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v2/original/rhonchi/rhonchi_34529_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-34529',
        text: 'Like the low moaning of a ghost in a movie.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_34529_within_class_top1.wav',
        visqolMosLqo: 4.099893,
        visqolVnsim: 0.606669,
        genToOrig: 0.8536749482154846
      },
      {
        id: 's2-34529',
        text: 'Like a distinct "grumbling" of an upset stomach.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_34529_within_class_top2.wav',
        visqolMosLqo: 4.241988,
        visqolVnsim: 0.610708,
        genToOrig: 0.8216901421546936
      },
      {
        id: 's3-34529',
        text: 'Like a person snoring deeply.',
        category: 'Rhonchi',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/rhonchi/rhonchi_34529_within_class_top3.wav',
        visqolMosLqo: 4.208489,
        visqolVnsim: 0.51136,
        genToOrig: 0.8730428218841553
      }
    ],
    examples: [
        {
            id: 'rhonchi_34529-ex1',
            rank: 1,
            prototypeIdx: 36,
            className: 'Rhonchi',
            weight: 1.981807231903076,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_34529_rank1_proto36_full.wav'
        },
        {
            id: 'rhonchi_34529-ex2',
            rank: 2,
            prototypeIdx: 32,
            className: 'Rhonchi',
            weight: 1.7904473543167114,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_34529_rank2_proto32_full.wav'
        },
        {
            id: 'rhonchi_34529-ex3',
            rank: 3,
            prototypeIdx: 31,
            className: 'Rhonchi',
            weight: 1.480868935585022,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/rhonchi/rhonchi_34529_rank3_proto31_full.wav'
        }
    ]
  },
  {
    id: 'stridor-24614',
    name: 'Stridor #24614',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v2/original/stridor/stridor_24614_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-24614',
        text: 'Like a foghorn in the distance (if lower pitched).',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_24614_within_class_top1.wav',
        visqolMosLqo: 4.418225,
        visqolVnsim: 0.640311,
        genToOrig: 0.6908658146858215
      },
      {
        id: 's2-24614',
        text: 'Like a seal barking.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_24614_within_class_top2.wav',
        visqolMosLqo: 4.275448,
        visqolVnsim: 0.509745,
        genToOrig: 0.6401706337928772
      },
      {
        id: 's3-24614',
        text: 'Like a rooster crowing.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_24614_within_class_top3.wav',
        visqolMosLqo: 4.275224,
        visqolVnsim: 0.509591,
        genToOrig: 0.49405092000961304
      }
    ],
    examples: [
        {
            id: 'stridor_24614-ex1',
            rank: 1,
            prototypeIdx: 46,
            className: 'Stridor',
            weight: 1.6564983129501345,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_24614_rank1_proto46_full.wav'
        },
        {
            id: 'stridor_24614-ex2',
            rank: 2,
            prototypeIdx: 48,
            className: 'Stridor',
            weight: 1.753227949142456,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_24614_rank2_proto48_full.wav'
        },
        {
            id: 'stridor_24614-ex3',
            rank: 3,
            prototypeIdx: 41,
            className: 'Stridor',
            weight: 1.4839074611663818,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_24614_rank3_proto41_full.wav'
        }
    ]
  },
  {
    id: 'stridor-27508',
    name: 'Stridor #27508',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v2/original/stridor/stridor_27508_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-27508',
        text: 'Like a mosquito buzzing near your ear.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 91,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_27508_within_class_top1.wav',
        visqolMosLqo: 4.351048,
        visqolVnsim: 0.673304,
        genToOrig: 0.8695881366729736
      },
      {
        id: 's2-27508',
        text: 'Like a whale song (high frequency).',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 91,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_27508_within_class_top2.wav',
        visqolMosLqo: 4.393326,
        visqolVnsim: 0.701655,
        genToOrig: 0.9528595805168152
      },
      {
        id: 's3-27508',
        text: 'Like blowing across the top of a small glass bottle.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 91,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_27508_within_class_top3.wav',
        visqolMosLqo: 4.3172,
        visqolVnsim: 0.68072,
        genToOrig: 0.8524410724639893
      }
    ],
    examples: [
        {
            id: 'stridor_27508-ex1',
            rank: 1,
            prototypeIdx: 46,
            className: 'Stridor',
            weight: 1.6564983129501345,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_27508_rank1_proto46_full.wav'
        },
        {
            id: 'stridor_27508-ex2',
            rank: 2,
            prototypeIdx: 48,
            className: 'Stridor',
            weight: 1.753227949142456,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_27508_rank2_proto48_full.wav'
        },
        {
            id: 'stridor_27508-ex3',
            rank: 3,
            prototypeIdx: 41,
            className: 'Stridor',
            weight: 1.4839074611663818,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_27508_rank3_proto41_full.wav'
        }
    ]
  },
  {
    id: 'stridor-31850',
    name: 'Stridor #31850',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v2/original/stridor/stridor_31850_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-31850',
        text: 'Like a foghorn in the distance (if lower pitched).',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_31850_within_class_top1.wav',
        visqolMosLqo: 4.099457,
        visqolVnsim: 0.636978,
        genToOrig: 0.7800922393798828
      },
      {
        id: 's2-31850',
        text: 'Like a seal barking.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_31850_within_class_top2.wav',
        visqolMosLqo: 3.983185,
        visqolVnsim: 0.460035,
        genToOrig: 0.649111270904541
      },
      {
        id: 's3-31850',
        text: 'Like a rooster crowing.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_31850_within_class_top3.wav',
        visqolMosLqo: 3.99946,
        visqolVnsim: 0.465005,
        genToOrig: 0.5726186037063599
      }
    ],
    examples: [
        {
            id: 'stridor_31850-ex1',
            rank: 1,
            prototypeIdx: 46,
            className: 'Stridor',
            weight: 1.6564983129501345,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_31850_rank1_proto46_full.wav'
        },
        {
            id: 'stridor_31850-ex2',
            rank: 2,
            prototypeIdx: 48,
            className: 'Stridor',
            weight: 1.753227949142456,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_31850_rank2_proto48_full.wav'
        },
        {
            id: 'stridor_31850-ex3',
            rank: 3,
            prototypeIdx: 41,
            className: 'Stridor',
            weight: 1.4839074611663818,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_31850_rank3_proto41_full.wav'
        }
    ]
  },
  {
    id: 'stridor-33472',
    name: 'Stridor #33472',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v2/original/stridor/stridor_33472_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-33472',
        text: 'Like a foghorn in the distance (if lower pitched).',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_33472_within_class_top1.wav',
        visqolMosLqo: 4.200844,
        visqolVnsim: 0.748313,
        genToOrig: 0.8695676326751709
      },
      {
        id: 's2-33472',
        text: 'Like a seal barking.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_33472_within_class_top2.wav',
        visqolMosLqo: 4.123341,
        visqolVnsim: 0.681599,
        genToOrig: 0.8044832944869995
      },
      {
        id: 's3-33472',
        text: 'Like a rooster crowing.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_33472_within_class_top3.wav',
        visqolMosLqo: 4.221508,
        visqolVnsim: 0.696802,
        genToOrig: 0.6820764541625977
      }
    ],
    examples: [
        {
            id: 'stridor_33472-ex1',
            rank: 1,
            prototypeIdx: 46,
            className: 'Stridor',
            weight: 1.6564983129501345,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_33472_rank1_proto46_full.wav'
        },
        {
            id: 'stridor_33472-ex2',
            rank: 2,
            prototypeIdx: 41,
            className: 'Stridor',
            weight: 1.4839074611663818,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_33472_rank2_proto41_full.wav'
        },
        {
            id: 'stridor_33472-ex3',
            rank: 3,
            prototypeIdx: 48,
            className: 'Stridor',
            weight: 1.753227949142456,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_33472_rank3_proto48_full.wav'
        }
    ]
  },
  {
    id: 'stridor-38105',
    name: 'Stridor #38105',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v2/original/stridor/stridor_38105_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-38105',
        text: 'Like a foghorn in the distance (if lower pitched).',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_38105_within_class_top1.wav',
        visqolMosLqo: 4.622424,
        visqolVnsim: 0.895914,
        genToOrig: 0.9279025793075562
      },
      {
        id: 's2-38105',
        text: 'Like sawing through a metal pipe.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_38105_within_class_top2.wav',
        visqolMosLqo: 4.622464,
        visqolVnsim: 0.892138,
        genToOrig: 0.8094394207000732
      },
      {
        id: 's3-38105',
        text: 'Like a rooster crowing.',
        category: 'Stridor',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/stridor/stridor_38105_within_class_top3.wav',
        visqolMosLqo: 4.604523,
        visqolVnsim: 0.870985,
        genToOrig: 0.8858844041824341
      }
    ],
    examples: [
        {
            id: 'stridor_38105-ex1',
            rank: 1,
            prototypeIdx: 41,
            className: 'Stridor',
            weight: 1.4839074611663818,
            activeWindow: '0.00s - 3.49s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_38105_rank1_proto41_full.wav'
        },
        {
            id: 'stridor_38105-ex2',
            rank: 2,
            prototypeIdx: 46,
            className: 'Stridor',
            weight: 1.6564983129501345,
            activeWindow: '0.00s - 4.51s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_38105_rank2_proto46_full.wav'
        },
        {
            id: 'stridor_38105-ex3',
            rank: 3,
            prototypeIdx: 48,
            className: 'Stridor',
            weight: 1.753227949142456,
            activeWindow: '0.00s - 4.51s',
            audioUrl: '/audio/lungausc_v2/examples/stridor/stridor_38105_rank3_proto48_full.wav'
        }
    ]
  },
  {
    id: 'wheeze-11831',
    name: 'Wheezes #11831',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/wheezes/wheeze_11831_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      rhonchi: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-11831',
        text: 'Like a whale song (high frequency).',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 90,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_11831_within_class_top1.wav',
        visqolMosLqo: 4.606715,
        visqolVnsim: 0.852634,
        genToOrig: 0.9132119417190552
      },
      {
        id: 's2-11831',
        text: 'Like a mosquito buzzing near your ear.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 90,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_11831_within_class_top2.wav',
        visqolMosLqo: 4.579669,
        visqolVnsim: 0.834995,
        genToOrig: 0.8075951337814331
      },
      {
        id: 's3-11831',
        text: 'Like wind whistling through a tunnel or under a door.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 90,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_11831_within_class_top3.wav',
        visqolMosLqo: 4.581336,
        visqolVnsim: 0.83355,
        genToOrig: 0.8819147944450378
      }
    ],
    examples: [
        {
            id: 'wheeze_11831-ex1',
            rank: 1,
            prototypeIdx: 59,
            className: 'Wheeze',
            weight: 1.433444619178772,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_11831_rank1_proto59_full.wav'
        },
        {
            id: 'wheeze_11831-ex2',
            rank: 2,
            prototypeIdx: 53,
            className: 'Wheeze',
            weight: 1.471926212310791,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_11831_rank2_proto53_full.wav'
        },
        {
            id: 'wheeze_11831-ex3',
            rank: 3,
            prototypeIdx: 56,
            className: 'Wheeze',
            weight: 1.3924360275268557,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_11831_rank3_proto56_full.wav'
        }
    ]
  },
  {
    id: 'wheeze-27004',
    name: 'Wheezes #27004',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/wheezes/wheeze_27004_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      rhonchi: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-27004',
        text: 'Like a mosquito buzzing near your ear.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_27004_within_class_top1.wav',
        visqolMosLqo: 4.172628,
        visqolVnsim: 0.644568,
        genToOrig: 0.7986571788787842
      },
      {
        id: 's2-27004',
        text: 'Like a whale song (high frequency).',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_27004_within_class_top2.wav',
        visqolMosLqo: 4.193279,
        visqolVnsim: 0.704486,
        genToOrig: 0.9425045251846313
      },
      {
        id: 's3-27004',
        text: 'Like blowing across the top of a small glass bottle.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_27004_within_class_top3.wav',
        visqolMosLqo: 3.684515,
        visqolVnsim: 0.574538,
        genToOrig: 0.8321930766105652
      }
    ],
    examples: [
        {
            id: 'wheeze_27004-ex1',
            rank: 1,
            prototypeIdx: 53,
            className: 'Wheeze',
            weight: 1.471926212310791,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_27004_rank1_proto53_full.wav'
        },
        {
            id: 'wheeze_27004-ex2',
            rank: 2,
            prototypeIdx: 59,
            className: 'Wheeze',
            weight: 1.433444619178772,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_27004_rank2_proto59_full.wav'
        },
        {
            id: 'wheeze_27004-ex3',
            rank: 3,
            prototypeIdx: 56,
            className: 'Wheeze',
            weight: 1.3924360275268557,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_27004_rank3_proto56_full.wav'
        }
    ]
  },
  {
    id: 'wheeze-32992',
    name: 'Wheezes #32992',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/wheezes/wheeze_32992_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      rhonchi: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-32992',
        text: 'Like a whale song (high frequency).',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_32992_within_class_top1.wav',
        visqolMosLqo: 4.401062,
        visqolVnsim: 0.664919,
        genToOrig: 0.8585406541824341
      },
      {
        id: 's2-32992',
        text: 'Like a mosquito buzzing near your ear.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_32992_within_class_top2.wav',
        visqolMosLqo: 4.366454,
        visqolVnsim: 0.63268,
        genToOrig: 0.8029858469963074
      },
      {
        id: 's3-32992',
        text: 'Like wind whistling through a tunnel or under a door.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 98,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_32992_within_class_top3.wav',
        visqolMosLqo: 4.390029,
        visqolVnsim: 0.645589,
        genToOrig: 0.8874292373657227
      }
    ],
    examples: [
        {
            id: 'wheeze_32992-ex1',
            rank: 1,
            prototypeIdx: 53,
            className: 'Wheeze',
            weight: 1.471926212310791,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_32992_rank1_proto53_full.wav'
        },
        {
            id: 'wheeze_32992-ex2',
            rank: 2,
            prototypeIdx: 56,
            className: 'Wheeze',
            weight: 1.3924360275268557,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_32992_rank2_proto56_full.wav'
        },
        {
            id: 'wheeze_32992-ex3',
            rank: 3,
            prototypeIdx: 50,
            className: 'Wheeze',
            weight: 1.3105199337005615,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_32992_rank3_proto50_full.wav'
        }
    ]
  },
  {
    id: 'wheeze-33222',
    name: 'Wheezes #33222',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/wheezes/wheeze_33222_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      rhonchi: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-33222',
        text: 'Like a mosquito buzzing near your ear.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_33222_within_class_top1.wav',
        visqolMosLqo: 3.000781,
        visqolVnsim: 0.5438,
        genToOrig: 0.8535138368606567
      },
      {
        id: 's2-33222',
        text: 'Like a whale song (high frequency).',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_33222_within_class_top2.wav',
        visqolMosLqo: 3.128694,
        visqolVnsim: 0.580979,
        genToOrig: 0.9154845476150513
      },
      {
        id: 's3-33222',
        text: 'Like blowing across the top of a small glass bottle.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_33222_within_class_top3.wav',
        visqolMosLqo: 3.062956,
        visqolVnsim: 0.504098,
        genToOrig: 0.8709443211555481
      }
    ],
    examples: [
        {
            id: 'wheeze_33222-ex1',
            rank: 1,
            prototypeIdx: 53,
            className: 'Wheeze',
            weight: 1.471926212310791,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_33222_rank1_proto53_full.wav'
        },
        {
            id: 'wheeze_33222-ex2',
            rank: 2,
            prototypeIdx: 56,
            className: 'Wheeze',
            weight: 1.3924360275268557,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_33222_rank2_proto56_full.wav'
        },
        {
            id: 'wheeze_33222-ex3',
            rank: 3,
            prototypeIdx: 59,
            className: 'Wheeze',
            weight: 1.433444619178772,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_33222_rank3_proto59_full.wav'
        }
    ]
  },
  {
    id: 'wheeze-36284',
    name: 'Wheezes #36284',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v2/original/wheezes/wheeze_36284_original.wav',
    features: { pitch: 'Medium', loudness: 'Medium', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
      rhonchi: { pitch: 'Similar', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' }
    },
    similes: [
      {
        id: 's1-36284',
        text: 'Like a mosquito buzzing near your ear.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_36284_within_class_top1.wav',
        visqolMosLqo: 4.40066,
        visqolVnsim: 0.626488,
        genToOrig: 0.7902223467826843
      },
      {
        id: 's2-36284',
        text: 'Like a whale song (high frequency).',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_36284_within_class_top2.wav',
        visqolMosLqo: 4.424281,
        visqolVnsim: 0.648309,
        genToOrig: 0.8813517689704895
      },
      {
        id: 's3-36284',
        text: 'Like the sound of a deflating balloon when the neck is stretched.',
        category: 'Wheezes',
        relatedFeatures: 'Nature',
        confidence: 100,
        withinClassAudioUrl: '/audio/lungausc_v2/similes/wheezes/wheeze_36284_within_class_top3.wav',
        visqolMosLqo: 4.399189,
        visqolVnsim: 0.628921,
        genToOrig: 0.8510792851448059
      }
    ],
    examples: [
        {
            id: 'wheeze_36284-ex1',
            rank: 1,
            prototypeIdx: 53,
            className: 'Wheeze',
            weight: 1.471926212310791,
            activeWindow: '1.14s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_36284_rank1_proto53_full.wav'
        },
        {
            id: 'wheeze_36284-ex2',
            rank: 2,
            prototypeIdx: 56,
            className: 'Wheeze',
            weight: 1.3924360275268557,
            activeWindow: '0.00s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_36284_rank2_proto56_full.wav'
        },
        {
            id: 'wheeze_36284-ex3',
            rank: 3,
            prototypeIdx: 50,
            className: 'Wheeze',
            weight: 1.3105199337005615,
            activeWindow: '0.11s - 5.00s',
            audioUrl: '/audio/lungausc_v2/examples/wheezes/wheeze_36284_rank3_proto50_full.wav'
        }
    ]
  },
];

// Helper: unique pathology display labels
export const PATHOLOGY_LABELS: Record<string, string> = {
  fine_crackles: 'Fine Crackles',
  coarse_crackles: 'Coarse Crackles',
  wheezes: 'Wheezes',
  rhonchi: 'Rhonchi',
  stridor: 'Stridor',
  normal: 'Normal',
};
