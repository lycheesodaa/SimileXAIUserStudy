import { Info } from "lucide-react";

export function SimilePractice() {
  return (
    <div className="w-full my-6 mx-3">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Welcome to Simile Practice Mode</h2>
        <p className="text-gray-600 mb-4">
          Review how different lung classifications map to common descriptive similes.
        </p>
      </div>
      <div className="space-y-6 text-gray-700">
        <p>
          Similes can provide intuitive ways to recognize and communicate lung sounds.
          Familiarize yourself with these associations before moving to the test tab.
        </p>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
          <ul className="list-disc pl-5 space-y-1 text-blue-800 text-sm">
            <li>Review the Simile Practice Table to understand how descriptions map to sounds.</li>
            <li>Note the various everyday comparisons that professionals use for each classification.</li>
          </ul>
        </div>

        <div className="space-y-8 mt-6">
          <section>
            <h3 className="text-xl font-semibold text-cyan-800 border-b pb-2 mb-3">1. Fine Crackles (Fine Rales)</h3>
            <p className="italic text-gray-600 mb-3 bg-gray-50 p-2 rounded">
              High-pitched, short, popping sounds usually heard during inspiration. They are not cleared by coughing.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Like rubbing a lock of hair between your fingers near your ear.</li>
              <li>Like pulling apart a strip of Velcro slowly.</li>
              <li>Like salt crackling on a hot frying pan.</li>
              <li>Like crumpling up a piece of cellophane wrapper.</li>
              <li>Like the fizz of a freshly poured carbonated soda.</li>
              <li>Like wood popping and snapping in a distant campfire.</li>
              <li>Like gentle footsteps on dry, crisp autumn leaves.</li>
              <li>Like the sound of foam bubbles bursting in a bathtub.</li>
              <li>Like radio static on a low volume.</li>
              <li>Like the distant sound of fireworks popping.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-cyan-800 border-b pb-2 mb-3">2. Coarse Crackles (Coarse Rales)</h3>
            <p className="italic text-gray-600 mb-3 bg-gray-50 p-2 rounded">
              Lower-pitched, louder, longer, and bubbling sounds. They sound "wet" and may decrease after coughing.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Like water boiling vigorously in a pot.</li>
              <li>Like slurping the last few drops of a drink through a straw.</li>
              <li>Like pouring water out of a narrow-necked bottle (glug-glug).</li>
              <li>Like rolling marbles around in a tin can.</li>
              <li>Like old-fashioned coffee percolating.</li>
              <li>Like a shovel digging into loose, wet gravel.</li>
              <li>Like ripping a heavy piece of canvas or fabric.</li>
              <li>Like the sound of a wet sponge being squeezed out.</li>
              <li>Like rattling rocks in a plastic cup.</li>
              <li>Like mud bubbling in a swamp.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-cyan-800 border-b pb-2 mb-3">3. Wheezes (Sibilant)</h3>
            <p className="italic text-gray-600 mb-3 bg-gray-50 p-2 rounded">
              High-pitched, musical, continuous sounds often heard on expiration. Caused by narrowed airways.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Like wind whistling through a tunnel or under a door.</li>
              <li>Like a squeaky door hinge needing oil.</li>
              <li>Like the whistle of a tea kettle reaching a boil.</li>
              <li>Like the sound of a deflating balloon when the neck is stretched.</li>
              <li>Like a mosquito buzzing near your ear.</li>
              <li>Like a flute or piccolo playing a sustained, discordant note.</li>
              <li>Like a high-pitched violin string being bowed poorly.</li>
              <li>Like a distant siren wailing.</li>
              <li>Like a whale song (high frequency).</li>
              <li>Like blowing across the top of a small glass bottle.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-cyan-800 border-b pb-2 mb-3">4. Rhonchi (Sonorous Wheezes)</h3>
            <p className="italic text-gray-600 mb-3 bg-gray-50 p-2 rounded">
              Low-pitched, snoring, or moaning sounds. They imply obstruction of larger airways and often clear with coughing.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Like a person snoring deeply.</li>
              <li>Like the low moaning of a ghost in a movie.</li>
              <li>Like a cat purring loudly against your chest.</li>
              <li>Like a distinct "grumbling" of an upset stomach.</li>
              <li>Like a saw cutting through a thick log (the "pull" stroke).</li>
              <li>Like a low note played on a cello or bassoon.</li>
              <li>Like a diesel engine idling nearby.</li>
              <li>Like air bubbling through thick plumbing pipes.</li>
              <li>Like two large stones grinding against each other.</li>
              <li>Like the sound of a didgeridoo.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-cyan-800 border-b pb-2 mb-3">5. Stridor</h3>
            <p className="italic text-gray-600 mb-3 bg-gray-50 p-2 rounded">
              Loud, high-pitched, crowing sound usually heard without a stethoscope during inspiration. Indicates upper airway obstruction.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Like a seal barking.</li>
              <li>Like a rooster crowing.</li>
              <li>Like a crow cawing harshly.</li>
              <li>Like the sound of someone choking or gasping desperately for air.</li>
              <li>Like sawing through a metal pipe.</li>
              <li>Like a rusty, heavy gate being forced open.</li>
              <li>Like a banshee screaming.</li>
              <li>Like a foghorn in the distance (if lower pitched).</li>
              <li>Like tires screeching on pavement.</li>
              <li>Like a mechanical belt slipping on a pulley.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-cyan-800 border-b pb-2 mb-3">6. Pleural Friction Rub</h3>
            <p className="italic text-gray-600 mb-3 bg-gray-50 p-2 rounded">
              A dry, grating, or creaking sound typically heard during both inspiration and expiration. Caused by inflamed pleural surfaces rubbing together.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Like walking on fresh, cold, crunchy snow.</li>
              <li>Like two pieces of new leather being rubbed together.</li>
              <li>Like a piece of sandpaper rubbing against wood.</li>
              <li>Like the creaking of an old rocking chair.</li>
              <li>Like rubbing your hands together vigorously when they are dry.</li>
              <li>Like the creaking ropes of a boat at a dock.</li>
              <li>Like dragging heavy wooden furniture across a floor.</li>
              <li>Like stretching a piece of old, dried-out rubber.</li>
              <li>Like grating a block of hard cheese.</li>
              <li>Like footsteps on a gravel driveway.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
