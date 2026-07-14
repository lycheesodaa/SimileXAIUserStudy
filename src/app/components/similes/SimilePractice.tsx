import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useParams, useSearchParams } from "react-router";
import { Button } from "../ui/button";
import { loadSample, loadSplitSamples } from "../../study/dataV1";

interface SimilePracticeProps {
  /** Fallback used only when the URL carries no `xai` param (the legacy
   *  /v0.1 & /v0.2 practice routes). When an `xai` query param is present it
   *  wins, so the drawer/practice content tracks the live condition. */
  isOnomatopoeia?: boolean;
  /** True when rendered as the cheatsheet drawer inside an explanation
   *  (train/test item views). Hides the per-class example-audio buttons so the
   *  reference drawer can't play labelled class sounds mid-item; they remain on
   *  the standalone practice pages. */
  inDrawer?: boolean;
}

type PracticeSet = "similes" | "onomatopoeia";
type PracticeDomain = "lung" | "bird";

interface CheatsheetCategory {
  title: string;
  /** True class label (matches core_samples.json true_label) used to look up
   *  the representative training clip for this class's play button. */
  classLabel: string;
  /** The italic blurb characterizing the sound class (from the markdown). */
  description: string;
  items: string[];
}

interface CheatsheetContent {
  /** Phrase for "review how different ___ may be mapped to…". */
  subject: string;
  /** Plural noun for "…communicate ___." */
  soundsPlural: string;
  categories: CheatsheetCategory[];
}

// Content mirrors public/*.md (Similes/Onomatopoeia for Lung/Bird Sounds).
// Keep these in sync with those source files when the descriptions change.
const CHEATSHEETS: Record<PracticeDomain, Record<PracticeSet, CheatsheetContent>> = {
  lung: {
    similes: {
      subject: "lung sound categories",
      soundsPlural: "lung sounds",
      categories: [
        {
          title: "1. Crackles (Rales)",
          classLabel: "Crackle",
          description:
            "Discontinuous, non-musical popping, snapping, or bubbling sounds. They span high-pitched, dry, fine crackles (inspiratory, not cleared by coughing) through to lower-pitched, louder, wet coarse crackles (may decrease after coughing).",
          items: [
            "Like salt crackling on a hot frying pan.",
            "Like pulling apart a strip of Velcro slowly.",
            "Like crumpling up a piece of cellophane wrapper.",
            "Like gentle footsteps on dry, crisp autumn leaves.",
            "Like wood popping and snapping in a distant campfire.",
            "Like water boiling vigorously in a pot.",
            "Like old-fashioned coffee percolating.",
            "Like the sound of a wet sponge being squeezed out.",
            "Like pouring water out of a narrow-necked bottle (glug-glug).",
            "Like mud bubbling in a swamp.",
          ],
        },
        {
          title: "2. Wheezes (Sibilant)",
          classLabel: "Wheeze",
          description:
            "High-pitched, musical, continuous sounds often heard on expiration. Caused by narrowed airways.",
          items: [
            "Like wind whistling through a tunnel or under a door.",
            "Like a squeaky door hinge needing oil.",
            "Like the whistle of a tea kettle reaching a boil.",
            "Like the sound of a deflating balloon when the neck is stretched.",
            "Like a mosquito buzzing near your ear.",
            "Like a flute or piccolo playing a sustained, discordant note.",
            "Like a high-pitched violin string being bowed poorly.",
            "Like a distant siren wailing.",
            "Like a whale song (high frequency).",
            "Like blowing across the top of a small glass bottle.",
          ],
        },
        {
          title: "3. Rhonchi (Sonorous Wheezes)",
          classLabel: "Rhonchi",
          description:
            "Low-pitched, snoring, or moaning sounds. They imply obstruction of larger airways and often clear with coughing.",
          items: [
            "Like a person snoring deeply.",
            "Like the low moaning of a ghost in a movie.",
            "Like a cat purring loudly against your chest.",
            'Like a distinct "grumbling" of an upset stomach.',
            'Like a saw cutting through a thick log (the "pull" stroke).',
            "Like a low note played on a cello or bassoon.",
            "Like a diesel engine idling nearby.",
            "Like air bubbling through thick plumbing pipes.",
            "Like two large stones grinding against each other.",
            "Like the sound of a didgeridoo.",
          ],
        },
        {
          title: "4. Stridor",
          classLabel: "Stridor",
          description:
            "Loud, high-pitched, crowing sound usually heard without a stethoscope during inspiration. Indicates upper airway obstruction.",
          items: [
            "Like a seal barking.",
            "Like a rooster crowing.",
            "Like a crow cawing harshly.",
            "Like the sound of someone choking or gasping desperately for air.",
            "Like sawing through a metal pipe.",
            "Like a rusty, heavy gate being forced open.",
            "Like a banshee screaming.",
            "Like a foghorn in the distance (if lower pitched).",
            "Like tires screeching on pavement.",
            "Like a mechanical belt slipping on a pulley.",
          ],
        },
        {
          title: "5. Normal Lung Sounds",
          classLabel: "Normal",
          description:
            "Clear, rhythmic breath sounds with no added noises. Indicates healthy, unobstructed airways.",
          items: [
            "Like a gentle breeze blowing through a quiet room.",
            "Like the soft, steady hum of a distant cooling fan.",
            "Like the sound of a calm ocean tide in the distance.",
            "Like a rhythmic, clear airflow with no interruptions.",
            "Like the soft rustling of silk fabric in the air.",
            "Like a quiet, steady breath during deep sleep.",
            "Like the sound of a soft summer wind through pine trees.",
            "Like a clean, unobstructed sigh.",
            "Like the sound of air moving through a wide, smooth pipe.",
            "Like a peaceful, undisturbed respiratory cycle.",
          ],
        },
      ],
    },
    onomatopoeia: {
      subject: "lung sound categories",
      soundsPlural: "lung sounds",
      categories: [
        {
          title: "1. Crackles (Rales)",
          classLabel: "Crackle",
          description:
            "Discontinuous, non-musical popping, snapping, or bubbling sounds spanning fine (high-pitched, dry) and coarse (low-pitched, wet) crackles.",
          items: [
            'A rapid series of tiny, snapping "pop-pop-pop" sounds.',
            'A faint, dry "crick-crick-crick" repeating softly with each breath.',
            'A cluster of miniature "snap-snap-snap" sounds, thin and airy.',
            'A gentle "crr-crr-crr" rippling rapidly at high pitch.',
            'A succession of soft "tic-tic-tic" taps at an irregular high-frequency cadence.',
            'A deep, rolling, bubbling "blub-blub-blub".',
            'A heavy, pouring "glug-glug-glug" of fluid.',
            'A moist, drawn-out "krackle-krackle" reverberating across a broad airway.',
            'A rumbling "brrr-brrr-brrr" with a low, wet resonance.',
            'A heavy, staccato "rattle-rattle-rattle" loosening and shifting with each breath.',
          ],
        },
        {
          title: "2. Wheezes (Sibilant)",
          classLabel: "Wheeze",
          description:
            "High-pitched, musical, continuous sounds often heard on expiration. Caused by narrowed airways.",
          items: [
            'A thin, sustained "wheeeee" sustaining itself throughout expiration.',
            'A high, musical, boiling "eeee".',
            'A reedy "shhhhh" that rises and falls in pitch with each breath.',
            'A narrow, whistling "fweeeee" cutting through the expiratory phase.',
            'A vibrating "zeeeeee" that buzzes with harmonic overtones.',
            'A continuous, shrill, forced "sweeee".',
            'A quavering "wheee-wheee" modulating with bronchial spasm.',
            'A piercing, musical "eeeoh" with a slight pitch undulation.',
            'A tense, buzzing "zzzzz" at high frequency held throughout the breath.',
            'A musical, gliding "fwee-fwee" that warbles between notes on exhalation.',
          ],
        },
        {
          title: "3. Rhonchi (Sonorous Wheezes)",
          classLabel: "Rhonchi",
          description:
            "Low-pitched, snoring, or moaning sounds. They imply obstruction of larger airways and often clear with coughing.",
          items: [
            'A deep, rumbling "snorrr-snorrr" resonating in the chest.',
            'A low, drawn-out "groannn" vibrating through the larger bronchi.',
            'A throaty, idling "rrrumble-rrrumble".',
            'A sonorous "mmmmm" that dips and rises with each breath cycle.',
            'A reverberant "brronnn-brronnn" humming at low frequency.',
            'A coarse, droning "rrrrr" sustained with each exhalation.',
            'A low, nasal "honk-honk" reverberating through obstructed airways.',
            'A muffled "grrronk" that clears momentarily after a cough.',
            'A buzzing, baritone "bzzzz" with a vibrating, labial quality.',
            'A rolling "rrr-owww-rrr" undulating at the lowest audible pitch.',
          ],
        },
        {
          title: "4. Stridor",
          classLabel: "Stridor",
          description:
            "Loud, high-pitched, crowing sound usually heard without a stethoscope during inspiration. Indicates upper airway obstruction.",
          items: [
            'A harsh, crowing "krrrow" forced through a severely narrowed larynx.',
            'A sharp, piercing, metallic "krrk-krrk" on each inhale.',
            'A loud, barking "rawk" echoing in the upper airway.',
            'A strained "eeerk" scraped painfully across a narrowed glottis.',
            'A grating, strident "squeeek" pulling tight with every inspiratory effort.',
            'A desperate "hrrk-hrrk" as air struggles to bypass obstruction.',
            'A metallic "screech" resonating at the level of the trachea.',
            'A crowing "crow-crow" that cuts short as the airway snaps half-closed.',
            'A high, rasping, abrasive "cchhhh".',
            'A piercing, clattering "shrieek" audible across the room without auscultation.',
          ],
        },
        {
          title: "5. Normal Lung Sounds",
          classLabel: "Normal",
          description:
            "Clear, rhythmic breath sounds with no added noises. Indicates healthy, unobstructed airways.",
          items: [
            'A soft, even "whoosh" of unimpeded airflow with each breath.',
            'A quiet, airy "shhh" rising smoothly on inspiration and fading on expiration.',
            'A steady, gentle "fwooo" of clean air moving through open airways.',
            'A smooth "haaa" expanding effortlessly across a clear chest field.',
            'A low, rhythmic, breezy "swooo-swooo".',
            'A calm "hoo-hoo" of regular, unhurried tidal breathing.',
            'A barely audible "hushhh" of air gliding without resistance.',
            'A soft, clear "sss" of laminar flow without turbulence or added sound.',
            'A quiet, even "fwsh-fwsh" keeping perfect time with the respiratory cycle.',
            'A placid "ahhhh" of full, deep, unobstructed inspiration and expiration.',
          ],
        },
      ],
    },
  },
  bird: {
    similes: {
      subject: "bird species",
      soundsPlural: "bird calls",
      categories: [
        {
          title: "1. Eastern Towhee (eastow)",
          classLabel: "Eastern Towhee",
          description:
            'A distinct, loud, two-to-three syllable song, often described as sounding like "drink-your-teeeee" with the last note drawn out and trilled.',
          items: [
            "Like a person enthusiastically ordering a cup of tea.",
            "Like a rusty swing set creaking back and forth quickly.",
            "Like a small, metallic bell ringing twice and then vibrating.",
            "Like flicking a stretched rubber band twice, then letting it buzz against the table.",
            "Like a squeaky wheel on a small cart suddenly spinning fast.",
            "Like a child's toy whistle blown twice shortly, then held for a trill.",
            "Like a metallic zipper being pulled closed in three distinct jerks.",
            "Like a sudden, sharp intake of breath followed by a vibrating exhalation.",
            "Like a small pebble bouncing twice on ice and skittering away.",
            "Like a quick, bright double-chime followed by a sustained buzz.",
          ],
        },
        {
          title: "2. Wood Thrush (woothr)",
          classLabel: "Wood Thrush",
          description:
            'A flute-like, beautiful, and complex echoing song, often described as "ee-oh-lay," characterized by its ethereal, ringing quality in woodlands.',
          items: [
            "Like a skilled flutist playing a delicate, echoing arpeggio.",
            "Like glass wind chimes softly clinking in a gentle breeze.",
            "Like a pure, clear bell ringing in a quiet, empty cathedral.",
            "Like water trickling into a deep, resonant hollow log.",
            "Like a distant, melodic yodel echoing through a dense forest.",
            "Like a series of crystal glasses being gently struck with a spoon.",
            "Like a pan flute playing a haunting, three-note melody.",
            "Like a silver coin spinning and settling on a glass table.",
            "Like a clear, whistling breeze harmonizing with itself.",
            "Like an electronic synthesizer playing a smooth, liquid chime.",
          ],
        },
        {
          title: "3. Black-capped Chickadee (bkcchi)",
          classLabel: "Black-capped Chickadee",
          description:
            'A familiar, distinct, and rhythmic call sounding like "chick-a-dee-dee-dee," with the number of "dees" varying based on agitation or alarm.',
          items: [
            "Like someone rapidly tapping a small wooden block on a hollow box.",
            "Like a tiny, rhythmic drumroll played on a high-pitched snare.",
            "Like a thumbnail flicked rapidly down the teeth of a pocket comb.",
            "Like a small, squeaky spring bouncing multiple times.",
            "Like a fast-paced Morse code message tapped out on a telegraph.",
            "Like a quick sniffle followed by three rapid sneezes.",
            "Like shaking a tiny box of dry cereal rhythmically.",
            "Like a squeaky dog toy being pressed several times in quick succession.",
            "Like a small ratchet wrench clicking rapidly.",
            "Like a rhythmic, high-pitched hiccup.",
          ],
        },
        {
          title: "4. Tufted Titmouse (tuftit)",
          classLabel: "Tufted Titmouse",
          description:
            'A clear, whistled, repetitive song, often described as a loud, ringing "peter-peter-peter" or "here-here-here."',
          items: [
            "Like a tiny, enthusiastic cheerleader chanting a two-syllable phrase.",
            "Like a high-pitched, rhythmic squeak from a bicycle pedal.",
            "Like a person rhythmically whistling to call a dog.",
            "Like a small, persistent alarm clock chiming a two-note pattern.",
            "Like a repetitive, clear whistle from a referee.",
            "Like the rhythmic squeak of a wet shoe on a polished floor.",
            "Like a swing with a consistent, two-part creak.",
            "Like a child's recorder piping the same two clear notes again and again.",
            "Like a metronome ticking with a distinct high and low tone.",
            "Like a rhythmic, alternating squeal of a tiny pulley.",
          ],
        },
        {
          title: "5. Ovenbird (ovenbil)",
          classLabel: "Ovenbird",
          description:
            'A loud, ringing, ascending song that sounds like a repeated "teacher, teacher, TEACHER!" growing louder and more emphatic with each repetition.',
          items: [
            "Like a student desperately calling out to their instructor, getting louder each time.",
            "Like a siren slowly winding up and increasing in volume.",
            "Like a repetitive, rhythmic chant echoing in an empty hallway.",
            "Like a small, energetic engine revving up to a higher gear.",
            "Like an enthusiastic, two-note chant increasing in urgency.",
            "Like a rapid, alternating high-low whistle growing progressively louder.",
            "Like a series of sharp, rhythmic hiccups getting stronger.",
            "Like someone striking two small metal pipes together, hitting harder each time.",
            "Like a fast-paced, ascending trill from a small wooden flute.",
            "Like a rhythmic, escalating squeal of a rusty hinge being forced open.",
          ],
        },
      ],
    },
    onomatopoeia: {
      subject: "bird species",
      soundsPlural: "bird calls",
      categories: [
        {
          title: "1. Eastern Towhee (eastow)",
          classLabel: "Eastern Towhee",
          description:
            'A distinct, loud, two-to-three syllable song, often described as sounding like "drink-your-teeeee" with the last note drawn out and trilled.',
          items: [
            '"drink-your-TEEEEE" — two short, clipped syllables launching into a vibrating, extended trill.',
            '"chweek-chweek-TWEEEEE" — two bright percussive hits, then a ringing, sustained high note.',
            '"chik-CHIK-trrrreeee" — rising in both pitch and intensity, ending in a rolled trill.',
            '"tik-tik-FREEEE" — sharp twin attacks followed by a fluting, vibrato tail.',
            '"bwik-BWIK-wheeeee" — two punchy notes resolving into a whistled, quavering finish.',
            '"pip-pip-TREEEEEE" — two quick pips opening into a sustained, bright trill.',
            '"che-CHEE-wheeeee" — clipped onset syllables flowering into a ringing, held note.',
            '"wit-WIT-wheeeee" — a fast double-strike launching a long, warbling crescendo.',
            '"zip-zip-ZREEEEEE" — two quick zips and a resonant buzz-trill at full volume.',
            '"tek-TEK-treeeeeee" — percussive onset doubling then releasing into a vibrating sustain.',
          ],
        },
        {
          title: "2. Wood Thrush (woothr)",
          classLabel: "Wood Thrush",
          description:
            'A flute-like, beautiful, and complex echoing song, often described as "ee-oh-lay," characterized by its ethereal, ringing quality in woodlands.',
          items: [
            '"ee-oh-LAY" — three liquid notes spiraling into a ringing final tone that hangs in the air.',
            '"eee-oo-leeee" — a fluid glide between pitches, each note ringing with crystal clarity.',
            '"ayy-oh-wheee" — a rising-falling-rising sequence with overlapping harmonic overtones.',
            '"oooh-wheee-lay" — soft, rounded opening tones flowing into a bright, ringing close.',
            '"wee-oh-LEEE" — a delicate three-note arpeggio ascending with effortless precision.',
            '"eeee-aww-leeee" — wide vowels carrying maximum resonance through a dense woodland.',
            '"ooo-eee-layyy" — a slow, cascading phrase where each note blossoms into the next.',
            '"wheee-oh-leee" — three smooth tones with liquid transitions and no hard consonants.',
            '"ay-oo-wheee" — an upward-opening phrase with a ringing, ethereal final vowel.',
            '"eee-oh-wheeeee" — a pure, sustained arc of pitch that slowly fades in intensity.',
          ],
        },
        {
          title: "3. Black-capped Chickadee (bkcchi)",
          classLabel: "Black-capped Chickadee",
          description:
            'A familiar, distinct, and rhythmic call sounding like "chick-a-dee-dee-dee," with the number of "dees" varying based on agitation or alarm.',
          items: [
            '"chick-a-dee-dee-dee" — the canonical call, crisp and rhythmic with a bright, clipped quality.',
            '"tsik-a-dee-dee-dee" — a thinner, sharper onset syllable firing off rapid, staccato dees.',
            '"chik-ik-dee-dee-dee" — fast double-onset leading into a machine-gun burst of dee-dee-dee.',
            '"chick-a-deet-deet-deet" — slightly clipped tail notes, each ending with a sharp stop.',
            '"tik-tik-di-di-di" — miniaturized, rapid, and rhythmically tapping on a small hollow.',
            '"chk-chk-dee-dee-dee-dee" — two abrupt noise bursts before the rolling dee sequence.',
            '"chick-uh-dee-dee-deedeedee" — slowing onset then accelerating through a dee-cascade.',
            '"tsik-uh-dee-di-di-di" — bright and quick, each dee syllable tightly compressed.',
            '"chick-a-deet-dee-di" — mixed tail syllable lengths reflecting mild alarm.',
            '"chik-a-deeeee-dee-dee" — first dee elongated before snapping to rapid shorter dees.',
          ],
        },
        {
          title: "4. Tufted Titmouse (tuftit)",
          classLabel: "Tufted Titmouse",
          description:
            'A clear, whistled, repetitive song, often described as a loud, ringing "peter-peter-peter" or "here-here-here."',
          items: [
            '"PEE-tuh-PEE-tuh-PEE-tuh" — a loud, ringing two-syllable phrase repeated insistently.',
            '"HERE-here-HERE-here" — first syllable struck hard, second syllable echoing softer.',
            '"PEET-peet-PEET-peet" — alternating stress and volume, metronomically precise.',
            '"twee-twee-twee-twee" — bright, whistled, evenly stressed at a clear mid-high pitch.',
            '"PEE-tur-PEE-tur-PEE-tur" — a round, ringing vowel hammered in consistent triplets.',
            '"WHEEE-ur-WHEEE-ur" — a two-beat phrase looping cleanly without pause.',
            '"PETE-pete-PETE-pete" — bold onset note, quieter echo, cycling steadily.',
            '"tee-WIT-tee-WIT-tee-WIT" — inverted stress pattern in a rapidly alternating sequence.',
            '"FWEET-ur-FWEET-ur" — a firm, clean whistle with a rounded falling second syllable.',
            '"HEE-er-HEE-er-HEE-er" — clear, ringing, repetitive with a slight pleading urgency.',
          ],
        },
        {
          title: "5. Ovenbird (ovenbil)",
          classLabel: "Ovenbird",
          description:
            'A loud, ringing, ascending song that sounds like a repeated "teacher, teacher, TEACHER!" growing louder and more emphatic with each repetition.',
          items: [
            '"TEE-chur-TEE-chur-TEE-CHUR" — each repetition louder and more emphatic than the last.',
            '"tee-CHER-tee-CHER-TEE-CHER" — stress shifting progressively to the second syllable.',
            '"wich-ee-WICH-ee-WICH-EE" — a rising sequence where each pair gains energy and volume.',
            '"tcher-TCHER-TCHEER" — compressed, percussive syllables expanding into a full ring.',
            '"ti-CHEE-ti-CHEE-TI-CHEE" — driving upward, each phrase striking harder on the peak.',
            '"WIT-chee-WIT-chee-WIT-CHEE" — a bold, cresting chant building to a climactic shout.',
            '"tee-CHER-tee-CHER-TEEEE-CHER" — final iteration held and stretched at full volume.',
            '"tchi-TCHI-TCHII" — shortened and urgent, crescendoing through three quick bursts.',
            '"TEECH-er-TEECH-er-TEEEECH-er" — elongated peak vowel on the final, loudest phrase.',
            '"wit-CHEER-wit-CHEER-WIT-CHEEEER" — each phrase louder and the final vowel sustained.',
          ],
        },
      ],
    },
  },
};

const slugify = (s: string): string =>
  s.toLowerCase().replace(/\W+/g, "-").replace(/^-|-$/g, "");

// Play button for a class's representative training clip. Disabled (with a
// hint) until the audio URL resolves, or when the class has no train sample.
// `onPlay` reports the element that just started so the parent can pause any
// other clip that was playing (single-clip-at-a-time coordinator).
function ClassPlayButton({
  url,
  onPlay,
}: {
  url?: string;
  onPlay?: (el: HTMLAudioElement) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) el.pause();
    else el.play();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        disabled={!url}
        title={url ? (isPlaying ? "Pause example" : "Play example sound") : "No example audio"}
        className="h-8 w-8 text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 disabled:opacity-40"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          className="hidden"
          onPlay={() => {
            setIsPlaying(true);
            if (audioRef.current) onPlay?.(audioRef.current);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </>
  );
}

export function SimilePractice({ isOnomatopoeia = false, inDrawer = false }: SimilePracticeProps) {
  const params = useParams<{ domain?: string }>();
  const [searchParams] = useSearchParams();

  // The live condition comes from the URL: the study route path carries the
  // domain (lung/bird) and the `xai` query param carries the condition. When
  // there is no `xai` param (legacy /v0.1 & /v0.2 practice routes) we fall
  // back to the isOnomatopoeia prop and the lung domain.
  const xaiType = searchParams.get("xai") ?? "";
  const set: PracticeSet = xaiType.includes("onomatopoeia")
    ? "onomatopoeia"
    : xaiType.includes("simile")
      ? "similes"
      : isOnomatopoeia
        ? "onomatopoeia"
        : "similes";
  const domain: PracticeDomain = params.domain === "bird" ? "bird" : "lung";
  const isOno = set === "onomatopoeia";

  const content = CHEATSHEETS[domain][set];

  // Only one example clip plays at a time: when a button starts, pause whatever
  // was playing before. Tracked by element ref so no re-render is needed.
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const handlePlay = (el: HTMLAudioElement) => {
    if (activeAudioRef.current && activeAudioRef.current !== el) {
      activeAudioRef.current.pause();
    }
    activeAudioRef.current = el;
  };

  // Each class's play button plays a representative clip from the training
  // split (training.csv holds one sample per class per domain). Map the class
  // label to that sample's audio URL. Audio is head-independent of the
  // simile/onomatopoeia set, so this only depends on the domain. Skipped in the
  // drawer, where the class buttons are hidden.
  const [audioByClass, setAudioByClass] = useState<Record<string, string>>({});
  useEffect(() => {
    if (inDrawer) return;
    let cancelled = false;
    setAudioByClass({});
    loadSplitSamples(domain, "train").then(async (list) => {
      if (!list || cancelled) return;
      const firstByLabel = new Map<string, string>();
      for (const s of list) {
        if (s.true_label && !firstByLabel.has(s.true_label)) {
          firstByLabel.set(s.true_label, s.sample_id);
        }
      }
      const entries = await Promise.all(
        [...firstByLabel].map(async ([label, sampleId]) => {
          const sample = await loadSample(domain, sampleId);
          return [label, sample?.audio] as const;
        })
      );
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const [label, audio] of entries) if (audio) map[label] = audio;
      setAudioByClass(map);
    });
    return () => {
      cancelled = true;
    };
  }, [domain, inDrawer]);

  return (
    <div className="my-6 mx-3">
      <div className="space-y-4 text-gray-700">
        <p className="text-gray-600">
          In this section, you can review how different {content.subject} may be mapped to{" "}
          {isOno ? "onomatopoeic sounds (words that imitate the sound)" : "everyday sounds"}.
        </p>
        <p>
          These are known as {isOno ? "onomatopoeias" : "similes"}. {isOno ? "Onomatopoeias" : "Similes"} can
          provide intuitive ways to recognize and communicate {content.soundsPlural}.
        </p>
        <p>
          <i>
            Some {isOno ? "onomatopoeias" : "similes"} may be more intuitive than others, and it may be helpful to
            take a few seconds to internalize the associations to improve efficiency of recognition.
          </i>
        </p>

        <div className="space-y-8 mt-6">
          {content.categories.map((category) => {
            const id = slugify(category.title);
            return (
              <section key={id}>
                <div className="flex items-center gap-4 border-b pb-2 mb-3">
                  <h3 className="text-xl font-semibold text-cyan-800">{category.title}</h3>
                  {!inDrawer && (
                    <ClassPlayButton
                      url={audioByClass[category.classLabel]}
                      onPlay={handlePlay}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 italic mb-3">{category.description}</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  {category.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
