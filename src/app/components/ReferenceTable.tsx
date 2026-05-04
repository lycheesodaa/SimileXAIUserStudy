import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const referenceData = [
  {
    type: "Fine Crackles",
    pitch: "High",
    loudness: "Soft/Medium",
    duration: "Short",
    continuity: "Discontinuous",
    quality: "Explosive, Velcro-like",
  },
  {
    type: "Coarse Crackles",
    pitch: "Low",
    loudness: "Loud",
    duration: "Longer",
    continuity: "Discontinuous",
    quality: "Bubbling, Gurgling",
  },
  {
    type: "Wheezes",
    pitch: "High",
    loudness: "Variable",
    duration: "Long",
    continuity: "Continuous",
    quality: "Musical, Squeaky",
  },
  {
    type: "Rhonchi",
    pitch: "Low",
    loudness: "Variable",
    duration: "Long",
    continuity: "Continuous",
    quality: "Snoring, Moaning",
  },
  {
    type: "Stridor",
    pitch: "High",
    loudness: "Loud",
    duration: "Long",
    continuity: "Continuous",
    quality: "Crowing, Harsh",
  },
  {
    type: "Pleural Rub",
    pitch: "Low",
    loudness: "Variable",
    duration: "Variable",
    continuity: "Continuous / Discontinuous",
    quality: "Creaking, Grating",
  },
];

export function ReferenceTable() {
  return (
    <div className="w-full mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Lung Sound Reference Guide</h2>
        <p className="text-gray-600 mb-4">
          A quick reference mapping acoustic cues to common lung sound types.
        </p>
      </div>
      <div>
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Pitch</TableHead>
                <TableHead>Loudness</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Continuity</TableHead>
                <TableHead>Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referenceData.map((sound) => (
                <TableRow key={sound.type}>
                  <TableCell className="font-medium whitespace-nowrap">{sound.type}</TableCell>
                  <TableCell>{sound.pitch}</TableCell>
                  <TableCell>{sound.loudness}</TableCell>
                  <TableCell>{sound.duration}</TableCell>
                  <TableCell>{sound.continuity}</TableCell>
                  <TableCell>{sound.quality}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
